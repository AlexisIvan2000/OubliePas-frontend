export const COMMITMENT_ENDPOINTS = {
  root: "/commitments",
  batch: "/commitments/batch",
  summary: "/commitments/summary",
  occurrences: "/commitments/occurrences",
  one: (id) => `/commitments/${id}`,
  occurrence: (id) => `/commitments/occurrences/${id}`,
};
