import { useEffect, useMemo, useRef } from "react";

import { useTranslation } from "../../../../core/translation/useTranslation";
import { formatLongDate, formatMoney, parseDate } from "../../domain/formatting";
import { OccurrenceRow } from "./OccurrenceRow";
import styles from "../styles/day.module.css";

function doucement() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "auto";
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function DayPanel({ day, occurrences, currency, busyId, onToggle, onClear }) {
  const { t } = useTranslation();
  const panel = useRef(null);

  useEffect(() => {
    // Le panneau naît sous une grille de six rangees : sur un telephone il
    // arrive hors champ, et taper une date semblerait ne rien faire. Le focus
    // suit le regard, sinon un lecteur d'ecran resterait sur la case tapee.
    panel.current?.scrollIntoView({ block: "nearest", behavior: doucement() });
    panel.current?.focus({ preventScroll: true });
  }, [day]);

  const remaining = useMemo(
    () =>
      occurrences
        .filter((occurrence) => occurrence.status === "pending")
        .reduce((total, occurrence) => total + Number(occurrence.amount), 0),
    [occurrences],
  );

  const heading = formatLongDate(parseDate(day));

  return (
    <section ref={panel} tabIndex={-1} className={styles.panel} aria-label={heading}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{heading}</h2>
          <p className={styles.subtitle}>
            {remaining > 0
              ? t("calendar.dayRemaining", {
                  count: occurrences.length,
                  amount: formatMoney(remaining, currency),
                })
              : t("calendar.dayAllSettled", { count: occurrences.length })}
          </p>
        </div>

        {/* Le retour doit etre explicite : le panneau prend la place de la liste
            du mois, et rien d'autre ne dit comment la retrouver. */}
        <button type="button" className={styles.back} onClick={onClear}>
          {t("calendar.wholeMonth")}
        </button>
      </header>

      <ul className={styles.list}>
        {occurrences.map((occurrence, index) => (
          <OccurrenceRow
            key={occurrence.id}
            occurrence={occurrence}
            currency={currency}
            busy={busyId === occurrence.id}
            index={index}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </section>
  );
}
