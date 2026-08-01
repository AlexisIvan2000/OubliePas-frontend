import { http } from "../../../core/network/httpClient";
import { AUTH_ENDPOINTS } from "./authEndpoints";

export function register({ firstName, email, password, currency }) {
  return http.post(AUTH_ENDPOINTS.register, {
    first_name: firstName,
    email,
    password,
    currency,
  });
}

export function login({ email, password }) {
  return http.post(AUTH_ENDPOINTS.login, { email, password });
}

export function verifyEmail({ email, code }) {
  return http.post(AUTH_ENDPOINTS.verifyEmail, { email, code });
}

export function resendVerification({ email }) {
  return http.post(AUTH_ENDPOINTS.resendVerification, { email });
}

export function forgotPassword({ email }) {
  return http.post(AUTH_ENDPOINTS.forgotPassword, { email });
}

export function resetPassword({ email, code, newPassword }) {
  return http.post(AUTH_ENDPOINTS.resetPassword, {
    email,
    code,
    new_password: newPassword,
  });
}

export function startGoogleSignIn({ state, codeChallenge }) {
  return http.post(AUTH_ENDPOINTS.googleStart, { state, code_challenge: codeChallenge });
}

export function completeGoogleSignIn({ code, codeVerifier }) {
  return http.post(AUTH_ENDPOINTS.google, { code, code_verifier: codeVerifier });
}

export function refreshSession({ refreshToken }) {
  return http.post(AUTH_ENDPOINTS.refresh, { refresh_token: refreshToken });
}

export function logout({ refreshToken }) {
  return http.post(AUTH_ENDPOINTS.logout, { refresh_token: refreshToken });
}

export function fetchCurrentUser() {
  return http.get(AUTH_ENDPOINTS.me, { auth: true });
}
