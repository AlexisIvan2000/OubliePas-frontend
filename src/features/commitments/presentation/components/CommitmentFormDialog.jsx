import { useEffect, useMemo, useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { SelectField } from "../../../../core/components/SelectField/SelectField";
import { TextField } from "../../../../core/components/TextField/TextField";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { createCommitment, updateCommitment } from "../../data/commitmentsApi";
import {
  COMMITMENT_TYPES,
  categoryOptions,
  emptyForm,
  formFromCommitment,
  frequencyOptions,
  toCommitmentPayload,
} from "../../domain/commitment";
import styles from "../styles/commitmentForm.module.css";

export function CommitmentFormDialog({ type, commitment, onClose, onSaved }) {
  const { t } = useTranslation();
  const editing = Boolean(commitment);
  const [form, setForm] = useState(() =>
    commitment ? formFromCommitment(commitment) : emptyForm(type),
  );

  const save = useAsyncAction((payload) =>
    editing ? updateCommitment(commitment.id, payload) : createCommitment(payload),
  );

  const frequencies = useMemo(() => frequencyOptions(t), [t]);
  const categories = useMemo(() => categoryOptions(t, type), [t, type]);

  useEffect(() => {
    const handler = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const result = await save.run(toCommitmentPayload(form));
    if (result.ok) {
      onSaved(result.data);
      onClose();
    }
  };

  const meta = COMMITMENT_TYPES[type];
  const heading = editing
    ? t("form.editTitle", { title: form.title || t(meta.labelKey) })
    : t(meta.formTitleKey);

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 className={styles.title}>{heading}</h2>
          <p className={styles.subtitle}>{t(meta.formHintKey)}</p>
        </header>

        <form className={styles.form} onSubmit={submit} noValidate>
          <Alert variant="error" details={save.error?.fieldErrors}>
            {save.error ? messageForError(t, save.error) : null}
          </Alert>

          <TextField
            label={t("form.name")}
            value={form.title}
            onChange={set("title")}
            placeholder={t(meta.namePlaceholderKey)}
            maxLength={100}
            required
            autoFocus
          />

          <div className={styles.pair}>
            <TextField
              label={t("form.amount")}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={set("amount")}
              placeholder={t("form.amountPlaceholder")}
              required
            />
            <SelectField
              label={t("form.frequency")}
              value={form.frequency}
              onChange={set("frequency")}
              options={frequencies}
            />
          </div>

          <SelectField
            label={t("form.category")}
            value={form.category}
            onChange={set("category")}
            options={categories}
          />

          <div className={styles.pair}>
            <TextField
              label={t("form.firstDueDate")}
              type="date"
              value={form.startsOn}
              onChange={set("startsOn")}
              required
            />
            <TextField
              label={t("form.endDate")}
              type="date"
              value={form.endsOn}
              onChange={set("endsOn")}
              hint={t("form.endDateHint")}
            />
          </div>

          <div className={styles.reminder}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={form.isReminderEnabled}
                onChange={set("isReminderEnabled")}
              />
              <span>{t("form.remindMe")}</span>
            </label>

            {form.isReminderEnabled ? (
              <TextField
                label={t("form.daysBefore")}
                type="number"
                min="0"
                max="30"
                value={form.reminderDaysBefore}
                onChange={set("reminderDaysBefore")}
                className={styles.days}
              />
            ) : null}
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} disabled={save.loading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={save.loading}>
              {editing ? t("common.save") : t("common.add")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
