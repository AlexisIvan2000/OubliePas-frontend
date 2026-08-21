import { useMemo, useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Icon } from "../../../../core/components/Icon/Icon";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useToday } from "../../../../core/utils/useToday";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { updateOccurrence } from "../../data/commitmentsApi";
import { buildMonthCells } from "../../domain/calendar";
import { formatMoney, formatMonth, parseDate } from "../../domain/formatting";
import { MonthGrid } from "../components/MonthGrid";
import { MonthGridSkeleton } from "../components/MonthGridSkeleton";
import { OccurrenceRow } from "../components/OccurrenceRow";
import { monthRange, useOccurrences } from "../providers/useOccurrences";
import styles from "../styles/calendar.module.css";
import listStyles from "../styles/commitments.module.css";

export function CalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [cursor, setCursor] = useState(() => new Date());
  const [busyId, setBusyId] = useState(null);
  const today = useToday();

  useDocumentTitle(t("calendar.documentTitle"));

  const range = useMemo(() => monthRange(cursor), [cursor]);
  const { items, loading, error, setItems } = useOccurrences(range);

  const currency = user?.currency ?? "CAD";
  const monthLabel = formatMonth(range.start.slice(0, 7));

  const cells = useMemo(
    () => buildMonthCells(cursor, items, parseDate(today)),
    [cursor, items, today],
  );

  const remaining = useMemo(
    () =>
      items
        .filter((item) => item.status === "pending")
        .reduce((total, item) => total + Number(item.amount), 0),
    [items],
  );

  const shift = (delta) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  const toggle = async (occurrence) => {
    setBusyId(occurrence.id);
    const nextStatus = occurrence.status === "paid" ? "pending" : "paid";
    try {
      const updated = await updateOccurrence(occurrence.id, { status: nextStatus });
      setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={listStyles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>{monthLabel}</h1>
          <div className={styles.summary}>
            {loading
              ? t("common.loading")
              : items.length
                ? t("calendar.dueThisMonth", {
                    count: items.length,
                    amount: formatMoney(remaining, currency),
                  })
                : t("calendar.nothingThisMonth")}
          </div>
        </div>

        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => shift(-1)}
            aria-label={t("calendar.previousMonth")}
          >
            <Icon name="previous" size={16} />
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => shift(1)}
            aria-label={t("calendar.nextMonth")}
          >
            <Icon name="next" size={16} />
          </button>
        </div>
      </header>

      {error ? <Alert variant="error">{messageForError(t, error)}</Alert> : null}

      {loading ? (
        <MonthGridSkeleton />
      ) : (
        <>
          <MonthGrid cells={cells} currency={currency} busyId={busyId} onToggle={toggle} />

          <ul className={styles.mobileList}>
            {items.map((occurrence, index) => (
              <OccurrenceRow
                key={occurrence.id}
                occurrence={occurrence}
                currency={currency}
                busy={busyId === occurrence.id}
                index={index}
                onToggle={toggle}
              />
            ))}
          </ul>

          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span
                className={styles.swatch}
                style={{ backgroundColor: "var(--color-accent-soft)" }}
              />
              {t("calendar.legendSubscription")}
            </span>
            <span className={styles.legendItem}>
              <span
                className={styles.swatch}
                style={{ backgroundColor: "var(--color-invoice-soft)" }}
              />
              {t("calendar.legendInvoice")}
            </span>
            <span className={styles.legendItem}>
              <span
                className={styles.swatch}
                style={{ backgroundColor: "var(--color-paid-soft)" }}
              />
              {t("calendar.legendPaid")}
            </span>
            <span className={styles.legendItem}>{t("calendar.legendHint")}</span>
          </div>
        </>
      )}
    </div>
  );
}
