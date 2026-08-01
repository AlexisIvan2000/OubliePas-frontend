const STATE_KEY = "oubliepas.google.state";
const VERIFIER_KEY = "oubliepas.google.verifier";
const VERIFIER_BYTES = 48;
const STATE_BYTES = 24;

function base64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(byteLength) {
  return base64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export async function challengeFor(verifier) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

export async function createHandshake() {
  const state = randomString(STATE_BYTES);
  const verifier = randomString(VERIFIER_BYTES);

  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  return { state, verifier, codeChallenge: await challengeFor(verifier) };
}

export function consumeHandshake(returnedState) {
  const state = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);

  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);

  if (!state || !verifier || !returnedState || returnedState !== state) {
    return null;
  }

  return verifier;
}

export function readCallbackParams(search) {
  const params = new URLSearchParams(search);
  return {
    code: params.get("code"),
    state: params.get("state"),
    error: params.get("error"),
  };
}
