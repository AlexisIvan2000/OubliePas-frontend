import { describe, expect, it } from "vitest";

import {
  commitmentChanges,
  formFromCommitment,
  toCommitmentPayload,
} from "../../features/commitments/domain/commitment";

// Le tour complet du parcours d'edition : ce que le serveur a enregistre devient
// un formulaire, le formulaire redevient une charge utile, et le diff decide de
// ce qui part en PATCH. Chaque etape est testee seule cote unitaire ; ce qui se
// joue ici est leur accord.
const tour = (enregistre, modifier = (form) => form) => {
  const form = modifier(formFromCommitment(enregistre));
  const payload = toCommitmentPayload(form, { currentTrialEnd: enregistre.trialEndsOn });
  return { form, payload, changes: commitmentChanges(payload, enregistre) };
};

const abonnement = (overrides = {}) => ({
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
  ...overrides,
});

describe("rouvrir puis enregistrer sans rien changer", () => {
  it.each([
    ["abonnement simple", abonnement()],
    ["avec date de fin", abonnement({ endsOn: "2027-01-01" })],
    ["avec preavis d'annulation", abonnement({ cancellationNoticeDays: 30 })],
    ["avec des notes", abonnement({ notes: "carte se terminant par 4242" })],
    ["rappels coupes", abonnement({ isReminderEnabled: false })],
    ["delai de rappel nul", abonnement({ reminderDaysBefore: 0 })],
    ["facture ponctuelle", abonnement({ type: "invoice", frequency: "oneoff" })],
    ["en essai gratuit", abonnement({ startsOn: "2026-09-25", trialEndsOn: "2026-09-25" })],
  ])("n'envoie rien : %s", (_nom, enregistre) => {
    // L'invariant qui compte : ouvrir le formulaire ne doit jamais suffire a
    // modifier quoi que ce soit. Le cas de l'essai est le plus delicat, puisque
    // la duree n'est pas stockee et que le formulaire rouvre sur des champs vides.
    expect(tour(enregistre).changes).toEqual({});
  });
});

describe("une seule modification ne part jamais accompagnee", () => {
  it("changer le montant n'envoie que le montant", () => {
    const { changes } = tour(abonnement(), (form) => ({ ...form, amount: "24,99" }));

    expect(changes).toEqual({ amount: "24.99" });
  });

  it("changer la categorie n'envoie que la categorie", () => {
    const { changes } = tour(abonnement(), (form) => ({ ...form, category: "music" }));

    expect(changes).toEqual({ category: "music" });
  });

  it("poser une date de fin n'envoie que la date de fin", () => {
    const { changes } = tour(abonnement(), (form) => ({ ...form, endsOn: "2027-06-30" }));

    expect(changes).toEqual({ ends_on: "2027-06-30" });
  });

  it("retirer une date de fin l'envoie a null", () => {
    const { changes } = tour(abonnement({ endsOn: "2027-01-01" }), (form) => ({
      ...form,
      endsOn: "",
    }));

    expect(changes).toEqual({ ends_on: null });
  });

  it("couper les rappels n'envoie que le drapeau", () => {
    const { changes } = tour(abonnement(), (form) => ({ ...form, isReminderEnabled: false }));

    expect(changes).toEqual({ is_reminder_enabled: false });
  });

  it("vider les notes les envoie a null", () => {
    const { changes } = tour(abonnement({ notes: "un mot" }), (form) => ({ ...form, notes: "" }));

    expect(changes).toEqual({ notes: null });
  });
});

describe("l'essai gratuit vu de bout en bout", () => {
  const enEssai = abonnement({ startsOn: "2026-09-25", trialEndsOn: "2026-09-25" });

  it("decocher l'essai le retire et laisse la premiere echeance en place", () => {
    const { changes } = tour(enEssai, (form) => ({ ...form, isTrial: false }));

    expect(changes).toEqual({ trial_ends_on: null });
  });

  it("resaisir une duree deplace la premiere echeance avec la fin d'essai", () => {
    const { payload, changes } = tour(enEssai, (form) => ({
      ...form,
      trialStartsOn: "2026-09-01",
      trialDays: "14",
    }));

    expect(payload.starts_on).toBe("2026-09-15");
    expect(payload.trial_ends_on).toBe("2026-09-15");
    expect(changes).toEqual({ starts_on: "2026-09-15", trial_ends_on: "2026-09-15" });
  });

  it("les deux dates ne divergent jamais", () => {
    // Elles decrivent le meme instant : la fin de l'essai est le premier
    // prelevement. Les voir differer signalerait que l'une des deux a ete
    // derivee d'une autre source.
    const { payload } = tour(enEssai, (form) => ({
      ...form,
      trialStartsOn: "2026-10-01",
      trialDays: "7",
    }));

    expect(payload.starts_on).toBe(payload.trial_ends_on);
  });

  it("cocher l'essai sur un abonnement ordinaire sans duree ne change rien", () => {
    const { changes } = tour(abonnement(), (form) => ({ ...form, isTrial: true }));

    expect(changes).toEqual({});
  });
});

describe("la virgule traverse toute la chaine", () => {
  it("une saisie a la francaise arrive au serveur avec un point", () => {
    const { payload } = tour(abonnement(), (form) => ({ ...form, amount: "1 234,56" }));

    expect(payload.amount).toBe("1234.56");
  });

  it("retaper le meme montant avec une virgule n'envoie rien", () => {
    // 18,99 saisi, 18.99 enregistre : apres normalisation les deux se valent, et
    // le diff doit rester vide.
    const { changes } = tour(abonnement(), (form) => ({ ...form, amount: "18,99" }));

    expect(changes).toEqual({});
  });
});
