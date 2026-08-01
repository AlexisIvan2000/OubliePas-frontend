import { useCallback, useEffect, useState } from "react";

import { listCommitments } from "../../data/commitmentsApi";

export function useCommitments(type) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listCommitments({ type }));
      setError(null);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    let active = true;

    listCommitments({ type })
      .then((rows) => {
        if (active) {
          setItems(rows);
          setError(null);
        }
      })
      .catch((caught) => active && setError(caught))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [type]);

  return { items, loading, error, reload };
}
