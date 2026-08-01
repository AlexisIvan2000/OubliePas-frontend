const SPECIAL_CHARACTERS = /[!@#$%^&*(),.?":{}|<>_+=[\]\\;'`~-]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES = [
  { id: "length", test: (value) => value.length >= 8 },
  { id: "uppercase", test: (value) => /[A-Z]/.test(value) },
  { id: "lowercase", test: (value) => /[a-z]/.test(value) },
  { id: "special", test: (value) => SPECIAL_CHARACTERS.test(value) },
];

export function checkPassword(t, value = "") {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: t(`password.${rule.id}`),
    valid: rule.test(value),
  }));
}

export function isPasswordValid(value = "") {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function isEmailValid(value = "") {
  return EMAIL_PATTERN.test(value.trim());
}

export function isCodeValid(value = "") {
  return /^\d{6}$/.test(value);
}
