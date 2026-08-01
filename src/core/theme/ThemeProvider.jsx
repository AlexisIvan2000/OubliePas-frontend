import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ThemeContext } from "./ThemeContext";
import {
  applyTheme,
  detectTheme,
  isSupported,
  rememberTheme,
  subscribeSystem,
  systemSnapshot,
} from "./themes";

const SERVER_SNAPSHOT = () => "light";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(detectTheme);
  const system = useSyncExternalStore(subscribeSystem, systemSnapshot, SERVER_SNAPSHOT);

  const resolved = theme === "system" ? system : theme;

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const changeTheme = useCallback((code) => {
    if (!isSupported(code)) {
      return;
    }
    rememberTheme(code);
    setTheme(code);
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme: changeTheme }),
    [theme, resolved, changeTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
