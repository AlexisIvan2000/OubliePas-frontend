import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cx } from "../../utils/classNames";
import styles from "./Toast.module.css";
import { ToastContext } from "./ToastContext";

const DURATION = 2600;
const EXIT = 200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Set());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismiss = useCallback(
    (id) => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
      );

      const timer = setTimeout(() => {
        timers.current.delete(timer);
        remove(id);
      }, EXIT);
      timers.current.add(timer);
    },
    [remove],
  );

  const push = useCallback(
    (message, variant = "success") => {
      if (!message) {
        return;
      }
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { id, message, variant }]);

      const timer = setTimeout(() => {
        timers.current.delete(timer);
        dismiss(id);
      }, DURATION);
      timers.current.add(timer);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      push,
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.stack} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              styles.toast,
              toast.variant === "error" && styles.error,
              toast.leaving && styles.leaving,
            )}
            onClick={() => !toast.leaving && dismiss(toast.id)}
          >
            <span className={styles.mark} aria-hidden="true">
              {toast.variant === "error" ? "!" : "✓"}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
