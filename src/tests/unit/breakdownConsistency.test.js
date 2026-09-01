import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  MAX_SLICES,
  REST_SLICE,
  categoryRows,
  topCategories,
} from "../../features/commitments/domain/commitment";

// Le compte des captures du 31 aout, reconstruit ligne a ligne plutot que
// recopie en totaux : les montants attendus se lisent alors dans le decor, et
// ils ne mentent pas le jour ou le compte change.
const LIGNES_DE_SEPTEMBRE = [
  { titre: "Loyer", categorie: "housing", montant: "700.00" },
  { titre: "Koodo", categorie: "internet", montant: "170.00" },
  { titre: "Electricite", categorie: "energy", montant: "100.00" },
  { titre: "Lifesum", categorie: "entertainment", montant: "12.99" },
  { titre: "Xbox Game Pass Premium", categorie: "entertainment", montant: "16.99" },
  { titre: "Netflix", categorie: "entertainment", montant: "56.79" },
  { titre: "Pure active", categorie: "fitness", montant: "65.00" },
  { titre: "Divers", categorie: "other", montant: "20.68" },
];

const LIGNES_DU_31_AOUT = [
  { titre: "Electricite", categorie: "energy", montant: "100.00" },
  { titre: "Pure active", categorie: "fitness", montant: "65.00" },
  { titre: "Lifesum", categorie: "entertainment", montant: "12.99" },
  { titre: "Xbox Game Pass Premium", categorie: "entertainment", montant: "16.99" },
];

// Ce que le serveur rend dans by_category : deja groupe, deja trie par total
// decroissant puis categorie, les montants en chaines comme toute decimale.
function resumeDuServeur(lignes) {
  const groupes = new Map();
  for (const ligne of lignes) {
    const entree = groupes.get(ligne.categorie) ?? { total: 0, count: 0 };
    entree.total += Number(ligne.montant);
    entree.count += 1;
    groupes.set(ligne.categorie, entree);
  }

  return [...groupes.entries()]
    .map(([category, { total, count }]) => ({
      category,
      total: total.toFixed(2),
      count,
    }))
    .sort(
      (gauche, droite) =>
        Number(droite.total) - Number(gauche.total) ||
        gauche.category.localeCompare(droite.category),
    );
}

const SEPTEMBRE = resumeDuServeur(LIGNES_DE_SEPTEMBRE);
const AOUT = resumeDuServeur(LIGNES_DU_31_AOUT);

const somme = (lignes) => lignes.reduce((total, ligne) => total + Number(ligne.montant), 0);

// Les deux ecrans, tels qu'ils lisent le meme resume.
const tableauDeBord = (resume) => topCategories(resume);
const pageBreakdown = (resume) => categoryRows(resume);

describe("le decor, avant de rien affirmer", () => {
  it("septembre pese ce que la capture annonce, sur six categories", () => {
    expect(somme(LIGNES_DE_SEPTEMBRE)).toBeCloseTo(1142.45, 2);
    expect(SEPTEMBRE).toHaveLength(6);
  });

  it("le 31 aout pese ce que la capture annonce, sur trois categories", () => {
    expect(somme(LIGNES_DU_31_AOUT)).toBeCloseTo(194.98, 2);
    expect(AOUT).toHaveLength(3);
  });
});

describe("une seule repartition, deux vues", () => {
  it("les cinq premieres du tableau de bord sont les cinq premieres du Breakdown", () => {
    // L'invariant du jour : les deux ecrans nommaient des categories
    // differentes parce qu'ils comptaient chacun leur mois.
    const haut = tableauDeBord(SEPTEMBRE).slices.filter(
      (part) => part.category !== REST_SLICE,
    );
    const complet = pageBreakdown(SEPTEMBRE).rows.slice(0, MAX_SLICES);

    expect(haut.map((part) => part.category)).toEqual(
      complet.map((ligne) => ligne.category),
    );
  });

  it("aux memes montants", () => {
    const haut = tableauDeBord(SEPTEMBRE).slices.filter(
      (part) => part.category !== REST_SLICE,
    );
    const complet = pageBreakdown(SEPTEMBRE).rows.slice(0, MAX_SLICES);

    expect(haut.map((part) => part.total)).toEqual(complet.map((ligne) => ligne.total));
  });

  it("et aux memes parts", () => {
    // Les deux parts se rapportent au meme total : celui du mois entier, pas
    // celui des cinq retenues, sinon le tableau de bord annoncerait des
    // pourcentages qui somment a cent sur une repartition tronquee.
    const haut = tableauDeBord(SEPTEMBRE).slices.filter(
      (part) => part.category !== REST_SLICE,
    );
    const complet = pageBreakdown(SEPTEMBRE).rows.slice(0, MAX_SLICES);

    haut.forEach((part, index) => {
      expect(part.share).toBeCloseTo(complet[index].share, 10);
    });
  });

  it("« autres » vaut le total du Breakdown moins le haut du tableau, au cent pres", () => {
    const vue = tableauDeBord(SEPTEMBRE);
    const reste = vue.slices.find((part) => part.category === REST_SLICE);
    const complet = pageBreakdown(SEPTEMBRE);
    const hautDuTableau = vue.slices
      .filter((part) => part.category !== REST_SLICE)
      .reduce((total, part) => total + part.total, 0);

    expect(reste.total).toBeCloseTo(complet.total - hautDuTableau, 2);
    expect(reste.total).toBeCloseTo(20.68, 2);
  });

  it("les deux vues portent le meme total", () => {
    expect(tableauDeBord(SEPTEMBRE).total).toBeCloseTo(pageBreakdown(SEPTEMBRE).total, 2);
    expect(pageBreakdown(SEPTEMBRE).total).toBeCloseTo(1142.45, 2);
  });

  it("sous le seuil, il n'y a pas de ligne « autres » du tout", () => {
    // Trois categories au 31 aout : le tableau de bord montre la repartition
    // entiere, et les deux ecrans coincident ligne pour ligne.
    const vue = tableauDeBord(AOUT);
    const complet = pageBreakdown(AOUT);

    expect(vue.slices.some((part) => part.category === REST_SLICE)).toBe(false);
    expect(vue.slices.map((part) => [part.category, part.total])).toEqual(
      complet.rows.map((ligne) => [ligne.category, ligne.total]),
    );
    expect(complet.total).toBeCloseTo(194.98, 2);
  });

  it("le compte de lignes suit la categorie et non la tranche", () => {
    const complet = pageBreakdown(AOUT);
    const divertissement = complet.rows.find((ligne) => ligne.category === "entertainment");

    expect(divertissement.count).toBe(2);
    expect(divertissement.total).toBeCloseTo(29.98, 2);
  });
});

describe("l'ordre, a montants egaux", () => {
  const EGALITE = [
    { category: "energy", total: "50.00", count: 1 },
    { category: "housing", total: "50.00", count: 1 },
    { category: "fitness", total: "50.00", count: 1 },
  ];

  it("la categorie departage, comme dans le SQL", () => {
    // Un tri sur le seul total laisse l'ordre a l'implementation : les deux
    // ecrans cesseraient de nommer les memes premieres, par intermittence.
    expect(pageBreakdown(EGALITE).rows.map((ligne) => ligne.category)).toEqual([
      "energy",
      "fitness",
      "housing",
    ]);
  });

  it("et les deux vues tombent sur le meme ordre", () => {
    const haut = tableauDeBord(EGALITE).slices.map((part) => part.category);

    expect(haut).toEqual(pageBreakdown(EGALITE).rows.map((ligne) => ligne.category));
  });

  it("un resume arrive en desordre est remis dans l'ordre du serveur", () => {
    const melange = [...SEPTEMBRE].reverse();

    expect(pageBreakdown(melange).rows.map((ligne) => ligne.category)).toEqual(
      pageBreakdown(SEPTEMBRE).rows.map((ligne) => ligne.category),
    );
  });
});

describe("la repartition ne naît qu'a un seul endroit", () => {
  const PAGE = "src/features/commitments/presentation/pages/BreakdownPage.jsx";

  it("le Breakdown lit le resume et ne regroupe plus rien lui-meme", () => {
    // Le defaut repare : la page comptait ses propres echeances, en heure
    // locale, pendant que le tableau de bord lisait un resume calcule en UTC.
    // Les deux etaient justes pour leur mois et ne parlaient pas du meme.
    const source = readFileSync(PAGE, "utf8");

    expect(source).toContain("useResource(SUMMARY, getSummary)");
    expect(source).toContain("categoryRows(categories)");
    expect(source).not.toContain("categoryBreakdown");
    expect(source).not.toContain("withinMonth");
  });

  it("le libelle du mois vient du serveur, plus de l'horloge du navigateur", () => {
    const source = readFileSync(PAGE, "utf8");

    expect(source).toContain('const month = summary?.month ?? ""');
    expect(source).not.toContain("today.slice(0, 7)");
  });

  it("le calcul cote client n'existe plus nulle part", () => {
    const domaine = readFileSync("src/features/commitments/domain/breakdown.js", "utf8");

    expect(domaine).not.toContain("categoryBreakdown");
    expect(domaine).not.toContain("withinMonth");
  });

  it("les deux pages passent par la meme fonction de troncature", () => {
    for (const page of [PAGE, "src/core/pages/HomePage.jsx"]) {
      expect(readFileSync(page, "utf8")).toContain("topCategories(");
    }
  });
});
