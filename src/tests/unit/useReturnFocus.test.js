import { beforeEach, describe, expect, it, vi } from "vitest";

// Le hook enregistre son auditeur focusin a l'import : le document minimal doit
// donc exister avant, et le module etre recharge a chaque scenario.
class ElementFactice {
  constructor(nom, dansDialogue = false) {
    this.nom = nom;
    this.dansDialogue = dansDialogue;
    this.isConnected = true;
    this.focalise = 0;
  }

  closest(selecteur) {
    return this.dansDialogue && selecteur.includes("dialog") ? {} : null;
  }

  focus() {
    this.focalise += 1;
  }
}

let auditeurs;
let effets;

async function chargerHook() {
  auditeurs = [];
  effets = [];
  globalThis.Element = ElementFactice;
  globalThis.document = {
    body: new ElementFactice("body"),
    addEventListener: (type, fn) => auditeurs.push({ type, fn }),
  };

  vi.resetModules();
  vi.doMock("react", () => ({
    useRef: (init) => ({ current: init }),
    useCallback: (fn) => fn,
    useEffect: (fn) => effets.push(fn),
  }));

  const { useReturnFocus } = await import("../../core/utils/useReturnFocus");
  return useReturnFocus;
}

function focusSur(node) {
  auditeurs.filter((a) => a.type === "focusin").forEach((a) => a.fn({ target: node }));
}

function monter(useReturnFocus, actif = true) {
  effets = [];
  const restaurer = useReturnFocus(actif);
  effets.forEach((effet) => effet());
  return restaurer;
}

let useReturnFocus;

beforeEach(async () => {
  useReturnFocus = await chargerHook();
});

describe("useReturnFocus", () => {
  it("s'abonne une seule fois aux changements de focus", () => {
    expect(auditeurs).toHaveLength(1);
    expect(auditeurs[0].type).toBe("focusin");
  });

  it("rend le focus au bouton qui a ouvert le dialogue", () => {
    const ajouter = new ElementFactice("bouton Ajouter");
    focusSur(ajouter);

    const restaurer = monter(useReturnFocus);
    focusSur(new ElementFactice("champ Nom", true)); // autoFocus dans le dialogue
    restaurer();

    expect(ajouter.focalise).toBe(1);
  });

  it("ce qui se passe dans le dialogue n'ecrase pas l'origine", () => {
    // C'est tout l'interet de suivre le focus en continu plutot que de le lire a
    // l'ouverture : quand les effets s'executent, autoFocus a deja frappe.
    const regler = new ElementFactice("bouton Regler");
    focusSur(regler);

    const restaurer = monter(useReturnFocus);
    focusSur(new ElementFactice("champ Montant", true));
    focusSur(new ElementFactice("bouton Confirmer", true));
    restaurer();

    expect(regler.focalise).toBe(1);
  });

  it("ne focalise pas un noeud qui a quitte le document", () => {
    // Le cas de la suppression : le bouton d'origine n'existe plus, et un
    // focus() dessus laisserait le focus sur body.
    const supprimer = new ElementFactice("bouton Supprimer");
    focusSur(supprimer);

    const restaurer = monter(useReturnFocus);
    supprimer.isConnected = false;
    restaurer();

    expect(supprimer.focalise).toBe(0);
  });

  it("ne refocalise pas body quand rien n'etait focalise", () => {
    focusSur(globalThis.document.body);

    monter(useReturnFocus)();

    expect(globalThis.document.body.focalise).toBe(0);
  });

  it("ne rejoue pas la restitution au second appel", () => {
    const bouton = new ElementFactice("bouton");
    focusSur(bouton);

    const restaurer = monter(useReturnFocus);
    restaurer();
    restaurer();

    expect(bouton.focalise).toBe(1);
  });

  it("ne memorise rien tant que le dialogue est ferme", () => {
    // ConfirmDialog reste monte et bascule sur open : chaque ouverture doit
    // capturer a nouveau, sinon la deuxieme rendrait le focus au declencheur de
    // la premiere.
    const premier = new ElementFactice("premier declencheur");
    focusSur(premier);
    monter(useReturnFocus, false);

    const second = new ElementFactice("second declencheur");
    focusSur(second);
    const restaurer = monter(useReturnFocus, true);
    restaurer();

    expect(second.focalise).toBe(1);
    expect(premier.focalise).toBe(0);
  });
});
