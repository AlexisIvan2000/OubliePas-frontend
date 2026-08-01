import { http } from "../../../core/network/httpClient";
import { USER_ENDPOINTS } from "./authEndpoints";

export function getProfile() {
  return http.get(USER_ENDPOINTS.me, { auth: true });
}

export function updateProfile(fields) {
  return http.patch(USER_ENDPOINTS.me, fields, { auth: true });
}

export function changePassword({ currentPassword, newPassword }) {
  return http.post(
    USER_ENDPOINTS.changePassword,
    { current_password: currentPassword, new_password: newPassword },
    { auth: true },
  );
}

export function setPassword({ newPassword }) {
  return http.post(USER_ENDPOINTS.setPassword, { new_password: newPassword }, { auth: true });
}

export function requestEmailChange({ newEmail, password }) {
  return http.post(
    USER_ENDPOINTS.changeEmail,
    { new_email: newEmail, password },
    { auth: true },
  );
}

export function confirmEmailChange({ code }) {
  return http.post(USER_ENDPOINTS.confirmEmailChange, { code }, { auth: true });
}

export function resendEmailChange() {
  return http.post(USER_ENDPOINTS.resendEmailChange, undefined, { auth: true });
}
