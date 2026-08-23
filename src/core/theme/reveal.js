const DURATION = 420;
const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function isAvailable() {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

function farthestCorner(x, y) {
  const { innerWidth: width, innerHeight: height } = window;
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

export function revealTheme(apply, origin) {
  if (!isAvailable() || prefersReducedMotion()) {
    apply();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const transition = document.startViewTransition(apply);

  transition.ready
    .then(() => {
      const radius = farthestCorner(x, y);
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
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
