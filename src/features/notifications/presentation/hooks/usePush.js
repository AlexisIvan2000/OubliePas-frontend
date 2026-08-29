import { useCallback, useEffect, useState } from "react";

import {
  getPublicKey,
  sendTestNotification,
  subscribeDevice,
  unsubscribeDevice,
} from "../../data/pushApi";
import {
  GRANTED,
  decodeVapidKey,
  inspect,
  keyMatches,
  pushState,
  subscriptionPayload,
} from "../../domain/push";

const WORKER_URL = "/sw.js";

// Le resultat de l'activation se dit en un mot, parce que l'ecran n'a pas la
// meme phrase a montrer selon qu'on a refuse la permission ou que le serveur
// n'a pas de paire VAPID.
export const SENT = "sent";
export const REFUSED = "refused";
export const UNAVAILABLE = "unavailable";

async function activeRegistration() {
  await navigator.serviceWorker.register(WORKER_URL);
  // register rend son enregistrement avant que le worker ne soit actif, et
  // pushManager.subscribe echoue tant qu'il ne l'est pas.
  return navigator.serviceWorker.ready;
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.getRegistration(WORKER_URL);
  return (await registration?.pushManager.getSubscription()) ?? null;
}

async function deviceSubscription(registration, key) {
  const existing = await registration.pushManager.getSubscription();
  if (existing && keyMatches(existing, key)) {
    return existing;
  }
  if (existing) {
    await existing.unsubscribe();
  }
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
}

export function usePush() {
  const [state, setState] = useState(() => pushState(inspect()));
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Une permission accordee ne dit pas que cet appareil est abonne : le
    // compte peut l'etre depuis un autre telephone, et l'interrupteur doit
    // parler de celui qu'on a sous les yeux.
    if (state !== GRANTED) {
      return undefined;
    }
    let alive = true;
    currentSubscription()
      .then((subscription) => {
        if (alive) {
          setSubscribed(Boolean(subscription));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [state]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      setState(pushState({ ...inspect(), permission }));
      if (permission !== "granted") {
        return REFUSED;
      }

      const { public_key: publicKey } = await getPublicKey();
      if (!publicKey) {
        // Le serveur n'a pas de paire VAPID : rien ne partira jamais, et un
        // interrupteur au vert le cacherait.
        return UNAVAILABLE;
      }

      const registration = await activeRegistration();
      const subscription = await deviceSubscription(registration, decodeVapidKey(publicKey));
      const payload = subscriptionPayload(subscription, navigator.userAgent);

      await subscribeDevice(payload);
      setSubscribed(true);
      // La preuve vient du service de push, jamais d'une notification fabriquee
      // ici : celle-ci s'afficherait meme si le chemin etait coupe.
      await sendTestNotification(payload.endpoint);
      return SENT;
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const subscription = await currentSubscription();
      setSubscribed(false);
      if (!subscription) {
        return;
      }
      // L'API d'abord : si le navigateur se desabonnait en premier et que
      // l'appel echouait, le serveur garderait une adresse que plus personne ne
      // pourrait lui nommer.
      await unsubscribeDevice(subscription.endpoint);
      await subscription.unsubscribe();
    } finally {
      setBusy(false);
    }
  }, []);

  return { state, busy, subscribed, enable, disable };
}
