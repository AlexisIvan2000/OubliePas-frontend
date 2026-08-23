const DURATION = 420;
const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const SWEEP_LEFT_TO_RIGHT = ["inset(0 100% 0 0)", "inset(0 0 0 0)"];

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

  const transition = document.startViewTransition(apply);

  transition.ready
    .then(() => {
      document.documentElement.animate(
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
