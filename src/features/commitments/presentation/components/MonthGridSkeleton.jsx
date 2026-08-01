import { SHIMMER_STEP, Skeleton } from "../../../../core/components/Skeleton/Skeleton";
import { formatWeekdays } from "../../domain/formatting";
import styles from "../styles/skeletons.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

const CELLS = 35;
const LEADING = 2;
const EVENTS = { 4: 2, 9: 1, 12: 1, 17: 3, 20: 1, 25: 2, 30: 1 };

export function MonthGridSkeleton() {
  const { t } = useTranslation();
  const weekdays = formatWeekdays();

  return (
    <div className={styles.board} aria-busy="true" aria-label={t("a11y.loadingCalendar")}>
      <div className={styles.weekdays}>
        {weekdays.map((weekday) => (
          <div className={styles.weekday} key={weekday}>
            {weekday}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: CELLS }, (_, index) => {
          if (index < LEADING) {
            return <div className={styles.filler} key={index} />;
          }

          const row = Math.floor(index / 7);
          const column = index % 7;
          const wave = (row + column) * SHIMMER_STEP * 0.5;
          const pills = EVENTS[index] ?? 0;

          return (
            <div className={styles.cell} key={index}>
              <Skeleton width="1rem" height="0.6875rem" delay={wave} />
              <div className={styles.pills}>
                {Array.from({ length: pills }, (_, pill) => (
                  <Skeleton
                    key={pill}
                    height="1.125rem"
                    radius="0.375rem"
                    delay={wave + (pill + 1) * 60}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
