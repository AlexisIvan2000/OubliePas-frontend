const BOUNDARIES = [5, 12, 18];

const SLOTS = {
  morning: "dashboard.greetingMorning",
  afternoon: "dashboard.greetingAfternoon",
  evening: "dashboard.greetingEvening",
};

export function greetingSlot(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 18 || hour < 5) {
    return "evening";
  }
  if (hour >= 12) {
    return "afternoon";
  }
  return "morning";
}

export function greetingKey(date = new Date()) {
  return SLOTS[greetingSlot(date)];
}

export function msUntilNextSlot(date = new Date()) {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);

  const upcoming = BOUNDARIES.find((hour) => hour > date.getHours());
  if (upcoming === undefined) {
    next.setDate(next.getDate() + 1);
    next.setHours(BOUNDARIES[0]);
  } else {
    next.setHours(upcoming);
  }

  return Math.max(1000, next.getTime() - date.getTime());
}
