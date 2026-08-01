import { useId } from "react";

import { cx } from "../../utils/classNames";
import styles from "./SelectField.module.css";

export function SelectField({ label, error, hint, options, className, id, ...rest }) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className={cx(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}

      <div className={styles.control}>
        <select
          id={selectId}
          className={cx(styles.select, error && styles.invalid)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          ▼
        </span>
      </div>

      {error ? (
        <span className={styles.error} id={`${selectId}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className={styles.hint} id={`${selectId}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
