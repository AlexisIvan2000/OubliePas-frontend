import { useEffect, useState } from "react";

import { todayIso } from "./formatting";

export function useToday() {
  const [today, setToday] = useState(todayIso);

  useEffect(() => {
    let timer;

    const schedule = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
      timer = setTimeout(() => {
        setToday(todayIso());
        schedule();
      }, next - now);
    };

    const sync = () => {
      if (!document.hidden) {
        setToday(todayIso());
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
