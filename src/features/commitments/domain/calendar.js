export const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export const MAX_VISIBLE_EVENTS = 3;

function isoDay(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function buildMonthCells(reference, occurrences, today = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = new Map();
  occurrences.forEach((occurrence) => {
    const [rowYear, rowMonth, rowDay] = occurrence.dueDate.split("-").map(Number);
    if (rowYear !== year || rowMonth - 1 !== month) {
      return;
    }
    const bucket = byDay.get(rowDay);
    if (bucket) {
      bucket.push(occurrence);
    } else {
      byDay.set(rowDay, [occurrence]);
    }
  });

  const todayIso = isoDay(today.getFullYear(), today.getMonth(), today.getDate());
  const cells = [];

  for (let index = 0; index < leading; index += 1) {
    cells.push({ key: `pad-${index}`, empty: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = isoDay(year, month, day);
    cells.push({
      key: iso,
      day,
      iso,
      isToday: iso === todayIso,
      events: byDay.get(day) ?? [],
    });
  }

  return cells;
}

export const STRIP_DAYS = 14;
export const MIN_BAR = 0.14;

export function buildStripDays(occurrences, today = new Date(), count = STRIP_DAYS) {
  const byDay = new Map();
  occurrences.forEach((occurrence) => {
    if (occurrence.status === "skipped") {
      return;
    }
    const bucket = byDay.get(occurrence.dueDate);
    if (bucket) {
      bucket.push(occurrence);
    } else {
      byDay.set(occurrence.dueDate, [occurrence]);
    }
  });

  const days = Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
    const events = byDay.get(isoDay(date.getFullYear(), date.getMonth(), date.getDate())) ?? [];
    const total = events.reduce((sum, event) => sum + Number(event.amount), 0);
    const due = events
      .filter((event) => event.status === "pending")
      .reduce((sum, event) => sum + Number(event.amount), 0);

    return {
      iso: isoDay(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      weekday: (date.getDay() + 6) % 7,
      isToday: index === 0,
      events,
      total,
      due,
      settled: events.length > 0 && due === 0,
    };
  });

  const peak = Math.max(...days.map((entry) => entry.total), 0);
  return days.map((entry) => ({
    ...entry,
    fill: peak && entry.total ? Math.max(entry.total / peak, MIN_BAR) : 0,
  }));
}

export function eventTone(occurrence) {
  if (occurrence.status === "paid") {
    return "paid";
  }
  if (occurrence.status === "skipped") {
    return "skipped";
  }
  return occurrence.type === "invoice" ? "invoice" : "subscription";
}
