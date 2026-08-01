import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import styles from "../styles/profileCards.module.css";

export function DangerZone() {
  const { t } = useTranslation();

  return (
    <div className={styles.danger}>
      <span className={styles.dangerHeading}>
        <Icon name="late" size={16} variant="Bold" />
        {t("settings.dangerTitle")}
      </span>

      <section className={styles.dangerCard}>
        <div className={styles.dangerBody}>
          <p className={styles.dangerText}>{t("settings.deleteAccountWarning")}</p>
          <p className={styles.dangerHint}>{t("settings.deleteAccountSoon")}</p>
        </div>

        <Button variant="danger" fullWidth={false} compact disabled>
          {t("settings.deleteAccount")}
        </Button>
      </section>
    </div>
  );
}
