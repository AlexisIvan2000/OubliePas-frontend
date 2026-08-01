import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { formatMoney } from "../../domain/formatting";
import styles from "../styles/summary.module.css";

export function SummaryTiles({ summary }) {
  const { t } = useTranslation();
  const currency = summary.currency;

  return (
    <div className={styles.tiles}>
      <div className={cx(styles.tile, styles.feature)}>
        <div className={styles.tileHead}>
          <Icon name="wallet" size={16} className={styles.tileIcon} />
          <span className={styles.tileLabel}>{t("dashboard.tileMonth")}</span>
        </div>
        <div className={styles.tileValue}>{formatMoney(summary.monthTotal, currency)}</div>
        <div className={styles.split}>
          <span>
            <Icon name="subscriptions" size={13} />
            {formatMoney(summary.subscriptionsTotal, currency)}
          </span>
          <span>
            <Icon name="invoices" size={13} />
            {formatMoney(summary.invoicesTotal, currency)}
          </span>
        </div>
      </div>

      <div className={styles.tile}>
        <div className={styles.tileHead}>
          <Icon name="clock" size={16} className={styles.tileIcon} />
          <span className={styles.tileLabel}>{t("dashboard.tileRemaining")}</span>
        </div>
        <div className={styles.tileValue}>{formatMoney(summary.pendingTotal, currency)}</div>
        <div className={styles.tileNote}>
          {t("dashboard.tileAlreadyPaid", { amount: formatMoney(summary.paidTotal, currency) })}
        </div>
      </div>

      <div className={styles.tile}>
        <div className={styles.tileHead}>
          <Icon name={summary.lateCount ? "late" : "scheduled"} size={16} className={styles.tileIcon} />
          <span className={styles.tileLabel}>{t("dashboard.tileLate")}</span>
        </div>
        <div className={cx(styles.tileValue, summary.lateCount > 0 && styles.alert)}>
          {summary.lateCount}
        </div>
        <div className={styles.tileNote}>
          {t("dashboard.tileTracked", { count: summary.activeCount })}
        </div>
      </div>
    </div>
  );
}
