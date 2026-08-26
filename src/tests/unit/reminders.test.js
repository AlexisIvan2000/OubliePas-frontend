import { describe, expect, it } from "vitest";

import { scheduledReminders } from "../../features/notifications/domain/reminders";

const engagement = (overrides = {}) => ({
  id: "c1",
  isReminderEnabled: true,
  reminderDaysBefore: 3,
  ...overrides,
});

const echeance = (overrides = {}) => ({
  id: "o1",
  commitmentId: "c1",
  title: "Netflix",
  amount: "18.99",
  dueDate: "2026-09-18",
  status: "pending",
  ...overrides,
});

describe("scheduledReminders", () => {
  it("recule la date d'envoi du delai propre a l'engagement", () => {
    const [ligne] = scheduledReminders([echeance()], [engagement()]);

    expect(ligne.sendDate).toBe("2026-09-15");
    expect(ligne.daysBefore).toBe(3);
  });

  it("envoie le jour meme quand le delai est nul", () => {
    const [ligne] = scheduledReminders([echeance()], [engagement({ reminderDaysBefore: 0 })]);

    expect(ligne.sendDate).toBe(ligne.dueDate);
  });

  it.each([
    [1, "2026-09-01", "2026-08-31", "recule d'un mois"],
    [3, "2026-01-01", "2025-12-29", "recule d'une annee"],
    [1, "2024-03-01", "2024-02-29", "atterrit sur un 29 fevrier"],
    [1, "2026-03-01", "2026-02-28", "atterrit sur un 28 fevrier"],
    [30, "2026-09-18", "2026-08-19", "delai maximal"],
  ])("delai %i sur %s -> %s (%s)", (delai, echeanceIso, attendu) => {
    const [ligne] = scheduledReminders(
      [echeance({ dueDate: echeanceIso })],
      [engagement({ reminderDaysBefore: delai })],
    );

    expect(ligne.sendDate).toBe(attendu);
  });

  it("ignore une echeance deja payee", () => {
    expect(scheduledReminders([echeance({ status: "paid" })], [engagement()])).toEqual([]);
  });

  it("ignore une echeance passee", () => {
    expect(scheduledReminders([echeance({ status: "skipped" })], [engagement()])).toEqual([]);
  });

  it("ignore un engagement dont les rappels sont coupes", () => {
    expect(
      scheduledReminders([echeance()], [engagement({ isReminderEnabled: false })]),
    ).toEqual([]);
  });

  it("ignore une echeance orpheline plutot que de planter", () => {
    // Le cas arrive apres une suppression : l'echeance est encore en cache, son
    // engagement ne l'est plus.
    expect(scheduledReminders([echeance({ commitmentId: "disparu" })], [])).toEqual([]);
  });

  it("classe les lignes par date d'envoi et non par echeance", () => {
    const lignes = scheduledReminders(
      [
        echeance({ id: "tard", commitmentId: "c1", dueDate: "2026-09-10" }),
        echeance({ id: "tot", commitmentId: "c2", dueDate: "2026-09-12" }),
      ],
      [
        engagement({ id: "c1", reminderDaysBefore: 0 }),
        engagement({ id: "c2", reminderDaysBefore: 7 }),
      ],
    );

    // c2 echoit plus tard mais previent une semaine avant : sa ligne passe en
    // premier. Trier sur l'echeance donnerait l'ordre inverse.
    expect(lignes.map((ligne) => ligne.id)).toEqual(["tot", "tard"]);
    expect(lignes.map((ligne) => ligne.sendDate)).toEqual(["2026-09-05", "2026-09-10"]);
  });

  it("reporte le titre et le montant de l'echeance, pas ceux de l'engagement", () => {
    const [ligne] = scheduledReminders(
      [echeance({ title: "Netflix", amount: "24.99" })],
      [engagement({ title: "ancien nom", amount: "18.99" })],
    );

    expect(ligne.title).toBe("Netflix");
    expect(ligne.amount).toBe("24.99");
  });
});
