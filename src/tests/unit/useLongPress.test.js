import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// React remplace par le strict minimum : le hook ne tient qu'a un timer et a
// une reference, tout le reste est de la logique de pointeur.
let effets;
let useLongPress;
let LONG_PRESS_MS;

async function chargerHook() {
  effets = [];
  vi.resetModules();
  vi.doMock("react", () => ({
    useRef: (initial) => ({ current: initial }),
    useCallback: (fn) => fn,
    useEffect: (fn) => effets.push(fn),
  }));

  const module = await import("../../core/utils/useLongPress");
  LONG_PRESS_MS = module.LONG_PRESS_MS;
  useLongPress = module.useLongPress;
}

const doigt = (overrides = {}) => ({
  pointerType: "touch",
  clientX: 100,
  clientY: 100,
  preventDefault: () => {},
  ...overrides,
});

beforeEach(async () => {
  vi.useFakeTimers();
  await chargerHook();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useLongPress", () => {
  it("declenche apres le delai", () => {
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt());
    expect(appele).not.toHaveBeenCalled();

    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(appele).toHaveBeenCalledTimes(1);
  });

  it("ne declenche pas une milliseconde trop tot", () => {
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt());
    vi.advanceTimersByTime(LONG_PRESS_MS - 1);

    expect(appele).not.toHaveBeenCalled();
  });

  it("un doigt leve avant la fin n'ouvre rien", () => {
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt());
    vi.advanceTimersByTime(200);
    gestes.onPointerUp();
    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(appele).not.toHaveBeenCalled();
  });

  it("un doigt qui glisse fait defiler, il ne selectionne pas", () => {
    // Sans cette annulation, chaque defilement de la liste ouvrirait le mode.
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt());
    gestes.onPointerMove(doigt({ clientY: 140 }));
    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(appele).not.toHaveBeenCalled();
  });

  it("un tremblement de quelques pixels ne compte pas comme un glissement", () => {
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt());
    gestes.onPointerMove(doigt({ clientX: 104, clientY: 97 }));
    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(appele).toHaveBeenCalledTimes(1);
  });

  it("une annulation du pointeur arrete tout", () => {
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt());
    gestes.onPointerCancel();
    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(appele).not.toHaveBeenCalled();
  });

  it("la souris est ignoree : elle a le survol et le menu de la ligne", () => {
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt({ pointerType: "mouse" }));
    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(appele).not.toHaveBeenCalled();
  });

  it("sans rappel, rien n'est arme", () => {
    // C'est ainsi que le mode selection se desarme lui-meme une fois ouvert.
    const gestes = useLongPress(null);

    expect(() => gestes.onPointerDown(doigt())).not.toThrow();
    expect(() => vi.advanceTimersByTime(LONG_PRESS_MS)).not.toThrow();
  });

  it("le menu contextuel est neutralise apres un appui long", () => {
    // Sur iOS il s'ouvrirait par-dessus la selection qui vient de naitre.
    const gestes = useLongPress(vi.fn());
    const empeche = vi.fn();

    gestes.onPointerDown(doigt());
    vi.advanceTimersByTime(LONG_PRESS_MS);
    gestes.onContextMenu({ preventDefault: empeche });

    expect(empeche).toHaveBeenCalledTimes(1);
  });

  it("un clic droit ordinaire garde son menu", () => {
    const gestes = useLongPress(vi.fn());
    const empeche = vi.fn();

    gestes.onContextMenu({ preventDefault: empeche });

    expect(empeche).not.toHaveBeenCalled();
  });

  it("le demontage annule un appui en cours", () => {
    const appele = vi.fn();
    const gestes = useLongPress(appele);

    gestes.onPointerDown(doigt());
    effets.forEach((effet) => effet()());
    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(appele).not.toHaveBeenCalled();
  });
});
