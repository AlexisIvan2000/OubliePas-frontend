export const COMMITMENT_ENDPOINTS = {
  root: "/commitments",
  summary: "/commitments/summary",
  occurrences: "/commitments/occurrences",
  lateOccurrences: "/commitments/occurrences/late",
  restore: "/commitments/restore",
  trash: "/commitments/trash",
  one: (id) => `/commitments/${id}`,
  occurrence: (id) => `/commitments/occurrences/${id}`,
};
