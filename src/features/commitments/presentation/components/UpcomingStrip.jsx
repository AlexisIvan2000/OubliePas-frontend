import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Icon } from "../../../../core/components/Icon/Icon";
import { Spinner } from "../../../../core/components/Spinner/Spinner";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { buildStripDays } from "../../domain/calendar";
import { COMMITMENT_TYPES, categoryLabel } from "../../domain/commitment";
import { formatDate, formatMoney, formatWeekdays, relativeDue } from "../../domain/formatting";
import styles from "../styles/upcoming.module.css";

export function UpcomingStrip({ items, days, currency, busyId, onToggle }) {
  const { t } = useTranslation();
  const weekdays = formatWeekdays();
  const panelId = useId();

  const cells = useMemo(() => buildStripDays(items, new Date(), days), [items, days]);
  const firstBusy = cells.find((cell) => cell.events.length)?.iso ?? null;
  const [selected, setSelected] = useState(firstBusy);

  useEffect(() => setSelected(firstBusy), [firstBusy]);

  if (!firstBusy) {
    const [before, middle, after] = t("dashboard.upcomingEmptyAdd").split(
      /\{subscriptions\}|\{invoices\}/,
    );

    return (
      <p className={styles.none}>
        {t("dashboard.upcomingEmpty", { days })} {before}
        <Link to="/abonnements">{t("dashboard.upcomingEmptySubscriptions")}</Link>
        {middle}
        <Link to="/factures">{t("dashboard.upcomingEmptyInvoices")}</Link>
        {after}
      </p>
    );
  }

  const open = cells.find((cell) => cell.iso === selected) ?? null;

  return (
    <>
      <div className={styles.strip} role="group" aria-label={t("dashboard.stripAria", { days })}>
        {cells.map((cell, index) => (
          <button
            key={cell.iso}
            type="button"
            className={cx(
              styles.day,
              cell.isToday && styles.today,
              cell.events.length && styles.loaded,
              cell.settled && styles.settled,
              selected === cell.iso && styles.open,
            )}
            style={{ "--enter-delay": `${index * 22}ms`, "--fill": cell.fill }}
            disabled={!cell.events.length}
            aria-controls={cell.events.length ? panelId : undefined}
            aria-current={selected === cell.iso ? "true" : undefined}
            aria-label={
              cell.events.length
                ? t("dashboard.dayAria", {
                    date: formatDate(cell.iso),
                    count: cell.events.length,
                    amount: formatMoney(cell.total, currency),
                  })
                : t("dashboard.dayEmptyAria", { date: formatDate(cell.iso) })
            }
            onClick={() => setSelected(cell.iso)}
          >
            <span className={styles.weekday}>{weekdays[cell.weekday]}</span>
            <span className={styles.number}>{cell.day}</span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.bar} />
            </span>
          </button>
        ))}
      </div>

      {open ? (
        <div id={panelId} className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelDate}>{formatDate(open.iso)}</span>
            <span className={styles.panelTotal}>
              {t("dashboard.dayTotal", {
                count: open.events.length,
                amount: formatMoney(open.total, currency),
              })}
            </span>
          </div>

          <ul className={styles.lines}>
            {open.events.map((event, index) => {
              const paid = event.status === "paid";
              return (
                <li
                  key={event.id}
                  className={cx(styles.line, paid && styles.linePaid)}
                  style={{ "--enter-delay": `${index * 45}ms` }}
                >
                  <button
                    type="button"
                    className={cx(styles.check, paid && styles.checked)}
                    disabled={busyId === event.id}
                    onClick={() => onToggle(event)}
                    aria-label={t(paid ? "occurrence.markPending" : "occurrence.markPaid", {
                      title: event.title,
                    })}
                  >
                    {busyId === event.id ? (
                      <Spinner size={14} />
                    ) : (
                      <Icon name={paid ? "done" : "undone"} size={18} />
                    )}
                  </button>

                  <span className={styles.lineMain}>
                    <span className={styles.lineTitle}>
                      <Icon
                        name={COMMITMENT_TYPES[event.type].icon}
                        size={13}
                        className={styles.typeIcon}
                      />
                      {event.title}
                    </span>
                    <span className={styles.lineMeta}>
                      {categoryLabel(t, event.category)} · {relativeDue(t, event.dueDate)}
                    </span>
                  </span>

                  <span className={cx(styles.lineAmount, paid && styles.struck)}>
                    {formatMoney(event.amount, currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className={styles.footer}>
        <Link to="/calendrier" className={styles.seeMore}>
          {t("dashboard.seeCalendar")}
          <Icon name="next" size={14} />
        </Link>
      </div>
    </>
  );
}
