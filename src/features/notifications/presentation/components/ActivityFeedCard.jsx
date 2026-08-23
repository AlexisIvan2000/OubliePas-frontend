import { useState } from "react";

import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { formatMoney, formatShortDate, relativeDue } from "../../../commitments/domain/formatting";
import styles from "../styles/reminders.module.css";

const PER_PAGE = 5;

function FeedRow({ entry, currency, index }) {
  const { t } = useTranslation();

  return (
    <li className={styles.feedRow} style={{ "--enter-delay": `${index * 55}ms` }}>
      <span className={styles.feedIcon}>
        <Icon name="reminders" size={15} />
      </span>
      <div className={styles.feedText}>
        <span className={styles.feedTitle}>{entry.title}</span>
        <span className={styles.feedMeta}>
          {t("reminders.feed.sendOn", { date: formatShortDate(entry.sendDate) })} &middot;{" "}
          <span className={styles.feedLead}>
            {entry.daysBefore === 0
              ? t("reminders.feed.sameDay")
              : t("reminders.lead.before", { count: entry.daysBefore })}
          </span>{" "}
          &middot; {t("reminders.feed.dueOn", { date: relativeDue(t, entry.dueDate) })}
        </span>
      </div>
      <span className={styles.feedAmount}>{formatMoney(entry.amount, currency)}</span>
    </li>
  );
}

export function ActivityFeedCard({ entries, loading, muted }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const currency = user?.currency ?? "CAD";
  const pages = Math.max(1, Math.ceil(entries.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = entries.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const go = (step) => setPage(Math.min(Math.max(current + step, 1), pages));

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{t("reminders.feed.title")}</h2>
        <p className={styles.cardDescription}>{t("reminders.feed.description")}</p>
      </header>

      {loading ? (
        <ul className={styles.feed}>
          {[0, 1, 2].map((row) => (
            <li key={row} className={styles.feedSkeleton} />
          ))}
        </ul>
      ) : muted ? (
        <div className={styles.empty}>
          <Icon name="reminders" size={22} />
          <p className={styles.emptyTitle}>{t("reminders.feed.mutedTitle")}</p>
          <p className={styles.emptyText}>{t("reminders.feed.mutedText")}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="reminders" size={22} />
          <p className={styles.emptyTitle}>{t("reminders.feed.emptyTitle")}</p>
          <p className={styles.emptyText}>{t("reminders.feed.emptyText")}</p>
        </div>
      ) : (
        <>
          <ul key={current} className={styles.feed}>
            {shown.map((entry, index) => (
              <FeedRow key={entry.id} entry={entry} currency={currency} index={index} />
            ))}
          </ul>

          {pages > 1 ? (
            <div className={styles.pager}>
              <button
                type="button"
                className={styles.pagerButton}
                onClick={() => go(-1)}
                disabled={current === 1}
                aria-label={t("reminders.feed.previous")}
              >
                <Icon name="previous" size={15} />
              </button>

              <span className={styles.pagerCount} aria-live="polite">
                {t("reminders.feed.page", { current, pages })}
              </span>

              <button
                type="button"
                className={styles.pagerButton}
                onClick={() => go(1)}
                disabled={current === pages}
                aria-label={t("reminders.feed.next")}
              >
                <Icon name="next" size={15} />
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
