import { useEffect } from "react";

let holders = 0;
let restore = null;

function lock() {
  const gap = window.innerWidth - document.documentElement.clientWidth;
  restore = {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  };
  document.body.style.overflow = "hidden";
  if (gap > 0) {
    document.body.style.paddingRight = `${gap}px`;
  }
}

function unlock() {
  if (!restore) {
    return;
  }
  document.body.style.overflow = restore.overflow;
  document.body.style.paddingRight = restore.paddingRight;
  restore = null;
}

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    if (holders === 0) {
      lock();
    }
    holders += 1;

    return () => {
      holders -= 1;
      if (holders === 0) {
        unlock();
      }
    };
  }, [active]);
}
