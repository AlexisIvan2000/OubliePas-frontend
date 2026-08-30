import { useCallback, useEffect, useRef, useState } from "react";

import { useReturnFocus } from "../../utils/useReturnFocus";
import { useScrollLock } from "../../utils/useScrollLock";

export function useNavDrawer(pathname) {
  const [open, setOpen] = useState(false);
  const restoreFocus = useReturnFocus(open);
  const seen = useRef(pathname);

  useScrollLock(open);

  const close = useCallback(() => {
    setOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  const toggle = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    // Le premier rendu n'est pas une navigation : fermer ici rappellerait le
    // focus alors que personne n'a rien ouvert.
    if (seen.current === pathname) {
      return;
    }
    seen.current = pathname;
    // Le focus est reste sur un lien du tiroir, qui sort de l'ecran juste
    // apres : sans rappel explicite il retomberait sur body, et la tabulation
    // suivante repartirait du haut du document.
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handler = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  return { open, toggle, close };
}
