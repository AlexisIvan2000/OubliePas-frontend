import { useCallback, useEffect, useRef } from "react";

export const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE = 10;

export function useLongPress(onLongPress, { delay = LONG_PRESS_MS } = {}) {
  const timer = useRef(null);
  const origin = useRef(null);
  const fired = useRef(false);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    origin.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    (event) => {
      // Souris et stylet ouvrent deja le menu de la ligne : l'appui long est le
      // geste du doigt, la ou il n'y a ni survol ni clic droit.
      if (event.pointerType !== "touch" || !onLongPress) {
        return;
      }
      fired.current = false;
      origin.current = { x: event.clientX, y: event.clientY };
      timer.current = setTimeout(() => {
        fired.current = true;
        timer.current = null;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay],
  );

  const move = useCallback(
    (event) => {
      // Un doigt qui glisse fait defiler la liste : ce n'est plus un appui.
      if (!origin.current) {
        return;
      }
      const far =
        Math.abs(event.clientX - origin.current.x) > MOVE_TOLERANCE ||
        Math.abs(event.clientY - origin.current.y) > MOVE_TOLERANCE;
      if (far) {
        stop();
      }
    },
    [stop],
  );

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: stop,
    onPointerCancel: stop,
    onContextMenu: (event) => {
      // Sur iOS l'appui long leve aussi un menu contextuel, qui volerait le
      // geste et la selection de texte avec lui.
      if (fired.current) {
        event.preventDefault();
      }
    },
  };
}
