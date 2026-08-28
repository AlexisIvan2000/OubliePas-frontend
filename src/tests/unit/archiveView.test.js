import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { quotaState, trackedCount } from "../../features/commitments/domain/commitment";

const VUE = "src/features/commitments/presentation/components/CommitmentsView.jsx";
const source = readFileSync(VUE, "utf8");

const LIMITE = 25;
const lignes = (count, status = "active", prefixe = status) =>
  Array.from({ length: count }, (_, index) => ({ id: `${prefixe}-${index}`, status }));

describe("le compteur ne depend pas de la vue", () => {
  it("il est calcule sur la liste du compte, pas sur celle qui est affichee", () => {
    // La puce des archives est devenue exclusive : la population affichee n'est
    // plus celle du compte. Nourrir le compteur avec pool ou visible le ferait
    // tomber a zero des qu'on ouvre le placard.
    expect(source).toContain("quotaState(items, user?.commitmentLimit)");
    expect(source).not.toMatch(/quotaState\((pool|visible|pickedRows)/);
  });

  it("le meme compte, vu du placard ou de la liste", () => {
    const compte = [...lignes(20), ...lignes(3, "paused"), ...lignes(40, "archived")];

    expect(quotaState(compte, LIMITE)).toMatchObject({ used: 23, left: 2, tone: "alert" });
  });

  it("un compte fait d'archives seules laisse toutes les places libres", () => {
    expect(trackedCount(lignes(30, "archived"))).toBe(0);
    expect(quotaState(lignes(30, "archived"), LIMITE)).toMatchObject({ used: 0, tone: "calm" });
  });

  it("archiver au plafond libere une place, quelle que soit la vue", () => {
    const plein = lignes(LIMITE);
    expect(quotaState(plein, LIMITE).tone).toBe("full");

    const apres = plein.map((item, index) =>
      index === 0 ? { ...item, status: "archived" } : item,
    );
    expect(quotaState(apres, LIMITE)).toMatchObject({ used: 24, left: 1 });
  });
});

describe("l'archive reste a un clic", () => {
  it("la puce s'affiche des qu'une ligne est archivee", () => {
    expect(source).toContain("{archivedCount || showArchived ? (");
  });

  it("le compteur et le bouton d'ajout ne quittent pas l'en-tete", () => {
    // Le message du plafond dit "archivez pour faire de la place" : le compteur
    // doit rester lisible et l'ajout atteignable, y compris depuis le placard.
    const entete = source.slice(source.indexOf("<header"), source.indexOf("</header>"));

    expect(entete).toContain("commitments.quota");
    expect(entete).toContain("onClick={openCreate}");
    expect(entete).not.toContain("showArchived");
  });

  it("une creation ramene a la liste ou la ligne neuve se trouve", () => {
    // Sans cela, creer depuis le placard annoncerait une ligne que le filtre
    // cache aussitot.
    expect(source).toMatch(/if \(!editing\) \{\s*setShowArchived\(false\);/);
  });

  it("le placard vide garde une porte de sortie", () => {
    expect(source).toContain('t("commitments.backToList")');
    expect(source).toContain("onAction={() => setShowArchived(false)}");
  });
});
