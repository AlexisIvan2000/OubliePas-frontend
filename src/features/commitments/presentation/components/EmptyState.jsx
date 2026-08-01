import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import styles from "../styles/commitments.module.css";

export function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>
        <Icon name={icon} size={26} />
      </span>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyMessage}>{message}</p>
      {actionLabel ? (
        <Button fullWidth={false} compact onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
