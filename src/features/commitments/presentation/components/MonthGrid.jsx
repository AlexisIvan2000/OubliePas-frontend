import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { MAX_VISIBLE_EVENTS, eventTone } from "../../domain/calendar";
import { formatMoney, formatWeekdays } from "../../domain/formatting";
import styles from "../styles/calendar.module.css";

export function MonthGrid({ cells, currency, busyId, onToggle }) {
  const { t } = useTranslation();
  const weekdays = formatWeekdays();

  return (
    <div className={styles.board}>
      <div className={styles.weekdays}>
        {weekdays.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((cell, index) =>
          cell.empty ? (
            <div key={cell.key} className={styles.filler} />
          ) : (
            <div
              key={cell.key}
              className={cx(styles.cell, styles.enter, cell.isToday && styles.today)}
              style={{
                "--enter-delay": `${(Math.floor(index / 7) + (index % 7)) * 18}ms`,
              }}
            >
              <div className={cx(styles.dayNumber, cell.isToday && styles.todayNumber)}>
                {cell.day}
              </div>

              <div className={styles.events}>
                {cell.events.slice(0, MAX_VISIBLE_EVENTS).map((occurrence) => (
                  <button
                    key={occurrence.id}
                    type="button"
                    className={cx(
                      styles.event,
                      styles[eventTone(occurrence)],
                      occurrence.isLate && styles.lateEvent,
                      busyId === occurrence.id && styles.busy,
                    )}
                    onClick={() => onToggle(occurrence)}
                    disabled={busyId === occurrence.id}
                    title={`${occurrence.title} · ${formatMoney(occurrence.amount, currency)} · ${t(
                      `occurrence.${occurrence.status}`,
                    )}`}
                  >
                    {occurrence.title} · {formatMoney(occurrence.amount, currency)}
                  </button>
                ))}

                {cell.events.length > MAX_VISIBLE_EVENTS ? (
                  <span className={styles.more}>
                    {t("calendar.more", { count: cell.events.length - MAX_VISIBLE_EVENTS })}
                  </span>
                ) : null}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
