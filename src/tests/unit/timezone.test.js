import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  DEFAULT_TIMEZONE,
  browserTimezone,
  knownTimezones,
  startOfDayIn,
  timezoneToAdopt,
  todayIn,
} from "../../core/utils/timezone";

const MONCTON = "America/Moncton";
const TOKYO = "Asia/Tokyo";

// Les deux instants des captures, dits en UTC.
const LE_31_AOUT_22H10_A_MONCTON = new Date("2026-09-01T01:10:00Z");
const LE_1ER_SEPTEMBRE_8H_A_MONCTON = new Date("2026-09-01T11:00:00Z");

function intl({ zone = MONCTON, leve = false, sansListe = false } = {}) {
  return {
    DateTimeFormat: () => {
      if (leve) {
        throw new Error("pas de base de fuseaux");
      }
      return { resolvedOptions: () => ({ timeZone: zone }) };
    },
    supportedValuesOf: () => {
      if (sansListe) {
        throw new Error("inconnue de ce navigateur");
      }
      return [TOKYO, MONCTON];
    },
  };
}

describe("le jour, dans le fuseau de la personne", () => {
  it("22 h 10 le 31 aout a Moncton est encore le 31 aout", () => {
    // Le defaut d'origine : a cet instant, le serveur etait deja le 1er
    // septembre, et le tableau de bord annoncait le mois suivant.
    expect(todayIn(MONCTON, LE_31_AOUT_22H10_A_MONCTON)).toBe("2026-08-31");
  });

  it("le meme instant est deja le 1er septembre a Tokyo", () => {
    expect(todayIn(TOKYO, LE_31_AOUT_22H10_A_MONCTON)).toBe("2026-09-01");
  });

  it("et le lendemain matin, Moncton a tourne la page", () => {
    expect(todayIn(MONCTON, LE_1ER_SEPTEMBRE_8H_A_MONCTON)).toBe("2026-09-01");
  });

  it("sans fuseau, c'est UTC, comme le serveur pour un compte jamais corrige", () => {
    expect(todayIn(null, LE_31_AOUT_22H10_A_MONCTON)).toBe("2026-09-01");
  });

  it("un nom inconnu ne vide pas l'ecran", () => {
    // Une base de fuseaux plus ancienne que celle du serveur ne doit pas
    // laisser un tableau de bord sans date.
    expect(todayIn("Mars/Olympus", LE_31_AOUT_22H10_A_MONCTON)).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });

  it("le debut de journee porte ce meme jour", () => {
    const minuit = startOfDayIn(MONCTON, LE_31_AOUT_22H10_A_MONCTON);

    expect([minuit.getFullYear(), minuit.getMonth() + 1, minuit.getDate()]).toEqual([
      2026, 8, 31,
    ]);
  });
});

describe("ce que le navigateur sait dire", () => {
  it("il rend son fuseau", () => {
    expect(browserTimezone(intl({ zone: TOKYO }))).toBe(TOKYO);
  });

  it("et rien plutot qu'une erreur quand il ne sait pas", () => {
    expect(browserTimezone(intl({ leve: true }))).toBeNull();
  });

  it("la liste des fuseaux tombe sur un repli utilisable", () => {
    // Un reglage vide serait pire qu'un reglage court : on ne pourrait meme
    // plus reparer a la main ce que la detection a rate.
    const liste = knownTimezones(intl({ zone: TOKYO, sansListe: true }));

    expect(liste).toContain(TOKYO);
    expect(liste).toContain(DEFAULT_TIMEZONE);
  });
});

describe("le rattrapage des comptes restes au defaut", () => {
  it("un compte en UTC adopte le fuseau du navigateur", () => {
    // Les comptes crees avant la colonne sont tous en UTC : c'est cette regle
    // qui les corrige, a leur prochaine connexion et sans rien demander.
    expect(timezoneToAdopt(DEFAULT_TIMEZONE, MONCTON)).toBe(MONCTON);
  });

  it("un compte sans fuseau du tout aussi", () => {
    expect(timezoneToAdopt(null, MONCTON)).toBe(MONCTON);
  });

  it("un fuseau deja choisi n'est jamais ecrase", () => {
    // La garde qui compte. Sans elle, un portable en voyage ou un poste
    // emprunte remplacerait un reglage pose a la main, et la personne n'aurait
    // aucun moyen de deviner ce qui a bouge.
    expect(timezoneToAdopt(MONCTON, TOKYO)).toBeNull();
  });

  it("un navigateur muet ne declenche rien", () => {
    expect(timezoneToAdopt(DEFAULT_TIMEZONE, null)).toBeNull();
  });

  it("et un fuseau deja bon n'ecrit pas pour rien", () => {
    // Le cas qui isole le test d'egalite : quelqu'un vraiment en UTC. Un
    // fuseau deja choisi serait de toute facon protege par la garde du
    // dessus, donc lui ne prouverait rien ici. Sans l'egalite, ce compte
    // reecrirait la meme valeur a chaque connexion et a chaque onglet.
    expect(timezoneToAdopt(DEFAULT_TIMEZONE, DEFAULT_TIMEZONE)).toBeNull();
    expect(timezoneToAdopt(MONCTON, MONCTON)).toBeNull();
  });
});

describe("les branchements", () => {
  const source = (chemin) => readFileSync(chemin, "utf8");

  it("l'inscription emporte le fuseau du navigateur", () => {
    const forme = source(
      "src/features/authentication/presentation/components/RegisterForm.jsx",
    );

    expect(forme).toContain("timezone: browserTimezone()");
  });

  it("la connexion rattrape les comptes restes au defaut", () => {
    const provider = source(
      "src/features/authentication/presentation/providers/AuthProvider.jsx",
    );

    expect(provider).toContain("adoptTimezone(mapUser(dto))");
    expect(provider).toContain("timezoneToAdopt(user?.timezone, browserTimezone())");
  });

  it("un echec d'ecriture n'empeche pas d'entrer", () => {
    // Le rattrapage est un confort, pas une condition : rater le PATCH ne doit
    // pas laisser quelqu'un a la porte de son propre compte.
    const provider = source(
      "src/features/authentication/presentation/providers/AuthProvider.jsx",
    );

    expect(provider).toContain("} catch {\n    return user;\n  }");
  });

  it("la ligne de date du tableau de bord suit le compte, plus le navigateur", () => {
    // Le constat de la capture : « MONDAY, AUGUST 31 » au-dessus du total de
    // septembre, sur la meme page.
    const accueil = source("src/core/pages/HomePage.jsx");

    expect(accueil).toContain("formatLongDate(startOfDayIn(user?.timezone, now))");
  });

  it("et le crochet du jour lit le fuseau du compte", () => {
    const crochet = source("src/core/utils/useToday.js");

    expect(crochet).toContain("todayIn(timezone)");
    expect(crochet).not.toContain("todayIso");
  });
});
