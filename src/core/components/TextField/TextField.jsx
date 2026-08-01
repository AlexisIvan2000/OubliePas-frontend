import { useId } from "react";

import { cx } from "../../utils/classNames";
import styles from "./TextField.module.css";

export function TextField({
  label,
  error,
  hint,
  trailing,
  className,
  id,
  ...rest
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cx(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <div className={cx(styles.control, trailing && styles.hasTrailing)}>
        <input
          id={inputId}
          className={cx(styles.input, error && styles.invalid)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        />
        {trailing}
      </div>

      {error ? (
        <span className={styles.error} id={`${inputId}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className={styles.hint} id={`${inputId}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
