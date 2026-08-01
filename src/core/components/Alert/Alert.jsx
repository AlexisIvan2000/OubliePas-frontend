import { cx } from "../../utils/classNames";
import styles from "./Alert.module.css";

export function Alert({ variant = "info", children, details, className }) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={cx(styles.alert, styles[variant], className)}
      role={variant === "error" ? "alert" : "status"}
    >
      <div>
        {children}
        {details?.length ? (
          <ul className={styles.list}>
            {details.map((detail) => (
              <li key={`${detail.field}-${detail.message}`}>{detail.message}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
