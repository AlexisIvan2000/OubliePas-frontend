import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useTranslation } from "../../translation/useTranslation";
import { cx } from "../../utils/classNames";
import { formatDate, formatMonth, formatWeekdays } from "../../utils/formatting";
import { useDismiss } from "../../utils/useDismiss";
import { Icon } from "../Icon/Icon";
import { opensUpward } from "../Picker/placement";
import styles from "./DateField.module.css";
import { WEEK, fromIso, monthDays, monthKey, outOfRange, shiftMonth, toIso } from "./monthDays";

const STEPS = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -WEEK,
  ArrowDown: WEEK,
};

export function DateField({
  label,
  value,
  onChange,
  min,
  max,
  hint,
  error,
  required,
  placeholder,
  className,
}) {
  const { t } = useTranslation();
  const id = useId();
  const root = useRef(null);
  const gridRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [upward, setUpward] = useState(false);
  const [cursor, setCursor] = useState(() => fromIso(value) ?? new Date());
  const { leaving, dismiss } = useDismiss();

  const today = toIso(new Date());
  const selected = value || null;
  const days = useMemo(() => monthDays(cursor), [cursor]);
  const weekdays = useMemo(() => formatWeekdays(), []);

  const close = () => dismiss(() => setOpen(false));

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const away = (event) => {
      if (root.current && !root.current.contains(event.target)) {
        close();
      }
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  });

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    const box = root.current?.getBoundingClientRect();
    if (box) {
      setUpward(opensUpward(box, window.innerHeight));
    }
    setCursor(fromIso(value) ?? new Date());
    setOpen(true);
  };

  const pick = (iso) => {
    if (outOfRange(iso, min, max)) {
      return;
    }
    onChange(iso);
    close();
  };

  const move = (from, step) => {
    const base = fromIso(from) ?? new Date();
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + step);
    const iso = toIso(next);
    if (outOfRange(iso, min, max)) {
      return;
    }
    setCursor(next);
    onChange(iso);
    requestAnimationFrame(() => {
      gridRef.current?.querySelector('[data-active="true"]')?.focus();
    });
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      setCursor((current) => shiftMonth(current, event.key === "PageUp" ? -1 : 1));
      return;
    }
    const step = STEPS[event.key];
    if (step) {
      event.preventDefault();
      move(selected ?? today, step);
    }
  };

  const active = selected ?? today;
  const describedBy = cx(error && `${id}-error`, !error && hint && `${id}-hint`) || undefined;

  return (
    <div className={cx(styles.field, className)} ref={root}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      <button
        type="button"
        id={id}
        className={cx(styles.trigger, open && styles.triggerOpen, error && styles.invalid)}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        <span className={cx(styles.value, !selected && styles.placeholder)}>
          {selected ? formatDate(selected) : (placeholder ?? t("date.choose"))}
        </span>
        <Icon name="calendar" size={16} className={styles.triggerIcon} />
      </button>

      {open ? (
        <div
          className={cx(styles.pop, upward && styles.upward, leaving && styles.leaving)}
          role="dialog"
          aria-label={label}
          onKeyDown={onKeyDown}
        >
          <div className={styles.head}>
            <button
              type="button"
              className={styles.nav}
              onClick={() => setCursor((current) => shiftMonth(current, -1))}
              aria-label={t("date.previousMonth")}
            >
              <Icon name="previous" size={15} />
            </button>
            <span className={styles.month} aria-live="polite">
              {formatMonth(monthKey(cursor))}
            </span>
            <button
              type="button"
              className={styles.nav}
              onClick={() => setCursor((current) => shiftMonth(current, 1))}
              aria-label={t("date.nextMonth")}
            >
              <Icon name="next" size={15} />
            </button>
          </div>

          <div className={styles.weekdays} aria-hidden="true">
            {weekdays.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>

          <div className={styles.grid} role="grid" ref={gridRef}>
            {days.map((cell, index) => {
              const disabled = outOfRange(cell.iso, min, max);
              return (
                <button
                  key={cell.iso}
                  type="button"
                  role="gridcell"
                  tabIndex={cell.iso === active ? 0 : -1}
                  data-active={cell.iso === active ? "true" : undefined}
                  disabled={disabled}
                  aria-selected={cell.iso === selected}
                  aria-label={formatDate(cell.iso)}
                  className={cx(
                    styles.day,
                    cell.outside && styles.outside,
                    cell.iso === today && styles.today,
                    cell.iso === selected && styles.selected,
                  )}
                  style={{ "--cell": `${index % WEEK}` }}
                  onClick={() => pick(cell.iso)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className={styles.foot}>
            <button
              type="button"
              className={styles.quick}
              disabled={outOfRange(today, min, max)}
              onClick={() => pick(today)}
            >
              {t("date.today")}
            </button>
            {value ? (
              <button
                type="button"
                className={styles.quick}
                onClick={() => {
                  onChange("");
                  close();
                }}
              >
                {t("date.clear")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
