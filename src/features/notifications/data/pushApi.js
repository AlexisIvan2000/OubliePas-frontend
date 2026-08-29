import { http } from "../../../core/network/httpClient";
import { PUSH_ENDPOINTS } from "./pushEndpoints";

export function getPublicKey() {
  return http.get(PUSH_ENDPOINTS.key, { auth: true });
}

export function subscribeDevice(payload) {
  return http.post(PUSH_ENDPOINTS.subscriptions, payload, { auth: true });
}

export function unsubscribeDevice(endpoint) {
  return http.delete(PUSH_ENDPOINTS.subscriptions, { auth: true, body: { endpoint } });
}

export function sendTestNotification(endpoint) {
  return http.post(PUSH_ENDPOINTS.test, { endpoint }, { auth: true });
}
