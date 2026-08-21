const DAY_MS = 86400000;

let activeLocale = "fr-CA";

const dateFormatters = new Map();
const moneyFormatters = new Map();

export function setFormattingLocale(locale) {
  if (locale !== activeLocale) {
    activeLocale = locale;
    dateFormatters.clear();
    moneyFormatters.clear();
  }
}

function dateFormatter(key, options) {
  const cacheKey = `${activeLocale}:${key}`;
  if (!dateFormatters.has(cacheKey)) {
    dateFormatters.set(cacheKey, new Intl.DateTimeFormat(activeLocale, options));
  }
  return dateFormatters.get(cacheKey);
}

function moneyFormatter(currency) {
  const cacheKey = `${activeLocale}:${currency}`;
  if (!moneyFormatters.has(cacheKey)) {
    moneyFormatters.set(
      cacheKey,
      new Intl.NumberFormat(activeLocale, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      }),
    );
  }
  return moneyFormatters.get(cacheKey);
}

export function formatMoney(amount, currency = "CAD") {
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return String(amount);
  }
  try {
    return moneyFormatter(currency).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatPercent(share) {
  return new Intl.NumberFormat(activeLocale, {
    style: "percent",
    maximumFractionDigits: share > 0 && share < 0.01 ? 1 : 0,
  }).format(share);
}

export function parseDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(iso) {
  return dateFormatter("full", { day: "numeric", month: "long", year: "numeric" }).format(
    parseDate(iso),
  );
}

export function formatShortDate(iso) {
  return dateFormatter("short", { day: "numeric", month: "short" }).format(parseDate(iso));
}

export function formatMonth(month) {
  const [year, index] = month.split("-").map(Number);
  return dateFormatter("month", { month: "long", year: "numeric" }).format(
    new Date(year, index - 1, 1),
  );
}

export function formatWeekdays() {
  const formatter = dateFormatter("weekday", { weekday: "short" });
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2024, 0, index + 1)).replace(/\.$/, ""),
  );
}

export function formatLongDate(date) {
  return dateFormatter("longWeekday", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function daysUntil(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseDate(iso) - today) / DAY_MS);
}

export function relativeDueKey(iso) {
  const days = daysUntil(iso);
  if (days === 0) return { key: "relative.today", count: 0 };
  if (days === 1) return { key: "relative.tomorrow", count: 1 };
  if (days === -1) return { key: "relative.yesterday", count: 1 };
  if (days > 1) return { key: "relative.inDays", count: days };
  return { key: "relative.daysAgo", count: Math.abs(days) };
}
