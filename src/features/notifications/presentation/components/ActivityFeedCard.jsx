import { useId, useState } from "react";

import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { formatMoney, formatShortDate, relativeDue } from "../../../commitments/domain/formatting";
import styles from "../styles/reminders.module.css";

function FeedRow({ entry, currency, index = 0, folded = false }) {
  const { t } = useTranslation();

  return (
    <li
      className={cx(styles.feedRow, folded && styles.feedRowFolded)}
      style={folded ? { "--fold-delay": `${index * 45}ms` } : undefined}
    >
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

const VISIBLE = 4;

export function ActivityFeedCard({ entries, loading, muted }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const foldId = useId();

  const currency = user?.currency ?? "CAD";
  const head = entries.slice(0, VISIBLE);
  const folded = entries.slice(VISIBLE);

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
          <ul className={styles.feed}>
            {head.map((entry) => (
              <FeedRow key={entry.id} entry={entry} currency={currency} />
            ))}
          </ul>

          {folded.length ? (
            <>
              <div
                id={foldId}
                className={cx(styles.fold, open && styles.unfolded)}
                aria-hidden={!open}
              >
                <ul className={cx(styles.feed, styles.foldInner)}>
                  {folded.map((entry, index) => (
                    <FeedRow
                      key={entry.id}
                      entry={entry}
                      currency={currency}
                      index={index}
                      folded
                    />
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={styles.foldToggle}
                aria-expanded={open}
                aria-controls={foldId}
                onClick={() => setOpen((current) => !current)}
              >
                {open ? null : (
                  <span className={styles.deck} aria-hidden="true">
                    {folded.slice(0, 3).map((card, depth) => (
                      <span
                        key={card.id}
                        className={styles.deckCard}
                        style={{ "--depth": depth }}
                      />
                    ))}
                  </span>
                )}
                <span className={styles.foldLabel}>
                  {open
                    ? t("reminders.feed.showLess")
                    : t("reminders.feed.showMore", { count: folded.length })}
                </span>
              </button>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
