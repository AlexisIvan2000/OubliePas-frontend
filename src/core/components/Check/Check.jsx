import { cx } from "../../utils/classNames";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Check.module.css";

export function Check({ paid, busy, label, onClick, compact }) {
  return (
    <button
      type="button"
      className={cx(styles.check, compact && styles.compact, paid && styles.paid)}
      onClick={onClick}
      disabled={busy}
      aria-label={label}
    >
      {busy ? (
        <Spinner size={14} />
      ) : (
        <span key={String(paid)} className={styles.mark} aria-hidden="true">
          <span className={styles.circle} />
          <Icon name="done" size={18} className={styles.tick} />
        </span>
      )}
    </button>
  );
}
