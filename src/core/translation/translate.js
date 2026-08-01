const PLACEHOLDER = /\{(\w+)\}/g;

export function lookup(dictionary, key) {
  return key.split(".").reduce((node, part) => {
    if (node && typeof node === "object") {
      return node[part];
    }
    return undefined;
  }, dictionary);
}

export function interpolate(template, values) {
  if (!values) {
    return template;
  }
  return template.replace(PLACEHOLDER, (match, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}

export function pickPlural(entry, count, pluralRules) {
  if (typeof entry === "string") {
    return entry;
  }
  if (!entry || typeof entry !== "object") {
    return undefined;
  }

  const exact = entry[`=${count}`];
  if (typeof exact === "string") {
    return exact;
  }

  const category = pluralRules.select(count);
  return entry[category] ?? entry.other ?? entry.one;
}

export function createTranslator(dictionary, locale) {
  const pluralRules = new Intl.PluralRules(locale);

  return function translate(key, values) {
    const entry = lookup(dictionary, key);

    if (entry === undefined) {
      return key;
    }

    const template =
      values && Object.hasOwn(values, "count")
        ? pickPlural(entry, values.count, pluralRules)
        : entry;

    if (typeof template !== "string") {
      return key;
    }

    return interpolate(template, values);
  };
}
