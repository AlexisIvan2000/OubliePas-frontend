import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { MAX_VISIBLE_EVENTS, eventTone } from "../../domain/calendar";

// Trois pastilles suffisent a dire « il se passe quelque chose ce jour-la » dans
// une case de trente-sept pixels ; le detail est a un doigt, dans le dialogue.
const MAX_DOTS = 3;
import { formatMoney, formatWeekdays } from "../../domain/formatting";
import styles from "../styles/calendar.module.css";

export function MonthGrid({ cells, currency, busyId, onToggle, onOpenDay }) {
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
              {/* Le numero fait office de bouton : seule cible tactile de la
                  case en grille compacte (et raccourci vers le jour ailleurs). */}
              <button
                type="button"
                className={cx(styles.dayNumber, cell.isToday && styles.todayNumber)}
                onClick={() => onOpenDay(cell)}
                disabled={!cell.events.length}
                aria-label={t("calendar.openDay")}
              >
                {cell.day}
              </button>

              <div className={styles.dots} aria-hidden="true">
                {cell.events.slice(0, MAX_DOTS).map((occurrence) => (
                  <span
                    key={occurrence.id}
                    className={cx(styles.dot, styles[eventTone(occurrence)])}
                  />
                ))}
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
                  <button
                    type="button"
                    className={styles.more}
                    onClick={() => onOpenDay(cell)}
                    aria-label={t("calendar.openDay")}
                  >
                    {t("calendar.more", { count: cell.events.length - MAX_VISIBLE_EVENTS })}
                  </button>
                ) : null}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
