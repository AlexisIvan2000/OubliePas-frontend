import { useContext } from "react";

import { ThemeContext } from "./ThemeContext";

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
}
