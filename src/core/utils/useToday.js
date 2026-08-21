import { useEffect, useState } from "react";

function isoToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function useToday() {
  const [today, setToday] = useState(isoToday);

  useEffect(() => {
    let timer;

    const schedule = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
      timer = setTimeout(() => {
        setToday(isoToday());
        schedule();
      }, next - now);
    };

    const sync = () => {
      if (!document.hidden) {
        setToday(isoToday());
      }
    };

    schedule();
    document.addEventListener("visibilitychange", sync);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return today;
}
