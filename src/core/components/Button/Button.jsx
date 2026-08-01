import { cx } from "../../utils/classNames";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Button.module.css";

export function Button({
  variant = "primary",
  type = "button",
  loading = false,
  fullWidth = true,
  compact = false,
  disabled,
  children,
  className,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        styles.button,
        styles[variant],
        compact && styles.compact,
        !fullWidth && styles.auto,
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : null}
      {children}
    </button>
  );
}
