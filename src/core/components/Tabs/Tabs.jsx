import { useRef } from "react";

import { cx } from "../../utils/classNames";
import styles from "./Tabs.module.css";

const OFFSETS = { ArrowRight: 1, ArrowLeft: -1 };

export function Tabs({ items, value, onChange, label, className }) {
  const buttons = useRef([]);

  const focusAt = (index) => {
    const target = buttons.current[index];
    if (target) {
      target.focus();
      onChange(items[index].id);
    }
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusAt(items.length - 1);
      return;
    }
    const offset = OFFSETS[event.key];
    if (offset) {
      event.preventDefault();
      focusAt((index + offset + items.length) % items.length);
    }
  };

  return (
    <div className={cx(styles.tabs, className)} role="tablist" aria-label={label}>
      {items.map((item, index) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active}
            aria-controls={`panel-${item.id}`}
            tabIndex={active ? 0 : -1}
            className={cx(styles.tab, active && styles.active)}
            onClick={() => onChange(item.id)}
            onKeyDown={handleKeyDown(index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, children, className }) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={cx(styles.panel, className)}
    >
      {children}
    </div>
  );
}
