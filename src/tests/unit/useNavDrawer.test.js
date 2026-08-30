import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Meme harnais que les autres crochets : React reduit a un etat minimal et les
// effets rejoues a la main. Rien n'est rendu, donc rien de ce qui est teste ici
// ne depend du DOM.
let etats;
let refs;
let effets;
let nettoyages;
let ecouteurs;
let focusRendu;
let verrous;

async function chargerCrochet() {
  etats = [];
  refs = [];
  effets = [];
  nettoyages = [];

  vi.resetModules();
  vi.doMock("react", () => {
    let curseurEtat = 0;
    let curseurRef = 0;
    return {
      __rendre: () => {
        curseurEtat = 0;
        curseurRef = 0;
        effets = [];
      },
      useState: (initial) => {
        const index = curseurEtat++;
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
      useRef: (initial) => {
        const index = curseurRef++;
        if (!(index in refs)) {
          refs[index] = { current: initial };
        }
        return refs[index];
      },
      useCallback: (fn) => fn,
      useEffect: (fn) => effets.push(fn),
    };
  });

  vi.doMock("../../core/utils/useReturnFocus", () => ({
    useReturnFocus: () => () => {
      focusRendu += 1;
    },
  }));

  vi.doMock("../../core/utils/useScrollLock", () => ({
    useScrollLock: (actif) => {
      verrous.push(actif);
    },
  }));

  const react = await import("react");
  const module = await import("../../core/components/AppShell/useNavDrawer");

  return (chemin) => {
    react.__rendre();
    const tiroir = module.useNavDrawer(chemin);
    nettoyages.forEach((fn) => fn?.());
    nettoyages = effets.map((effet) => effet());
    return tiroir;
  };
}

beforeEach(() => {
  focusRendu = 0;
  verrous = [];
  ecouteurs = new Map();
  vi.stubGlobal("window", {
    addEventListener: (type, handler) => ecouteurs.set(type, handler),
    removeEventListener: (type, handler) => {
      if (ecouteurs.get(type) === handler) {
        ecouteurs.delete(type);
      }
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const echap = () => ecouteurs.get("keydown")?.({ key: "Escape" });

describe("l'etat du tiroir", () => {
  it("part ferme", async () => {
    const rendre = await chargerCrochet();

    expect(rendre("/").open).toBe(false);
  });

  it("le bouton l'ouvre puis le referme", async () => {
    const rendre = await chargerCrochet();

    rendre("/").toggle();
    expect(rendre("/").open).toBe(true);

    rendre("/").toggle();
    expect(rendre("/").open).toBe(false);
  });

  it("le defilement de la page n'est verrouille que tiroir ouvert", async () => {
    const rendre = await chargerCrochet();

    rendre("/");
    rendre("/").toggle();
    rendre("/");

    expect(verrous.at(0)).toBe(false);
    expect(verrous.at(-1)).toBe(true);
  });
});

describe("la fermeture", () => {
  it("Echap ferme le tiroir ouvert", async () => {
    const rendre = await chargerCrochet();

    rendre("/").toggle();
    rendre("/");
    echap();

    expect(rendre("/").open).toBe(false);
  });

  it("aucune touche n'est ecoutee tant que le tiroir est ferme", async () => {
    // Un ecouteur global pose en permanence intercepterait l'Echap d'un
    // dialogue ouvert par-dessus la page.
    const rendre = await chargerCrochet();

    rendre("/");

    expect(ecouteurs.has("keydown")).toBe(false);
  });

  it("le voile rend le focus au bouton", async () => {
    const rendre = await chargerCrochet();

    rendre("/").toggle();
    rendre("/").close();

    expect(rendre("/").open).toBe(false);
    expect(focusRendu).toBeGreaterThan(0);
  });
});

describe("la navigation", () => {
  it("changer de page referme le tiroir", async () => {
    // Sans cela le panneau resterait ouvert par-dessus la page qu'on vient
    // d'atteindre, et il faudrait le fermer pour voir ce qu'on a demande.
    const rendre = await chargerCrochet();

    rendre("/").toggle();
    expect(rendre("/").open).toBe(true);

    rendre("/calendrier");

    expect(rendre("/calendrier").open).toBe(false);
  });

  it("rend le focus, que le lien cliqué emportait avec lui", async () => {
    const rendre = await chargerCrochet();

    rendre("/").toggle();
    rendre("/");
    const avant = focusRendu;

    rendre("/reglages");

    expect(focusRendu).toBeGreaterThan(avant);
  });

  it("le premier rendu n'est pas une navigation", async () => {
    // Fermer des le montage rappellerait un focus que personne n'a deplace.
    const rendre = await chargerCrochet();

    rendre("/abonnements");

    expect(focusRendu).toBe(0);
  });
});
