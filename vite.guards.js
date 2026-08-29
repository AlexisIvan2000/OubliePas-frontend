const LOCAL_FALLBACK = "http://localhost:8000";

// Vite inscrit VITE_API_URL dans le bundle au moment du build. Le danger n'est
// pas de construire sans elle, c'est de le faire sur la machine qui sert le
// public : le repli de developpement partirait en production et chaque visiteur
// interrogerait sa propre machine. On ne bloque donc que la ou ca compte, et un
// clone frais peut construire chez lui sans rien configurer.
export function checkApiUrl(mode, value, { hosted = false } = {}) {
  if (mode !== "production") {
    return null;
  }

  if (!value) {
    if (hosted) {
      throw new Error(
        `VITE_API_URL manquante. Sans elle le bundle pointe vers ${LOCAL_FALLBACK}. ` +
          "Renseignez l'adresse publique de l'API dans les variables du projet.",
      );
    }
    return `VITE_API_URL absente : ce build vise ${LOCAL_FALLBACK} et ne convient qu'en local.`;
  }

  if (!/^https?:\/\/\S+$/.test(value)) {
    throw new Error(`VITE_API_URL doit etre une adresse absolue, recu : ${value}`);
  }

  return null;
}

// Les plateformes d'hebergement posent toutes une variable qui les nomme. En
// leur absence, on considere qu'on construit sur un poste de developpement.
export function isHostedBuild(env) {
  return Boolean(env.VERCEL || env.CI || env.NETLIFY || env.RAILWAY_ENVIRONMENT);
}
