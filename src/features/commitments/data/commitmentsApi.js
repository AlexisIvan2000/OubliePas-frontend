import { http } from "../../../core/network/httpClient";
import { toCommitment, toOccurrence, toSummary } from "../domain/commitment";
import { COMMITMENT_ENDPOINTS } from "./commitmentEndpoints";

function query(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export async function listCommitments({ type, status } = {}) {
  const rows = await http.get(`${COMMITMENT_ENDPOINTS.root}${query({ type, status })}`, {
    auth: true,
  });
  return rows.map(toCommitment);
}

export async function createCommitment(payload) {
  return toCommitment(await http.post(COMMITMENT_ENDPOINTS.root, payload, { auth: true }));
}

export async function updateCommitment(id, payload) {
  return toCommitment(await http.patch(COMMITMENT_ENDPOINTS.one(id), payload, { auth: true }));
}

export function deleteCommitment(id) {
  return http.delete(COMMITMENT_ENDPOINTS.one(id), { auth: true });
}

export function deleteAllCommitments({ type, status } = {}) {
  return http.delete(`${COMMITMENT_ENDPOINTS.root}${query({ type, status })}`, {
    auth: true,
  });
}

export async function listTrash({ type } = {}) {
  const rows = await http.get(`${COMMITMENT_ENDPOINTS.trash}${query({ type })}`, {
    auth: true,
  });
  return rows.map(toCommitment);
}

export function emptyTrash({ type } = {}) {
  return http.delete(`${COMMITMENT_ENDPOINTS.trash}${query({ type })}`, { auth: true });
}

export function restoreCommitments(ids) {
  return http.post(COMMITMENT_ENDPOINTS.restore, { ids }, { auth: true });
}

export async function listOccurrences({ start, end, status } = {}) {
  const rows = await http.get(
    `${COMMITMENT_ENDPOINTS.occurrences}${query({ start, end, status })}`,
    { auth: true },
  );
  return rows.map(toOccurrence);
}

export async function listLateOccurrences() {
  const rows = await http.get(COMMITMENT_ENDPOINTS.lateOccurrences, { auth: true });
  return rows.map(toOccurrence);
}

export async function updateOccurrence(id, payload) {
  return toOccurrence(
    await http.patch(COMMITMENT_ENDPOINTS.occurrence(id), payload, { auth: true }),
  );
}

export async function getSummary() {
  return toSummary(await http.get(COMMITMENT_ENDPOINTS.summary, { auth: true }));
}
