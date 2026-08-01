import { relativeDueKey } from "../../../core/utils/formatting";

export {
  daysUntil,
  formatDate,
  formatLongDate,
  formatMonth,
  formatMoney,
  formatShortDate,
  formatWeekdays,
  parseDate,
  relativeDueKey,
} from "../../../core/utils/formatting";

export function relativeDue(t, iso) {
  const { key, count } = relativeDueKey(iso);
  return t(key, { count });
}
