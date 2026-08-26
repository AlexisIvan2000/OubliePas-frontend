import { useCallback, useEffect, useRef } from "react";

const DIALOG = "[role='dialog'], [role='alertdialog']";

// Le dernier element focalise en dehors d'un dialogue, c'est-a-dire celui qui l'a
// ouvert. On ne peut pas le lire a l'ouverture : autoFocus deplace deja le focus
// dans le dialogue avant que le moindre effet ne s'execute. En le suivant en
// continu et en ignorant ce qui se passe a l'interieur d'un dialogue, la valeur
// est encore la bonne quand on la relit.
let lastOutside = null;

function remember(event) {
  const node = event.target;
  if (node instanceof Element && !node.closest(DIALOG)) {
    lastOutside = node;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("focusin", remember, true);
}

export function useReturnFocus(active = true) {
  const origin = useRef(null);

  useEffect(() => {
    if (active) {
      origin.current = lastOutside;
    }
  }, [active]);

  return useCallback(() => {
    const node = origin.current;
    origin.current = null;

    // Apres une suppression, le bouton d'origine n'est plus dans le document :
    // lui rendre le focus ne ferait rien et le laisserait sur body, ce que l'on
    // cherche justement a eviter.
    if (!node || node === document.body || !node.isConnected) {
      return;
    }
    if (typeof node.focus === "function") {
      node.focus();
    }
  }, []);
}
