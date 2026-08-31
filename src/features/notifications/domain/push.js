import { isApple, isStandalone } from "../../../core/pwa/platform";

export const UNSUPPORTED = "unsupported";
export const HOME_SCREEN = "homeScreen";
export const IDLE = "idle";
export const DENIED = "denied";
export const GRANTED = "granted";

const MAX_USER_AGENT = 255;

export function inspect(win = globalThis) {
  const nav = win?.navigator;
  return {
    hasWorker: Boolean(nav?.serviceWorker),
    hasPush: typeof win?.PushManager !== "undefined",
    hasNotification: typeof win?.Notification !== "undefined",
    permission: win?.Notification?.permission ?? "default",
    apple: isApple(nav),
    standalone: isStandalone(win),
  };
}

export function pushState(env) {
  // L'ordre compte. Safari n'expose PushManager sur iPhone qu'une fois l'app
  // ajoutee a l'ecran d'accueil : chercher le support d'abord repondrait « votre
  // navigateur ne sait pas faire » a quelqu'un dont le navigateur sait faire,
  // et lui cacherait le seul geste qui debloque la situation.
  if (env.apple && !env.standalone) {
    return HOME_SCREEN;
  }
  if (!env.hasWorker || !env.hasPush || !env.hasNotification) {
    return UNSUPPORTED;
  }
  if (env.permission === "denied") {
    return DENIED;
  }
  if (env.permission === "granted") {
    return GRANTED;
  }
  return IDLE;
}

const BLOCKING = [UNSUPPORTED, HOME_SCREEN, DENIED];

export function blockingReason(state) {
  return BLOCKING.includes(state) ? state : null;
}

export function decodeVapidKey(key) {
  const normalized = String(key ?? "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function subscriptionPayload(subscription, userAgent) {
  // Recopie champ par champ plutot que le toJSON du navigateur : celui-ci porte
  // un expirationTime que l'API refuse, et le refus arriverait apres que le
  // navigateur a deja accorde la permission.
  const raw = subscription?.toJSON?.() ?? subscription ?? {};
  return {
    endpoint: raw.endpoint,
    p256dh: raw.keys?.p256dh ?? null,
    auth: raw.keys?.auth ?? null,
    user_agent: userAgent ? String(userAgent).slice(0, MAX_USER_AGENT) : null,
  };
}

export function keyMatches(subscription, key) {
  // Un abonnement reste valide pour la cle publique qui l'a cree. Si la paire
  // VAPID du serveur a change, le service de push refusera nos envois avec un
  // 403 que personne ne verra : mieux vaut le detecter ici et se reabonner.
  const stored = subscription?.options?.applicationServerKey;
  if (!stored) {
    return false;
  }
  const bytes = new Uint8Array(stored);
  return bytes.length === key.length && bytes.every((value, index) => value === key[index]);
}
