import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { formatMoney, formatShortDate, relativeDue } from "../../../commitments/domain/formatting";
import styles from "../styles/reminders.module.css";

function FeedRow({ entry, currency }) {
  const { t } = useTranslation();

  return (
    <li className={styles.feedRow}>
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
        <ul className={styles.feed}>
          {entries.map((entry) => (
            <FeedRow key={entry.id} entry={entry} currency={user?.currency ?? "CAD"} />
          ))}
        </ul>
      )}
    </section>
  );
}
