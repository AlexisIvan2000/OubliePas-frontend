import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cx } from "../../utils/classNames";
import { useDismiss } from "../../utils/useDismiss";
import { Icon } from "../Icon/Icon";
import styles from "./Menu.module.css";

const ITEM_SELECTOR = "[role='menuitem']:not(:disabled)";

export function Menu({ label, icon = "more", items, className }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();
  const { leaving, dismiss } = useDismiss(130);

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

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    listRef.current?.querySelector(ITEM_SELECTOR)?.focus();

    const onPointerDown = (event) => {
      const inside =
        listRef.current?.contains(event.target) || triggerRef.current?.contains(event.target);
      if (!inside) {
        close(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, close]);

  const onListKeyDown = (event) => {
    if (event.key === "Tab") {
      close(false);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const nodes = [...listRef.current.querySelectorAll(ITEM_SELECTOR)];
    const step = event.key === "ArrowDown" ? 1 : -1;
    const current = nodes.indexOf(document.activeElement);
    const next = (current + step + nodes.length) % nodes.length;
    nodes[next]?.focus();
  };

  return (
    <div className={cx(styles.wrap, className)}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles.trigger, open && styles.triggerOpen)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name={icon} size={16} />
      </button>

      {open ? (
        <div
          ref={listRef}
          id={listId}
          role="menu"
          aria-label={label}
          className={cx(styles.list, leaving && styles.leaving)}
          onKeyDown={onListKeyDown}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={cx(styles.item, item.tone === "danger" && styles.danger)}
              onClick={() => {
                close();
                item.onSelect();
              }}
            >
              {item.icon ? <Icon name={item.icon} size={16} /> : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
