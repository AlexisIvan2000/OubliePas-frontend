import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 170;

function instant() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

export function useDismiss(duration = DURATION) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const dismiss = useCallback(
    (done) => {
      if (timer.current) {
        return;
      }
      if (instant()) {
        done?.();
        return;
      }
      setLeaving(true);
      timer.current = setTimeout(() => {
        timer.current = null;
        setLeaving(false);
        done?.();
      }, duration);
    },
    [duration],
  );

  return { leaving, dismiss };
}
