import { describe, expect, it, vi } from "vitest";

// Les primitives React sont remplacees par des equivalents deterministes : ce
// qui est teste ici est la garde de re-entrance, pas le moteur de rendu.
vi.mock("react", () => ({
  useState: (init) => [typeof init === "function" ? init() : init, () => {}],
  useRef: (init) => ({ current: init }),
  useCallback: (fn) => fn,
}));

const { useAsyncAction } = await import("../../core/utils/useAsyncAction");

const lente = (delai = 20) => {
  const appels = [];
  const action = async (nom) => {
    appels.push(nom);
    await new Promise((resoudre) => setTimeout(resoudre, delai));
    return `resultat de ${nom}`;
  };
  return { action, appels };
};

describe("useAsyncAction", () => {
  it("rend le resultat en cas de succes", async () => {
    const { run } = useAsyncAction(async () => "ok");

    await expect(run()).resolves.toEqual({ ok: true, data: "ok", error: null });
  });

  it("rattrape l'echec au lieu de le laisser remonter", async () => {
    const panne = Object.assign(new Error("boum"), { code: "X" });
    const { run } = useAsyncAction(async () => {
      throw panne;
    });

    const resultat = await run();

    expect(resultat.ok).toBe(false);
    expect(resultat.data).toBeNull();
    expect(resultat.error).toBe(panne);
  });

  it("transmet ses arguments a l'action", async () => {
    const action = vi.fn(async () => "ok");
    const { run } = useAsyncAction(action);

    await run("premier", { second: true });

    expect(action).toHaveBeenCalledWith("premier", { second: true });
  });
});

describe("garde de re-entrance", () => {
  it("deux envois simultanes ne declenchent qu'un appel", async () => {
    // Le cas reel : deux appuis sur Entree, ou Ajouter puis Enregistrer et
    // ajouter. loading n'est visible qu'au rendu suivant, un rendu trop tard
    // pour arreter le second envoi.
    const { action, appels } = lente();
    const { run } = useAsyncAction(action);

    await Promise.all([run("premier"), run("second")]);

    expect(appels).toEqual(["premier"]);
  });

  it("le second appelant recoit le resultat du premier", async () => {
    const { action } = lente();
    const { run } = useAsyncAction(action);

    const [un, deux] = await Promise.all([run("premier"), run("second")]);

    expect(deux).toBe(un);
    expect(un.data).toBe("resultat de premier");
  });

  it("se relache une fois l'appel termine", async () => {
    const { action, appels } = lente(5);
    const { run } = useAsyncAction(action);

    await run("un");
    await run("deux");

    expect(appels).toEqual(["un", "deux"]);
  });

  it("ne reste pas fermee apres un echec asynchrone", async () => {
    const action = vi.fn(async () => {
      throw new Error("boum");
    });
    const { run } = useAsyncAction(action);

    await run();
    await run();

    expect(action).toHaveBeenCalledTimes(2);
  });

  it("ne reste pas fermee apres une levee synchrone", async () => {
    // Le piege evite : si la reference etait posee apres le lancement, le
    // finally s'executerait avant l'assignation et la laisserait coincee sur une
    // promesse deja resolue.
    const action = vi.fn(() => {
      throw new Error("sync");
    });
    const { run } = useAsyncAction(action);

    const premier = await run();
    await run();

    expect(premier.ok).toBe(false);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it("trois envois simultanes ne declenchent toujours qu'un appel", async () => {
    const { action, appels } = lente();
    const { run } = useAsyncAction(action);

    await Promise.all([run("a"), run("b"), run("c")]);

    expect(appels).toHaveLength(1);
  });
});
