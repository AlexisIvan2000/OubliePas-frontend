const WORKER_URL = "/sw.js";

// Le navigateur ne cherche un worker neuf qu'a la navigation, ou une fois par
// jour. Une app installee et jamais fermee ne navigue plus : sans ce reveil,
// un correctif du worker attendrait le lendemain.
export const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export function dueForUpdate({ visible, last, now, interval = UPDATE_INTERVAL_MS }) {
  return visible && now - last >= interval;
}

function whenLoaded(win, run) {
  // readyState avant l'ecouteur : un bundle deja en cache rend la page chargee
  // avant que React ne monte, et « load » ne se rejouerait jamais.
  if (win.document?.readyState === "complete") {
    run();
    return;
  }
  win.addEventListener("load", run, { once: true });
}

export function watchForUpdates(registration, win = globalThis) {
  let last = Date.now();
  const check = () => {
    const visible = win.document?.visibilityState === "visible";
    if (!dueForUpdate({ visible, last, now: Date.now() })) {
      return;
    }
    last = Date.now();
    registration.update().catch(() => {});
  };

  win.document?.addEventListener("visibilitychange", check);
  return () => win.document?.removeEventListener("visibilitychange", check);
}

export function registerServiceWorker(win = globalThis) {
  const nav = win?.navigator;
  if (!nav?.serviceWorker) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    // Enregistrer pendant le chargement disputerait la bande passante a la
    // page que quelqu'un est en train de regarder.
    whenLoaded(win, () => {
      nav.serviceWorker
        .register(WORKER_URL)
        .then((registration) => {
          watchForUpdates(registration, win);
          return registration;
        })
        // Un worker qui refuse de s'enregistrer ne doit pas empecher l'app de
        // s'afficher : elle marche sans lui, elle est seulement moins bonne.
        .catch(() => null)
        .then(resolve);
    });
  });
}
