import { useCallback, useEffect, useState } from "react";

export const RESEND_COOLDOWN_SECONDS = 15;

export function useCooldown(seconds = RESEND_COOLDOWN_SECONDS) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => setLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  // Le compte a rebours part sur un envoi reussi, jamais sur un echec : un
  // envoi qui n'a pas abouti doit pouvoir etre retente tout de suite.
  const start = useCallback(() => setLeft(seconds), [seconds]);

  return { left, waiting: left > 0, start };
}
