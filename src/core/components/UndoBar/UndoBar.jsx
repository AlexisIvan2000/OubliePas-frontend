import { useEffect } from "react";

import { useTranslation } from "../../translation/useTranslation";
import styles from "./UndoBar.module.css";

export const UNDO_DELAY = 6000;

export function UndoBar({ message, busy, onUndo, onDismiss }) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDismiss, UNDO_DELAY);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.action} onClick={onUndo} disabled={busy}>
        {t("common.undo")}
      </button>
      <span
        className={styles.timer}
        style={{ "--undo-delay": `${UNDO_DELAY}ms` }}
        aria-hidden="true"
      />
    </div>
  );
}
