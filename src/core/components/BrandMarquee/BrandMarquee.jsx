import { useMemo } from "react";

import { CATALOG } from "../../../features/commitments/domain/catalog";
import { brandLogo } from "../../../features/commitments/domain/brandLogos";
import { categoryTint, monogram } from "../../../features/commitments/domain/commitment";
import styles from "./BrandMarquee.module.css";

const PER_LANE = 14;

function named(entries) {
  return entries.filter((entry) => typeof entry.name === "string");
}

function lanes() {
  const pool = named(CATALOG.subscription).concat(named(CATALOG.invoice));
  const spread = [];

  for (let step = 0; spread.length < PER_LANE * 2 && step < pool.length; step += 1) {
    const entry = pool[(step * 7) % pool.length];
    if (!spread.some((kept) => kept.id === entry.id)) {
      spread.push(entry);
    }
  }

  return [spread.slice(0, PER_LANE), spread.slice(PER_LANE, PER_LANE * 2)];
}

function Lane({ entries, reverse }) {
  const doubled = entries.concat(entries);

  return (
    <div className={styles.lane}>
      <div className={reverse ? `${styles.track} ${styles.reverse}` : styles.track}>
        {doubled.map((entry, index) => {
          const logo = brandLogo(entry.name);
          return (
            <span className={styles.chip} key={`${entry.id}-${index}`}>
              {logo ? (
                <span className={`${styles.mark} ${styles.logoMark}`}>
                  <img className={styles.logo} src={logo} alt="" loading="lazy" />
                </span>
              ) : (
                <span className={styles.mark} style={{ "--tint": categoryTint(entry.category) }}>
                  {monogram(entry.name)}
                </span>
              )}
              <span className={styles.name}>{entry.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function BrandMarquee({ label }) {
  const [first, second] = useMemo(() => lanes(), []);

  return (
    <div className={styles.marquee} role="img" aria-label={label}>
      <Lane entries={first} />
      <Lane entries={second} reverse />
    </div>
  );
}
