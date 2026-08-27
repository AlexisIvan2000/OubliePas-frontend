import { useId } from "react";

import { useTranslation } from "../../translation/useTranslation";
import { cx } from "../../utils/classNames";
import { Icon } from "../Icon/Icon";
import styles from "./SearchField.module.css";

export function SearchField({ value, onChange, onClear, label, placeholder, className, id }) {
  const { t } = useTranslation();
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.srOnly} htmlFor={fieldId}>
        {label}
      </label>

      <span className={styles.leading} aria-hidden="true">
        <Icon name="search" size={16} />
      </span>

      <input
        id={fieldId}
        type="search"
        className={styles.input}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
      />

      {value ? (
        <button type="button" className={styles.clear} onClick={onClear} aria-label={t("a11y.clearSearch")}>
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
}
