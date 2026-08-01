import { buildUrl } from "./apiConfig";
import { ApiError } from "./ApiError";
import { clearTokens, getAccessToken } from "./tokenStorage";

const RETRYABLE_AUTH_CODES = new Set(["INVALID_ACCESS_TOKEN"]);

const sessionExpiredListeners = new Set();

let refreshHandler = null;
let refreshInFlight = null;

export function setRefreshHandler(handler) {
  refreshHandler = handler;
}

export function onSessionExpired(listener) {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

async function parseError(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const detail = payload?.detail;

  if (detail && typeof detail === "object") {
    return new ApiError({
      status: response.status,
      code: detail.code ?? "APP_ERROR",
      message: detail.message ?? response.statusText,
      fieldErrors: Array.isArray(detail.errors) ? detail.errors : [],
    });
  }

  return new ApiError({
    status: response.status,
    code: "APP_ERROR",
    message: typeof detail === "string" ? detail : response.statusText,
  });
}

async function parseBody(response) {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function rawRequest(path, { method = "GET", body, token, signal } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    if (cause?.name === "AbortError") {
      throw cause;
    }
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Impossible de joindre le serveur",
    });
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  return parseBody(response);
}

function runRefresh() {
  if (!refreshHandler) {
    return Promise.reject(
      new ApiError({
        status: 401,
        code: "INVALID_REFRESH_TOKEN",
        message: "Aucune session active",
      }),
    );
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshHandler().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function request(path, options = {}) {
  const { auth = false, ...rest } = options;

  if (!auth) {
    return rawRequest(path, rest);
  }

  try {
    return await rawRequest(path, { ...rest, token: getAccessToken() });
  } catch (error) {
    if (!(error instanceof ApiError) || !RETRYABLE_AUTH_CODES.has(error.code)) {
      throw error;
    }

    let freshToken;
    try {
      freshToken = await runRefresh();
    } catch (refreshError) {
      clearTokens();
      const code = refreshError instanceof ApiError ? refreshError.code : "INVALID_REFRESH_TOKEN";
      sessionExpiredListeners.forEach((listener) => listener(code));
      throw refreshError;
    }

    return rawRequest(path, { ...rest, token: freshToken });
  }
}

export const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
