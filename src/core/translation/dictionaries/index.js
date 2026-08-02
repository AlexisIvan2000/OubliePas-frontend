import { DEFAULT_LOCALE } from "../locales";
import fr from "./fr.json";

const LAZY = {
  en: () => import("./en.json"),
};

export const defaultDictionary = fr;

export async function loadDictionary(code) {
  const loader = LAZY[code];
  if (code === DEFAULT_LOCALE || !loader) {
    return defaultDictionary;
  }
  const module = await loader();
  return module.default;
}
