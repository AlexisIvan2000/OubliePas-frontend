export const LEGAL = {
  entity: "Oubliepas",
  contactEmail: "support@oubliepas.com",
  jurisdiction: "Québec (Canada)",
  jurisdictionEn: "Quebec, Canada",
  updated: "2026-08-21",
};

export function fill(text) {
  return text
    .replaceAll("{entity}", LEGAL.entity)
    .replaceAll("{email}", LEGAL.contactEmail)
    .replaceAll("{jurisdiction}", LEGAL.jurisdiction)
    .replaceAll("{jurisdictionEn}", LEGAL.jurisdictionEn);
}
