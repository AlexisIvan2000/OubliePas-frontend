// Vite inscrit VITE_API_URL dans le bundle au moment du build. Absente, le repli
// de developpement part en production et chaque visiteur interroge sa propre
// machine : l'application se charge, puis echoue sur chaque requete. On refuse
// donc de construire plutot que de livrer une application muette.
export function checkApiUrl(mode, value) {
  if (mode !== "production") {
    return;
  }
  if (!value) {
    throw new Error(
      "VITE_API_URL manquante. Sans elle le bundle pointe vers http://localhost:8000. " +
        "Renseignez l'adresse publique de l'API dans les variables du projet.",
    );
  }
  if (!/^https?:\/\/\S+$/.test(value)) {
    throw new Error(`VITE_API_URL doit etre une adresse absolue, recu : ${value}`);
  }
}
