import { cx } from "../../../../core/utils/classNames";
import { checkPassword } from "../../domain/validation";
import styles from "../styles/PasswordRules.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

const VERDICTS = ["", "Faible", "Moyen", "Bon", "Solide"];

function toneFor(score) {
  if (score <= 1) {
    return "weak";
  }
  if (score <= 3) {
    return "medium";
  }
  return "strong";
}

export function PasswordRules({ value = "" }) {
  const { t } = useTranslation();
  const rules = checkPassword(t, value);
  const score = rules.filter((rule) => rule.valid).length;
  const tone = toneFor(score);

  return (
    <div className={cx(styles.wrapper, styles[tone])}>
      <div className={styles.meter}>
        <div className={styles.segments}>
          {rules.map((rule, index) => (
            <span key={rule.id} className={cx(styles.segment, index < score && styles.on)} />
          ))}
        </div>
        <span className={styles.verdict} aria-live="polite">
          {value ? VERDICTS[score] : ""}
        </span>
      </div>

      <ul className={styles.list}>
        {rules.map((rule) => (
          <li key={rule.id} className={cx(styles.rule, rule.valid && styles.valid)}>
            <span className={styles.mark} aria-hidden="true">
              {rule.valid ? "✓" : ""}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
