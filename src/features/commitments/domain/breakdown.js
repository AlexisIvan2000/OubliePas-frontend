import { ANNUAL_FACTOR, isRecurring } from "./commitment";

export const HORIZON_DAYS = 120;
export const MAX_HEAVIEST = 6;

function counted(occurrences, key) {
  const groups = new Map();
  occurrences.forEach((row) => {
    if (row.status === "skipped") {
      return;
    }
    const id = key(row);
    const entry = groups.get(id) ?? { id, total: 0, count: 0 };
    entry.total += Number(row.amount);
    entry.count += 1;
    groups.set(id, entry);
  });
  return [...groups.values()];
}

export function monthlyTotals(occurrences) {
  return counted(occurrences, (row) => row.dueDate.slice(0, 7))
    .map((row) => ({ month: row.id, total: row.total, count: row.count }))
    .sort((left, right) => left.month.localeCompare(right.month));
}

export function heaviest(commitments, limit = MAX_HEAVIEST) {
  const recurring = commitments
    .filter((item) => item.status === "active" && isRecurring(item))
    .map((item) => ({ ...item, annual: Number(item.amount) * ANNUAL_FACTOR[item.frequency] }));

  const total = recurring.reduce((sum, item) => sum + item.annual, 0);

  return {
    total,
    rows: recurring
      .sort((left, right) => right.annual - left.annual || left.title.localeCompare(right.title))
      .slice(0, limit)
      .map((item) => ({ ...item, share: total ? item.annual / total : 0 })),
  };
}
