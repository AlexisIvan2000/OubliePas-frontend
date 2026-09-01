import { beforeEach, describe, expect, it, vi } from "vitest";

// Deux instances du meme crochet, chacune avec ses propres etats : c'est le
// montage qui reproduit la panne, une barre laterale et un tableau de bord qui
// lisent la meme cle.
let actif = null;

function memesDeps(avant, apres) {
  return (
    Array.isArray(avant) &&
    Array.isArray(apres) &&
    avant.length === apres.length &&
    avant.every((valeur, index) => Object.is(valeur, apres[index]))
  );
}

function boite() {
  return {
    etats: [],
    callbacks: [],
    montes: [],
    rendus: [],
    curseurEtat: 0,
    curseurCallback: 0,
    curseurEffet: 0,
  };
}

async function harnais() {
  vi.resetModules();
  // Les tableaux de dependances comptent ici : sans eux le harnais rejouerait
  // le chargement a chaque rendu, et la lecture fraiche ecraserait justement ce
  // que le test cherche a voir arriver.
  vi.doMock("react", () => ({
    useState: (initial) => {
      const index = actif.curseurEtat++;
      const sienne = actif;
      if (!(index in sienne.etats)) {
        sienne.etats[index] = typeof initial === "function" ? initial() : initial;
      }
      return [
        sienne.etats[index],
        (suivant) => {
          sienne.etats[index] =
            typeof suivant === "function" ? suivant(sienne.etats[index]) : suivant;
        },
      ];
    },
    useCallback: (fn, deps) => {
      const index = actif.curseurCallback++;
      const memo = actif.callbacks[index];
      if (memo && memesDeps(memo.deps, deps)) {
        return memo.fn;
      }
      actif.callbacks[index] = { fn, deps };
      return fn;
    },
    useEffect: (fn, deps) => {
      actif.rendus.push({ index: actif.curseurEffet++, fn, deps });
    },
  }));

  const { useResource } = await import("../../core/network/useResource");
  const cache = await import("../../core/network/resourceCache");

  function instance() {
    const sienne = boite();

    const passe = () => {
      for (const { index, fn, deps } of sienne.rendus) {
        const monte = sienne.montes[index];
        if (monte && memesDeps(monte.deps, deps)) {
          continue;
        }
        monte?.nettoyage?.();
        sienne.montes[index] = { deps, nettoyage: fn() };
      }
      sienne.rendus = [];
    };

    return {
      async rendre(key, fetcher) {
        actif = sienne;
        sienne.curseurEtat = 0;
        sienne.curseurCallback = 0;
        sienne.curseurEffet = 0;
        sienne.rendus = [];

        useResource(key, fetcher);
        passe();
        await Promise.resolve();
        await Promise.resolve();

        actif = sienne;
        sienne.curseurEtat = 0;
        sienne.curseurCallback = 0;
        sienne.curseurEffet = 0;
        sienne.rendus = [];
        const rendu = useResource(key, fetcher);
        passe();
        return rendu;
      },
      demonter() {
        sienne.montes.forEach((monte) => monte?.nettoyage?.());
        sienne.montes = [];
      },
    };
  }

  return { instance, cache };
}

describe("deux ecrans qui lisent la meme cle", () => {
  it("l'un voit ce que l'autre vient d'ecrire", async () => {
    // La panne rapportee : la pastille des retards de la barre laterale gardait
    // son ancien compte apres un paiement, et n'obeissait qu'a une navigation
    // ou un rechargement. Le cache etait partage, la notification manquait.
    const { instance } = await harnais();
    const chercher = vi.fn(async () => ({ lateCount: 2 }));

    const barre = instance();
    const tableau = instance();
    expect((await barre.rendre("summary", chercher)).data).toEqual({ lateCount: 2 });
    await tableau.rendre("summary", chercher);

    const { setData } = await tableau.rendre("summary", chercher);
    setData({ lateCount: 0 });

    actif = null;
    expect((await barre.rendre("summary", chercher)).data).toEqual({ lateCount: 0 });
  });

  it("une ecriture sur une autre cle ne les derange pas", async () => {
    const { instance, cache } = await harnais();
    const barre = instance();
    await barre.rendre("summary", async () => ({ lateCount: 2 }));

    cache.writeResource("occurrences:janvier", []);

    expect((await barre.rendre("summary", async () => ({ lateCount: 2 }))).data).toEqual({
      lateCount: 2,
    });
  });

  it("un ecran demonte n'est plus notifie", async () => {
    // Sans desabonnement, chaque navigation laisserait un abonne de plus, et
    // une ecriture appellerait le setState de composants disparus.
    const { instance, cache } = await harnais();
    const barre = instance();
    await barre.rendre("summary", async () => ({ lateCount: 2 }));

    barre.demonter();

    expect(() => cache.writeResource("summary", { lateCount: 0 })).not.toThrow();
    expect(cache.readResource("summary")).toEqual({ lateCount: 0 });
  });
});

describe("le rafraichissement d'une lecture derivee", () => {
  let cache;

  beforeEach(async () => {
    vi.resetModules();
    cache = await import("../../core/network/resourceCache");
    cache.clearResources();
  });

  it("un desabonnement fait taire la notification", async () => {
    // Sans lui, chaque navigation laisserait un abonne de plus derriere elle,
    // et une ecriture appellerait le setState de composants disparus.
    const vus = [];
    const oublier = cache.subscribeResource("summary", (valeur) => vus.push(valeur));

    oublier();
    cache.writeResource("summary", { lateCount: 0 });

    expect(vus).toEqual([]);
  });

  it("ecrit la valeur fraiche et previent les abonnes", async () => {
    const vus = [];
    cache.subscribeResource("summary", (valeur) => vus.push(valeur));

    await cache.refreshResource("summary", async () => ({ lateCount: 0 }));

    expect(cache.readResource("summary")).toEqual({ lateCount: 0 });
    expect(vus).toEqual([{ lateCount: 0 }]);
  });

  it("une lecture en echec laisse la valeur en place", async () => {
    // Le paiement, lui, est passe : faire echouer l'ecran sur la pastille
    // annoncerait une panne qui n'a pas eu lieu.
    cache.writeResource("summary", { lateCount: 2 });

    await expect(
      cache.refreshResource("summary", async () => {
        throw new Error("reseau");
      }),
    ).resolves.toBeUndefined();

    expect(cache.readResource("summary")).toEqual({ lateCount: 2 });
  });

  it("une reponse partie avant une deconnexion n'atterrit pas dans la session suivante", async () => {
    const attente = cache.refreshResource("summary", async () => {
      cache.clearResources();
      return { lateCount: 9 };
    });

    await attente;

    expect(cache.readResource("summary")).toBeUndefined();
  });
});

describe("tout reglement rafraichit le resume", () => {
  async function crochet({ echoue = false } = {}) {
    vi.resetModules();
    const etats = [];
    let curseur = 0;

    vi.doMock("react", () => ({
      useState: (initial) => {
        const index = curseur++;
        if (!(index in etats)) {
          etats[index] = typeof initial === "function" ? initial() : initial;
        }
        return [etats[index], (suivant) => {
          etats[index] = typeof suivant === "function" ? suivant(etats[index]) : suivant;
        }];
      },
    }));

    const getSummary = vi.fn(async () => ({ lateCount: 0 }));
    vi.doMock("../../features/commitments/data/commitmentsApi", () => ({
      SUMMARY: "summary",
      getSummary,
      updateOccurrence: vi.fn(async () => {
        if (echoue) {
          throw new Error("refus");
        }
        return { id: "o1", status: "paid" };
      }),
    }));
    vi.doMock("../../core/components/Toast/useToast", () => ({
      useToast: () => ({ push: vi.fn() }),
    }));
    vi.doMock("../../core/translation/useTranslation", () => ({
      useTranslation: () => ({ t: (cle) => cle }),
    }));

    const cache = await import("../../core/network/resourceCache");
    cache.clearResources();
    cache.writeResource("summary", { lateCount: 2 });

    const { useSettle } = await import(
      "../../features/commitments/presentation/providers/useSettle"
    );

    curseur = 0;
    return { settle: useSettle(() => {}), cache, getSummary };
  }

  it("payer depuis n'importe quel ecran recompte les retards", async () => {
    // Le calendrier ne rafraichissait rien du tout : la pastille y survivait au
    // paiement jusqu'a ce qu'on change de page.
    const { settle, cache, getSummary } = await crochet();

    settle.pick({ id: "o1", status: "paid" });
    await new Promise((resolu) => setTimeout(resolu, 0));

    expect(getSummary).toHaveBeenCalled();
    expect(cache.readResource("summary")).toEqual({ lateCount: 0 });
  });

  it("un reglement refuse ne touche pas au compte", async () => {
    const { settle, cache, getSummary } = await crochet({ echoue: true });

    settle.pick({ id: "o1", status: "paid" });
    await new Promise((resolu) => setTimeout(resolu, 0));

    expect(getSummary).not.toHaveBeenCalled();
    expect(cache.readResource("summary")).toEqual({ lateCount: 2 });
  });
});
