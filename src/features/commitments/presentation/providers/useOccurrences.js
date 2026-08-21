import { useCallback } from "react";

import { useResource } from "../../../../core/network/useResource";
import { listOccurrences } from "../../data/commitmentsApi";

function iso(value) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}

export function monthRange(reference) {
  return {
    start: iso(new Date(reference.getFullYear(), reference.getMonth(), 1)),
    end: iso(new Date(reference.getFullYear(), reference.getMonth() + 1, 0)),
  };
}

export function upcomingRange(reference, days) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + days - 1);
  return { start: iso(start), end: iso(end) };
}

export function useOccurrences({ start, end }) {
  const fetch = useCallback(() => listOccurrences({ start, end }), [start, end]);
  const { data, loading, error, revalidate, setData } = useResource(
    `occurrences:${start}|${end}`,
    fetch,
  );

  const setItems = useCallback(
    (updater) =>
      setData((previous) =>
        typeof updater === "function" ? updater(previous ?? []) : updater,
      ),
    [setData],
  );

  return { items: data ?? [], loading, error, reload: revalidate, setItems };
}
