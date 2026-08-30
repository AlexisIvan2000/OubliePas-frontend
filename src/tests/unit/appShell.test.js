import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const CSS = "src/core/components/AppShell/AppShell.module.css";
const JSX = "src/core/components/AppShell/AppShell.jsx";

const feuille = readFileSync(CSS, "utf8");

function regle(nom) {
  // La premiere occurrence est la regle de base ; celles des media queries
  // suivent et sont volontairement exclues.
  const debut = feuille.indexOf(`.${nom} {`);
  return debut === -1 ? "" : feuille.slice(debut, feuille.indexOf("}", debut));
}

describe("le pied de la barre laterale reste atteignable", () => {
  it("la barre occupe toute la hauteur, sans defilement propre", () => {
    // C'est la contrainte qui rend le reste necessaire : ce qui deborde d'une
    // hauteur fixe sans overflow devient invisible, sans barre de defilement
    // pour aller le chercher.
    expect(regle("sidebar")).toContain("height: 100dvh");
  });

  it("c'est la liste des liens qui defile", () => {
    const nav = regle("nav");

    expect(nav).toContain("overflow-y: auto");
    // Sans min-height, un enfant flex refuse de retrecir sous la taille de son
    // contenu : la regle de defilement ne s'appliquerait jamais.
    expect(nav).toContain("min-height: 0");
    expect(nav).toMatch(/flex:\s*1/);
  });

  it("le compte et la deconnexion sont dans le pied, apres la liste", () => {
    const source = readFileSync(JSX, "utf8");
    const pied = source.indexOf("styles.foot");

    expect(pied).toBeGreaterThan(source.indexOf("styles.nav"));
    expect(source.indexOf("styles.signOut")).toBeGreaterThan(pied);
  });

  it("le pied est colle en bas", () => {
    expect(regle("foot")).toContain("margin-top: auto");
  });

  it("aucune barre de defilement horizontale ne peut apparaitre", () => {
    // overflow-y: auto suffit a faire deduire overflow-x: auto au navigateur,
    // la specification interdisant de melanger « visible » et une valeur
    // defilante. Sans declaration explicite, quelques pixels de debordement
    // suffisent a poser une barre horizontale en travers de la navigation.
    expect(regle("nav")).toContain("overflow-x: clip");
  });
});

describe("les reglages de langue et de theme", () => {
  it("sont dans le pied, avant le compte", () => {
    // Retires un temps parce qu'ils faisaient doublon avec la page Reglages,
    // ils sont revenus : deux clics pour changer de langue valent mieux qu'un
    // detour, et la place a ete reprise sur les hauteurs, pas sur eux.
    const source = readFileSync(JSX, "utf8");
    const bandeau = source.indexOf("PreferenceToggles");

    expect(bandeau).toBeGreaterThan(-1);
    expect(source.indexOf("styles.prefs")).toBeGreaterThan(source.indexOf("styles.foot"));
    expect(source.indexOf("styles.prefs")).toBeLessThan(source.indexOf("styles.account"));
  });
});
