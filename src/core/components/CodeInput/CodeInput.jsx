import { useId, useRef, useState } from "react";

import { cx } from "../../utils/classNames";
import styles from "./CodeInput.module.css";

function toChars(value, length) {
  return Array.from({ length }, (_, index) => value[index] ?? "");
}

export function CodeInput({ value = "", onChange, label, error, length = 6, className }) {
  const generatedId = useId();
  const inputs = useRef([]);
  const [chars, setChars] = useState(() => toChars(value, length));
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setChars(toChars(value, length));
  }

  const focusAt = (index) => {
    const target = inputs.current[Math.min(Math.max(index, 0), length - 1)];
    target?.focus();
    target?.select();
  };

  const commit = (next) => {
    const joined = next.join("");
    setChars(next);
    setSyncedValue(joined);
    onChange(joined);
  };

  const handleChange = (index) => (event) => {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    const next = chars.slice();
    next[index] = digit;
    commit(next);
    if (digit) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === "Backspace" && !chars[index]) {
      event.preventDefault();
      const next = chars.slice();
      next[index - 1] = "";
      commit(next);
      focusAt(index - 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) {
      return;
    }
    event.preventDefault();
    commit(toChars(digits, length));
    focusAt(digits.length);
  };

  return (
    <div className={cx(styles.field, className)}>
      {label ? (
        <span className={styles.label} id={`${generatedId}-label`}>
          {label}
        </span>
      ) : null}

      <div
        className={styles.boxes}
        style={{ "--code-length": length }}
        role="group"
        aria-labelledby={label ? `${generatedId}-label` : undefined}
        onPaste={handlePaste}
      >
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            className={cx(styles.box, char && styles.filled, error && styles.invalid)}
            value={char}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onFocus={(event) => event.target.select()}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Chiffre ${index + 1} sur ${length}`}
            aria-invalid={Boolean(error)}
          />
        ))}
      </div>

      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
