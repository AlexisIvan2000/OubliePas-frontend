import { beforeEach, describe, expect, it } from "vitest";

import {
  clearResources,
  readResource,
  resourceGeneration,
  writeResource,
} from "../../core/network/resourceCache";

beforeEach(() => {
  clearResources();
});

describe("resourceCache", () => {
  it("rend ce qui vient d'etre ecrit", () => {
    writeResource("commitments:subscription", ["Netflix"]);

    expect(readResource("commitments:subscription")).toEqual(["Netflix"]);
  });

  it("rend undefined pour une cle inconnue", () => {
    expect(readResource("jamais ecrite")).toBeUndefined();
  });

  it("oublie tout a la remise a zero", () => {
    writeResource("a", 1);
    writeResource("b", 2);

    clearResources();

    expect(readResource("a")).toBeUndefined();
    expect(readResource("b")).toBeUndefined();
  });

  it("avance la generation a chaque remise a zero", () => {
    const avant = resourceGeneration();

    clearResources();

    expect(resourceGeneration()).toBeGreaterThan(avant);
  });
});

describe("etancheite entre deux comptes", () => {
  it("refuse une reponse partie avant la deconnexion", () => {
    // Le scenario a fermer : le compte A demande sa liste, se deconnecte, B se
    // connecte, et la reponse de A arrive enfin. Sans la garde, elle atterrirait
    // dans la session de B.
    const generationDeA = resourceGeneration();
    clearResources();

    const ecrit = writeResource("commitments:subscription", ["Netflix de A"], generationDeA);

    expect(ecrit).toBe(false);
    expect(readResource("commitments:subscription")).toBeUndefined();
  });

  it("accepte une reponse partie apres la derniere remise a zero", () => {
    const generationCourante = resourceGeneration();

    const ecrit = writeResource("summary", { total: 42 }, generationCourante);

    expect(ecrit).toBe(true);
    expect(readResource("summary")).toEqual({ total: 42 });
  });

  it("survit a deux remises a zero d'affilee, comme une deconnexion suivie d'une connexion", () => {
    const generationDeA = resourceGeneration();
    writeResource("commitments:subscription", ["Netflix de A"]);

    clearResources();
    clearResources();

    expect(readResource("commitments:subscription")).toBeUndefined();
    expect(writeResource("commitments:subscription", ["Netflix de A"], generationDeA)).toBe(false);
  });

  it("une ecriture sans generation ecrase toujours, c'est la mise a jour locale", () => {
    // setData ecrit sans preciser de generation : il agit dans la session
    // courante et n'a pas a se defendre contre une reponse perimee.
    writeResource("summary", { total: 1 });

    expect(writeResource("summary", { total: 2 })).toBe(true);
    expect(readResource("summary")).toEqual({ total: 2 });
  });
});
