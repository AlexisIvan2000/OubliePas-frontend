import { describe, expect, it } from "vitest";

import en from "../../core/translation/dictionaries/en.json";
import fr from "../../core/translation/dictionaries/fr.json";

// Les codes qu'on ne voit qu'apres avoir confie quelque chose au serveur. Pour
// eux, et pour eux seuls, le message doit dire ce qu'il est advenu des donnees.
// La liste vient du point de levee cote backend, pas de l'intuition : un code
// qui n'apparait que sur une lecture ou un refus d'authentification n'a rien a
// promettre.
const WRITE_CODES = [
  "AVATAR_TOO_LARGE",
  "AVATAR_UPLOAD_FAILED",
  "COMMITMENT_LIMIT_REACHED",
  "COMMITMENT_LIMIT_REACHED_INVOICE",
  "COMMITMENT_LIMIT_REACHED_SUBSCRIPTION",
  "DISPOSABLE_EMAIL_NOT_ALLOWED",
  "EMAIL_ALREADY_IN_USE",
  "EMAIL_ALREADY_REGISTERED",
  "FUTURE_PAYMENT_DATE",
  "GOOGLE_ONLY_ACCOUNT",
  "INCORRECT_CURRENT_PASSWORD",
  "INCORRECT_PASSWORD",
  "INTERNAL_ERROR",
  "INVALID_DATE_RANGE",
  "INVALID_DELETION_CONFIRMATION",
  "INVALID_OR_EXPIRED_RESET_CODE",
  "INVALID_RESET_CODE",
  "PASSWORD_ALREADY_SET",
  "PUSH_ENDPOINT_REFUSED",
  "RESET_CODE_EXPIRED",
  "RESTORE_LIMIT_REACHED",
  "SAME_EMAIL_AS_CURRENT",
  "SAME_PASSWORD_AS_BEFORE",
  "STORAGE_UNAVAILABLE",
  "UNSUPPORTED_AVATAR_TYPE",
  "VALIDATION_ERROR",
];

const STATE = {
  fr: /rien n'a été (enregistré|modifié|créé|restauré)|n'a pas changé|n'a pas été (enregistré|supprimé)|votre saisie est conservée/i,
  en: /nothing was (saved|changed|created|restored)|has not changed|was not (deleted|recorded|saved)|your entry is kept/i,
};

const ACTION = {
  fr: /réessayez|vérifiez|choisissez|corrigez|connectez-vous|reconnectez-vous|saisissez|demandez|archivez|écrivez|rechargez|utilisez|attendez|relancez|recopiez|reprenez|passez|ouvrez|définissez|changez|réinitialisez|redemander|recommencer|supprimez/i,
  en: /try again|check|pick|fix|sign in|ask for|archive|email support|reload|use a|use the|wait|retype|start .{0,20}again|set one|change at least|enter|open the|verify|choose|reset your|delete/i,
};

const DICTS = { fr, en };
const CODES = Object.keys(fr.errors);

describe("l'etat des donnees, seulement quand une ecriture est en jeu", () => {
  it.each(Object.keys(DICTS))("%s : chaque message d'ecriture dit ce qu'il est advenu", (locale) => {
    const muets = WRITE_CODES.filter(
      (code) => !STATE[locale].test(DICTS[locale].errors[code]),
    );

    expect(muets).toEqual([]);
  });

  it.each(Object.keys(DICTS))("%s : aucun autre message ne promet quoi que ce soit", (locale) => {
    // Une promesse sur un refus d'authentification ou une lecture serait au
    // mieux inutile, au pire fausse : rien n'etait en jeu.
    const bavards = CODES.filter(
      (code) => !WRITE_CODES.includes(code) && STATE[locale].test(DICTS[locale].errors[code]),
    );

    expect(bavards).toEqual([]);
  });

  it("les codes d'ecriture existent tous dans le dictionnaire", () => {
    expect(WRITE_CODES.filter((code) => !(code in fr.errors))).toEqual([]);
  });

  it("aucun message de saisie de code ne promet que rien n'a bouge", () => {
    // Le compteur de tentatives est incremente avant que l'exception ne parte,
    // et get_session valide quand meme : quelque chose a bien ete ecrit. Ces
    // messages parlent donc de ce que l'utilisateur possede, jamais de la base.
    for (const code of [
      "INVALID_VERIFICATION_CODE",
      "VERIFICATION_CODE_EXPIRED",
      "TOO_MANY_VERIFICATION_ATTEMPTS",
    ]) {
      expect(fr.errors[code]).not.toMatch(/rien n'a été/i);
      expect(en.errors[code]).not.toMatch(/nothing was/i);
    }
  });
});

describe("chaque message dit quoi faire ensuite", () => {
  it.each(Object.keys(DICTS))("%s : aucun message ne laisse sans action", (locale) => {
    const sansIssue = CODES.filter((code) => !ACTION[locale].test(DICTS[locale].errors[code]));

    expect(sansIssue).toEqual([]);
  });

  it("le detecteur d'action ne se contente pas de tout accepter", () => {
    expect(ACTION.fr.test("Le serveur a repondu de facon inattendue.")).toBe(false);
    expect(ACTION.en.test("The server answered in an unexpected way.")).toBe(false);
  });

  it("le detecteur d'etat ne se contente pas de tout accepter", () => {
    expect(STATE.fr.test("Ce compte a ete desactive.")).toBe(false);
    expect(STATE.en.test("This account has been disabled.")).toBe(false);
  });
});
