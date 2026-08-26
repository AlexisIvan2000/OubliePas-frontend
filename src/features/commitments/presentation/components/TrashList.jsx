import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { categoryLabel, monogram } from "../../domain/commitment";
import { categoryTint } from "../../domain/commitment";
import { daysUntil, formatMoney } from "../../domain/formatting";
import styles from "../styles/trash.module.css";

export function TrashList({ items, currency, busyId, onRestore, onEmpty }) {
  const { t } = useTranslation();

  return (
    <section className={styles.panel}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{t("commitments.trashTitle", { count: items.length })}</h2>
          <p className={styles.hint}>{t("commitments.trashHint")}</p>
        </div>
        <button type="button" className={styles.empty} onClick={onEmpty}>
          <Icon name="delete" size={15} />
          {t("commitments.trashEmpty")}
        </button>
      </header>

      <ul className={styles.list}>
        {items.map((commitment) => {
          const left = commitment.purgeOn ? daysUntil(commitment.purgeOn) : null;
          return (
            <li className={styles.row} key={commitment.id}>
              <span
                className={styles.monogram}
                style={{ "--tint": categoryTint(commitment.category) }}
                aria-hidden="true"
              >
                {monogram(commitment.title)}
              </span>

              <div className={styles.main}>
                <div className={styles.rowTitle}>{commitment.title}</div>
                <div className={styles.meta}>
                  <span>{categoryLabel(t, commitment.category)}</span>
                  <span className={styles.dot} aria-hidden="true" />
                  <span>
                    {left !== null && left <= 0
                      ? t("commitments.trashLastDay")
                      : t("commitments.trashCountdown", { count: Math.max(left ?? 0, 1) })}
                  </span>
                </div>
              </div>

              <div className={styles.amount}>{formatMoney(commitment.amount, currency)}</div>

              <Button
                variant="secondary"
                compact
                fullWidth={false}
                loading={busyId === commitment.id}
                onClick={() => onRestore(commitment)}
              >
                {t("commitments.trashRestore")}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
