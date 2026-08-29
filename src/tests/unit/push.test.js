import { describe, expect, it } from "vitest";

import {
  DENIED,
  GRANTED,
  HOME_SCREEN,
  IDLE,
  UNSUPPORTED,
  blockingReason,
  decodeVapidKey,
  inspect,
  keyMatches,
  pushState,
  subscriptionPayload,
} from "../../features/notifications/domain/push";

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Version/17.5 Mobile Safari/605.1";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/17.5 Safari/605.1.15";

function fenetre({ agent = CHROME, permission = "default", touches = 0, worker = true, push = true, standalone = false } = {}) {
  const win = {
    navigator: { userAgent: agent, maxTouchPoints: touches },
    matchMedia: () => ({ matches: standalone }),
  };
  if (worker) {
    win.navigator.serviceWorker = {};
  }
  if (push) {
    win.PushManager = function PushManager() {};
    win.Notification = { permission };
  }
  return win;
}

const etat = (options) => pushState(inspect(fenetre(options)));

describe("l'etat du push tel que l'ecran doit le dire", () => {
  it("un navigateur jamais interroge attend qu'on lui demande", () => {
    expect(etat()).toBe(IDLE);
  });

  it("une permission deja accordee", () => {
    expect(etat({ permission: "granted" })).toBe(GRANTED);
  });

  it("une permission refusee", () => {
    expect(etat({ permission: "denied" })).toBe(DENIED);
  });

  it("un navigateur sans service worker ne peut rien recevoir", () => {
    expect(etat({ worker: false })).toBe(UNSUPPORTED);
  });

  it("un iPhone hors ecran d'accueil reclame l'ecran d'accueil, pas un autre navigateur", () => {
    // Safari n'expose PushManager qu'une fois l'app installee : sans l'ordre
    // choisi dans pushState, cet appareil s'entendrait repondre que son
    // navigateur ne sait pas faire, alors qu'il lui manque un seul geste.
    expect(etat({ agent: IPHONE, push: false })).toBe(HOME_SCREEN);
  });

  it("le meme iPhone ajoute a l'ecran d'accueil retrouve le chemin ordinaire", () => {
    expect(etat({ agent: IPHONE, standalone: true })).toBe(IDLE);
  });

  it("un iPad se declare Macintosh et se trahit par ses points de contact", () => {
    expect(etat({ agent: MAC, touches: 5, push: false })).toBe(HOME_SCREEN);
  });

  it("un vrai Mac n'est pas pris pour un iPad", () => {
    expect(etat({ agent: MAC, permission: "granted" })).toBe(GRANTED);
  });

  it("une fenetre vide ne fait pas tomber l'inspection", () => {
    expect(pushState(inspect({}))).toBe(UNSUPPORTED);
  });
});

describe("les etats qui ferment l'interrupteur", () => {
  it.each([UNSUPPORTED, HOME_SCREEN, DENIED])("%s porte une explication", (state) => {
    expect(blockingReason(state)).toBe(state);
  });

  it.each([IDLE, GRANTED])("%s laisse l'interrupteur libre", (state) => {
    expect(blockingReason(state)).toBeNull();
  });
});

describe("la cle publique du serveur", () => {
  it("se lit en base64 url-safe sans remplissage", () => {
    const octets = decodeVapidKey("q-_A");

    expect([...octets]).toEqual([171, 239, 192]);
  });

  it("une cle VAPID complete fait bien soixante-cinq octets", () => {
    // Une cle P-256 non compressee : 0x04 puis deux coordonnees de 32 octets.
    const brute = new Uint8Array(65).fill(7);
    brute[0] = 4;
    const encodee = btoa(String.fromCharCode(...brute))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    expect(decodeVapidKey(encodee)).toHaveLength(65);
  });
});

describe("ce qui part vers l'API", () => {
  const abonnement = {
    toJSON: () => ({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      expirationTime: null,
      keys: { p256dh: "cle", auth: "secret" },
    }),
  };

  it("les trois champs attendus, et rien d'autre", () => {
    // L'API refuse tout champ inconnu : recopier le toJSON du navigateur ferait
    // echouer l'enregistrement apres que la permission a ete accordee.
    expect(subscriptionPayload(abonnement, "Chrome")).toEqual({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      p256dh: "cle",
      auth: "secret",
      user_agent: "Chrome",
    });
  });

  it("un user-agent trop long est coupe a la longueur que la colonne accepte", () => {
    const payload = subscriptionPayload(abonnement, "x".repeat(400));

    expect(payload.user_agent).toHaveLength(255);
  });

  it("un user-agent absent vaut nul, pas une chaine vide", () => {
    expect(subscriptionPayload(abonnement, "").user_agent).toBeNull();
  });
});

describe("la cle qui a cree l'abonnement", () => {
  const cle = decodeVapidKey("BFakeKeyForTests_-ab");

  it("reconnait la sienne", () => {
    const abonnement = { options: { applicationServerKey: cle.buffer } };

    expect(keyMatches(abonnement, cle)).toBe(true);
  });

  it("refuse celle d'une autre paire", () => {
    const abonnement = { options: { applicationServerKey: decodeVapidKey("BAutreCle___").buffer } };

    expect(keyMatches(abonnement, cle)).toBe(false);
  });

  it("un abonnement sans cle enregistree est a refaire", () => {
    expect(keyMatches({ options: {} }, cle)).toBe(false);
  });
});
