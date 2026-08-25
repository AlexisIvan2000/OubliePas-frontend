import { Check } from "../../../../core/components/Check/Check";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { categoryLabel, occurrenceStatus } from "../../domain/commitment";
import { checkLabel } from "../providers/useSettle";
import { formatDate, formatMoney, relativeDue } from "../../domain/formatting";
import styles from "../styles/commitments.module.css";

export function OccurrenceRow({ occurrence, currency, busy, index = 0, onToggle }) {
  const { t } = useTranslation();
  const paid = occurrence.status === "paid";
  const status = occurrenceStatus(t, occurrence.status);

  return (
    <li
      className={cx(
        styles.occurrence,
        styles.enter,
        paid && styles.settled,
        occurrence.isLate && styles.late,
      )}
      style={{ "--enter-delay": `${Math.min(index, 12) * 40}ms` }}
    >
      <Check
        paid={paid}
        skipped={occurrence.status === "skipped"}
        busy={busy}
        onClick={() => onToggle(occurrence)}
        label={checkLabel(t, occurrence)}
      />

      <div className={styles.occurrenceMain}>
        <div className={styles.occurrenceTitle}>{occurrence.title}</div>
        <div className={styles.occurrenceMeta}>
          <span>{categoryLabel(t, occurrence.category)}</span>
          <span className={styles.dot} aria-hidden="true" />
          {paid && occurrence.paidOn ? (
            <span>{t("occurrence.paidOn", { date: formatDate(occurrence.paidOn) })}</span>
          ) : (
            <span className={cx(occurrence.isLate && styles.lateText)}>
              {occurrence.isLate ? t("occurrence.latePrefix") : ""}
              {relativeDue(t, occurrence.dueDate)}
            </span>
          )}
        </div>
      </div>

      <span className={cx(styles.badge, styles[status.tone])}>{status.label}</span>

      <div className={cx(styles.occurrenceAmount, paid && styles.struck)}>
        {formatMoney(occurrence.amount, currency)}
      </div>
    </li>
  );
}
