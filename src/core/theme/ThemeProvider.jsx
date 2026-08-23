import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { revealTheme } from "./reveal";
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

  const changeTheme = useCallback(
    (code, origin) => {
      if (!isSupported(code) || code === theme) {
        return;
      }
      rememberTheme(code);
      revealTheme(() => {
        applyTheme(code === "system" ? system : code);
        flushSync(() => setTheme(code));
      }, origin);
    },
    [theme, system],
  );

  const value = useMemo(
    () => ({ theme, resolved, setTheme: changeTheme }),
    [theme, resolved, changeTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
