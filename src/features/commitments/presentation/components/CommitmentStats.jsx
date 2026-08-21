import { useTranslation } from "../../../../core/translation/useTranslation";
import { formatMoney, relativeDue } from "../../domain/formatting";
import styles from "../styles/commitments.module.css";

function Tile({ label, value, note, muted }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={muted ? styles.statValueMuted : styles.statValue}>{value}</span>
      <span className={styles.statNote}>{note}</span>
    </div>
  );
}

export function CommitmentStats({ month, due, pending, rate, next, currency }) {
  const { t } = useTranslation();

  return (
    <div className={styles.stats}>
      <Tile
        label={t("commitments.statThisMonth")}
        value={pending || !due ? "—" : formatMoney(month, currency)}
        muted={pending || !due}
        note={
          pending
            ? t("common.loading")
            : due
              ? t("commitments.statDueCount", { count: due })
              : t("commitments.statNothingDue")
        }
      />

      <Tile
        label={t("commitments.statPerYear")}
        value={rate.annual === null ? "—" : formatMoney(rate.annual, currency)}
        muted={rate.annual === null}
        note={
          rate.annual === null
            ? t("commitments.statNoRecurring")
            : rate.oneoff
              ? t("commitments.statExcluded", { count: rate.oneoff })
              : t("commitments.statRecurring", { count: rate.lines })
        }
      />

      <Tile
        label={t("commitments.statNext")}
        value={next ? next.title : "—"}
        muted={!next}
        note={next ? relativeDue(t, next.nextDueDate) : t("commitments.statNoNext")}
      />
    </div>
  );
}
