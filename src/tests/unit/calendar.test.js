import { describe, expect, it } from "vitest";

import { MAX_VISIBLE_EVENTS, buildMonthCells } from "../../features/commitments/domain/calendar";

const echeance = (id, dueDate, overrides = {}) => ({
  id,
  title: `Ligne ${id}`,
  amount: "10.00",
  dueDate,
  status: "pending",
  ...overrides,
});

const septembre = new Date(2026, 8, 1);
const jour = (cells, iso) => cells.find((cell) => cell.iso === iso);

describe("buildMonthCells", () => {
  it("pose une case par jour du mois", () => {
    const cells = buildMonthCells(septembre, [], septembre);

    expect(cells.filter((cell) => !cell.empty)).toHaveLength(30);
  });

  it("comble le debut de grille jusqu'au premier lundi", () => {
    // Le 1er septembre 2026 est un mardi : une seule case vide avant lui.
    const cells = buildMonthCells(septembre, [], septembre);

    expect(cells.filter((cell) => cell.empty)).toHaveLength(1);
    expect(cells[1].day).toBe(1);
  });

  it("range chaque echeance sous son jour", () => {
    const cells = buildMonthCells(
      septembre,
      [echeance("a", "2026-09-18"), echeance("b", "2026-09-02")],
      septembre,
    );

    expect(jour(cells, "2026-09-18").events.map((row) => row.id)).toEqual(["a"]);
    expect(jour(cells, "2026-09-02").events.map((row) => row.id)).toEqual(["b"]);
  });

  it("ignore ce qui appartient a un autre mois", () => {
    const cells = buildMonthCells(
      septembre,
      [echeance("aout", "2026-08-31"), echeance("octobre", "2026-10-01")],
      septembre,
    );

    expect(cells.flatMap((cell) => cell.events ?? [])).toEqual([]);
  });

  it("marque le jour courant, et lui seul", () => {
    const cells = buildMonthCells(septembre, [], new Date(2026, 8, 18));

    expect(cells.filter((cell) => cell.isToday).map((cell) => cell.iso)).toEqual(["2026-09-18"]);
  });

  it("ne marque aucun jour quand on regarde un autre mois", () => {
    const cells = buildMonthCells(septembre, [], new Date(2026, 9, 5));

    expect(cells.some((cell) => cell.isToday)).toBe(false);
  });
});

describe("une journee chargee", () => {
  const quatre = [
    echeance("1", "2026-09-18", { title: "Netflix" }),
    echeance("2", "2026-09-18", { title: "Spotify" }),
    echeance("3", "2026-09-18", { title: "iCloud", status: "paid" }),
    echeance("4", "2026-09-18", { title: "Loyer" }),
  ];

  it("le domaine ne tronque jamais", () => {
    // C'est ce qui rend la reparation possible : la limite des trois lignes est
    // une decision d'affichage, pas une perte de donnee. La quatrieme echeance
    // est bien dans la case, elle n'avait simplement aucun chemin vers l'ecran.
    const cellule = jour(buildMonthCells(septembre, quatre, septembre), "2026-09-18");

    expect(cellule.events).toHaveLength(4);
    expect(cellule.events.length).toBeGreaterThan(MAX_VISIBLE_EVENTS);
  });

  it("conserve l'ordre d'arrivee des echeances", () => {
    const cellule = jour(buildMonthCells(septembre, quatre, septembre), "2026-09-18");

    expect(cellule.events.map((row) => row.title)).toEqual([
      "Netflix",
      "Spotify",
      "iCloud",
      "Loyer",
    ]);
  });

  it("garde les echeances deja reglees dans la case", () => {
    const cellule = jour(buildMonthCells(septembre, quatre, septembre), "2026-09-18");

    expect(cellule.events.filter((row) => row.status === "paid")).toHaveLength(1);
  });

  it("le compte cache est celui qu'affiche le bouton", () => {
    const cellule = jour(buildMonthCells(septembre, quatre, septembre), "2026-09-18");

    expect(cellule.events.length - MAX_VISIBLE_EVENTS).toBe(1);
  });

  it("le filtre du jour retrouve exactement les memes lignes", () => {
    // Le dialogue ne relit pas la grille : il refiltre la liste du mois sur la
    // date. Les deux chemins doivent donner le meme lot, sinon le dialogue
    // montrerait autre chose que la case.
    const cellule = jour(buildMonthCells(septembre, quatre, septembre), "2026-09-18");
    const duJour = quatre.filter((row) => row.dueDate === "2026-09-18");

    expect(duJour.map((row) => row.id)).toEqual(cellule.events.map((row) => row.id));
  });
});
