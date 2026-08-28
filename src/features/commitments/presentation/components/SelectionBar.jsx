import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import styles from "../styles/selection.module.css";

export function SelectionBar({
  count,
  total,
  allPicked,
  actions,
  busy,
  onAction,
  onToggleAll,
  onCancel,
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.bar} role="toolbar" aria-label={t("commitments.selectionToolbar")}>
      <span className={styles.count}>{t("commitments.selectionCount", { count })}</span>

      <button type="button" className={styles.link} onClick={onToggleAll}>
        {allPicked
          ? t("commitments.selectNone")
          : t("commitments.selectAll", { count: total })}
      </button>

      <span className={styles.spacer} />

      <div className={styles.actions}>
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            className={styles.action}
            onClick={() => onAction(action.status)}
            disabled={busy}
          >
            <Icon name={action.icon} size={15} />
            {action.partial
              ? t("commitments.bulkPartial", {
                  label: t(action.labelKey),
                  count: action.count,
                })
              : t(action.labelKey)}
          </button>
        ))}

        <button
          type="button"
          className={styles.danger}
          onClick={() => onAction("deleted")}
          disabled={busy || !count}
        >
          <Icon name="delete" size={15} />
          {t("common.delete")}
        </button>
      </div>

      <button type="button" className={styles.cancel} onClick={onCancel}>
        {t("common.cancel")}
      </button>
    </div>
  );
}
