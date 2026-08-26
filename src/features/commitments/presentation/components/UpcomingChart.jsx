import { useState } from "react";

import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { formatMoney, formatMonth, formatMonthShort } from "../../domain/formatting";
import styles from "../styles/upcomingChart.module.css";

const MIN_BAR = 0.06;

export function UpcomingChart({ months, currency }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);

  const peak = Math.max(...months.map((row) => row.total), 0);
  const horizon = months.reduce((total, row) => total + row.total, 0);
  const shown = active === null ? null : months[active];

  return (
    <div className={styles.chart} onMouseLeave={() => setActive(null)}>
      <div className={styles.readout}>
        <span className={styles.period}>
          {shown
            ? formatMonth(shown.month)
            : t("breakdown.comingHorizon", { count: months.length })}
        </span>
        <span className={cx(styles.amount, shown && styles.amountActive)}>
          {formatMoney(shown ? shown.total : horizon, currency)}
        </span>
      </div>

      <ul className={styles.bars}>
        {months.map((row, index) => {
          const near = active !== null && Math.abs(index - active) === 1;

          return (
            <li key={row.month} className={styles.column}>
              <span
                className={cx(styles.tip, active === index && styles.tipShown)}
                aria-hidden="true"
              >
                {formatMoney(row.total, currency)}
              </span>

              <button
                type="button"
                className={cx(
                  styles.bar,
                  active === index && styles.barActive,
                  near && styles.barNear,
                  active !== null && active !== index && !near && styles.barFar,
                )}
                style={{
                  "--fill": Math.max(peak ? row.total / peak : 0, MIN_BAR),
                  "--enter-delay": `${index * 70}ms`,
                }}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              >
                <span className={styles.reader}>
                  {t("breakdown.comingReader", {
                    month: formatMonth(row.month),
                    amount: formatMoney(row.total, currency),
                    count: row.count,
                  })}
                </span>
              </button>

              <span className={cx(styles.label, active === index && styles.labelActive)}>
                {formatMonthShort(row.month)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
