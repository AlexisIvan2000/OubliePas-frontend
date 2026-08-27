import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Meme technique que les autres crochets : React reduit a un etat minimal, les
// effets rejoues a la main, et des minuteurs feints.
let etats;
let effets;
let nettoyages;
let RESEND_COOLDOWN_SECONDS;

async function chargerHook() {
  etats = [];
  effets = [];
  nettoyages = [];

  vi.resetModules();
  vi.doMock("react", () => {
    let curseur = 0;
    return {
      __rendre: () => {
        curseur = 0;
        effets = [];
      },
      useState: (initial) => {
        const index = curseur++;
        if (!(index in etats)) {
          etats[index] = typeof initial === "function" ? initial() : initial;
        }
        return [
          etats[index],
          (suivant) => {
            etats[index] = typeof suivant === "function" ? suivant(etats[index]) : suivant;
          },
        ];
      },
      useCallback: (fn) => fn,
      useEffect: (fn) => effets.push(fn),
    };
  });

  const react = await import("react");
  const module = await import("../../core/utils/useCooldown");
  RESEND_COOLDOWN_SECONDS = module.RESEND_COOLDOWN_SECONDS;

  return () => {
    react.__rendre();
    const hook = module.useCooldown();
    nettoyages.forEach((fn) => fn?.());
    nettoyages = effets.map((effet) => effet());
    return hook;
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCooldown", () => {
  it("n'attend rien au depart", async () => {
    const rendre = await chargerHook();

    const hook = rendre();

    expect(hook.left).toBe(0);
    expect(hook.waiting).toBe(false);
  });

  it("le delai par defaut est de quinze secondes", async () => {
    const rendre = await chargerHook();
    rendre().start();

    expect(rendre().left).toBe(RESEND_COOLDOWN_SECONDS);
    expect(RESEND_COOLDOWN_SECONDS).toBe(15);
  });

  it("descend d'une seconde par seconde", async () => {
    const rendre = await chargerHook();
    rendre().start();
    rendre();

    vi.advanceTimersByTime(1000);
    expect(rendre().left).toBe(14);

    vi.advanceTimersByTime(1000);
    expect(rendre().left).toBe(13);
  });

  it("attend encore a une seconde du bout", async () => {
    const rendre = await chargerHook();
    rendre().start();
    rendre();

    for (let tour = 0; tour < RESEND_COOLDOWN_SECONDS - 1; tour += 1) {
      vi.advanceTimersByTime(1000);
      rendre();
    }

    expect(rendre().left).toBe(1);
    expect(rendre().waiting).toBe(true);
  });

  it("rouvre le bouton a la fin du compte", async () => {
    const rendre = await chargerHook();
    rendre().start();
    rendre();

    for (let tour = 0; tour < RESEND_COOLDOWN_SECONDS; tour += 1) {
      vi.advanceTimersByTime(1000);
      rendre();
    }

    const hook = rendre();
    expect(hook.left).toBe(0);
    expect(hook.waiting).toBe(false);
  });

  it("ne descend plus une fois a zero", async () => {
    // Sans la garde, le compte passerait en negatif et le bouton resterait
    // ferme pour toujours.
    const rendre = await chargerHook();
    rendre().start();
    rendre();

    for (let tour = 0; tour < RESEND_COOLDOWN_SECONDS + 5; tour += 1) {
      vi.advanceTimersByTime(1000);
      rendre();
    }

    expect(rendre().left).toBe(0);
  });

  it("un second envoi repart du plein", async () => {
    const rendre = await chargerHook();
    rendre().start();
    rendre();
    vi.advanceTimersByTime(3000);
    rendre();

    rendre().start();

    expect(rendre().left).toBe(RESEND_COOLDOWN_SECONDS);
  });

  it("le minuteur s'arrete au demontage", async () => {
    const rendre = await chargerHook();
    rendre().start();
    rendre();

    nettoyages.forEach((fn) => fn?.());
    vi.advanceTimersByTime(5000);

    expect(etats[0]).toBe(RESEND_COOLDOWN_SECONDS);
  });
});
