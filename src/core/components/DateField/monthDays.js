export const WEEK = 7;
export const ROWS = 6;

export function toIso(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromIso(iso) {
  if (typeof iso !== "string") {
    return null;
  }
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 ? date : null;
}

export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(date, step) {
  const anchor = new Date(date.getFullYear(), date.getMonth() + step, 1);
  return anchor;
}

export function outOfRange(iso, min, max) {
  if (min && iso < min) {
    return true;
  }
  return Boolean(max && iso > max);
}

export function monthDays(reference) {
  const first = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const lead = (first.getDay() + 6) % WEEK;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - lead);

  return Array.from({ length: ROWS * WEEK }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return {
      iso: toIso(date),
      day: date.getDate(),
      outside: date.getMonth() !== reference.getMonth(),
    };
  });
}
