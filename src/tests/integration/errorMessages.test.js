import { describe, expect, it } from "vitest";

import { ApiError } from "../../core/network/ApiError";
import { messageForCode, messageForError } from "../../core/network/errorMessages";
import { createTranslator } from "../../core/translation/translate";
import en from "../../core/translation/dictionaries/en.json";
import fr from "../../core/translation/dictionaries/fr.json";

const LOCALES = {
  fr: { dict: fr, tag: "fr-CA" },
  en: { dict: en, tag: "en-CA" },
};

const traducteur = (locale) => createTranslator(LOCALES[locale].dict, LOCALES[locale].tag);
const CODES = Object.keys(fr.errors).filter((cle) => cle !== "unexpected");

const erreur = (code, message = "raw server text", status = 400) =>
  new ApiError({ status, code, message });

describe("aucun message brut n'atteint l'ecran", () => {
  it.each(Object.keys(LOCALES))("%s : chaque code connu est traduit", (locale) => {
    const t = traducteur(locale);
    const brut = "raw server text";

    const fuites = CODES.filter((code) => messageForError(t, erreur(code, brut)) === brut);

    expect(fuites).toEqual([]);
  });

  it.each(Object.keys(LOCALES))("%s : aucun message n'est vide", (locale) => {
    const t = traducteur(locale);

    const vides = CODES.filter((code) => !messageForError(t, erreur(code)).trim());

    expect(vides).toEqual([]);
  });

  it.each(Object.keys(LOCALES))("%s : aucun message ne rend sa propre cle", (locale) => {
    const t = traducteur(locale);

    const cruds = CODES.filter((code) => messageForError(t, erreur(code)).startsWith("errors."));

    expect(cruds).toEqual([]);
  });

  it("rend un repli lisible quand il n'y a pas d'erreur du tout", () => {
    expect(messageForError(traducteur("fr"), null)).toBe(fr.errors.unexpected);
    expect(messageForError(traducteur("en"), undefined)).toBe(en.errors.unexpected);
  });

  it("un code inconnu retombe sur le message du serveur, seule fuite possible", () => {
    const inconnu = messageForError(traducteur("fr"), erreur("CODE_TOUT_NEUF", "Brand new"));

    expect(inconnu).toBe("Brand new");
  });
});

describe("les trois codes ajoutes apres l'audit", () => {
  it.each([
    ["INTERNAL_ERROR", 500],
    ["FUTURE_PAYMENT_DATE", 400],
    ["APP_ERROR", 502],
    ["TIMEOUT", 0],
  ])("%s est traduit dans les deux langues", (code) => {
    expect(fr.errors[code]).toBeTruthy();
    expect(en.errors[code]).toBeTruthy();
    expect(fr.errors[code]).not.toBe(en.errors[code]);
  });

  it("parmi les echecs inconnus, seule la 500 promet que rien n'a ete enregistre", () => {
    // La distinction est deliberee : sur une 500 la transaction serveur est
    // annulee, donc la promesse est vraie. Une expiration ou une reponse hors
    // enveloppe peuvent venir d'un proxy, et le front ne sait alors rien.
    const promet = /rien n'a ete|Rien n'a ete|Rien n'a été|nothing was saved|Nothing was saved/i;

    expect(fr.errors.INTERNAL_ERROR).toMatch(promet);
    expect(en.errors.INTERNAL_ERROR).toMatch(promet);
    expect(fr.errors.TIMEOUT).not.toMatch(promet);
    expect(en.errors.TIMEOUT).not.toMatch(promet);
    expect(fr.errors.APP_ERROR).not.toMatch(promet);
    expect(en.errors.APP_ERROR).not.toMatch(promet);
  });

  it("les messages qui ne promettent rien demandent de verifier", () => {
    const verifier = /verifiez|vérifiez|check the result/i;

    expect(fr.errors.TIMEOUT).toMatch(verifier);
    expect(en.errors.TIMEOUT).toMatch(verifier);
    expect(fr.errors.APP_ERROR).toMatch(verifier);
    expect(en.errors.APP_ERROR).toMatch(verifier);
  });
});

describe("le plafond d'engagements", () => {
  const refus = (type) =>
    new ApiError({
      status: 409,
      code: "COMMITMENT_LIMIT_REACHED",
      message: "This account already tracks the maximum number of commitments of this type",
      details: type ? { type, limit: 25 } : {},
    });

  it.each([
    ["fr", "subscription", "abonnements"],
    ["fr", "invoice", "factures"],
    ["en", "subscription", "subscriptions"],
    ["en", "invoice", "invoices"],
  ])("%s : le message dit le nombre et le mot juste pour %s", (locale, type, mot) => {
    const rendu = messageForError(traducteur(locale), refus(type));

    expect(rendu).toContain("25");
    expect(rendu).toContain(mot);
  });

  it.each(Object.keys(LOCALES))("%s : aucun trou de gabarit n'atteint l'ecran", (locale) => {
    const t = traducteur(locale);

    expect(messageForError(t, refus("subscription"))).not.toMatch(/[{}]/);
    expect(messageForError(t, refus("invoice"))).not.toMatch(/[{}]/);
    expect(messageForError(t, refus(null))).not.toMatch(/[{}]/);
  });

  it("le repli sans type ne contient aucun trou a remplir", () => {
    // C'est ce qui rend le repli sur : si le detail manque, il ne reste rien
    // a interpoler, donc rien d'illisible ne s'affiche.
    expect(fr.errors.COMMITMENT_LIMIT_REACHED).not.toMatch(/[{}]/);
    expect(en.errors.COMMITMENT_LIMIT_REACHED).not.toMatch(/[{}]/);
  });

  it.each(Object.keys(LOCALES))("%s : le message dit l'action et l'etat des donnees", (locale) => {
    const rendu = messageForError(traducteur(locale), refus("subscription"));
    const action = /archivez|archive/i;
    const etat = /rien n'a ete cree|rien n'a été créé|nothing was created/i;

    expect(rendu).toMatch(action);
    expect(rendu).toMatch(etat);
  });

  it("le clic bloque et le refus du serveur disent la meme chose", () => {
    // Le bouton Ajouter au plafond n'appelle pas le serveur : il compose le
    // message par le meme chemin, sinon les deux textes divergeraient.
    const t = traducteur("fr");
    const avant = messageForCode(t, "COMMITMENT_LIMIT_REACHED", {
      type: "subscription",
      limit: 25,
    });

    expect(avant).toBe(messageForError(t, refus("subscription")));
  });

  it("un code sans traduction ne rend rien, plutot que sa cle", () => {
    expect(messageForCode(traducteur("fr"), "CODE_TOUT_NEUF")).toBeNull();
  });

  it("un type inconnu retombe sur le message sans type", () => {
    const rendu = messageForError(traducteur("fr"), refus("licorne"));

    expect(rendu).toBe(fr.errors.COMMITMENT_LIMIT_REACHED);
  });
});

describe("parite des dictionnaires", () => {
  const aplatir = (objet, prefixe = "") =>
    Object.entries(objet).flatMap(([cle, valeur]) =>
      valeur && typeof valeur === "object" && !Array.isArray(valeur)
        ? aplatir(valeur, `${prefixe}${cle}.`)
        : [`${prefixe}${cle}`],
    );

  it("les deux langues portent exactement les memes cles", () => {
    const cotefr = new Set(aplatir(fr));
    const coteen = new Set(aplatir(en));

    expect([...cotefr].filter((cle) => !coteen.has(cle))).toEqual([]);
    expect([...coteen].filter((cle) => !cotefr.has(cle))).toEqual([]);
  });

  it("le bloc des erreurs ne contient que des codes et le repli", () => {
    const inattendues = Object.keys(fr.errors).filter(
      (cle) => cle !== "unexpected" && !/^[A-Z][A-Z0-9_]*$/.test(cle),
    );

    expect(inattendues).toEqual([]);
  });
});

describe("erreurs de champ", () => {
  it("expose les erreurs par champ pour un 422", () => {
    const validation = new ApiError({
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Invalid request payload",
      fieldErrors: [
        { field: "amount", message: "Input should be a valid decimal" },
        { field: "title", message: "String should have at least 1 character" },
      ],
    });

    expect(validation.isValidation).toBe(true);
    expect(messageForError(traducteur("fr"), validation)).toBe(fr.errors.VALIDATION_ERROR);
  });

  it("reconnait une limite de debit sans dependre du code", () => {
    expect(new ApiError({ status: 429, code: "RATE_LIMIT_EXCEEDED" }).isRateLimited).toBe(true);
  });

  it("reconnait une coupure reseau", () => {
    expect(new ApiError({ status: 0, code: "NETWORK_ERROR" }).isNetwork).toBe(true);
  });
});
