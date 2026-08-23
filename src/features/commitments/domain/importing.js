import { catalogLabel } from "./catalog";
import { CATEGORIES, MONTHLY_FACTOR } from "./commitment";
import { parseDate } from "./formatting";

export const ANCHORED = ["monthly", "quarterly"];
export const MAX_IMPORT_LINES = 25;
export const MAX_DAY = 31;

function daysIn(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function iso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function usesDay(frequency) {
  return ANCHORED.includes(frequency);
}

export function nextDayOfMonth(day, todayIso) {
  const number = Number(day);
  if (!Number.isInteger(number) || number < 1 || number > MAX_DAY) {
    return null;
  }

  const today = parseDate(todayIso);
  for (let step = 0; step < 14; step += 1) {
    const month = today.getMonth() + step;
    if (number > daysIn(today.getFullYear(), month)) {
      continue;
    }
    if (step === 0 && number < today.getDate()) {
      continue;
    }
    return iso(new Date(today.getFullYear(), month, number));
  }
  return null;
}

export function emptyLine(entry, type) {
  return {
    key: `${type}:${entry.id}`,
    entryId: entry.id,
    type,
    category: entry.category ?? CATEGORIES[type][0],
    frequency: entry.frequency ?? "monthly",
    amount: "",
    day: "",
    date: "",
  };
}

export function lineStartsOn(line, todayIso) {
  return usesDay(line.frequency) ? nextDayOfMonth(line.day, todayIso) : line.date || null;
}

export function lineErrors(line, todayIso) {
  const errors = {};
  const amount = Number(line.amount);
  if (!line.amount || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "import.amountMissing";
  }
  if (!lineStartsOn(line, todayIso)) {
    errors.when = usesDay(line.frequency) ? "import.dayMissing" : "import.dateMissing";
  }
  return errors;
}

export function toBatch(t, lines, todayIso, entryOf) {
  return lines.map((line) => ({
    title: catalogLabel(t, entryOf(line)),
    type: line.type,
    category: line.category,
    amount: line.amount,
    frequency: line.frequency,
    starts_on: lineStartsOn(line, todayIso),
  }));
}

export function rowErrors(fieldErrors) {
  const map = new Map();
  fieldErrors.forEach(({ field, message }) => {
    const [scope, index, name] = String(field).split(".");
    if (scope !== "items" || index === undefined) {
      return;
    }
    const row = Number(index);
    const entry = map.get(row) ?? {};
    entry[name === "starts_on" ? "when" : name] = message;
    map.set(row, entry);
  });
  return map;
}

export function isRecurringFrequency(frequency) {
  return Object.hasOwn(MONTHLY_FACTOR, frequency);
}
