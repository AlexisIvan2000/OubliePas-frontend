export function messageForError(t, error) {
  if (!error) {
    return t("errors.unexpected");
  }

  const key = `errors.${error.code}`;
  const translated = t(key);

  if (translated !== key) {
    return translated;
  }

  return error.message || t("errors.unexpected");
}
