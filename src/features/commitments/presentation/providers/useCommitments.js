import { useCallback } from "react";

import { useResource } from "../../../../core/network/useResource";
import { listCommitments, listTrash } from "../../data/commitmentsApi";

export function useCommitments(type) {
  const fetch = useCallback(() => listCommitments({ type }), [type]);
  const { data, loading, error, revalidate } = useResource(`commitments:${type}`, fetch);

  return { items: data ?? [], loading, error, reload: revalidate };
}

export function useTrash(type) {
  const fetch = useCallback(() => listTrash({ type }), [type]);
  const { data, loading, error, revalidate } = useResource(`trash:${type}`, fetch);

  return { items: data ?? [], loading, error, reload: revalidate };
}
