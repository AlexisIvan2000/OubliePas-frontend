const ACCESS_KEY = "oubliepas.access_token";
const REFRESH_KEY = "oubliepas.refresh_token";

const listeners = new Set();

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    /* storage unavailable */
  }
}

export function getAccessToken() {
  return read(ACCESS_KEY);
}

export function getRefreshToken() {
  return read(REFRESH_KEY);
}

export function getTokens() {
  return { accessToken: getAccessToken(), refreshToken: getRefreshToken() };
}

export function hasSession() {
  return Boolean(getRefreshToken());
}

export function setTokens({ access_token, refresh_token }) {
  write(ACCESS_KEY, access_token ?? null);
  write(REFRESH_KEY, refresh_token ?? null);
  listeners.forEach((listener) => listener(getTokens()));
}

export function clearTokens() {
  write(ACCESS_KEY, null);
  write(REFRESH_KEY, null);
  listeners.forEach((listener) => listener(getTokens()));
}

export function subscribeToTokens(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function watchCrossTabChanges(onChange) {
  const handler = (event) => {
    if (event.key === ACCESS_KEY || event.key === REFRESH_KEY) {
      onChange(getTokens());
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
