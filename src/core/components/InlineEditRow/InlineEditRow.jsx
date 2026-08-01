import { useCallback, useRef, useState } from "react";

import { cx } from "../../utils/classNames";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import styles from "./InlineEditRow.module.css";

function useFocusOnMount() {
  return useCallback((node) => {
    if (node) {
      node.focus();
      node.select();
    }
  }, []);
}

export function InlineEditRow({
  label,
  value,
  placeholder,
  onSave,
  maxLength = 80,
  autoComplete,
  name,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const settled = useRef(false);
  const focusOnMount = useFocusOnMount();

  const current = value ?? "";

  const open = () => {
    setDraft(current);
    setEditing(true);
    settled.current = false;
  };

  const close = () => {
    setEditing(false);
    setSaving(false);
    settled.current = true;
  };

  const commit = () => {
    if (settled.current) {
      return;
    }
    settled.current = true;
    const next = draft.trim();
    if (next === current) {
      setEditing(false);
      return;
    }
    setSaving(true);
    Promise.resolve(onSave(next)).then(close, close);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  if (editing) {
    return (
      <div className={styles.row}>
        <span className={styles.label}>{label}</span>
        <span className={styles.editor}>
          <input
            ref={focusOnMount}
            className={styles.input}
            name={name}
            autoComplete={autoComplete}
            maxLength={maxLength}
            value={draft}
            disabled={saving}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
          />
          {saving ? <Spinner size={14} /> : null}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={cx(styles.trigger, !current && styles.placeholder)}
        onClick={open}
      >
        <span className={styles.text}>{current || placeholder}</span>
        <Icon name="edit" size={15} className={styles.pencil} />
      </button>
    </div>
  );
}

export function InlineSelectRow({ label, value, options, onChange, name }) {
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const next = event.target.value;
    if (next === value) {
      return;
    }
    setSaving(true);
    Promise.resolve(onChange(next)).then(
      () => setSaving(false),
      () => setSaving(false),
    );
  };

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.selectWrap}>
        <select
          className={styles.select}
          name={name}
          value={value ?? ""}
          disabled={saving}
          onChange={handleChange}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.caret}>
          {saving ? <Spinner size={14} /> : <Icon name="expand" size={15} />}
        </span>
      </span>
    </div>
  );
}
