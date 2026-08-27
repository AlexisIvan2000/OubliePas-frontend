import { parseDate, todayIso } from "./formatting";

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
    wipeTitleKey: "commitments.wipeSubscriptionsTitle",
    wipeDoneKey: "commitments.wipeSubscriptionsDone",
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
    wipeTitleKey: "commitments.wipeInvoicesTitle",
    wipeDoneKey: "commitments.wipeInvoicesDone",
    formHintKey: "form.invoiceHint",
    namePlaceholderKey: "form.namePlaceholderInvoice",
  },
};

export const CALENDAR_FILTERS = [
  { id: "all", labelKey: "calendar.filterAll" },
  { id: "subscription", labelKey: "commitments.subscriptionsTitle" },
  { id: "invoice", labelKey: "commitments.invoicesTitle" },
];

export function filterByType(occurrences, kind) {
  return kind === "all" ? occurrences : occurrences.filter((row) => row.type === kind);
}

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

const CATEGORY_TINTS = {
  entertainment: "1",
  music: "2",
  software: "3",
  storage: "4",
  fitness: "5",
  news: "1",
  housing: "1",
  energy: "2",
  internet: "3",
  insurance: "4",
  transport: "5",
  taxes: "1",
  other: "rest",
};

const TINT_SLOTS = ["1", "2", "3", "4", "5"];

export function categoryTint(category) {
  return `var(--chart-${CATEGORY_TINTS[category] ?? "rest"})`;
}

const TINT_ORDER = Object.keys(CATEGORY_TINTS);

export function assignTints(categories) {
  const taken = new Set();
  const chosen = new Map();

  // L'attribution suit l'ordre fixe du catalogue, jamais l'ordre des montants :
  // sinon deux categories qui visent la meme teinte echangeraient leurs couleurs
  // d'un mois a l'autre selon laquelle a le plus gros total.
  const ordered = [...new Set(categories)].sort(
    (left, right) => TINT_ORDER.indexOf(left) - TINT_ORDER.indexOf(right),
  );

  ordered.forEach((category) => {
    const preferred = CATEGORY_TINTS[category];
    const slot =
      preferred && preferred !== "rest" && !taken.has(preferred)
        ? preferred
        : TINT_SLOTS.find((candidate) => !taken.has(candidate));

    if (slot) {
      taken.add(slot);
      chosen.set(category, `var(--chart-${slot})`);
    } else {
      chosen.set(category, "var(--chart-rest)");
    }
  });

  return chosen;
}

export function monogram(title) {
  const first = [...(title ?? "").trim()].find((glyph) => /\p{L}|\p{N}/u.test(glyph));
  return (first ?? "?").toLocaleUpperCase();
}

export function categoryOptions(t, type) {
  return CATEGORIES[type].map((value) => ({ value, label: t(`category.${value}`) }));
}

export const MONTHLY_FACTOR = { weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };
export const ANNUAL_FACTOR = { weekly: 52, monthly: 12, quarterly: 4, yearly: 1 };

export function isRecurring(commitment) {
  return Object.hasOwn(MONTHLY_FACTOR, commitment.frequency);
}

export function runRate(commitments) {
  const recurring = commitments.filter(isRecurring);
  if (!recurring.length) {
    return { monthly: null, annual: null, lines: 0, oneoff: commitments.length };
  }

  return {
    monthly: recurring.reduce(
      (total, item) => total + Number(item.amount) * MONTHLY_FACTOR[item.frequency],
      0,
    ),
    annual: recurring.reduce(
      (total, item) => total + Number(item.amount) * ANNUAL_FACTOR[item.frequency],
      0,
    ),
    lines: recurring.length,
    oneoff: commitments.length - recurring.length,
  };
}

export const SORTS = ["due", "amount", "title"];

const COMPARATORS = {
  due: (left, right) => {
    if (left.nextDueDate === right.nextDueDate) return 0;
    if (!left.nextDueDate) return 1;
    if (!right.nextDueDate) return -1;
    return left.nextDueDate < right.nextDueDate ? -1 : 1;
  },
  amount: (left, right) => Number(right.amount) - Number(left.amount),
  title: (left, right) => left.title.localeCompare(right.title),
};

export function sortCommitments(commitments, sort) {
  return [...commitments].sort(
    (left, right) => COMPARATORS[sort](left, right) || COMPARATORS.title(left, right),
  );
}

export function categoryCounts(commitments) {
  const counts = new Map();
  commitments.forEach((item) => {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category));
}

export function nextUp(commitments) {
  return sortCommitments(
    commitments.filter((item) => item.nextDueDate),
    "due",
  )[0] ?? null;
}

export const COUNTED_STATUSES = ["active", "paused"];
export const QUOTA_ALERT_LEFT = 3;

export function trackedCount(commitments) {
  return commitments.filter((item) => COUNTED_STATUSES.includes(item.status)).length;
}

export function quotaState(commitments, limit) {
  // Sans plafond connu il n'y a rien a afficher : le serveur est seul a le
  // donner, et un chiffre devine vaudrait moins que le silence.
  if (!limit) {
    return null;
  }

  const used = trackedCount(commitments);
  const left = limit - used;

  // La restauration depuis la corbeille peut passer au-dessus du plafond :
  // le compteur le dit au lieu de faire semblant.
  return { used, limit, left, tone: left <= 0 ? "full" : left <= QUOTA_ALERT_LEFT ? "alert" : "calm" };
}

export const REST_SLICE = "rest";
export const MAX_SLICES = TINT_SLOTS.length;

export function topCategories(rows, max = MAX_SLICES) {
  const sorted = [...rows].sort((left, right) => Number(right.total) - Number(left.total));
  const head = sorted.slice(0, max);
  const tail = sorted.slice(max);

  const tints = assignTints(head.map((row) => row.category));

  const slices = head.map((row) => ({
    key: row.category,
    category: row.category,
    total: Number(row.total),
    count: row.count,
    color: tints.get(row.category),
  }));

  if (tail.length) {
    slices.push({
      key: REST_SLICE,
      category: REST_SLICE,
      total: tail.reduce((sum, row) => sum + Number(row.total), 0),
      count: tail.reduce((sum, row) => sum + row.count, 0),
      color: "var(--chart-rest)",
    });
  }

  const total = slices.reduce((sum, slice) => sum + slice.total, 0);
  return {
    total,
    slices: slices.map((slice) => ({ ...slice, share: total ? slice.total / total : 0 })),
  };
}

export function sliceLabel(t, slice) {
  return slice.key === REST_SLICE
    ? t("dashboard.categoryRest")
    : categoryLabel(t, slice.category);
}



export const MAX_NOTICE_DAYS = 60;

function isoShift(iso, days) {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

const MONTHS_BY_FREQUENCY = { monthly: 1, quarterly: 3, yearly: 12 };
const MAX_STEPS = 600;

function pad(value) {
  return String(value).padStart(2, "0");
}

function addMonths(iso, months) {
  const [year, month, day] = iso.split("-").map(Number);
  const total = month - 1 + months;
  const targetYear = year + Math.floor(total / 12);
  const targetMonth = (total % 12) + 1;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  return `${targetYear}-${pad(targetMonth)}-${pad(Math.min(day, lastDay))}`;
}

// Reproduit le plancher du back : a la creation, aucune echeance anterieure a
// aujourd'hui n'est generee. Sert a annoncer la vraie premiere date suivie.
export function firstTrackedDate(startsOn, frequency, today) {
  if (!startsOn || !today) {
    return null;
  }
  if (frequency === "oneoff" || startsOn >= today) {
    return startsOn;
  }
  const months = MONTHS_BY_FREQUENCY[frequency];
  for (let step = 1; step <= MAX_STEPS; step += 1) {
    const due =
      frequency === "weekly" ? isoShift(startsOn, step * 7) : addMonths(startsOn, step * months);
    if (due >= today) {
      return due;
    }
  }
  return null;
}

export const TRIAL_PRESETS = [3, 7, 14, 30];
export const MAX_TRIAL_DAYS = 365;

export function trialEndFrom(startsOn, days) {
  const count = Number(days);
  if (!startsOn || !Number.isInteger(count) || count < 1 || count > MAX_TRIAL_DAYS) {
    return null;
  }
  return isoShift(startsOn, count);
}

export function actionDeadline(commitment, today) {
  if (commitment.trialEndsOn && commitment.trialEndsOn >= today) {
    return { reason: "trial", date: commitment.trialEndsOn };
  }
  if (commitment.cancellationNoticeDays && commitment.nextDueDate) {
    const date = isoShift(commitment.nextDueDate, -commitment.cancellationNoticeDays);
    return date >= today ? { reason: "cancellation", date } : null;
  }
  return null;
}

export const STATUS_TAG_KEYS = {
  paused: "commitments.paused",
  archived: "commitments.archived",
};

export const STATUS_ACTIONS = {
  active: [
    { id: "pause", status: "paused", icon: "pause", labelKey: "commitments.pause" },
    { id: "archive", status: "archived", icon: "archive", labelKey: "commitments.archive" },
  ],
  paused: [
    { id: "resume", status: "active", icon: "resume", labelKey: "commitments.resume" },
    { id: "archive", status: "archived", icon: "archive", labelKey: "commitments.archive" },
  ],
  archived: [
    { id: "restore", status: "active", icon: "restore", labelKey: "commitments.restore" },
  ],
};

// Seules les actions qui retirent quelque chose a l'utilisateur meritent un
// filet : reactiver ou desarchiver est deja une reparation, proposer de l'annuler
// ne ferait que reproposer le probleme.
export const REVERSIBLE_STATUS = new Set(["paused", "archived"]);

// Au-dela, une suppression par lot se confirme, comme "tout supprimer".
export const BULK_CONFIRM_ABOVE = 5;

export function previousStatuses(commitments, ids) {
  const picked = new Set(ids);
  return commitments
    .filter((item) => picked.has(item.id))
    .map((item) => ({ id: item.id, status: item.status }));
}

export function undoSteps(previous, changedIds) {
  // Une selection n'est pas homogene : trois lignes actives et une en pause
  // reviennent a deux etats differents. On regroupe par etat d'avant, donc
  // trois appels au plus, et seules les lignes qui ont bouge sont rejouees.
  const changed = new Set(changedIds);
  const byStatus = new Map();

  previous.forEach(({ id, status }) => {
    if (!changed.has(id)) {
      return;
    }
    if (!byStatus.has(status)) {
      byStatus.set(status, []);
    }
    byStatus.get(status).push(id);
  });

  return [...byStatus.entries()].map(([status, ids]) => ({ status, ids }));
}

export const STATUS_TOAST_KEYS = {
  active: "commitments.statusActive",
  paused: "commitments.statusPaused",
  archived: "commitments.statusArchived",
};

export function statusActions(t, commitment, onSelect) {
  return (STATUS_ACTIONS[commitment.status] ?? []).map((action) => ({
    id: action.id,
    icon: action.icon,
    label: t(action.labelKey),
    onSelect: () => onSelect(commitment, action.status),
  }));
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
    trialEndsOn: raw.trial_ends_on,
    cancellationNoticeDays: raw.cancellation_notice_days,
    reminderDaysBefore: raw.reminder_days_before,
    isReminderEnabled: raw.is_reminder_enabled,
    status: raw.status,
    notes: raw.notes,
    nextDueDate: raw.next_due_date,
    purgeOn: raw.purge_on ?? null,
    lateDueDate: raw.late_due_date ?? null,
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
    paidOn: raw.paid_on ?? null,
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
    byCategory: raw.by_category ?? [],
  };
}

const SPACES = /\s/g;

export function normalizeAmount(value) {
  if (typeof value !== "string") {
    return value;
  }
  // Un champ type="number" refuse la virgule et vide sa propre valeur sans le dire :
  // l'utilisateur voit 18,99 et le serveur recoit une chaine vide. On accepte donc
  // les deux separateurs, en tenant le dernier pour le decimal.
  const cleaned = value.trim().replace(SPACES, "");
  const cut = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  if (cut === -1) {
    return cleaned;
  }
  return `${cleaned.slice(0, cut).replace(/[,.]/g, "")}.${cleaned.slice(cut + 1)}`;
}

export function toCommitmentPayload(form, { currentTrialEnd = null } = {}) {
  const derived = form.isTrial ? trialEndFrom(form.trialStartsOn, form.trialDays) : null;

  const payload = {
    title: form.title.trim(),
    type: form.type,
    category: form.category,
    amount: normalizeAmount(form.amount),
    frequency: form.frequency,
    starts_on: derived ?? form.startsOn,
    reminder_days_before: Number(form.reminderDaysBefore),
    is_reminder_enabled: form.isReminderEnabled,
  };

  payload.ends_on = form.endsOn ? form.endsOn : null;
  payload.trial_ends_on = form.isTrial ? (derived ?? currentTrialEnd) : null;
  payload.cancellation_notice_days =
    form.cancellationNoticeDays === "" ? null : Number(form.cancellationNoticeDays);
  payload.notes = form.notes?.trim() ? form.notes.trim() : null;

  return payload;
}

const PAYLOAD_SOURCES = {
  title: "title",
  type: "type",
  category: "category",
  amount: "amount",
  frequency: "frequency",
  starts_on: "startsOn",
  ends_on: "endsOn",
  trial_ends_on: "trialEndsOn",
  cancellation_notice_days: "cancellationNoticeDays",
  reminder_days_before: "reminderDaysBefore",
  is_reminder_enabled: "isReminderEnabled",
  notes: "notes",
};

function unchanged(left, right) {
  if (left === null || left === undefined || right === null || right === undefined) {
    return (left ?? null) === (right ?? null);
  }
  if (typeof left === "number" || typeof right === "number") {
    return Number(left) === Number(right);
  }
  return left === right;
}

export function commitmentChanges(payload, commitment) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([field, value]) => !unchanged(value, commitment[PAYLOAD_SOURCES[field]]),
    ),
  );
}

export const DEFAULT_REMINDER_DAYS = 3;

export function emptyForm(type, reminderDaysBefore = DEFAULT_REMINDER_DAYS) {
  return {
    title: "",
    type,
    category: CATEGORIES[type][0],
    amount: "",
    frequency: "monthly",
    startsOn: todayIso(),
    endsOn: "",
    isTrial: false,
    trialStartsOn: "",
    trialDays: "",
    trialCustom: false,
    cancellationNoticeDays: "",
    reminderDaysBefore,
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
    isTrial: Boolean(commitment.trialEndsOn),
    trialStartsOn: "",
    trialDays: "",
    trialCustom: false,
    cancellationNoticeDays: commitment.cancellationNoticeDays ?? "",
    reminderDaysBefore: commitment.reminderDaysBefore,
    isReminderEnabled: commitment.isReminderEnabled,
    notes: commitment.notes ?? "",
  };
}
