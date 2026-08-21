import { useCallback, useEffect, useState } from "react";

import { readResource, resourceGeneration, writeResource } from "./resourceCache";

function snapshot(key) {
  const cached = readResource(key);
  return { data: cached, loading: cached === undefined, error: null };
}

export function useResource(key, fetcher) {
  const [state, setState] = useState(() => snapshot(key));
  const [current, setCurrent] = useState(key);

  if (current !== key) {
    setCurrent(key);
    setState(snapshot(key));
  }

  const load = useCallback(
    (isActive = () => true) => {
      const from = resourceGeneration();
      return fetcher()
        .then((data) => {
          const fresh = writeResource(key, data, from);
          if (fresh && isActive()) {
            setState({ data, loading: false, error: null });
          }
          return data;
        })
        .catch((error) => {
          if (from === resourceGeneration() && isActive()) {
            setState((previous) => ({ ...previous, loading: false, error }));
          }
          return undefined;
        });
    },
    [key, fetcher],
  );

  useEffect(() => {
    let active = true;
    load(() => active);
    return () => {
      active = false;
    };
  }, [load]);

  const setData = useCallback(
    (updater) => {
      setState((previous) => {
        const data = typeof updater === "function" ? updater(previous.data) : updater;
        writeResource(key, data);
        return { ...previous, data };
      });
    },
    [key],
  );

  return { ...state, revalidate: load, setData };
}
