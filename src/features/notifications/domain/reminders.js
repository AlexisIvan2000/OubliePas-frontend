export const LEAD_TIMES = [0, 1, 3, 7];
export const DEFAULT_LEAD_TIME = 3;

export const CHANNELS = [
  { id: "email", available: true },
  { id: "push", available: false },
];

export const DIGESTS = [{ id: "weekly", available: false }];

export const FAMILIES = [
  { id: "notice", field: "reminder_notice_enabled" },
  { id: "overdue", field: "reminder_overdue_enabled" },
  { id: "action", field: "reminder_action_enabled" },
];

export const DEFAULT_PREFERENCES = {
  email: true,
  push: false,
  weekly: false,
  notice: true,
  overdue: true,
  action: true,
  leadTime: DEFAULT_LEAD_TIME,
};

function shiftIso(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const moved = new Date(Date.UTC(year, month - 1, day - days));
  return moved.toISOString().slice(0, 10);
}

export function scheduledReminders(occurrences, commitments) {
  const settings = new Map(commitments.map((item) => [item.id, item]));

  return occurrences
    .filter((occurrence) => occurrence.status === "pending")
    .map((occurrence) => {
      const commitment = settings.get(occurrence.commitmentId);
      if (!commitment?.isReminderEnabled) {
        return null;
      }
      return {
        id: occurrence.id,
        title: occurrence.title,
        amount: occurrence.amount,
        dueDate: occurrence.dueDate,
        sendDate: shiftIso(occurrence.dueDate, commitment.reminderDaysBefore),
        daysBefore: commitment.reminderDaysBefore,
        status: "scheduled",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sendDate.localeCompare(b.sendDate));
}
