import { useCallback, useEffect, useState } from "react";

import { listOccurrences } from "../../data/commitmentsApi";

export function monthRange(reference) {
  const iso = (value) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
      value.getDate(),
    ).padStart(2, "0")}`;

  return {
    start: iso(new Date(reference.getFullYear(), reference.getMonth(), 1)),
    end: iso(new Date(reference.getFullYear(), reference.getMonth() + 1, 0)),
  };
}

export function upcomingRange(reference, days) {
  const iso = (value) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
      value.getDate(),
    ).padStart(2, "0")}`;

  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + days - 1);
  return { start: iso(start), end: iso(end) };
}

export function useOccurrences({ start, end }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedRange, setLoadedRange] = useState(null);

  const currentRange = `${start}|${end}`;

  if (loadedRange !== null && loadedRange !== currentRange) {
    setLoadedRange(currentRange);
    setLoading(true);
    setItems([]);
    setError(null);
  }

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listOccurrences({ start, end }));
      setError(null);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    let active = true;

    listOccurrences({ start, end })
      .then((rows) => {
        if (!active) return;
        setItems(rows);
        setError(null);
      })
      .catch((caught) => {
        if (active) setError(caught);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setLoadedRange(`${start}|${end}`);
      });

    return () => {
      active = false;
    };
  }, [start, end]);

  return { items, loading, error, reload, setItems };
}
