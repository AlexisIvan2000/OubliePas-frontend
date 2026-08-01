import { useTranslation } from "../../translation/useTranslation";
import { cx } from "../../utils/classNames";
import styles from "./SettingsSection.module.css";

export function SettingsSection({
  title,
  description,
  editing = false,
  onEdit,
  onCancel,
  editLabel,
  children,
  className,
}) {
  const { t } = useTranslation();
  const action = editing ? onCancel : onEdit;

  return (
    <section className={cx(styles.section, className)}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {action ? (
          <button type="button" className={styles.action} onClick={action}>
            {editing ? t("common.cancel") : (editLabel ?? t("common.edit"))}
          </button>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function SettingsRows({ children }) {
  return <div className={styles.rows}>{children}</div>;
}

export function SettingsRow({ label, value, placeholder }) {
  const { t } = useTranslation();
  const fallback = placeholder ?? t("common.none");

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={cx(styles.value, !value && styles.empty)}>{value || fallback}</span>
    </div>
  );
}
