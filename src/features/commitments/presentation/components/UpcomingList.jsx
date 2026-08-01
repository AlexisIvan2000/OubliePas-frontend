import { Link } from "react-router-dom";

import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { COMMITMENT_TYPES } from "../../domain/commitment";
import { formatMoney, formatShortDate, relativeDue } from "../../domain/formatting";
import styles from "../styles/summary.module.css";

export function UpcomingList({ items, total, days, currency }) {
  const { t } = useTranslation();

  if (!items.length) {
    const [before, middle, after] = t("dashboard.upcomingEmptyAdd")
      .split(/\{subscriptions\}|\{invoices\}/);

    return (
      <p className={styles.none}>
        {t("dashboard.upcomingEmpty", { days })}{" "}
        {before}
        <Link to="/abonnements">{t("dashboard.upcomingEmptySubscriptions")}</Link>
        {middle}
        <Link to="/factures">{t("dashboard.upcomingEmptyInvoices")}</Link>
        {after}
      </p>
    );
  }

  const hidden = total - items.length;

  return (
    <>
      <ul className={styles.upcoming}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={styles.upcomingRow}
            style={{ "--enter-delay": `${index * 45}ms` }}
          >
            <span className={styles.day}>{formatShortDate(item.dueDate)}</span>
            <span className={styles.upcomingMain}>
              <span className={styles.upcomingTitle}>
                <Icon
                  name={COMMITMENT_TYPES[item.type].icon}
                  size={13}
                  className={styles.typeIcon}
                />
                {item.title}
              </span>
              <span className={styles.upcomingWhen}>{relativeDue(t, item.dueDate)}</span>
            </span>
            <span className={styles.upcomingAmount}>{formatMoney(item.amount, currency)}</span>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        {hidden > 0 ? (
          <span className={styles.hidden}>{t("dashboard.upcomingHidden", { count: hidden })}</span>
        ) : null}
        <Link to="/calendrier" className={cx(styles.seeMore, hidden > 0 && styles.pushed)}>
          {t("dashboard.seeCalendar")}
          <Icon name="next" size={14} />
        </Link>
      </div>
    </>
  );
}
