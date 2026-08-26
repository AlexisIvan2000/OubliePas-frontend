import { describe, expect, it } from "vitest";

import {
  commitmentChanges,
  emptyForm,
  firstTrackedDate,
  formFromCommitment,
  normalizeAmount,
  toCommitmentPayload,
  trialEndFrom,
} from "../../features/commitments/domain/commitment";

const netflix = (overrides = {}) => ({
  ...emptyForm("subscription"),
  title: "Netflix",
  amount: "18.99",
  startsOn: "2026-08-26",
  ...overrides,
});

describe("trialEndFrom", () => {
  it("ajoute les jours d'essai a la date de depart", () => {
    expect(trialEndFrom("2026-08-26", 30)).toBe("2026-09-25");
  });

  it("accepte un nombre passe en chaine, comme le rend un champ de saisie", () => {
    expect(trialEndFrom("2026-08-26", "7")).toBe("2026-09-02");
  });

  it.each([
    ["2026-01-31", 1, "2026-02-01", "fin de mois"],
    ["2026-12-31", 1, "2027-01-01", "fin d'annee"],
    ["2024-02-28", 1, "2024-02-29", "annee bissextile"],
    ["2026-02-28", 1, "2026-03-01", "annee commune"],
  ])("franchit %s + %i jours -> %s (%s)", (depart, jours, attendu) => {
    expect(trialEndFrom(depart, jours)).toBe(attendu);
  });

  it.each([
    [null, 30, "pas de date de depart"],
    ["2026-08-26", 0, "zero jour"],
    ["2026-08-26", -5, "duree negative"],
    ["2026-08-26", 1.5, "duree non entiere"],
    ["2026-08-26", "", "champ vide"],
    ["2026-08-26", "abc", "saisie non numerique"],
    ["2026-08-26", 400, "au-dela du maximum"],
  ])("rend null pour (%s, %s) : %s", (depart, jours) => {
    expect(trialEndFrom(depart, jours)).toBeNull();
  });
});

describe("normalizeAmount", () => {
  it.each([
    ["18,99", "18.99", "virgule francaise"],
    ["18.99", "18.99", "point anglais"],
    ["18", "18", "entier"],
    ["", "", "champ vide"],
    ["  18,99  ", "18.99", "espaces autour"],
    ["1 234,56", "1234.56", "milliers a la francaise"],
    ["1 234,56", "1234.56", "espace insecable"],
    ["1,234.56", "1234.56", "milliers a l'anglaise"],
    ["1.234,56", "1234.56", "milliers separes par des points"],
    [",99", ".99", "virgule seule en tete"],
    ["0,01", "0.01", "plus petit montant accepte"],
    ["99999999,99", "99999999.99", "plafond du schema serveur"],
  ])("%s -> %s (%s)", (saisi, attendu) => {
    expect(normalizeAmount(saisi)).toBe(attendu);
  });

  it("laisse passer ce qui n'est pas une chaine", () => {
    expect(normalizeAmount(18.99)).toBe(18.99);
    expect(normalizeAmount(null)).toBeNull();
  });

  it("tient le dernier separateur pour le decimal", () => {
    // La regle qui tranche les deux conventions de milliers : ce qui suit le
    // dernier separateur est la partie decimale, le reste est du bruit.
    expect(normalizeAmount("1.234.567,89")).toBe("1234567.89");
    expect(normalizeAmount("1,234,567.89")).toBe("1234567.89");
  });
});

describe("firstTrackedDate", () => {
  it("rend la date de depart quand elle est a venir", () => {
    expect(firstTrackedDate("2026-09-15", "monthly", "2026-08-26")).toBe("2026-09-15");
  });

  it("rend aujourd'hui quand le depart est aujourd'hui", () => {
    expect(firstTrackedDate("2026-08-26", "monthly", "2026-08-26")).toBe("2026-08-26");
  });

  it("avance jusqu'a la premiere echeance non passee", () => {
    // Le plancher corrige : un abonnement demarre le 19 juillet et consulte le
    // 26 aout doit afficher septembre, pas juillet.
    expect(firstTrackedDate("2026-07-19", "monthly", "2026-08-26")).toBe("2026-09-19");
  });

  it("garde son ancrage au 31 en traversant les mois courts", () => {
    expect(firstTrackedDate("2026-01-31", "monthly", "2026-03-01")).toBe("2026-03-31");
  });

  it.each([
    ["weekly", "2026-08-01", "2026-08-26", "2026-08-29"],
    ["quarterly", "2026-01-15", "2026-08-26", "2026-10-15"],
    ["yearly", "2020-03-10", "2026-08-26", "2027-03-10"],
  ])("suit la frequence %s", (frequence, depart, aujourdhui, attendu) => {
    expect(firstTrackedDate(depart, frequence, aujourdhui)).toBe(attendu);
  });

  it("ne deplace jamais une facture ponctuelle", () => {
    expect(firstTrackedDate("2026-07-19", "oneoff", "2026-08-26")).toBe("2026-07-19");
  });

  it.each([
    [null, "2026-08-26"],
    ["2026-07-19", null],
  ])("rend null sans date utilisable (%s, %s)", (depart, aujourdhui) => {
    expect(firstTrackedDate(depart, "monthly", aujourdhui)).toBeNull();
  });
});

describe("commitmentChanges", () => {
  const enregistre = {
    title: "Netflix",
    type: "subscription",
    category: "entertainment",
    amount: "18.99",
    frequency: "monthly",
    startsOn: "2026-08-26",
    endsOn: null,
    trialEndsOn: null,
    cancellationNoticeDays: null,
    reminderDaysBefore: 3,
    isReminderEnabled: true,
    notes: null,
  };
  const memePayload = {
    title: "Netflix",
    type: "subscription",
    category: "entertainment",
    amount: "18.99",
    frequency: "monthly",
    starts_on: "2026-08-26",
    ends_on: null,
    trial_ends_on: null,
    cancellation_notice_days: null,
    reminder_days_before: 3,
    is_reminder_enabled: true,
    notes: null,
  };

  it("ne renvoie rien quand rien n'a bouge", () => {
    expect(commitmentChanges(memePayload, enregistre)).toEqual({});
  });

  it("ne renvoie que le champ modifie", () => {
    expect(commitmentChanges({ ...memePayload, amount: "24.99" }, enregistre)).toEqual({
      amount: "24.99",
    });
  });

  it("traduit le nom du champ vers celui de l'API", () => {
    expect(commitmentChanges({ ...memePayload, starts_on: "2026-09-01" }, enregistre)).toEqual({
      starts_on: "2026-09-01",
    });
  });

  it("compare les montants comme des chaines, pas comme des nombres", () => {
    // Caracterisation, pas souhait : 18.990 et 18.99 sont le meme montant et le
    // serveur les stocke pareil, mais le diff les voit differents et enverrait un
    // PATCH sans effet. Le formulaire part toujours de la chaine du serveur, donc
    // le cas demande une reecriture volontaire ; le cout est un appel inutile.
    expect(commitmentChanges({ ...memePayload, amount: "18.990" }, enregistre)).toEqual({
      amount: "18.990",
    });
  });

  it("ne confond pas null et chaine vide", () => {
    expect(commitmentChanges({ ...memePayload, ends_on: null }, enregistre)).toEqual({});
  });

  it("signale un champ qu'on vide", () => {
    const avecFin = { ...enregistre, endsOn: "2027-01-01" };

    expect(commitmentChanges({ ...memePayload, ends_on: null }, avecFin)).toEqual({
      ends_on: null,
    });
  });

  it("signale un booleen qui bascule", () => {
    expect(commitmentChanges({ ...memePayload, is_reminder_enabled: false }, enregistre)).toEqual({
      is_reminder_enabled: false,
    });
  });
});

describe("toCommitmentPayload", () => {
  it("normalise le montant avant l'envoi", () => {
    expect(toCommitmentPayload(netflix({ amount: "18,99" })).amount).toBe("18.99");
  });

  it("envoie le nom sans ses espaces de bord", () => {
    expect(toCommitmentPayload(netflix({ title: "  Netflix  " })).title).toBe("Netflix");
  });

  it("convertit les champs numeriques que le formulaire tient en chaine", () => {
    const payload = toCommitmentPayload(
      netflix({ reminderDaysBefore: "5", cancellationNoticeDays: "30" }),
    );

    expect(payload.reminder_days_before).toBe(5);
    expect(payload.cancellation_notice_days).toBe(30);
  });

  it("rend null plutot qu'une chaine vide pour les champs facultatifs", () => {
    const payload = toCommitmentPayload(
      netflix({ endsOn: "", cancellationNoticeDays: "", notes: "   " }),
    );

    expect(payload.ends_on).toBeNull();
    expect(payload.cancellation_notice_days).toBeNull();
    expect(payload.notes).toBeNull();
  });

  describe("essai gratuit", () => {
    const enEssai = netflix({
      isTrial: true,
      trialStartsOn: "2026-08-26",
      trialDays: "30",
      startsOn: "2026-08-26",
    });

    it("fait de la fin d'essai la premiere echeance", () => {
      const payload = toCommitmentPayload(enEssai);

      expect(payload.starts_on).toBe("2026-09-25");
      expect(payload.trial_ends_on).toBe("2026-09-25");
    });

    it("le champ de depart de l'essai n'alimente jamais starts_on", () => {
      // Le piege : trialStartsOn dit quand l'essai commence, pas quand le premier
      // prelevement tombe. Confondre les deux facturerait le jour de l'inscription.
      expect(toCommitmentPayload(enEssai).starts_on).not.toBe(enEssai.trialStartsOn);
    });

    it("efface la fin d'essai des que la case est decochee", () => {
      const payload = toCommitmentPayload(
        { ...enEssai, isTrial: false },
        { currentTrialEnd: "2026-09-25" },
      );

      expect(payload.trial_ends_on).toBeNull();
      expect(payload.starts_on).toBe("2026-08-26");
    });

    it("sans essai, starts_on est la date saisie", () => {
      expect(toCommitmentPayload(netflix()).starts_on).toBe("2026-08-26");
      expect(toCommitmentPayload(netflix()).trial_ends_on).toBeNull();
    });

    it("cocher l'essai sans duree ne deplace pas la premiere echeance", () => {
      const payload = toCommitmentPayload({ ...enEssai, trialDays: "" });

      expect(payload.starts_on).toBe("2026-08-26");
      expect(payload.trial_ends_on).toBeNull();
    });
  });
});

describe("formFromCommitment", () => {
  const enregistre = {
    title: "Netflix",
    type: "subscription",
    category: "entertainment",
    amount: "18.99",
    frequency: "monthly",
    startsOn: "2026-09-25",
    endsOn: null,
    trialEndsOn: "2026-09-25",
    cancellationNoticeDays: null,
    reminderDaysBefore: 3,
    isReminderEnabled: true,
    notes: null,
  };

  it("deduit la case essai de la presence d'une fin d'essai", () => {
    expect(formFromCommitment(enregistre).isTrial).toBe(true);
    expect(formFromCommitment({ ...enregistre, trialEndsOn: null }).isTrial).toBe(false);
  });

  it("rouvre le formulaire sans duree d'essai a resaisir", () => {
    // La duree n'est pas stockee, seule la date de fin l'est. Le formulaire
    // rouvre donc sur des champs vides, et c'est ce qui rend le tour complet
    // delicat : voir le test d'integration du parcours d'edition.
    const form = formFromCommitment(enregistre);

    expect(form.trialStartsOn).toBe("");
    expect(form.trialDays).toBe("");
  });

  it("remplace les null par des chaines vides pour les champs de saisie", () => {
    const form = formFromCommitment(enregistre);

    expect(form.endsOn).toBe("");
    expect(form.cancellationNoticeDays).toBe("");
    expect(form.notes).toBe("");
  });
});
