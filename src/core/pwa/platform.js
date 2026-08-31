const IOS = /iPad|iPhone|iPod/;

export function isApple(nav) {
  const agent = nav?.userAgent ?? "";
  // Depuis iPadOS 13 un iPad se declare Macintosh : seul le nombre de points
  // de contact le separe d'un vrai Mac, qui lui sait recevoir le push.
  return IOS.test(agent) || (agent.includes("Macintosh") && (nav?.maxTouchPoints ?? 0) > 1);
}

export function isStandalone(win) {
  return (
    Boolean(win?.navigator?.standalone) ||
    Boolean(win?.matchMedia?.("(display-mode: standalone)")?.matches)
  );
}
