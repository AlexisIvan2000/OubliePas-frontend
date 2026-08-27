import { describe, expect, it } from "vitest";

import {
  BULK_CONFIRM_ABOVE,
  previousStatuses,
  undoSteps,
} from "../../features/commitments/domain/commitment";

const ligne = (id, status = "active") => ({ id, status, title: `Ligne ${id}` });

const liste = [
  ligne("a"),
  ligne("b", "paused"),
  ligne("c"),
  ligne("d", "archived"),
  ligne("e"),
];

describe("previousStatuses", () => {
  it("releve l'etat des seules lignes choisies", () => {
    expect(previousStatuses(liste, ["a", "b", "d"])).toEqual([
      { id: "a", status: "active" },
      { id: "b", status: "paused" },
      { id: "d", status: "archived" },
    ]);
  });

  it("ignore un identifiant qui n'est pas dans la liste", () => {
    expect(previousStatuses(liste, ["a", "zzz"])).toEqual([{ id: "a", status: "active" }]);
  });

  it("rend une liste vide quand rien n'est choisi", () => {
    expect(previousStatuses(liste, [])).toEqual([]);
  });
});

describe("undoSteps", () => {
  it("regroupe une selection heterogene par etat d'avant", () => {
    // Trois actives et une en pause archivees ensemble ne reviennent pas au
    // meme etat : l'annulation doit rejouer deux lots, pas un.
    const previous = previousStatuses(liste, ["a", "b", "c"]);

    const steps = undoSteps(previous, ["a", "b", "c"]);

    expect(steps).toEqual([
      { status: "active", ids: ["a", "c"] },
      { status: "paused", ids: ["b"] },
    ]);
  });

  it("ne rejoue que les lignes qui ont reellement bouge", () => {
    // Le serveur peut n'en avoir change qu'une partie : rendre son etat a une
    // ligne restee sur place la ferait bouger pour de bon.
    const previous = previousStatuses(liste, ["a", "b", "c"]);

    expect(undoSteps(previous, ["a"])).toEqual([{ status: "active", ids: ["a"] }]);
  });

  it("ne rejoue rien quand le serveur n'a rien change", () => {
    const previous = previousStatuses(liste, ["a", "b"]);

    expect(undoSteps(previous, [])).toEqual([]);
  });

  it("un seul lot quand la selection etait homogene", () => {
    const previous = previousStatuses(liste, ["a", "c", "e"]);

    expect(undoSteps(previous, ["a", "c", "e"])).toEqual([
      { status: "active", ids: ["a", "c", "e"] },
    ]);
  });

  it("trois lots au plus, un par statut", () => {
    const previous = previousStatuses(liste, ["a", "b", "c", "d", "e"]);

    const steps = undoSteps(previous, ["a", "b", "c", "d", "e"]);

    expect(steps).toHaveLength(3);
    expect(steps.flatMap((step) => step.ids).sort()).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("garde l'ordre de la liste dans chaque lot", () => {
    const previous = previousStatuses(liste, ["e", "a", "c"]);

    expect(undoSteps(previous, ["a", "c", "e"])).toEqual([
      { status: "active", ids: ["a", "c", "e"] },
    ]);
  });
});

describe("le seuil de confirmation", () => {
  it("cinq lignes passent sans confirmation, six la demandent", () => {
    expect(5 > BULK_CONFIRM_ABOVE).toBe(false);
    expect(6 > BULK_CONFIRM_ABOVE).toBe(true);
  });
});
