import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Meme technique que les autres crochets : React reduit a un etat minimal et
// les effets rejoues a la main. Le navigateur, lui, est entierement feint.
let etats;
let effets;
let nettoyages;
let environnement;
let journal;
let api;

const CLE = "BFakeKeyForTests_-ab";
const ENDPOINT = "https://fcm.googleapis.com/fcm/send/appareil";

function abonnement(cle) {
  return {
    endpoint: ENDPOINT,
    options: { applicationServerKey: cle },
    toJSON: () => ({
      endpoint: ENDPOINT,
      expirationTime: null,
      keys: { p256dh: "cle", auth: "secret" },
    }),
    unsubscribe: async () => {
      journal.push("navigateur:desabonne");
      return true;
    },
  };
}

function poserLeNavigateur({ permission = "granted", existant = null, frais = null } = {}) {
  const pushManager = {
    getSubscription: async () => existant,
    subscribe: async () => {
      journal.push("navigateur:abonne");
      return frais ?? abonnement(null);
    },
  };
  const registration = { pushManager };

  vi.stubGlobal("navigator", {
    userAgent: "Chrome",
    serviceWorker: {
      register: async () => registration,
      ready: Promise.resolve(registration),
      getRegistration: async () => registration,
    },
  });
  vi.stubGlobal("Notification", {
    permission,
    requestPermission: async () => permission,
  });
}

async function chargerHook() {
  etats = [];
  effets = [];
  nettoyages = [];

  vi.resetModules();
  vi.doMock("react", () => {
    let curseur = 0;
    return {
      __rendre: () => {
        curseur = 0;
        effets = [];
      },
      useState: (initial) => {
        const index = curseur++;
        if (!(index in etats)) {
          etats[index] = typeof initial === "function" ? initial() : initial;
        }
        return [
          etats[index],
          (suivant) => {
            etats[index] = typeof suivant === "function" ? suivant(etats[index]) : suivant;
          },
        ];
      },
      useCallback: (fn) => fn,
      useEffect: (fn) => effets.push(fn),
    };
  });

  vi.doMock("../../features/notifications/domain/push", async (importOriginal) => ({
    ...(await importOriginal()),
    inspect: () => environnement,
  }));

  vi.doMock("../../features/notifications/data/pushApi", () => ({
    getPublicKey: (...args) => api.getPublicKey(...args),
    subscribeDevice: (...args) => api.subscribeDevice(...args),
    unsubscribeDevice: (...args) => api.unsubscribeDevice(...args),
    sendTestNotification: (...args) => api.sendTestNotification(...args),
  }));

  const react = await import("react");
  const module = await import(
    "../../features/notifications/presentation/hooks/usePush"
  );

  return {
    module,
    rendre: () => {
      react.__rendre();
      const hook = module.usePush();
      nettoyages.forEach((fn) => fn?.());
      nettoyages = effets.map((effet) => effet());
      return hook;
    },
  };
}

beforeEach(() => {
  journal = [];
  environnement = {
    hasWorker: true,
    hasPush: true,
    hasNotification: true,
    permission: "default",
    apple: false,
    standalone: false,
  };
  api = {
    getPublicKey: async () => {
      journal.push("api:cle");
      return { public_key: CLE };
    },
    subscribeDevice: async (payload) => {
      journal.push("api:abonne");
      return { endpoint: payload.endpoint, enabled: false };
    },
    unsubscribeDevice: async () => {
      journal.push("api:desabonne");
      return { message: "ok" };
    },
    sendTestNotification: async () => {
      journal.push("api:test");
      return { message: "ok" };
    },
  };
  poserLeNavigateur();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("l'etat que le crochet expose des le premier rendu", () => {
  it.each([
    ["idle", { permission: "default" }],
    ["granted", { permission: "granted" }],
    ["denied", { permission: "denied" }],
    ["unsupported", { hasWorker: false }],
    ["homeScreen", { apple: true, hasPush: false }],
  ])("%s", async (attendu, ecarts) => {
    // Sans initialiseur paresseux l'etat n'arriverait qu'au second rendu, et la
    // page afficherait un interrupteur inutilisable le temps d'un battement.
    environnement = { ...environnement, ...ecarts };
    const { rendre } = await chargerHook();

    expect(rendre().state).toBe(attendu);
  });
});

describe("l'activation", () => {
  it("enregistre l'appareil sans rien lui envoyer", async () => {
    // L'essai n'est plus automatique : une notification a chaque activation
    // devient du bruit. Le journal ne doit donc porter aucun api:test.
    const { module, rendre } = await chargerHook();

    const resultat = await rendre().enable();

    expect(resultat).toBe(module.READY);
    expect(journal).toEqual(["api:cle", "navigateur:abonne", "api:abonne"]);
  });

  it("marque l'appareil comme abonne", async () => {
    const { rendre } = await chargerHook();

    await rendre().enable();

    expect(rendre().subscribed).toBe(true);
  });

  it("un refus de permission ne touche ni le serveur ni l'appareil", async () => {
    poserLeNavigateur({ permission: "denied" });
    const { module, rendre } = await chargerHook();

    const resultat = await rendre().enable();

    expect(resultat).toBe(module.REFUSED);
    expect(journal).toEqual([]);
    expect(rendre().state).toBe("denied");
  });

  it("sans paire VAPID cote serveur, aucun abonnement n'est cree", async () => {
    // Le navigateur accorderait la permission, l'interrupteur passerait au vert
    // et rien ne partirait jamais : mieux vaut s'arreter avant.
    api.getPublicKey = async () => ({ public_key: null });
    const { module, rendre } = await chargerHook();

    const resultat = await rendre().enable();

    expect(resultat).toBe(module.UNAVAILABLE);
    expect(journal).toEqual([]);
  });

  it("un abonnement deja pose pour la meme cle est reutilise", async () => {
    const { decodeVapidKey } = await import("../../features/notifications/domain/push");
    poserLeNavigateur({ existant: abonnement(decodeVapidKey(CLE).buffer) });
    const { rendre } = await chargerHook();

    await rendre().enable();

    expect(journal).not.toContain("navigateur:abonne");
    expect(journal).toContain("api:abonne");
  });

  it("une cle VAPID changee fait repartir l'abonnement de zero", async () => {
    // L'ancien abonnement resterait valide pour le navigateur mais le service
    // de push refuserait nos envois signes par l'autre paire, sans que rien ne
    // le dise a personne.
    poserLeNavigateur({ existant: abonnement(new Uint8Array([1, 2, 3]).buffer) });
    const { rendre } = await chargerHook();

    await rendre().enable();

    expect(journal.slice(0, 3)).toEqual([
      "api:cle",
      "navigateur:desabonne",
      "navigateur:abonne",
    ]);
  });
});

describe("l'essai declenche a la main", () => {
  it("passe par l'API pour l'abonnement de cet appareil", async () => {
    // La preuve doit venir du service de push : une notification fabriquee
    // localement s'afficherait meme si le chemin etait coupe.
    poserLeNavigateur({ existant: abonnement(null) });
    const { rendre } = await chargerHook();

    const envoye = await rendre().test();

    expect(envoye).toBe(true);
    expect(journal).toEqual(["api:test"]);
  });

  it("ne tente rien quand cet appareil n'est pas abonne", async () => {
    const { rendre } = await chargerHook();

    const envoye = await rendre().test();

    expect(envoye).toBe(false);
    expect(journal).toEqual([]);
  });
});

describe("la desactivation", () => {
  it("previent l'API avant le navigateur", async () => {
    // Dans l'autre ordre, un appel qui echoue laisserait le serveur avec une
    // adresse que plus personne ne peut lui nommer.
    poserLeNavigateur({ existant: abonnement(null) });
    const { rendre } = await chargerHook();

    await rendre().disable();

    expect(journal).toEqual(["api:desabonne", "navigateur:desabonne"]);
  });

  it("ne dit rien a l'API quand cet appareil n'etait pas abonne", async () => {
    const { rendre } = await chargerHook();

    await rendre().disable();

    expect(journal).toEqual([]);
    expect(rendre().subscribed).toBe(false);
  });
});
