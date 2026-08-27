import { useCallback, useRef, useState } from "react";

export function useSelection() {
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const opener = useRef(null);

  const start = useCallback((id) => {
    opener.current = document.activeElement ?? null;
    setPicking(true);
    setSelected(new Set(id ? [id] : []));
  }, []);

  const stop = useCallback(() => {
    setPicking(false);
    // Sortir vide la selection : la retrouver telle quelle en revenant ferait
    // agir sur des lignes choisies avant un filtre, une recherche ou un tri.
    setSelected(new Set());

    const previous = opener.current;
    opener.current = null;
    if (previous?.isConnected) {
      previous.focus();
    }
  }, []);

  const toggle = useCallback((id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids) => {
    setSelected((current) => (current.size >= ids.length ? new Set() : new Set(ids)));
  }, []);

  return { picking, selected, start, stop, toggle, toggleAll };
}
