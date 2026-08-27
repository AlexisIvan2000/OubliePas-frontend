function keysFor(code, kind) {
  // Un meme code peut se dire autrement selon ce qu'il vise : le serveur donne
  // le type dans le detail, la cle suffixee gagne quand elle existe.
  const base = `errors.${code}`;
  return kind ? [`${base}_${String(kind).toUpperCase()}`, base] : [base];
}

export function messageForError(t, error) {
  if (!error) {
    return t("errors.unexpected");
  }

  const details = error.details ?? {};

  for (const key of keysFor(error.code, details.type)) {
    const translated = t(key, details);
    if (translated !== key) {
      return translated;
    }
  }

  return error.message || t("errors.unexpected");
}
