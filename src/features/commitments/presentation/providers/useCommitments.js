import { useCallback } from "react";

import { useResource } from "../../../../core/network/useResource";
import { listCommitments } from "../../data/commitmentsApi";

export function useCommitments(type) {
  const fetch = useCallback(() => listCommitments({ type }), [type]);
  const { data, loading, error, revalidate } = useResource(`commitments:${type}`, fetch);

  return { items: data ?? [], loading, error, reload: revalidate };
}
