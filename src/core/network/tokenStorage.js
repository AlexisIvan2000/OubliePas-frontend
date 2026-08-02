const ACCESS_KEY = "oubliepas.access_token";
const SESSION_KEY = "oubliepas.session";

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

export function getTokens() {
  return { accessToken: getAccessToken(), hasSession: hasSession() };
}

export function hasSession() {
  return read(SESSION_KEY) === "1";
}

export function setTokens({ access_token }) {
  write(ACCESS_KEY, access_token ?? null);
  write(SESSION_KEY, access_token ? "1" : null);
  listeners.forEach((listener) => listener(getTokens()));
}

export function clearTokens() {
  write(ACCESS_KEY, null);
  write(SESSION_KEY, null);
  listeners.forEach((listener) => listener(getTokens()));
}

export function subscribeToTokens(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function watchCrossTabChanges(onChange) {
  const handler = (event) => {
    if (event.key === ACCESS_KEY || event.key === SESSION_KEY) {
      onChange(getTokens());
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
