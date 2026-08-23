import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cx } from "../../utils/classNames";
import { useDismiss } from "../../utils/useDismiss";
import { Icon } from "../Icon/Icon";
import { opensUpward } from "./placement";
import styles from "./Picker.module.css";

const TYPEAHEAD_RESET = 700;

export function Picker({
  label,
  value,
  options,
  disabled,
  trailing,
  variant,
  invalid,
  describedBy,
  className,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [active, setActive] = useState(0);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();
  const { leaving, dismiss } = useDismiss(130);

  const selected = options.findIndex((option) => option.value === value);
  const current = options[selected] ?? null;

  const close = useCallback(
    (refocus = true) => {
      dismiss(() => {
        setOpen(false);
        if (refocus) {
          triggerRef.current?.focus();
        }
      });
    },
    [dismiss],
  );

  const start = () => {
    const box = triggerRef.current?.getBoundingClientRect();
    if (box) {
      setUp(opensUpward(box, window.innerHeight));
    }
    setActive(selected < 0 ? 0 : selected);
    setOpen(true);
  };

  const pick = (option) => {
    close();
    if (option.value !== value) {
      onChange(option.value);
    }
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onPointerDown = (event) => {
      const inside =
        listRef.current?.contains(event.target) || triggerRef.current?.contains(event.target);
      if (!inside) {
        close(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active]);

  const onKeyDown = (event) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        start();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "Tab") {
      close(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(options[active]);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) => (index + step + options.length) % options.length);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : options.length - 1);
      return;
    }
    if (event.key.length === 1) {
      const now = Date.now();
      const text = (now - typed.current.at > TYPEAHEAD_RESET ? "" : typed.current.text) + event.key;
      typed.current = { text, at: now };
      const found = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(text.toLowerCase()),
      );
      if (found >= 0) {
        setActive(found);
      }
    }
  };

  return (
    <div className={cx(styles.wrap, className)}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(
          styles.trigger,
          variant === "inline" && styles.inline,
          variant === "field" && styles.field,
          invalid && styles.invalid,
          open && styles.triggerOpen,
        )}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? close() : start())}
        onKeyDown={onKeyDown}
      >
        <span className={styles.value}>{current?.label ?? value}</span>
        {trailing ?? <Icon name="expand" size={15} className={styles.chevron} />}
      </button>

      {open ? (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${listId}-${active}`}
          tabIndex={-1}
          className={cx(styles.list, up && styles.up, leaving && styles.leaving)}
          onKeyDown={onKeyDown}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              data-active={index === active}
              className={cx(
                styles.option,
                index === active && styles.optionActive,
                option.value === value && styles.optionSelected,
              )}
              style={{ "--enter-delay": `${Math.min(index, 8) * 26}ms` }}
              onPointerEnter={() => setActive(index)}
              onClick={() => pick(option)}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              {option.value === value ? <Icon name="done" size={15} /> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
