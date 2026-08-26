import { useEffect, useRef } from "react";

import { cx } from "../../utils/classNames";
import { useDismiss } from "../../utils/useDismiss";
import { useReturnFocus } from "../../utils/useReturnFocus";
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
  const restoreFocus = useReturnFocus(open);
  const leave = (done) => dismiss(() => {
    restoreFocus();
    done();
  });

  useScrollLock(open);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    confirmRef.current?.focus();
    const handler = (event) => {
      if (event.key === "Escape") {
        leave(onCancel);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onCancel, dismiss]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cx(styles.overlay, leaving && styles.leavingVeil)}
      onMouseDown={() => leave(onCancel)}
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
          <Button variant="secondary" onClick={() => leave(onCancel)}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant="danger" onClick={() => leave(onConfirm)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
