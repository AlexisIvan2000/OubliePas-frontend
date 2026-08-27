import { beforeEach, describe, expect, it, vi } from "vitest";

// Meme technique que useReturnFocus : React est remplace par un etat minimal,
// et chaque rendu est declenche a la main. Sans cela, ces transitions ne
// seraient verifiables qu'a l'oeil dans le navigateur.
class ElementFactice {
  constructor() {
    this.isConnected = true;
    this.focalise = 0;
  }

  focus() {
    this.focalise += 1;
  }
}

let etats;
let refs;
let useSelection;

async function chargerHook() {
  etats = [];
  refs = [];

  vi.resetModules();
  vi.doMock("react", () => {
    let curseurEtat = 0;
    let curseurRef = 0;
    return {
      __rendre: () => {
        curseurEtat = 0;
        curseurRef = 0;
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
    };
  });

  const react = await import("react");
  const module = await import("../../features/commitments/presentation/hooks/useSelection");
  useSelection = () => {
    react.__rendre();
    return module.useSelection();
  };
  return useSelection();
}

beforeEach(() => {
  globalThis.document = { activeElement: null };
});

describe("useSelection", () => {
  it("commence hors du mode, sans rien de choisi", async () => {
    const hook = await chargerHook();

    expect(hook.picking).toBe(false);
    expect([...hook.selected]).toEqual([]);
  });

  it("entrer avec une ligne la choisit tout de suite", async () => {
    const hook = await chargerHook();

    hook.start("a");

    const apres = useSelection();
    expect(apres.picking).toBe(true);
    expect([...apres.selected]).toEqual(["a"]);
  });

  it("entrer sans ligne ouvre le mode a vide", async () => {
    const hook = await chargerHook();

    hook.start();

    expect([...useSelection().selected]).toEqual([]);
  });

  it("une ligne se coche puis se decoche", async () => {
    const hook = await chargerHook();
    hook.start("a");

    useSelection().toggle("b");
    expect([...useSelection().selected]).toEqual(["a", "b"]);

    useSelection().toggle("a");
    expect([...useSelection().selected]).toEqual(["b"]);
  });

  it("tout selectionner prend la liste visible, un second appel la vide", async () => {
    const hook = await chargerHook();
    hook.start();

    useSelection().toggleAll(["a", "b", "c"]);
    expect([...useSelection().selected]).toEqual(["a", "b", "c"]);

    useSelection().toggleAll(["a", "b", "c"]);
    expect([...useSelection().selected]).toEqual([]);
  });

  it("sortir du mode vide la selection", async () => {
    const hook = await chargerHook();
    hook.start("a");
    useSelection().toggle("b");
    expect(useSelection().selected.size).toBe(2);

    useSelection().stop();

    const apres = useSelection();
    expect(apres.picking).toBe(false);
    expect([...apres.selected]).toEqual([]);
  });

  it("revenir dans le mode ne retrouve pas l'ancienne selection", async () => {
    // C'est la raison du vidage : entre deux passages, un filtre ou une
    // recherche ont pu changer ce qui est a l'ecran.
    const hook = await chargerHook();
    hook.start("a");
    useSelection().toggle("b");
    useSelection().stop();

    useSelection().start();

    expect([...useSelection().selected]).toEqual([]);
  });

  it("sortir rend le focus a l'element qui avait ouvert le mode", async () => {
    const bouton = new ElementFactice();
    globalThis.document = { activeElement: bouton };
    const hook = await chargerHook();
    hook.start("a");

    useSelection().stop();

    expect(bouton.focalise).toBe(1);
  });

  it("un element disparu ne recoit pas le focus", async () => {
    const bouton = new ElementFactice();
    globalThis.document = { activeElement: bouton };
    const hook = await chargerHook();
    hook.start("a");
    bouton.isConnected = false;

    useSelection().stop();

    expect(bouton.focalise).toBe(0);
  });

  it("sortir deux fois de suite ne rend pas le focus deux fois", async () => {
    const bouton = new ElementFactice();
    globalThis.document = { activeElement: bouton };
    const hook = await chargerHook();
    hook.start("a");

    useSelection().stop();
    useSelection().stop();

    expect(bouton.focalise).toBe(1);
  });
});
