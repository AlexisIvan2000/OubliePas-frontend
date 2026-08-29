const rawBaseUrl = import.meta.env.VITE_API_URL ?? "https://api.oubliepas.com";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const API_PREFIX = "/v1";

export function buildUrl(path) {
  return `${API_BASE_URL}${API_PREFIX}${path}`;
}
