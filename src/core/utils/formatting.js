const DAY_MS = 86400000;

let activeLocale = "fr-CA";

const dateFormatters = new Map();
const moneyFormatters = new Map();
const percentFormatters = new Map();

export function setFormattingLocale(locale) {
  if (locale !== activeLocale) {
    activeLocale = locale;
    dateFormatters.clear();
    moneyFormatters.clear();
    percentFormatters.clear();
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

function percentFormatter() {
  if (!percentFormatters.has(activeLocale)) {
    percentFormatters.set(
      activeLocale,
      new Intl.NumberFormat(activeLocale, { style: "percent", maximumFractionDigits: 0 }),
    );
  }
  return percentFormatters.get(activeLocale);
}

export function formatPercent(share) {
  const formatter = percentFormatter();
  const rounded = Math.round(share * 100);

  if (share > 0 && rounded === 0) {
    return `< ${formatter.format(0.01)}`;
  }
  if (share < 1 && rounded === 100) {
    return `> ${formatter.format(0.99)}`;
  }
  return formatter.format(share);
}

export function todayIso() {
  // Date locale, jamais toISOString() : celui-ci rend la date UTC, en avance
  // d'un jour sur l'utilisateur pendant les dernieres heures de sa soiree.
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDaysIso(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const moved = new Date(Date.UTC(year, month - 1, day + days));
  return moved.toISOString().slice(0, 10);
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

export function formatMonthShort(month) {
  const [year, index] = month.split("-").map(Number);
  return dateFormatter("monthShort", { month: "short" }).format(new Date(year, index - 1, 1));
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
