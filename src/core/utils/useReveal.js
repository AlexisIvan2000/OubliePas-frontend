import { useEffect, useRef, useState } from "react";

const MARGIN = "0px 0px -12% 0px";

export function useReveal({ once = true, threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { rootMargin: MARGIN, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return [ref, shown];
}
