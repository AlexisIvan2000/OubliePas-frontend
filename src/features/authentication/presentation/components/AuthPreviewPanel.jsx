import { useTranslation } from "../../../../core/translation/useTranslation";
import { formatMoney, formatShortDate } from "../../../../core/utils/formatting";
import styles from "../styles/authPanels.module.css";

const SAMPLE_ROWS = [
  { name: "Salle de sport Vitalis", day: "2026-08-01", amount: 39 },
  { name: "Netflix", day: "2026-08-03", amount: 15.49 },
  { name: "Spotify Family", day: "2026-08-06", amount: 17.99 },
];

const SAMPLE_TOTAL = 182.74;
const SAMPLE_GHOST = 35.98;
const SAMPLE_CURRENCY = "CAD";

export function AuthPreviewPanel() {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.eyebrow}>{t("preview.heading")}</div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>{t("preview.monthlyTotal")}</div>
        <div className={styles.amount}>{formatMoney(SAMPLE_TOTAL, SAMPLE_CURRENCY)}</div>

        <div className={styles.divider} />

        <div className={styles.rows}>
          {SAMPLE_ROWS.map((row) => (
            <div className={styles.row} key={row.name}>
              <span className={styles.dot} />
              <span className={styles.rowName}>{row.name}</span>
              <span className={styles.rowWhen}>{formatShortDate(row.day)}</span>
              <span className={styles.rowAmount}>
                {formatMoney(row.amount, SAMPLE_CURRENCY)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.splitCard}>
          <div className={styles.splitLabel}>{t("preview.ghostSpending")}</div>
          <div className={styles.splitValue}>{formatMoney(SAMPLE_GHOST, SAMPLE_CURRENCY)}</div>
          <div className={styles.splitNote}>{t("preview.ghostNote")}</div>
        </div>
        <div className={styles.splitCard}>
          <div className={styles.splitLabel}>{t("preview.nextDue")}</div>
          <div className={styles.splitValue}>{formatShortDate(SAMPLE_ROWS[0].day)}</div>
          <div className={styles.splitNote}>{SAMPLE_ROWS[0].name}</div>
        </div>
      </div>
    </>
  );
}
