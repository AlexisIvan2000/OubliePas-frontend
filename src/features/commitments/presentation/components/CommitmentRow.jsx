import { Icon } from "../../../../core/components/Icon/Icon";
import { Menu } from "../../../../core/components/Menu/Menu";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { brandLogo } from "../../domain/brandLogos";
import {
  ANNUAL_FACTOR,
  FREQUENCY_SHORT_KEYS,
  STATUS_TAG_KEYS,
  actionDeadline,
  categoryLabel,
  categoryTint,
  monogram,
  statusActions,
} from "../../domain/commitment";
import { formatDate, formatMoney, relativeDue } from "../../domain/formatting";
import styles from "../styles/commitments.module.css";

export function CommitmentRow({
  commitment,
  currency,
  today,
  index = 0,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { t } = useTranslation();
  const logo = brandLogo(commitment.title);
  const deadline = actionDeadline(commitment, today);
  const dimmed = commitment.status !== "active";
  const tagKey = STATUS_TAG_KEYS[commitment.status];
  const factor = ANNUAL_FACTOR[commitment.frequency];
  const annual = factor && factor !== 1 ? Number(commitment.amount) * factor : null;

  const items = [
    ...statusActions(t, commitment, onStatusChange),
    {
      id: "delete",
      icon: "delete",
      tone: "danger",
      label: t("common.delete"),
      onSelect: () => onDelete(commitment),
    },
  ];

  return (
    <li
      className={cx(styles.row, styles.enter, dimmed && styles.paused)}
      style={{ "--enter-delay": `${Math.min(index, 12) * 40}ms` }}
    >
      {logo ? (
        <span className={cx(styles.monogram, styles.logoMark)} aria-hidden="true">
          <img className={styles.logo} src={logo} alt="" loading="lazy" />
        </span>
      ) : (
        <span
          className={styles.monogram}
          style={{ "--tint": categoryTint(commitment.category) }}
          aria-hidden="true"
        >
          {monogram(commitment.title)}
        </span>
      )}

      <div className={styles.rowMain}>
        <div className={styles.rowTitle}>
          {commitment.title}
          {tagKey ? <span className={styles.pausedTag}>{t(tagKey)}</span> : null}
        </div>
        {deadline ? (
          <div className={cx(styles.deadline, styles[deadline.reason])}>
            <Icon name="reminders" size={13} />
            {t(`commitments.${deadline.reason}Deadline`, {
              date: formatDate(deadline.date),
            })}
          </div>
        ) : null}
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

      <div className={styles.rowAmount}>
        <div>{formatMoney(commitment.amount, currency)}</div>
        {annual ? (
          <div className={styles.rowAnnual}>
            {t("commitments.perYear", { amount: formatMoney(annual, currency) })}
          </div>
        ) : null}
      </div>

      <div className={styles.rowActions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => onEdit(commitment)}
          aria-label={t("commitments.editAria", { title: commitment.title })}
        >
          <Icon name="edit" size={16} />
        </button>
        <Menu
          label={t("commitments.moreAria", { title: commitment.title })}
          items={items}
        />
      </div>
    </li>
  );
}
