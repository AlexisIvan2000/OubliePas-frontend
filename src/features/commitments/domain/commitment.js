export const COMMITMENT_TYPES = {
  subscription: {
    icon: "subscriptions",
    titleKey: "commitments.subscriptionsTitle",
    labelKey: "commitments.subscriptionLabel",
    subtitleKey: "commitments.subscriptionsSubtitle",
    searchKey: "commitments.searchSubscriptions",
    emptyTitleKey: "commitments.emptySubscriptionsTitle",
    emptyBodyKey: "commitments.emptySubscriptionsBody",
    addKey: "commitments.addSubscription",
    formTitleKey: "form.newSubscription",
    formHintKey: "form.subscriptionHint",
    namePlaceholderKey: "form.namePlaceholderSubscription",
  },
  invoice: {
    icon: "invoices",
    titleKey: "commitments.invoicesTitle",
    labelKey: "commitments.invoiceLabel",
    subtitleKey: "commitments.invoicesSubtitle",
    searchKey: "commitments.searchInvoices",
    emptyTitleKey: "commitments.emptyInvoicesTitle",
    emptyBodyKey: "commitments.emptyInvoicesBody",
    addKey: "commitments.addInvoice",
    formTitleKey: "form.newInvoice",
    formHintKey: "form.invoiceHint",
    namePlaceholderKey: "form.namePlaceholderInvoice",
  },
};

export const FREQUENCY_CODES = ["monthly", "weekly", "quarterly", "yearly", "oneoff"];

export function frequencyOptions(t) {
  return FREQUENCY_CODES.map((value) => ({ value, label: t(`frequency.${value}`) }));
}

export const FREQUENCY_SHORT_KEYS = {
  monthly: "frequency.shortMonthly",
  weekly: "frequency.shortWeekly",
  quarterly: "frequency.shortQuarterly",
  yearly: "frequency.shortYearly",
  oneoff: "frequency.shortOneoff",
};

export const CATEGORIES = {
  subscription: ["entertainment", "music", "software", "storage", "fitness", "news", "other"],
  invoice: ["housing", "energy", "internet", "insurance", "transport", "taxes", "other"],
};

export function categoryOptions(t, type) {
  return CATEGORIES[type].map((value) => ({ value, label: t(`category.${value}`) }));
}



export const OCCURRENCE_TONES = {
  pending: "pending",
  paid: "paid",
  skipped: "muted",
};

export function occurrenceStatus(t, status) {
  return { label: t(`occurrence.${status}`), tone: OCCURRENCE_TONES[status] };
}

export function categoryLabel(t, value) {
  const label = t(`category.${value}`);
  return label === `category.${value}` ? value : label;
}

export function normalizeSearch(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(t, commitment, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) {
    return true;
  }

  const haystack = normalizeSearch(
    `${commitment.title} ${categoryLabel(t, commitment.category)} ${commitment.notes ?? ""}`,
  );
  return terms.every((term) => haystack.includes(term));
}

export function frequencyLabel(t, value) {
  return t(`frequency.${value}`);
}

export function toCommitment(raw) {
  return {
    id: raw.id,
    title: raw.title,
    type: raw.type,
    category: raw.category,
    amount: raw.amount,
    frequency: raw.frequency,
    startsOn: raw.starts_on,
    endsOn: raw.ends_on,
    reminderDaysBefore: raw.reminder_days_before,
    isReminderEnabled: raw.is_reminder_enabled,
    status: raw.status,
    notes: raw.notes,
    nextDueDate: raw.next_due_date,
    createdAt: raw.created_at,
  };
}

export function toOccurrence(raw) {
  return {
    id: raw.id,
    commitmentId: raw.commitment_id,
    title: raw.title,
    type: raw.type,
    category: raw.category,
    dueDate: raw.due_date,
    amount: raw.amount,
    status: raw.status,
    paidAt: raw.paid_at,
    isLate: raw.is_late,
  };
}

export function toSummary(raw) {
  return {
    currency: raw.currency,
    month: raw.month,
    monthTotal: raw.month_total,
    subscriptionsTotal: raw.subscriptions_total,
    invoicesTotal: raw.invoices_total,
    paidTotal: raw.paid_total,
    pendingTotal: raw.pending_total,
    lateCount: raw.late_count,
    activeCount: raw.active_count,
    upcomingDays: raw.upcoming_days,
    upcomingTotal: raw.upcoming_total,
    upcoming: (raw.upcoming ?? []).map(toOccurrence),
  };
}

export function toCommitmentPayload(form) {
  const payload = {
    title: form.title.trim(),
    type: form.type,
    category: form.category,
    amount: form.amount,
    frequency: form.frequency,
    starts_on: form.startsOn,
    reminder_days_before: Number(form.reminderDaysBefore),
    is_reminder_enabled: form.isReminderEnabled,
  };

  payload.ends_on = form.endsOn ? form.endsOn : null;
  payload.notes = form.notes?.trim() ? form.notes.trim() : null;

  return payload;
}

export function emptyForm(type) {
  return {
    title: "",
    type,
    category: CATEGORIES[type][0],
    amount: "",
    frequency: "monthly",
    startsOn: new Date().toISOString().slice(0, 10),
    endsOn: "",
    reminderDaysBefore: 3,
    isReminderEnabled: true,
    notes: "",
  };
}

export function formFromCommitment(commitment) {
  return {
    title: commitment.title,
    type: commitment.type,
    category: commitment.category,
    amount: commitment.amount,
    frequency: commitment.frequency,
    startsOn: commitment.startsOn,
    endsOn: commitment.endsOn ?? "",
    reminderDaysBefore: commitment.reminderDaysBefore,
    isReminderEnabled: commitment.isReminderEnabled,
    notes: commitment.notes ?? "",
  };
}
