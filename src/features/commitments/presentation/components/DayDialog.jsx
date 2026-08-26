import { useEffect, useMemo, useRef } from "react";

import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useDismiss } from "../../../../core/utils/useDismiss";
import { useReturnFocus } from "../../../../core/utils/useReturnFocus";
import { useScrollLock } from "../../../../core/utils/useScrollLock";
import { formatLongDate, formatMoney, parseDate } from "../../domain/formatting";
import { OccurrenceRow } from "./OccurrenceRow";
import styles from "../styles/day.module.css";

export function DayDialog({ day, occurrences, currency, busyId, blocked, onToggle, onClose }) {
  const { t } = useTranslation();
  const { leaving, dismiss } = useDismiss();
  const restoreFocus = useReturnFocus();
  const panel = useRef(null);

  useScrollLock();

  const finish = () => {
    restoreFocus();
    onClose();
  };
  const close = () => dismiss(finish);

  useEffect(() => {
    const handler = (event) => event.key === "Escape" && !blocked && dismiss(finish);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    // Quand le dialogue de reglement se referme au-dessus, le focus repartirait
    // vers la grille, c'est-a-dire derriere ce panneau encore ouvert. On le
    // rappelle ici.
    if (!blocked) {
      panel.current?.focus();
    }
  }, [blocked]);

  const restant = useMemo(
    () =>
      occurrences
        .filter((occurrence) => occurrence.status === "pending")
        .reduce((total, occurrence) => total + Number(occurrence.amount), 0),
    [occurrences],
  );

  const heading = formatLongDate(parseDate(day));

  return (
    <div
      className={cx(styles.overlay, leaving && styles.leavingVeil)}
      onMouseDown={close}
    >
      <div
        ref={panel}
        tabIndex={-1}
        className={cx(styles.dialog, leaving && styles.leaving)}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 className={styles.title}>{heading}</h2>
          <p className={styles.subtitle}>
            {restant > 0
              ? t("calendar.dayRemaining", {
                  count: occurrences.length,
                  amount: formatMoney(restant, currency),
                })
              : t("calendar.dayAllSettled", { count: occurrences.length })}
          </p>
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

        <button type="button" className={styles.close} onClick={close}>
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
