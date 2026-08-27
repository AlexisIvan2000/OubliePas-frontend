import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Les attributs qui finissent sous les yeux ou dans l'oreille de quelqu'un.
// Une valeur ecrite en dur ici, c'est une langue qui ne suit pas le compte.
const SPOKEN = /\s(aria-label|placeholder|alt|title|label)="([^"]*)"/g;
const HAS_LETTER = /[A-Za-zÀ-ÿ]/;

function jsxFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === "tests" ? [] : jsxFiles(full);
    }
    return entry.endsWith(".jsx") ? [full] : [];
  });
}

describe("aucun texte visible n'echappe au dictionnaire", () => {
  it("aucun attribut parle n'est ecrit en dur dans un composant", () => {
    const fautes = [];

    for (const file of jsxFiles("src")) {
      const source = readFileSync(file, "utf8");
      source.split("\n").forEach((line, index) => {
        for (const [, attribut, valeur] of line.matchAll(SPOKEN)) {
          if (HAS_LETTER.test(valeur)) {
            fautes.push(`${file}:${index + 1} ${attribut}="${valeur}"`);
          }
        }
      });
    }

    expect(fautes).toEqual([]);
  });

  it("le detecteur voit une faute quand il y en a une", () => {
    // Sans ce controle, le test precedent passerait aussi bien si l'expression
    // ne trouvait plus rien du tout.
    const ligne = '        <button aria-label="Effacer la recherche">';

    expect([...ligne.matchAll(SPOKEN)]).toHaveLength(1);
  });

  it("une image decorative reste permise", () => {
    const ligne = '        <img src={logo} alt="" />';

    const trouvees = [...ligne.matchAll(SPOKEN)].filter(([, , valeur]) =>
      HAS_LETTER.test(valeur),
    );

    expect(trouvees).toEqual([]);
  });
});
