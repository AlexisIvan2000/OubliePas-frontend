import { useCallback, useRef, useState } from "react";

import { toFieldErrorMap } from "../network/ApiError";

export function useAsyncAction(action) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlight = useRef(null);

  const run = useCallback(
    async (...args) => {
      // La garde porte sur une reference et non sur loading : celui-ci n'est
      // visible qu'au rendu suivant, un rendu trop tard pour arreter un second
      // envoi. Le second appelant recoit le resultat du premier.
      if (inFlight.current) {
        return inFlight.current;
      }

      setLoading(true);
      setError(null);

      const attempt = (async () => {
        try {
          return { ok: true, data: await action(...args), error: null };
        } catch (caught) {
          setError(caught);
          return { ok: false, data: null, error: caught };
        }
      })();

      inFlight.current = attempt;
      try {
        return await attempt;
      } finally {
        inFlight.current = null;
        setLoading(false);
      }
    },
    [action],
  );

  return {
    run,
    loading,
    error,
    fieldErrors: toFieldErrorMap(error),
    reset: () => setError(null),
  };
}
