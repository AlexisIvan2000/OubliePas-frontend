import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { TranslationContext } from "../../core/translation/TranslationContext";

const PROVIDER = readFileSync("src/core/translation/TranslationProvider.jsx", "utf8");

describe("le fournisseur de traduction ne rend jamais hors de son contexte", () => {
  it("aucun retour anticipe avant le fournisseur", () => {
    // Le bug : l'ecran d'attente etait rendu par un return place avant le
    // Provider. Le Spinner qu'il contient traduit son libelle, useTranslation
    // lance faute de contexte, et la page reste blanche. Seuls les comptes qui
    // chargent un dictionnaire, donc les non francophones, passaient par la.
    const ouverture = PROVIDER.indexOf("<TranslationContext.Provider");
    const avant = PROVIDER.slice(0, ouverture);

    expect(ouverture).toBeGreaterThan(0);
    expect(avant).not.toContain("<TranslationLoading");
  });

  it("l'ecran d'attente est bien rendu comme enfant du fournisseur", () => {
    const dansLeFournisseur = PROVIDER.slice(PROVIDER.indexOf("<TranslationContext.Provider"));

    expect(dansLeFournisseur).toContain("<TranslationLoading />");
  });

  it("le traducteur se rabat sur le dictionnaire par defaut, pas sur le vide", () => {
    // Avec un dictionnaire vide, chaque cle serait rendue telle quelle a
    // l'ecran pendant le chargement.
    expect(PROVIDER).toContain("createTranslator(dictionary ?? defaultDictionary");
  });

  it("le contexte n'a pas de valeur par defaut, donc l'oubli se voit", () => {
    // C'est ce qui rend le test precedent necessaire plutot que decoratif : un
    // contexte a null fait lancer useTranslation au lieu de degrader en silence.
    expect(TranslationContext._currentValue ?? null).toBeNull();
  });
});
