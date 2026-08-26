import { useMemo, useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Chip } from "../../../../core/components/Chip/Chip";
import { Icon } from "../../../../core/components/Icon/Icon";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useToday } from "../../../../core/utils/useToday";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { buildMonthCells } from "../../domain/calendar";
import { CALENDAR_FILTERS, filterByType } from "../../domain/commitment";
import { formatMoney, formatMonth, parseDate } from "../../domain/formatting";
import { DayDialog } from "../components/DayDialog";
import { MonthGrid } from "../components/MonthGrid";
import { MonthGridSkeleton } from "../components/MonthGridSkeleton";
import { OccurrenceRow } from "../components/OccurrenceRow";
import { SettleDialog } from "../components/SettleDialog";
import { monthRange, useOccurrences } from "../providers/useOccurrences";
import { useSettle } from "../providers/useSettle";
import styles from "../styles/calendar.module.css";
import listStyles from "../styles/commitments.module.css";

const EMPTY_SUMMARY = {
  all: "calendar.nothingThisMonth",
  subscription: "calendar.noSubscriptions",
  invoice: "calendar.noInvoices",
};

export function CalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cursor, setCursor] = useState(() => new Date());
  const [kind, setKind] = useState("all");
  const [openDay, setOpenDay] = useState(null);
  const today = useToday();

  useDocumentTitle(t("calendar.documentTitle"));

  const range = useMemo(() => monthRange(cursor), [cursor]);
  const { items: all, loading, error, setItems } = useOccurrences(range);

  const items = useMemo(() => filterByType(all, kind), [all, kind]);

  const currency = user?.currency ?? "CAD";
  const monthLabel = formatMonth(range.start.slice(0, 7));

  const cells = useMemo(
    () => buildMonthCells(cursor, items, parseDate(today)),
    [cursor, items, today],
  );

  const dayOccurrences = useMemo(
    () => (openDay ? items.filter((row) => row.dueDate === openDay) : []),
    [openDay, items],
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

  const settle = useSettle((updated) => {
    setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
  });

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
                : t(EMPTY_SUMMARY[kind])}
          </div>
        </div>

        <div className={styles.tools}>
          <div className={styles.filters} role="group" aria-label={t("calendar.filterLabel")}>
            {CALENDAR_FILTERS.map((filter) => (
              <Chip
                key={filter.id}
                active={kind === filter.id}
                onClick={() => setKind(filter.id)}
              >
                {t(filter.labelKey)}
              </Chip>
            ))}
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
        </div>
      </header>

      {error ? <Alert variant="error">{messageForError(t, error)}</Alert> : null}

      {loading ? (
        <MonthGridSkeleton />
      ) : (
        <>
          <MonthGrid
            cells={cells}
            currency={currency}
            busyId={settle.busyId}
            onToggle={settle.pick}
            onOpenDay={(cell) => setOpenDay(cell.iso)}
          />

          <ul className={styles.mobileList}>
            {items.map((occurrence, index) => (
              <OccurrenceRow
                key={occurrence.id}
                occurrence={occurrence}
                currency={currency}
                busy={settle.busyId === occurrence.id}
                index={index}
                onToggle={settle.pick}
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

      {openDay && dayOccurrences.length ? (
        <DayDialog
          day={openDay}
          occurrences={dayOccurrences}
          currency={currency}
          busyId={settle.busyId}
          blocked={Boolean(settle.target)}
          onToggle={settle.pick}
          onClose={() => setOpenDay(null)}
        />
      ) : null}

      {settle.target ? (
        <SettleDialog
          occurrence={settle.target}
          currency={currency}
          busy={settle.busyId === settle.target.id}
          onSettle={settle.settle}
          onClose={settle.close}
        />
      ) : null}
    </div>
  );
}
