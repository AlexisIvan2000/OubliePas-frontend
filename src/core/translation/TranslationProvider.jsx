import { useCallback, useEffect, useMemo, useState } from "react";

import { setFormattingLocale } from "../utils/formatting";
import { TranslationContext } from "./TranslationContext";
import {
  DEFAULT_LOCALE,
  LOCALES,
  detectLocale,
  dictionaryUrl,
  isSupported,
  rememberLocale,
} from "./locales";
import { createTranslator } from "./translate";

const cache = new Map();

async function loadDictionary(code) {
  if (cache.has(code)) {
    return cache.get(code);
  }

  const response = await fetch(dictionaryUrl(code), { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Dictionnaire ${code} introuvable`);
  }

  const dictionary = await response.json();
  cache.set(code, dictionary);
  return dictionary;
}

export function TranslationProvider({ children }) {
  const [locale, setLocale] = useState(detectLocale);
  const [dictionary, setDictionary] = useState(null);

  useEffect(() => {
    let active = true;

    loadDictionary(locale)
      .catch(() => (locale === DEFAULT_LOCALE ? {} : loadDictionary(DEFAULT_LOCALE)))
      .catch(() => ({}))
      .then((loaded) => active && setDictionary(loaded));

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    setFormattingLocale(LOCALES[locale].intl);
  }, [locale]);

  const changeLocale = useCallback((code) => {
    if (!isSupported(code)) {
      return;
    }
    rememberLocale(code);
    setLocale(code);
  }, []);

  const value = useMemo(() => {
    const active = LOCALES[locale];
    return {
      locale,
      intlLocale: active.intl,
      localeLabel: active.label,
      setLocale: changeLocale,
      t: createTranslator(dictionary ?? {}, active.intl),
    };
  }, [locale, dictionary, changeLocale]);

  if (!dictionary) {
    return null;
  }

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}
