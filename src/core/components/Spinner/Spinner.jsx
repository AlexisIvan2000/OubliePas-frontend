import { useTranslation } from "../../translation/useTranslation";
import styles from "./Spinner.module.css";

export function Spinner({ size = 18, thickness = 2 }) {
  const { t } = useTranslation();

  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size, borderWidth: thickness }}
      role="status"
      aria-label={t("common.loading")}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className={styles.center}>
      <Spinner size={26} />
    </div>
  );
}
