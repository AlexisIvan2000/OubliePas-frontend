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
const PUSH = 4;
const STAGGER = 70;

function arcs(slices) {
  const gap = slices.length > 1 ? GAP : 0;
  let offset = 0;

  return slices.map((slice) => {
    const span = slice.share * CIRCUMFERENCE;
    const length = Math.max(span - gap, MIN_ARC);
    const angle = (2 * Math.PI * (offset + span / 2)) / CIRCUMFERENCE;
    const arc = {
      ...slice,
      length,
      offset,
      pushX: Math.cos(angle) * PUSH,
      pushY: Math.sin(angle) * PUSH,
    };
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
          style={{ "--ring": CIRCUMFERENCE }}
          role="img"
          aria-label={t("dashboard.categoriesAria", { legend })}
        >
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={18}
              className={styles.track}
            />

            {arcs(slices).map((slice, index) => (
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
                style={{
                  "--enter-delay": `${index * STAGGER}ms`,
                  "--push-x": `${slice.pushX}px`,
                  "--push-y": `${slice.pushY}px`,
                  "--glow": slice.color,
                }}
                className={cx(
                  styles.slice,
                  active === slice.key && styles.pulled,
                  active && active !== slice.key && styles.faded,
                )}
                onMouseEnter={() => setActive(slice.key)}
              />
            ))}
          </g>
        </svg>

        <div className={styles.center} key={shown ? shown.key : "total"}>
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
