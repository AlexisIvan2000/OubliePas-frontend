import { useMemo } from "react";

import { Icon } from "../../../../core/components/Icon/Icon";
import { Picker } from "../../../../core/components/Picker/Picker";
import { TextField } from "../../../../core/components/TextField/TextField";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { categoryLabel, frequencyOptions } from "../../domain/commitment";
import { formatDate } from "../../domain/formatting";
import { MAX_DAY, lineStartsOn, usesDay } from "../../domain/importing";
import styles from "../styles/importing.module.css";

export function ImportLine({ line, title, today, errors, index, onChange, onRemove }) {
  const { t } = useTranslation();
  const frequencies = useMemo(() => frequencyOptions(t), [t]);
  const starts = lineStartsOn(line, today);
  const anchored = usesDay(line.frequency);

  return (
    <li
      className={cx(styles.line, errors && styles.lineInvalid)}
      style={{ "--enter-delay": `${Math.min(index, 12) * 40}ms` }}
    >
      <div className={styles.lineHead}>
        <span className={styles.lineTitle}>{title}</span>
        <span className={styles.lineCategory}>{categoryLabel(t, line.category)}</span>
        <button
          type="button"
          className={styles.lineRemove}
          aria-label={t("import.removeLine", { title })}
          onClick={onRemove}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <div className={styles.lineFields}>
        <TextField
          className={styles.amount}
          label={t("form.amount")}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          value={line.amount}
          onChange={(event) => onChange({ amount: event.target.value })}
          error={errors?.amount ? t("import.amountMissing") : undefined}
          placeholder={t("form.amountPlaceholder")}
        />

        <div className={styles.frequency}>
          <span className={styles.fieldLabel}>{t("form.frequency")}</span>
          <Picker
            label={t("form.frequency")}
            value={line.frequency}
            options={frequencies}
            onChange={(frequency) => onChange({ frequency })}
          />
        </div>

        {anchored ? (
          <TextField
            className={styles.day}
            label={t("import.dayLabel")}
            type="number"
            inputMode="numeric"
            min="1"
            max={String(MAX_DAY)}
            value={line.day}
            onChange={(event) => onChange({ day: event.target.value })}
            error={errors?.when ? t("import.dayMissing") : undefined}
            hint={starts ? t("import.nextCharge", { date: formatDate(starts) }) : undefined}
            placeholder={t("import.dayPlaceholder")}
          />
        ) : (
          <TextField
            className={styles.day}
            label={t("form.firstDueDate")}
            type="date"
            value={line.date}
            onChange={(event) => onChange({ date: event.target.value })}
            error={errors?.when ? t("import.dateMissing") : undefined}
          />
        )}
      </div>
    </li>
  );
}
