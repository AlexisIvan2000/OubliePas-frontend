import { useEffect, useRef } from "react";

import { cx } from "../../utils/classNames";
import { useDismiss } from "../../utils/useDismiss";
import { useScrollLock } from "../../utils/useScrollLock";
import { Button } from "../Button/Button";
import styles from "./ConfirmDialog.module.css";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);
  const { leaving, dismiss } = useDismiss();

  useScrollLock(open);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    confirmRef.current?.focus();
    const handler = (event) => {
      if (event.key === "Escape") {
        dismiss(onCancel);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel, dismiss]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cx(styles.overlay, leaving && styles.leavingVeil)}
      onMouseDown={() => dismiss(onCancel)}
    >
      <div
        className={cx(styles.dialog, leaving && styles.leaving)}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => dismiss(onCancel)}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant="danger" onClick={() => dismiss(onConfirm)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
