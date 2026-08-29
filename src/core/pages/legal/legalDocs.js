const LOADERS = {
  terms: {
    fr: () => import("./content/terms.fr.js"),
    en: () => import("./content/terms.en.js"),
  },
  privacy: {
    fr: () => import("./content/privacy.fr.js"),
    en: () => import("./content/privacy.en.js"),
  },
};

export const LEGAL_PATHS = {
  terms: "/conditions",
  privacy: "/confidentialite",
};

// Meme repli que le dictionnaire : une traduction qui ne se charge pas rend la
// version francaise plutot que rien. Si le francais lui-meme echoue, l'appelant
// doit le savoir, donc la promesse est laissee en echec.
export function loadLegalDoc(name, locale) {
  const byLocale = LOADERS[name];
  const load = byLocale[locale] ?? byLocale.fr;

  return load()
    .catch(() => (load === byLocale.fr ? Promise.reject() : byLocale.fr()))
    .then((module) => module.default);
}
