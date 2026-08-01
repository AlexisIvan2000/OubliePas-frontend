import { useCallback, useState } from "react";

import { toFieldErrorMap } from "../network/ApiError";

export function useAsyncAction(action) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const data = await action(...args);
        return { ok: true, data, error: null };
      } catch (caught) {
        setError(caught);
        return { ok: false, data: null, error: caught };
      } finally {
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
