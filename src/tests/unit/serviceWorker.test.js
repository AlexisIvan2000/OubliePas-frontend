import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

import { beforeEach, describe, expect, it, vi } from "vitest";

const SOURCE = readFileSync("public/sw.js", "utf8");
const ORIGIN = "https://oubliepas.com";
const SHELL_CACHE = "oubliepas-shell-v1";
const ASSET_CACHE = "oubliepas-assets-v1";

function requete(url, { method = "GET", mode = "no-cors" } = {}) {
  return { method, mode, url: new URL(url, ORIGIN).href };
}

const navigation = (chemin) => requete(chemin, { mode: "navigate" });

// Le Request de Node exige une adresse absolue ; celui d'un worker la resout
// contre sa propre origine, comme le fait le worker au pre-cache.
class FauxRequest {
  constructor(url, init = {}) {
    this.url = new URL(url, ORIGIN).href;
    this.method = init.method ?? "GET";
    this.mode = init.mode ?? "no-cors";
    this.cache = init.cache;
  }
}

function page(corps) {
  return new Response(corps, { status: 200, headers: { "Content-Type": "text/html" } });
}

class FauxCache {
  constructor() {
    this.entrees = new Map();
  }

  clef(cle) {
    return typeof cle === "string" ? new URL(cle, ORIGIN).href : cle.url;
  }

  async put(cle, reponse) {
    this.entrees.set(this.clef(cle), reponse);
  }

  async match(cle) {
    return this.entrees.get(this.clef(cle));
  }

  async keys() {
    return [...this.entrees.keys()].map((url) => ({ url }));
  }

  async delete(cle) {
    return this.entrees.delete(this.clef(cle));
  }
}

class FauxCaches {
  constructor() {
    this.boites = new Map();
  }

  async open(nom) {
    if (!this.boites.has(nom)) {
      this.boites.set(nom, new FauxCache());
    }
    return this.boites.get(nom);
  }

  async keys() {
    return [...this.boites.keys()];
  }

  async delete(nom) {
    return this.boites.delete(nom);
  }

  async match(cle, { cacheName } = {}) {
    const fouillees = cacheName ? [this.boites.get(cacheName)] : [...this.boites.values()];
    for (const boite of fouillees) {
      const trouve = await boite?.match(cle);
      if (trouve) {
        return trouve;
      }
    }
    return undefined;
  }
}

function evenement(request) {
  const event = {
    request,
    reponse: null,
    attendu: null,
    respondWith(promesse) {
      event.reponse = promesse;
    },
    waitUntil(promesse) {
      event.attendu = promesse;
    },
  };
  return event;
}

function worker() {
  const ecouteurs = new Map();
  const caches = new FauxCaches();
  const fetch = vi.fn(async () => page("reseau"));
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type, ecouteur) => ecouteurs.set(type, ecouteur),
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn(async () => {}) },
    registration: { showNotification: vi.fn(async () => {}) },
  };

  runInNewContext(SOURCE, {
    self,
    caches,
    fetch,
    Request: FauxRequest,
    Response,
    URL,
    console,
  });

  return {
    caches,
    fetch,
    self,
    ecouteurs,
    async recevoir(type, event) {
      ecouteurs.get(type)(event);
      await event.attendu;
      return event.reponse;
    },
  };
}

let sw;

beforeEach(() => {
  sw = worker();
});

describe("le gestionnaire qui rend l'application installable", () => {
  it("le worker declare un ecouteur fetch", () => {
    // Chrome ne propose l'installation qu'a un worker qui en declare un. Le
    // retirer ne casse aucun ecran : l'app cesse seulement d'etre installable,
    // et rien nulle part ne le dit.
    expect(sw.ecouteurs.has("fetch")).toBe(true);
  });
});

describe("le cycle de mise a jour", () => {
  it("un seul rechargement suffit apres un deploiement", async () => {
    // La coquille en cache designe l'ancien bundle. Si la navigation la servait
    // en premier, un testeur ouvert pendant la livraison rechargerait une fois
    // pour reveiller le worker, puis une seconde pour voir la nouvelle version.
    const boite = await sw.caches.open(SHELL_CACHE);
    await boite.put("/", page("<script src=/assets/vieux.js>"));
    sw.fetch.mockResolvedValue(page("<script src=/assets/neuf.js>"));

    const reponse = await sw.recevoir("fetch", evenement(navigation("/calendrier")));

    expect(await (await reponse).text()).toContain("neuf.js");
  });

  it("et la coquille fraiche remplace celle qui vient d'etre servie", async () => {
    await sw.recevoir("fetch", evenement(navigation("/abonnements")));

    const garde = await (await sw.caches.open(SHELL_CACHE)).match("/");
    expect(await garde.text()).toBe("reseau");
  });

  it("le worker neuf n'attend pas la fermeture des onglets", async () => {
    // Sans skipWaiting un worker corrige resterait en attente tant qu'un seul
    // onglet reste ouvert, c'est-a-dire indefiniment sur un telephone.
    await sw.recevoir("install", evenement());

    expect(sw.self.skipWaiting).toHaveBeenCalled();
  });

  it("l'installation pre-cache la coquille en court-circuitant le cache HTTP", async () => {
    await sw.recevoir("install", evenement());

    expect(sw.fetch.mock.calls[0][0].cache).toBe("reload");
    expect(await (await sw.caches.open(SHELL_CACHE)).match("/")).toBeTruthy();
  });

  it("l'activation efface les caches des versions precedentes", async () => {
    await sw.caches.open("oubliepas-shell-v0");
    await sw.caches.open("oubliepas-assets-v0");
    await sw.caches.open(ASSET_CACHE);

    await sw.recevoir("activate", evenement());

    expect(await sw.caches.keys()).toEqual([ASSET_CACHE]);
  });

  it("et ne touche pas au cache d'une autre application du meme domaine", async () => {
    await sw.caches.open("une-autre-appli");

    await sw.recevoir("activate", evenement());

    expect(await sw.caches.keys()).toContain("une-autre-appli");
  });
});

describe("hors ligne", () => {
  it("une navigation retombe sur la coquille gardee", async () => {
    const boite = await sw.caches.open(SHELL_CACHE);
    await boite.put("/", page("coquille"));
    sw.fetch.mockRejectedValue(new TypeError("hors ligne"));

    const reponse = await sw.recevoir("fetch", evenement(navigation("/repartition")));

    expect(await (await reponse).text()).toBe("coquille");
  });

  it("sans coquille gardee, la panne remonte au navigateur", async () => {
    sw.fetch.mockRejectedValue(new TypeError("hors ligne"));
    const event = evenement(navigation("/"));

    sw.ecouteurs.get("fetch")(event);

    await expect(event.reponse).rejects.toThrow("hors ligne");
  });
});

describe("les fichiers empreintes", () => {
  it("sont servis du cache sans toucher le reseau", async () => {
    const actif = requete("/assets/index-abc123.js");
    const boite = await sw.caches.open(ASSET_CACHE);
    await boite.put(actif, page("garde"));

    const reponse = await sw.recevoir("fetch", evenement(actif));

    expect(await (await reponse).text()).toBe("garde");
    expect(sw.fetch).not.toHaveBeenCalled();
  });

  it("sont gardes au premier passage", async () => {
    const actif = requete("/assets/index-abc123.js");

    await sw.recevoir("fetch", evenement(actif));

    expect(await (await sw.caches.open(ASSET_CACHE)).match(actif)).toBeTruthy();
  });

  it("restent tous la tant que la borne n'est pas atteinte", async () => {
    // Une fin negative fait compter slice depuis la fin du tableau : la coupe
    // s'est deja declenchee des la trente-et-unieme entree, et le cache se
    // vidait par la tete pendant que la borne annoncait soixante.
    for (let index = 0; index < 40; index += 1) {
      await sw.recevoir("fetch", evenement(requete("/assets/bundle-" + index + ".js")));
    }

    expect(await (await sw.caches.open(ASSET_CACHE)).keys()).toHaveLength(40);
  });

  it("ne s'accumulent pas d'un deploiement a l'autre", async () => {
    // Chaque livraison publie un bundle sous un nom neuf que rien ne remplace :
    // sans coupe, le cache grossit d'une version par livraison, pour toujours.
    for (let index = 0; index < 65; index += 1) {
      await sw.recevoir("fetch", evenement(requete("/assets/bundle-" + index + ".js")));
    }

    expect(await (await sw.caches.open(ASSET_CACHE)).keys()).toHaveLength(60);
  });

  it("et le plus ancien part en premier", async () => {
    for (let index = 0; index < 61; index += 1) {
      await sw.recevoir("fetch", evenement(requete("/assets/bundle-" + index + ".js")));
    }

    const gardes = await (await sw.caches.open(ASSET_CACHE)).keys();
    expect(gardes[0].url).toContain("bundle-1.js");
  });
});

describe("ce que le worker ne met jamais en cache", () => {
  it("une reponse de l'API", async () => {
    // Un montant perime resservi avec assurance est pire qu'une erreur reseau.
    const event = evenement(requete("https://api.oubliepas.com/v1/commitments"));

    sw.ecouteurs.get("fetch")(event);

    expect(event.reponse).toBeNull();
  });

  it("un fichier etranger, meme sous un chemin qui ressemble au notre", async () => {
    // Ici le chemin ne distingue rien : seule l'origine separe le bundle d'un
    // fichier servi par quelqu'un d'autre, qu'on garderait alors sans jamais
    // pouvoir le dater ni le purger.
    const event = evenement(requete("https://un-cdn-etranger.example/assets/index-abc123.js"));

    sw.ecouteurs.get("fetch")(event);

    expect(event.reponse).toBeNull();
  });

  it("une ecriture, meme vers son propre domaine", async () => {
    const event = evenement(requete("/assets/index-abc123.js", { method: "POST" }));

    sw.ecouteurs.get("fetch")(event);

    expect(event.reponse).toBeNull();
  });

  it("un fichier de la racine qui n'est pas une navigation", async () => {
    const event = evenement(requete("/manifest.webmanifest"));

    sw.ecouteurs.get("fetch")(event);

    expect(event.reponse).toBeNull();
  });

  it("une reponse en erreur", async () => {
    sw.fetch.mockResolvedValue(new Response("absent", { status: 404 }));

    await sw.recevoir("fetch", evenement(requete("/assets/disparu.js")));

    expect(await (await sw.caches.open(ASSET_CACHE)).keys()).toEqual([]);
  });
});
