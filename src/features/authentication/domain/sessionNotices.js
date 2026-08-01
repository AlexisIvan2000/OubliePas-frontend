const NOTICES = new Set([
  "PASSWORD_CHANGED",
  "INVALID_REFRESH_TOKEN",
  "INVALID_ACCESS_TOKEN",
  "TOKEN_REUSE_DETECTED",
]);

export function messageForNotice(t, notice) {
  if (!notice || !NOTICES.has(notice)) {
    return null;
  }
  return t(`session.${notice}`);
}
