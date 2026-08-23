import { useEffect, useMemo, useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { Chip } from "../../../../core/components/Chip/Chip";
import { PickerField } from "../../../../core/components/Picker/PickerField";
import { Suggest } from "../../../../core/components/Suggest/Suggest";
import { TextField } from "../../../../core/components/TextField/TextField";
import { messageForError } from "../../../../core/network/errorMessages";
import { cx } from "../../../../core/utils/classNames";
import { useDismiss } from "../../../../core/utils/useDismiss";
import { useScrollLock } from "../../../../core/utils/useScrollLock";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { useToday } from "../../../../core/utils/useToday";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { createCommitment, updateCommitment } from "../../data/commitmentsApi";
import { catalogLabel, findSuggestions } from "../../domain/catalog";
import {
  COMMITMENT_TYPES,
  MAX_NOTICE_DAYS,
  MAX_TRIAL_DAYS,
  TRIAL_PRESETS,
  categoryLabel,
  categoryOptions,
  commitmentChanges,
  emptyForm,
  formFromCommitment,
  frequencyOptions,
  toCommitmentPayload,
  trialEndFrom,
} from "../../domain/commitment";
import { formatDate, formatMoney } from "../../domain/formatting";
import styles from "../styles/commitmentForm.module.css";

export function CommitmentFormDialog({ type, commitment, onClose, onSaved }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = useToday();
  const { leaving, dismiss } = useDismiss();
  const close = () => dismiss(onClose);

  useScrollLock();
  const editing = Boolean(commitment);
  const [form, setForm] = useState(() =>
    commitment ? formFromCommitment(commitment) : emptyForm(type, user?.defaultReminderDays),
  );

  const save = useAsyncAction((payload) =>
    editing ? updateCommitment(commitment.id, payload) : createCommitment(payload),
  );

  const frequencies = useMemo(() => frequencyOptions(t), [t]);
  const categories = useMemo(() => categoryOptions(t, type), [t, type]);
  const suggestions = useMemo(
    () => findSuggestions(t, type, form.title),
    [t, type, form.title],
  );

  const pick = (entry) => {
    setForm((current) => ({
      ...current,
      title: catalogLabel(t, entry),
      category: entry.category,
      frequency: entry.frequency ?? current.frequency,
    }));
  };

  useEffect(() => {
    const handler = (event) => event.key === "Escape" && dismiss(onClose);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, dismiss]);

  const set = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const choose = (field) => (value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const option = (field, fallback) => (event) => {
    const on = event.target.checked;
    setForm((current) => ({ ...current, [field]: on ? fallback(current) : "" }));
  };

  const toggleTrial = (event) => {
    const on = event.target.checked;
    setForm((current) => ({
      ...current,
      isTrial: on,
      endsOn: on && !editing ? "" : current.endsOn,
      trialStartsOn: on && !editing ? today : "",
      trialDays: on ? current.trialDays : "",
      trialCustom: on ? current.trialCustom : false,
    }));
  };

  const pickPreset = (days) => () =>
    setForm((current) => ({ ...current, trialDays: String(days), trialCustom: false }));

  const pickCustom = () => setForm((current) => ({ ...current, trialCustom: true }));

  const meta = COMMITMENT_TYPES[type];
  const currency = user?.currency ?? "CAD";
  const currentTrial = commitment?.trialEndsOn ?? null;
  const derivedTrial = form.isTrial
    ? trialEndFrom(form.trialStartsOn, form.trialDays)
    : null;
  const trialOver = derivedTrial !== null && derivedTrial <= today;
  const blocked = form.isTrial && derivedTrial === null && currentTrial === null;
  const firstCharge = form.isTrial ? (derivedTrial ?? currentTrial) : form.startsOn;
  const showEnd = !form.isTrial || editing;
  const showTrial = type === "subscription" || Boolean(currentTrial);
  const backdated =
    !form.isTrial && form.frequency === "oneoff" && Boolean(form.startsOn) && form.startsOn < today;

  const submit = async (event) => {
    event.preventDefault();
    const payload = toCommitmentPayload(form, { currentTrialEnd: currentTrial });

    if (editing) {
      const changes = commitmentChanges(payload, commitment);
      if (!Object.keys(changes).length) {
        onClose();
        return;
      }
      const result = await save.run(changes);
      if (result.ok) {
        onSaved(result.data);
        onClose();
      }
      return;
    }

    const result = await save.run(payload);
    if (result.ok) {
      onSaved(result.data);
      onClose();
    }
  };

  const heading = editing
    ? t("form.editTitle", { title: form.title || t(meta.labelKey) })
    : t(meta.formTitleKey);

  return (
    <div
      className={cx(styles.overlay, leaving && styles.leavingVeil)}
      onMouseDown={close}
    >
      <div
        className={cx(styles.dialog, leaving && styles.leaving)}
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

          <Suggest
            label={t("form.name")}
            value={form.title}
            onChange={set("title")}
            items={suggestions}
            onPick={pick}
            renderLabel={(entry) => catalogLabel(t, entry)}
            renderMeta={(entry) => categoryLabel(t, entry.category)}
            emptyHint={t("form.suggestHint")}
            countLabel={(count) => t("form.suggestCount", { count })}
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
              hint={t("form.amountHint", { currency: user?.currency ?? "CAD" })}
              required
            />
            <PickerField
              label={t("form.frequency")}
              value={form.frequency}
              onChange={choose("frequency")}
              options={frequencies}
            />
          </div>

          <PickerField
            label={t("form.category")}
            value={form.category}
            onChange={choose("category")}
            options={categories}
          />

          {showTrial ? (
          <div className={styles.reminder}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.isTrial} onChange={toggleTrial} />
              <span>{t("form.isTrial")}</span>
            </label>

            {form.isTrial ? (
              <>
                <TextField
                  label={t("form.trialStartsOn")}
                  type="date"
                  value={form.trialStartsOn}
                  onChange={set("trialStartsOn")}
                  required={!editing}
                />

                <div
                  className={styles.presets}
                  role="group"
                  aria-label={t("form.trialDuration")}
                >
                  <span className={styles.presetsLabel}>{t("form.trialDuration")}</span>
                  <div className={styles.presetRow}>
                    {TRIAL_PRESETS.map((days) => (
                      <Chip
                        key={days}
                        active={!form.trialCustom && form.trialDays === String(days)}
                        onClick={pickPreset(days)}
                      >
                        {t("form.trialPreset", { count: days })}
                      </Chip>
                    ))}
                    <Chip active={form.trialCustom} onClick={pickCustom}>
                      {t("form.trialOther")}
                    </Chip>
                  </div>
                </div>

                {form.trialCustom ? (
                  <TextField
                    label={t("form.trialCustomDays")}
                    type="number"
                    min="1"
                    max={String(MAX_TRIAL_DAYS)}
                    value={form.trialDays}
                    onChange={set("trialDays")}
                    className={styles.days}
                  />
                ) : null}

                {derivedTrial ? (
                  <p className={cx(styles.recap, trialOver && styles.recapWarning)}>
                    {trialOver
                      ? t("form.trialOver")
                      : t(form.amount ? "form.trialRecap" : "form.trialRecapPlain", {
                          end: formatDate(derivedTrial),
                          amount: form.amount ? formatMoney(form.amount, currency) : "",
                        })}
                  </p>
                ) : currentTrial ? (
                  <p className={styles.recap}>
                    {t("form.trialCurrent", { date: formatDate(currentTrial) })}
                  </p>
                ) : null}

                <p className={styles.recapHint}>{t("form.trialHint")}</p>
              </>
            ) : null}
          </div>
          ) : null}

          {form.isTrial ? (
            showEnd ? (
              <TextField
                label={t("form.endDate")}
                type="date"
                value={form.endsOn}
                onChange={set("endsOn")}
                min={firstCharge ?? undefined}
                hint={t("form.endDateHint")}
              />
            ) : null
          ) : (
            <div className={styles.pair}>
              <TextField
                label={t("form.firstDueDate")}
                type="date"
                value={form.startsOn}
                onChange={set("startsOn")}
                hint={backdated ? t("form.pastDueDate") : undefined}
                required
              />
              <TextField
                label={t("form.endDate")}
                type="date"
                value={form.endsOn}
                onChange={set("endsOn")}
                min={firstCharge ?? undefined}
                hint={t("form.endDateHint")}
              />
            </div>
          )}

          <div className={styles.reminder}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={form.cancellationNoticeDays !== ""}
                onChange={option("cancellationNoticeDays", () => 30)}
              />
              <span>{t("form.hasNotice")}</span>
            </label>

            {form.cancellationNoticeDays !== "" ? (
              <TextField
                label={t("form.noticeDays")}
                type="number"
                min="1"
                max={String(MAX_NOTICE_DAYS)}
                value={form.cancellationNoticeDays}
                onChange={set("cancellationNoticeDays")}
                hint={t("form.noticeHint")}
                className={styles.days}
              />
            ) : null}
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
            <Button variant="secondary" onClick={close} disabled={save.loading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={save.loading} disabled={blocked}>
              {editing ? t("common.save") : t("common.add")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
