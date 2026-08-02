import { cx } from "../../utils/classNames";
import styles from "./Switch.module.css";

export function Switch({ checked = false, disabled = false, label, onChange, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cx(styles.track, checked && styles.on, className)}
      onClick={() => onChange?.(!checked)}
    >
      <span className={styles.thumb} />
    </button>
  );
}
