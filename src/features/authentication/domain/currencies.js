export const DEFAULT_CURRENCY = "CAD";

export const CURRENCIES = [
  { code: "CAD", symbol: "$" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CHF", symbol: "Fr." },
  { code: "XOF", symbol: "F CFA" },
  { code: "XAF", symbol: "F CFA" },
  { code: "MAD", symbol: "DH" },
  { code: "JPY", symbol: "¥" },
  { code: "AUD", symbol: "$" },
];

export const COMMON_CURRENCY_CODES = ["CAD", "USD", "EUR", "GBP"];

export function currencyLabel({ code, symbol }) {
  return `${symbol} ${code}`;
}

export function findCurrency(code) {
  return CURRENCIES.find((currency) => currency.code === code) ?? { code, symbol: code };
}

export function labelForCode(code) {
  return code ? currencyLabel(findCurrency(code)) : "";
}

export function commonCurrencies() {
  return COMMON_CURRENCY_CODES.map(findCurrency);
}

export function otherCurrencies(current) {
  const rest = CURRENCIES.filter((currency) => !COMMON_CURRENCY_CODES.includes(currency.code));
  const known = CURRENCIES.some((currency) => currency.code === current);
  const list = !current || known ? rest : [{ code: current, symbol: current }, ...rest];
  return list.map((currency) => ({ value: currency.code, label: currencyLabel(currency) }));
}

export function currencyOptions(current) {
  const known = CURRENCIES.some((currency) => currency.code === current);
  const list = !current || known ? CURRENCIES : [{ code: current, symbol: current }, ...CURRENCIES];
  return list.map((currency) => ({ value: currency.code, label: currencyLabel(currency) }));
}
