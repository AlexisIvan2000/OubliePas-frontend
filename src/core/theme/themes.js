export const THEMES = {
  light: { code: "light", labelKey: "settings.themeLight" },
  dark: { code: "dark", labelKey: "settings.themeDark" },
  system: { code: "system", labelKey: "settings.themeSystem" },
};

export const THEME_LIST = [THEMES.light, THEMES.dark, THEMES.system];
export const DEFAULT_THEME = "system";
export const STORAGE_KEY = "oubliepas.theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

export function isSupported(code) {
  return Object.hasOwn(THEMES, code);
}

export function detectTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) {
      return stored;
    }
  } catch {
    /* stockage indisponible */
  }
  return DEFAULT_THEME;
}

export function rememberTheme(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* stockage indisponible */
  }
}

export function systemPrefersDark() {
  return Boolean(window.matchMedia?.(DARK_QUERY).matches);
}

export function resolveTheme(code) {
  if (code === "system") {
    return systemPrefersDark() ? "dark" : "light";
  }
  return isSupported(code) ? code : "light";
}

export function applyTheme(resolved) {
  document.documentElement.dataset.theme = resolved;
}

export function subscribeSystem(onChange) {
  const media = window.matchMedia?.(DARK_QUERY);
  if (!media) {
    return () => {};
  }
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function systemSnapshot() {
  return systemPrefersDark() ? "dark" : "light";
}
