const DURATION = 420;
const EASING = "cubic-bezier(0.4, 0, 1, 1)";
const SWEEP_LEFT_TO_RIGHT = ["inset(0 100% 0 0)", "inset(0 0 0 0)"];
const FLAG = "themeSweep";

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function isAvailable() {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

export function revealTheme(apply) {
  if (!isAvailable() || prefersReducedMotion()) {
    apply();
    return;
  }

  const root = document.documentElement;
  root.dataset[FLAG] = "";
  const clear = () => delete root.dataset[FLAG];
  const transition = document.startViewTransition(apply);

  transition.finished.then(clear, clear);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: SWEEP_LEFT_TO_RIGHT },
        {
          duration: DURATION,
          easing: EASING,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      /* transition interrompue par une bascule plus recente */
    });
}
