import { useCallback, useEffect, useState } from "react";

import { installState } from "./install";
import { isApple, isStandalone } from "./platform";

export function useInstallPrompt(win = globalThis) {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(() => isStandalone(win));

  useEffect(() => {
    const capture = (event) => {
      // Sans preventDefault Chrome pose sa propre banniere et garde
      // l'evenement : il ne se represente pas, et le bouton n'aurait plus rien
      // a declencher.
      event.preventDefault();
      setPrompt(event);
    };
    const done = () => {
      setPrompt(null);
      setInstalled(true);
    };

    win.addEventListener("beforeinstallprompt", capture);
    win.addEventListener("appinstalled", done);
    return () => {
      win.removeEventListener("beforeinstallprompt", capture);
      win.removeEventListener("appinstalled", done);
    };
  }, [win]);

  const install = useCallback(async () => {
    if (!prompt) {
      return null;
    }
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    // L'evenement ne se rejoue pas apres usage : le garder laisserait un bouton
    // qui ne fait plus rien.
    setPrompt(null);
    return outcome;
  }, [prompt]);

  return {
    state: installState({
      standalone: installed,
      apple: isApple(win?.navigator),
      prompt: Boolean(prompt),
    }),
    install,
  };
}
