import { cx } from "../../utils/classNames";
import styles from "./Chip.module.css";

export function Chip({ active = false, children, className, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(styles.chip, active && styles.active, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
