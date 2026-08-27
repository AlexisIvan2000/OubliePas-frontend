import { describe, expect, it } from "vitest";

import { mapUser } from "../../features/authentication/domain/user";
import {
  QUOTA_ALERT_LEFT,
  QUOTA_REVEAL_LEFT,
  quotaState,
  trackedCount,
} from "../../features/commitments/domain/commitment";

const LIMITE = 25;

const lignes = (count, status = "active") =>
  Array.from({ length: count }, (_, index) => ({ id: `${status}-${index}`, status }));

describe("trackedCount", () => {
  it("compte les actifs et les mis en pause", () => {
    expect(trackedCount([...lignes(3), ...lignes(2, "paused")])).toBe(5);
  });

  it("ne compte pas les archives", () => {
    expect(trackedCount([...lignes(3), ...lignes(9, "archived")])).toBe(3);
  });

  it("ne compte rien dans une liste vide", () => {
    expect(trackedCount([])).toBe(0);
  });
});

describe("quotaState", () => {
  it("se tait quand le serveur n'a pas donne de plafond", () => {
    expect(quotaState(lignes(24), null)).toBeNull();
  });

  it("se tait tant que la marge est large", () => {
    expect(quotaState(lignes(LIMITE - QUOTA_REVEAL_LEFT - 1), LIMITE)).toBeNull();
  });

  it("apparait des la premiere des sept dernieres places", () => {
    const etat = quotaState(lignes(LIMITE - QUOTA_REVEAL_LEFT), LIMITE);

    expect(etat).toEqual({ used: 18, limit: 25, left: 7, tone: "calm" });
  });

  it("passe en alerte quand il reste trois places", () => {
    expect(quotaState(lignes(LIMITE - QUOTA_ALERT_LEFT), LIMITE).tone).toBe("alert");
  });

  it("reste calme une place avant l'alerte", () => {
    expect(quotaState(lignes(LIMITE - QUOTA_ALERT_LEFT - 1), LIMITE).tone).toBe("calm");
  });

  it("est plein a la derniere place prise", () => {
    expect(quotaState(lignes(LIMITE), LIMITE)).toEqual({
      used: 25,
      limit: 25,
      left: 0,
      tone: "full",
    });
  });

  it("dit la verite au-dessus du plafond", () => {
    // Restaurer depuis la corbeille peut depasser : le compteur affiche 26 sur
    // 25 plutot que de faire semblant que tout va bien.
    const etat = quotaState(lignes(LIMITE + 1), LIMITE);

    expect(etat.used).toBe(26);
    expect(etat.left).toBe(-1);
    expect(etat.tone).toBe("full");
  });

  it("les archives ne prennent pas de place", () => {
    const etat = quotaState([...lignes(10), ...lignes(20, "archived")], LIMITE);

    expect(etat).toBeNull();
  });

  it("une ligne en pause en prend une", () => {
    const etat = quotaState([...lignes(LIMITE - 1), ...lignes(1, "paused")], LIMITE);

    expect(etat.tone).toBe("full");
  });
});

describe("le compteur suit la vie de la liste", () => {
  const ligne = (id, status = "active") => ({ id, status });
  const changer = (liste, id, status) =>
    liste.map((item) => (item.id === id ? { ...item, status } : item));
  const retirer = (liste, id) => liste.filter((item) => item.id !== id);
  const etat = (liste) => quotaState(liste, LIMITE);

  it("creation, archivage, suppression, restauration, annulation", () => {
    // Chaque etape est la liste telle que le serveur la renvoie apres l'action :
    // supprimer sort la ligne de la liste vivante, restaurer l'y remet, et
    // annuler un archivage n'est qu'un statut repose a actif.
    let liste = Array.from({ length: LIMITE - 1 }, (_, index) => ligne(`l${index}`));
    expect(etat(liste)).toMatchObject({ used: 24, left: 1, tone: "alert" });

    liste = [...liste, ligne("neuve")];
    expect(etat(liste)).toMatchObject({ used: 25, left: 0, tone: "full" });

    liste = changer(liste, "l0", "archived");
    expect(etat(liste)).toMatchObject({ used: 24, left: 1, tone: "alert" });

    liste = retirer(liste, "l1");
    expect(etat(liste)).toMatchObject({ used: 23, left: 2, tone: "alert" });

    liste = [...liste, ligne("l1")];
    expect(etat(liste)).toMatchObject({ used: 24, left: 1, tone: "alert" });

    liste = changer(liste, "l0", "active");
    expect(etat(liste)).toMatchObject({ used: 25, left: 0, tone: "full" });
  });

  it("l'annulation d'une suppression rend sa place a la ligne", () => {
    const plein = Array.from({ length: LIMITE }, (_, index) => ligne(`l${index}`));
    const apresSuppression = retirer(plein, "l3");

    expect(etat(apresSuppression).tone).toBe("alert");
    expect(etat([...apresSuppression, ligne("l3")]).tone).toBe("full");
  });

  it("une ligne restauree archivee ne reprend pas de place", () => {
    // La restauration rend la ligne a la liste avec son statut d'avant : une
    // ligne archivee puis supprimee revient archivee, donc hors du compte.
    const liste = Array.from({ length: LIMITE - 1 }, (_, index) => ligne(`l${index}`));

    expect(etat([...liste, ligne("vieille", "archived")])).toMatchObject({
      used: 24,
      tone: "alert",
    });
  });
});

describe("le plafond vient du compte", () => {
  it("mapUser porte la limite envoyee par le serveur", () => {
    expect(mapUser({ id: "1", commitment_limit: 40 }).commitmentLimit).toBe(40);
  });

  it("sans champ, la limite reste inconnue plutot que devinee", () => {
    expect(mapUser({ id: "1" }).commitmentLimit).toBeNull();
  });
});
