import { relativeDueKey } from "../../../core/utils/formatting";

export {
  addDaysIso,
  daysUntil,
  formatDate,
  formatLongDate,
  formatMonth,
  formatMoney,
  formatPercent,
  formatShortDate,
  formatWeekdays,
  parseDate,
  relativeDueKey,
  todayIso,
} from "../../../core/utils/formatting";

export function relativeDue(t, iso) {
  const { key, count } = relativeDueKey(iso);
  return t(key, { count });
}
