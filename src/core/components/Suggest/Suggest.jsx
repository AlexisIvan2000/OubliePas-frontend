import { useEffect, useId, useRef, useState } from "react";

import { cx } from "../../utils/classNames";
import { TextField } from "../TextField/TextField";
import styles from "./Suggest.module.css";

export function Suggest({
  items,
  onPick,
  renderLabel,
  renderMeta,
  emptyHint,
  countLabel,
  value,
  onChange,
  ...rest
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const listId = useId();

  const visible = open && items.length > 0;

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [visible]);

  const choose = (entry) => {
    setOpen(false);
    setActive(-1);
    onPick(entry);
  };

  const handleChange = (event) => {
    setActive(-1);
    setOpen(event.target.value.trim().length > 0);
    onChange(event);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      if (visible) {
        event.stopPropagation();
        setOpen(false);
      }
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    if (!visible) {
      if (event.key === "ArrowDown" && value.trim()) {
        setOpen(true);
        setActive(0);
        event.preventDefault();
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = (active + step + items.length + 1) % (items.length + 1);
      setActive(next === items.length ? -1 : next);
      return;
    }

    if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(items[active]);
    }
  };

  const activeId = active >= 0 ? `${listId}-${active}` : undefined;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <TextField
        {...rest}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={visible}
        aria-controls={visible ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
      />

      {visible ? (
        <ul className={styles.list} id={listId} role="listbox">
          {items.map((entry, index) => (
            <li
              key={entry.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={cx(styles.option, index === active && styles.active)}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(entry)}
            >
              <span className={styles.optionLabel}>{renderLabel(entry)}</span>
              <span className={styles.optionMeta}>{renderMeta(entry)}</span>
            </li>
          ))}
          {emptyHint ? <li className={styles.hint}>{emptyHint}</li> : null}
        </ul>
      ) : null}

      <span className={styles.live} role="status" aria-live="polite">
        {visible ? countLabel(items.length) : ""}
      </span>
    </div>
  );
}
