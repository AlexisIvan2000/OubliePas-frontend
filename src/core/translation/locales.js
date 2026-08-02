export const LOCALES = {
  fr: { code: "fr", intl: "fr-CA", label: "Français", short: "FR" },
  en: { code: "en", intl: "en-CA", label: "English", short: "EN" },
};

export const LOCALE_LIST = Object.values(LOCALES);
export const DEFAULT_LOCALE = "fr";
export const STORAGE_KEY = "oubliepas.locale";

export function isSupported(code) {
  return Object.hasOwn(LOCALES, code);
}

export function detectLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) {
      return stored;
    }
  } catch {
    /* stockage indisponible */
  }

  const preferred = navigator.languages ?? [navigator.language];
  for (const tag of preferred) {
    const base = String(tag).split("-")[0].toLowerCase();
    if (isSupported(base)) {
      return base;
    }
  }

  return DEFAULT_LOCALE;
}

export function rememberLocale(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* stockage indisponible */
  }
}
