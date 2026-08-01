import { useContext } from "react";

import { TranslationContext } from "./TranslationContext";

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation doit être utilisé à l'intérieur d'un TranslationProvider");
  }
  return context;
}
