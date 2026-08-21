import { useState } from "react";

import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { sliceLabel } from "../../domain/commitment";
import { formatMoney, formatPercent } from "../../domain/formatting";
import styles from "../styles/categories.module.css";

const SIZE = 128;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2.5;
const MIN_ARC = 1.5;

function arcs(slices) {
  const gap = slices.length > 1 ? GAP : 0;
  let offset = 0;

  return slices.map((slice) => {
    const span = slice.share * CIRCUMFERENCE;
    const length = Math.max(span - gap, MIN_ARC);
    const arc = { ...slice, length, offset };
    offset += span;
    return arc;
  });
}

export function CategoryDonut({ slices, total, currency }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);

  if (!slices.length) {
    return <p className={styles.none}>{t("dashboard.categoriesEmpty")}</p>;
  }

  const shown = slices.find((slice) => slice.key === active) ?? null;
  const legend = slices
    .map((slice) => `${sliceLabel(t, slice)} ${formatPercent(slice.share)}`)
    .join(", ");

  return (
    <div className={styles.layout}>
      <div className={styles.ring} onMouseLeave={() => setActive(null)}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className={styles.chart}
          role="img"
          aria-label={t("dashboard.categoriesAria", { legend })}
        >
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {arcs(slices).map((slice) => (
              <circle
                key={slice.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={18}
                strokeDasharray={`${slice.length} ${CIRCUMFERENCE - slice.length}`}
                strokeDashoffset={-slice.offset}
                className={cx(styles.slice, active && active !== slice.key && styles.faded)}
                onMouseEnter={() => setActive(slice.key)}
              />
            ))}
          </g>
        </svg>

        <div className={styles.center}>
          <span className={styles.centerLabel}>
            {shown ? sliceLabel(t, shown) : t("dashboard.categoriesCenter")}
          </span>
          <span className={styles.centerValue}>
            {formatMoney(shown ? shown.total : total, currency)}
          </span>
        </div>
      </div>

      <ul className={styles.legend}>
        {slices.map((slice, index) => (
          <li
            key={slice.key}
            className={cx(styles.row, active === slice.key && styles.rowActive)}
            style={{ "--enter-delay": `${index * 45}ms` }}
            onMouseEnter={() => setActive(slice.key)}
            onMouseLeave={() => setActive(null)}
          >
            <span className={styles.swatch} style={{ backgroundColor: slice.color }} />
            <span className={styles.name}>{sliceLabel(t, slice)}</span>
            <span className={styles.share}>{formatPercent(slice.share)}</span>
            <span className={styles.amount}>{formatMoney(slice.total, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
