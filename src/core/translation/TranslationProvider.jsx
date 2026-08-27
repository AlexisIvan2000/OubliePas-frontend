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
      t: createTranslator(dictionary ?? defaultDictionary, active.intl),
    };
  }, [locale, dictionary, changeLocale]);

  // L'ecran d'attente est rendu a l'interieur du contexte, jamais avant lui.
  // Sorti du fournisseur, le moindre composant qui traduit son libelle lance et
  // emporte la page entiere - et seuls les comptes en anglais passent par la.
  return (
    <TranslationContext.Provider value={value}>
      {dictionary ? children : <TranslationLoading />}
    </TranslationContext.Provider>
  );
}
