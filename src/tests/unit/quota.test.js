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

describe("le plafond vient du compte", () => {
  it("mapUser porte la limite envoyee par le serveur", () => {
    expect(mapUser({ id: "1", commitment_limit: 40 }).commitmentLimit).toBe(40);
  });

  it("sans champ, la limite reste inconnue plutot que devinee", () => {
    expect(mapUser({ id: "1" }).commitmentLimit).toBeNull();
  });
});
