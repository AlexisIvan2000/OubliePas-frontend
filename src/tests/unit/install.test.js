import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AVAILABLE,
  IDLE,
  INSTALLED,
  MANUAL,
  hasSomethingToSay,
  inspectInstall,
  installState,
} from "../../core/pwa/install";
import {
  UPDATE_INTERVAL_MS,
  dueForUpdate,
  registerServiceWorker,
  watchForUpdates,
} from "../../core/pwa/registerServiceWorker";

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Version/17.5 Mobile Safari/605.1";

function fenetre({
  agent = CHROME,
  touches = 0,
  standalone = false,
  worker = true,
  readyState = "complete",
} = {}) {
  const ecouteurs = new Map();
  return {
    navigator: {
      userAgent: agent,
      maxTouchPoints: touches,
      ...(worker ? { serviceWorker: { register: vi.fn(async () => ({ update: vi.fn() })) } } : {}),
    },
    matchMedia: () => ({ matches: standalone }),
    document: {
      readyState,
      visibilityState: "visible",
      addEventListener: (type, fn) => ecouteurs.set(type, fn),
      removeEventListener: (type) => ecouteurs.delete(type),
    },
    addEventListener: (type, fn) => ecouteurs.set(type, fn),
    removeEventListener: (type) => ecouteurs.delete(type),
    ecouteurs,
  };
}

describe("ce que l'ecran a le droit de proposer", () => {
  it("une app deja lancee depuis l'ecran d'accueil n'a plus rien a installer", () => {
    // Certains Android declenchent encore beforeinstallprompt dans une fenetre
    // autonome : proposer l'installation a qui l'a deja faite ferait douter de
    // ce qui est installe.
    expect(installState({ standalone: true, apple: false, prompt: true })).toBe(INSTALLED);
  });

  it("un navigateur qui a offert son invite la voit relayee", () => {
    expect(installState({ standalone: false, apple: false, prompt: true })).toBe(AVAILABLE);
  });

  it("un iPhone recoit le geste, faute d'invite", () => {
    // Safari ne declenche jamais beforeinstallprompt : sans cet etat, l'ecran
    // se tairait la ou l'ajout a l'ecran d'accueil est le seul chemin, et le
    // seul qui debloque aussi les notifications.
    expect(installState({ standalone: false, apple: true, prompt: false })).toBe(MANUAL);
  });

  it("et un navigateur qui n'installe pas se tait", () => {
    expect(installState({ standalone: false, apple: false, prompt: false })).toBe(IDLE);
  });

  it("seul cet etat-la ne dit rien", () => {
    expect([INSTALLED, AVAILABLE, MANUAL].every(hasSomethingToSay)).toBe(true);
    expect(hasSomethingToSay(IDLE)).toBe(false);
  });

  it("l'inspection lit la fenetre sans que personne ne la lui decrive", () => {
    expect(inspectInstall(fenetre({ agent: IPHONE }))).toEqual({
      standalone: false,
      apple: true,
      prompt: false,
    });
  });
});

describe("l'enregistrement du worker", () => {
  it("attend la fin du chargement quand la page charge encore", async () => {
    // L'enregistrer pendant le chargement disputerait la bande passante a la
    // page que quelqu'un regarde.
    const win = fenetre({ readyState: "loading" });

    const promesse = registerServiceWorker(win);
    expect(win.navigator.serviceWorker.register).not.toHaveBeenCalled();

    win.ecouteurs.get("load")();
    await promesse;

    expect(win.navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js");
  });

  it("s'enregistre tout de suite si la page est deja chargee", async () => {
    // Un bundle deja en cache rend la page complete avant que React ne monte :
    // attendre « load » serait attendre un evenement qui ne reviendra pas.
    const win = fenetre({ readyState: "complete" });

    await registerServiceWorker(win);

    expect(win.navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js");
  });

  it("un navigateur sans service worker ne fait rien echouer", async () => {
    await expect(registerServiceWorker(fenetre({ worker: false }))).resolves.toBeNull();
  });

  it("un refus d'enregistrement n'empeche pas l'application de s'afficher", async () => {
    const win = fenetre();
    win.navigator.serviceWorker.register = vi.fn(async () => {
      throw new Error("refus");
    });

    await expect(registerServiceWorker(win)).resolves.toBeNull();
  });
});

describe("la recherche d'un worker plus recent", () => {
  it("un onglet cache ne declenche rien", () => {
    expect(dueForUpdate({ visible: false, last: 0, now: UPDATE_INTERVAL_MS * 10 })).toBe(false);
  });

  it("ni un retour immediat sur l'onglet", () => {
    // Sans plancher, quelqu'un qui bascule entre deux onglets interrogerait le
    // serveur a chaque aller-retour.
    expect(dueForUpdate({ visible: true, last: 0, now: 1000 })).toBe(false);
  });

  it("mais une app rouverte apres une heure va voir", () => {
    expect(dueForUpdate({ visible: true, last: 0, now: UPDATE_INTERVAL_MS })).toBe(true);
  });

  it("le retour a l'ecran interroge l'enregistrement", () => {
    const win = fenetre();
    const registration = { update: vi.fn(async () => {}) };
    vi.spyOn(Date, "now").mockReturnValue(0);
    watchForUpdates(registration, win);

    Date.now.mockReturnValue(UPDATE_INTERVAL_MS + 1);
    win.ecouteurs.get("visibilitychange")();

    expect(registration.update).toHaveBeenCalled();
  });
});

describe("le crochet qui porte l'invite", () => {
  let etats;
  let effets;

  async function crochet(win) {
    etats = [];
    effets = [];
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

    const react = await import("react");
    const { useInstallPrompt } = await import("../../core/pwa/useInstallPrompt");

    const rendre = () => {
      react.__rendre();
      const rendu = useInstallPrompt(win);
      effets.forEach((effet) => effet());
      return rendu;
    };

    return { rendre };
  }

  function invite() {
    return {
      preventDefault: vi.fn(),
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: "accepted" }),
    };
  }

  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("un navigateur muet ne propose rien", async () => {
    const win = fenetre();
    const { rendre } = await crochet(win);

    expect(rendre().state).toBe(IDLE);
  });

  it("l'invite captee ouvre l'installation", async () => {
    const win = fenetre();
    const { rendre } = await crochet(win);
    rendre();

    win.ecouteurs.get("beforeinstallprompt")(invite());

    expect(rendre().state).toBe(AVAILABLE);
  });

  it("l'evenement est retenu, sinon Chrome le garde pour sa propre banniere", async () => {
    // Sans preventDefault l'evenement n'est pas rendu, et il ne se represente
    // pas : le bouton resterait la, sans rien a declencher.
    const win = fenetre();
    const { rendre } = await crochet(win);
    rendre();
    const evenement = invite();

    win.ecouteurs.get("beforeinstallprompt")(evenement);

    expect(evenement.preventDefault).toHaveBeenCalled();
  });

  it("une invite consommee ne laisse pas un bouton mort", async () => {
    // userChoice ne se rejoue pas : garder la reference laisserait un bouton
    // qui ne fait plus rien.
    const win = fenetre();
    const { rendre } = await crochet(win);
    rendre();
    win.ecouteurs.get("beforeinstallprompt")(invite());

    expect(await rendre().install()).toBe("accepted");
    expect(rendre().state).toBe(IDLE);
  });

  it("une installation terminee se dit installee", async () => {
    const win = fenetre();
    const { rendre } = await crochet(win);
    rendre();

    win.ecouteurs.get("appinstalled")();

    expect(rendre().state).toBe(INSTALLED);
  });

  it("un iPhone recoit le geste sans jamais voir d'invite", async () => {
    const { rendre } = await crochet(fenetre({ agent: IPHONE }));

    expect(rendre().state).toBe(MANUAL);
  });

  it("et le meme iPhone deja installe n'y revient pas", async () => {
    const { rendre } = await crochet(fenetre({ agent: IPHONE, standalone: true }));

    expect(rendre().state).toBe(INSTALLED);
  });
});
