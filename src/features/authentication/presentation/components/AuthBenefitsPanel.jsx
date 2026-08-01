import { useTranslation } from "../../../../core/translation/useTranslation";
import styles from "../styles/authPanels.module.css";

const BENEFITS = ["oneView", "reminders", "ghost", "budget"];

export function AuthBenefitsPanel() {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.eyebrow}>{t("benefits.heading")}</div>
      <div className={styles.benefits}>
        {BENEFITS.map((key) => (
          <div className={styles.benefit} key={key}>
            <div className={styles.benefitTitle}>{t(`benefits.${key}Title`)}</div>
            <div className={styles.benefitBody}>{t(`benefits.${key}Body`)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
