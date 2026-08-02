import { useCallback, useEffect, useMemo, useState } from "react";

import { setFormattingLocale } from "../utils/formatting";
import { defaultDictionary, loadDictionary } from "./dictionaries";
import { TranslationContext } from "./TranslationContext";
import { DEFAULT_LOCALE, LOCALES, detectLocale, isSupported, rememberLocale } from "./locales";
import { TranslationLoading } from "./TranslationBoot";
import { createTranslator } from "./translate";

export function TranslationProvider({ children }) {
  const [locale, setLocale] = useState(detectLocale);
  const [fetched, setFetched] = useState(null);

  const dictionary = locale === DEFAULT_LOCALE ? defaultDictionary : fetched;

  useEffect(() => {
    if (locale === DEFAULT_LOCALE) {
      return;
    }

    let active = true;

    loadDictionary(locale)
      .catch(() => defaultDictionary)
      .then((loaded) => {
        if (active) {
          setFetched(loaded);
        }
      });

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
    return <TranslationLoading />;
  }

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}
