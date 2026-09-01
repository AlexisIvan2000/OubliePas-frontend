import { useEffect, useState } from "react";

import { useAuth } from "../../features/authentication/presentation/providers/useAuth";
import { todayIn } from "./timezone";

// Le fuseau se lit ici plutot que de traverser sept appelants, comme il est
// lie une fois au service cote serveur. « Aujourd'hui » a une seule
// definition dans toute l'application, et c'est le jour de la personne qui
// regarde — pas celui de sa machine, qui peut etre en voyage.
export function useToday() {
  const { user } = useAuth();
  const timezone = user?.timezone ?? null;
  const [today, setToday] = useState(() => todayIn(timezone));

  useEffect(() => {
    let timer;

    const schedule = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
      timer = setTimeout(() => {
        setToday(todayIn(timezone));
        schedule();
      }, next - now);
    };

    const sync = () => {
      if (!document.hidden) {
        setToday(todayIn(timezone));
      }
    };

    schedule();
    document.addEventListener("visibilitychange", sync);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [timezone]);

  return today;
}
