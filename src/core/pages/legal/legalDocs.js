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

export function loadLegalDoc(name, locale) {
  const byLocale = LOADERS[name];
  return (byLocale[locale] ?? byLocale.fr)().then((module) => module.default);
}
