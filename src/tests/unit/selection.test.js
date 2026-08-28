import { describe, expect, it } from "vitest";

import {
  BULK_CONFIRM_ABOVE,
  bulkActions,
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

describe("bulkActions", () => {
  const noms = (actions) => actions.map((action) => action.labelKey);

  it("une selection d'archives ne propose jamais de les archiver", () => {
    // Le defaut d'origine : la barre etait figee et proposait "Archiver" sur
    // des lignes deja archivees, un lot vide et un message absurde.
    const actions = bulkActions([ligne("a", "archived"), ligne("b", "archived")]);

    expect(noms(actions)).toEqual(["commitments.restore"]);
  });

  it("une selection d'archives se desarchive d'un geste", () => {
    const [action] = bulkActions([ligne("a", "archived")]);

    expect(action.status).toBe("active");
    expect(action.icon).toBe("restore");
    expect(action.partial).toBe(false);
  });

  it("une selection active propose la pause et l'archive, pas la reprise", () => {
    const actions = bulkActions([ligne("a"), ligne("b")]);

    expect(noms(actions)).toEqual(["commitments.bulkPause", "commitments.bulkArchive"]);
  });

  it("une selection en pause propose la reprise, pas une seconde pause", () => {
    const actions = bulkActions([ligne("a", "paused"), ligne("b", "paused")]);

    expect(noms(actions)).toEqual(["commitments.resume", "commitments.bulkArchive"]);
  });

  it("un melange actif et pause compte ce que chaque action concerne", () => {
    const actions = bulkActions([ligne("a"), ligne("b"), ligne("c"), ligne("d", "paused")]);
    const par = Object.fromEntries(actions.map((action) => [action.status, action]));

    expect(par.paused).toMatchObject({ count: 3, partial: true });
    expect(par.active).toMatchObject({ count: 1, partial: true });
    expect(par.archived).toMatchObject({ count: 4, partial: false });
  });

  it("le retour a l'actif ne se dit desarchiver que sur un lot homogene", () => {
    // Depuis une pause on reprend, depuis une archive on desarchive : un lot
    // qui melange les deux garde le nom le plus general.
    const actions = bulkActions([ligne("a", "paused"), ligne("b", "archived")]);
    const retour = actions.find((action) => action.status === "active");

    expect(retour.labelKey).toBe("commitments.resume");
    expect(retour.count).toBe(2);
  });

  it("l'archive reste possible sur un melange actif et pause", () => {
    const actions = bulkActions([ligne("a"), ligne("b", "paused")]);
    const archive = actions.find((action) => action.status === "archived");

    expect(archive.partial).toBe(false);
  });

  it("une selection vide ne propose rien", () => {
    expect(bulkActions([])).toEqual([]);
  });

  it("l'ordre des actions ne depend pas de l'ordre de la selection", () => {
    const gauche = bulkActions([ligne("a"), ligne("b", "paused")]);
    const droite = bulkActions([ligne("b", "paused"), ligne("a")]);

    expect(noms(gauche)).toEqual(noms(droite));
  });
});

describe("le seuil de confirmation", () => {
  it("cinq lignes passent sans confirmation, six la demandent", () => {
    expect(5 > BULK_CONFIRM_ABOVE).toBe(false);
    expect(6 > BULK_CONFIRM_ABOVE).toBe(true);
  });
});
