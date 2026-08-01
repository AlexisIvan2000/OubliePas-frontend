import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { FREQUENCY_SHORT_KEYS, categoryLabel } from "../../domain/commitment";
import { formatDate, formatMoney, relativeDue } from "../../domain/formatting";
import styles from "../styles/commitments.module.css";

export function CommitmentRow({ commitment, currency, index = 0, onEdit, onDelete }) {
  const { t } = useTranslation();
  const paused = commitment.status !== "active";

  return (
    <li
      className={cx(styles.row, styles.enter, paused && styles.paused)}
      style={{ "--enter-delay": `${Math.min(index, 12) * 40}ms` }}
    >
      <div className={styles.rowMain}>
        <div className={styles.rowTitle}>
          {commitment.title}
          {paused ? <span className={styles.pausedTag}>{t("commitments.paused")}</span> : null}
        </div>
        <div className={styles.rowMeta}>
          <span>{categoryLabel(t, commitment.category)}</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>{t(FREQUENCY_SHORT_KEYS[commitment.frequency])}</span>
          {commitment.isReminderEnabled ? (
            <>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.reminder}>
                <Icon name="reminders" size={13} />
                {t("commitments.reminderDays", { count: commitment.reminderDaysBefore })}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.rowDue}>
        {commitment.nextDueDate ? (
          <>
            <div className={styles.dueDate}>{formatDate(commitment.nextDueDate)}</div>
            <div className={styles.dueRelative}>{relativeDue(t, commitment.nextDueDate)}</div>
          </>
        ) : (
          <div className={styles.dueRelative}>{t("commitments.noDueDate")}</div>
        )}
      </div>

      <div className={styles.rowAmount}>{formatMoney(commitment.amount, currency)}</div>

      <div className={styles.rowActions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => onEdit(commitment)}
          aria-label={t("commitments.editAria", { title: commitment.title })}
        >
          <Icon name="edit" size={16} />
        </button>
        <button
          type="button"
          className={cx(styles.iconButton, styles.danger)}
          onClick={() => onDelete(commitment)}
          aria-label={t("commitments.deleteAria", { title: commitment.title })}
        >
          <Icon name="delete" size={16} />
        </button>
      </div>
    </li>
  );
}
