import { useId } from "react";

import { cx } from "../../utils/classNames";
import { Picker } from "./Picker";
import styles from "./PickerField.module.css";

export function PickerField({ label, error, hint, options, value, className, onChange }) {
  const fieldId = useId();
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={cx(styles.field, className)}>
      {label ? (
        <span className={styles.label} id={`${fieldId}-label`}>
          {label}
        </span>
      ) : null}

      <Picker
        label={label}
        value={value}
        options={options}
        variant="field"
        invalid={Boolean(error)}
        describedBy={describedBy}
        className={styles.picker}
        onChange={onChange}
      />

      {error ? (
        <span className={styles.error} id={`${fieldId}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className={styles.hint} id={`${fieldId}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
