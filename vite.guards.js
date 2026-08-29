export const LOCAL_URL = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/|$)/i;

export function isLocalUrl(value) {
  return LOCAL_URL.test(String(value ?? ""));
}

// La premiere version de cette garde exigeait VITE_API_URL des qu'une variable
// de plateforme etait presente. Vercel n'expose les siennes au build que si une
// case est cochee dans les reglages : la garde ne s'est pas declenchee et un
// bundle visant localhost est parti en production. La detection d'environnement
// est donc abandonnee au profit d'une invariante de source, verifiee par un
// test : le repli de apiConfig.js ne vise jamais une machine locale. Un build
// sans variable est alors sans danger, ou qu'il tourne.
export function checkApiUrl(mode, value) {
  if (mode !== "production" || !value) {
    return null;
  }
  if (!/^https?:\/\/\S+$/.test(value)) {
    throw new Error(`VITE_API_URL doit etre une adresse absolue, recu : ${value}`);
  }
  if (isLocalUrl(value)) {
    return `VITE_API_URL vise ${value} : ce build ne convient qu'en local.`;
  }
  return null;
}
