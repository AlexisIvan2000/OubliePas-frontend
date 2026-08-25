import { Icon } from "../../../../core/components/Icon/Icon";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { OccurrenceRow } from "./OccurrenceRow";
import styles from "../styles/late.module.css";

const VISIBLE = 4;

export function LateBanner({ items, currency, busyId, onToggle }) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  const shown = items.slice(0, VISIBLE);
  const hidden = items.length - shown.length;

  return (
    <section className={styles.banner} aria-labelledby="late-title">
      <header className={styles.head}>
        <span className={styles.mark} aria-hidden="true">
          <Icon name="late" size={18} />
        </span>
        <div>
          <h2 id="late-title" className={styles.title}>
            {t("dashboard.lateTitle", { count: items.length })}
          </h2>
          <p className={styles.hint}>{t("dashboard.lateHint")}</p>
        </div>
      </header>

      <ul className={styles.rows}>
        {shown.map((occurrence, index) => (
          <OccurrenceRow
            key={occurrence.id}
            occurrence={occurrence}
            currency={currency}
            busy={busyId === occurrence.id}
            index={index}
            onToggle={onToggle}
          />
        ))}
      </ul>

      {hidden > 0 ? (
        <p className={styles.more}>{t("dashboard.lateMore", { count: hidden })}</p>
      ) : null}
    </section>
  );
}
