import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addDaysIso,
  daysUntil,
  formatDate,
  formatMoney,
  formatShortDate,
  relativeDueKey,
  setFormattingLocale,
  todayIso,
} from "../../core/utils/formatting";

afterEach(() => {
  vi.useRealTimers();
  setFormattingLocale("fr-CA");
});

describe("todayIso", () => {
  it("rend la date locale, pas la date UTC", () => {
    // Le bogue corrige : a 21 h 30 dans un fuseau en retard sur UTC, la date UTC
    // est deja celle du lendemain. Le formulaire proposait alors demain comme
    // premiere echeance, et l'engagement partait decale d'un jour.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T00:30:00Z"));

    const maintenant = new Date();
    const attendu = `${maintenant.getFullYear()}-${String(
      maintenant.getMonth() + 1,
    ).padStart(2, "0")}-${String(maintenant.getDate()).padStart(2, "0")}`;

    expect(todayIso()).toBe(attendu);
  });

  it("diverge de toISOString des que le fuseau est en retard sur UTC", () => {
    vi.useFakeTimers();
    // Minuit pile en UTC : dans tout fuseau en retard, on est encore la veille.
    vi.setSystemTime(new Date("2026-08-27T00:00:00Z"));

    const enRetard = new Date().getTimezoneOffset() > 0;

    if (enRetard) {
      expect(todayIso()).not.toBe(new Date().toISOString().slice(0, 10));
    } else {
      expect(todayIso()).toBe(new Date().toISOString().slice(0, 10));
    }
  });

  it("complete le mois et le jour sur deux chiffres", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 12));

    expect(todayIso()).toBe("2026-01-05");
  });
});

describe("addDaysIso", () => {
  it.each([
    ["2026-08-26", 1, "2026-08-27", "lendemain"],
    ["2026-08-26", 0, "2026-08-26", "aucun deplacement"],
    ["2026-08-31", 1, "2026-09-01", "changement de mois"],
    ["2026-12-31", 1, "2027-01-01", "changement d'annee"],
    ["2024-02-28", 1, "2024-02-29", "annee bissextile"],
    ["2026-02-28", 1, "2026-03-01", "annee commune"],
    ["2026-08-26", 60, "2026-10-25", "horizon des rappels"],
    ["2026-08-26", -1, "2026-08-25", "vers le passe"],
    ["2026-03-08", 1, "2026-03-09", "passage a l'heure d'ete"],
    ["2026-11-01", 1, "2026-11-02", "retour a l'heure normale"],
  ])("%s + %i -> %s (%s)", (iso, jours, attendu) => {
    expect(addDaysIso(iso, jours)).toBe(attendu);
  });

  it("ne depend pas du fuseau de la machine", () => {
    // L'arithmetique se fait sur la chaine, en UTC, sans jamais lire l'horloge :
    // c'est ce qui la rend stable quel que soit l'endroit ou tourne le code.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T00:30:00Z"));

    expect(addDaysIso("2026-08-26", 1)).toBe("2026-08-27");
  });
});

describe("daysUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 26, 14, 30));
  });

  it.each([
    ["2026-08-26", 0, "aujourd'hui"],
    ["2026-08-27", 1, "demain"],
    ["2026-08-25", -1, "hier"],
    ["2026-09-02", 7, "dans une semaine"],
    ["2026-07-19", -38, "il y a plus d'un mois"],
  ])("%s -> %i (%s)", (iso, attendu) => {
    expect(daysUntil(iso)).toBe(attendu);
  });

  it("compte en jours de calendrier, pas en tranches de 24 h", () => {
    // A 14 h 30, demain est dans 9 h 30. C'est quand meme un jour d'ecart.
    expect(daysUntil("2026-08-27")).toBe(1);
  });

  it("ne derape pas au passage a l'heure d'ete", () => {
    vi.setSystemTime(new Date(2026, 2, 7, 12));

    expect(daysUntil("2026-03-08")).toBe(1);
    expect(daysUntil("2026-03-09")).toBe(2);
  });
});

describe("relativeDueKey", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 26, 9));
  });

  it.each([
    ["2026-08-26", "relative.today", 0],
    ["2026-08-27", "relative.tomorrow", 1],
    ["2026-08-25", "relative.yesterday", 1],
    ["2026-08-31", "relative.inDays", 5],
    ["2026-08-20", "relative.daysAgo", 6],
  ])("%s -> %s (%i)", (iso, cle, compte) => {
    expect(relativeDueKey(iso)).toEqual({ key: cle, count: compte });
  });

  it("rend un compte toujours positif, meme dans le passe", () => {
    // La cle porte la direction, le nombre ne porte que la distance : afficher
    // « il y a -6 jours » serait le symptome d'une inversion.
    expect(relativeDueKey("2026-08-01").count).toBeGreaterThan(0);
  });
});

describe("formatage bilingue", () => {
  it("rend un mois francais en francais", () => {
    setFormattingLocale("fr-CA");

    expect(formatDate("2026-09-15")).toBe("15 septembre 2026");
  });

  it("rend un mois anglais en anglais", () => {
    // Non-regression du « Sending on 15 sept. » : la locale des formatteurs est
    // un etat de module, et la laisser sur fr-CA glissait un mois francais au
    // milieu d'une phrase anglaise.
    setFormattingLocale("en-CA");

    expect(formatDate("2026-09-15")).toBe("September 15, 2026");
    expect(formatShortDate("2026-09-15")).not.toContain("sept.");
  });

  it("bascule d'une locale a l'autre sans servir l'ancienne depuis le cache", () => {
    setFormattingLocale("fr-CA");
    const avant = formatShortDate("2026-09-15");
    setFormattingLocale("en-CA");
    const apres = formatShortDate("2026-09-15");

    expect(avant).not.toBe(apres);
    expect(avant).toContain("sept");
    expect(apres).toContain("Sep");
  });

  it("place le symbole monetaire selon la locale", () => {
    setFormattingLocale("fr-CA");
    const francais = formatMoney("18.99", "CAD");
    setFormattingLocale("en-CA");
    const anglais = formatMoney("18.99", "CAD");

    expect(francais).toMatch(/^18/);
    expect(anglais).toMatch(/^\$/);
    expect(francais).not.toBe(anglais);
  });

  it("accepte un montant en chaine comme le rend l'API", () => {
    setFormattingLocale("en-CA");

    expect(formatMoney("1250.00", "CAD")).toBe("$1,250.00");
  });

  it("rend la saisie telle quelle plutot que NaN", () => {
    setFormattingLocale("fr-CA");

    expect(formatMoney("pas un montant", "CAD")).toBe("pas un montant");
  });
});
