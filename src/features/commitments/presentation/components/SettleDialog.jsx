import { useEffect, useState } from "react";

import { Button } from "../../../../core/components/Button/Button";
import { DateField } from "../../../../core/components/DateField/DateField";
import { Icon } from "../../../../core/components/Icon/Icon";
import { TextField } from "../../../../core/components/TextField/TextField";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useDismiss } from "../../../../core/utils/useDismiss";
import { useScrollLock } from "../../../../core/utils/useScrollLock";
import { useToday } from "../../../../core/utils/useToday";
import { categoryLabel } from "../../domain/commitment";
import { formatDate, formatMoney } from "../../domain/formatting";
import styles from "../styles/settle.module.css";

export function SettleDialog({ occurrence, currency, busy, onSettle, onClose }) {
  const { t } = useTranslation();
  const today = useToday();
  const [amount, setAmount] = useState(() => String(occurrence.amount));
  const [paidOn, setPaidOn] = useState(() => occurrence.paidOn ?? today);
  const { leaving, dismiss } = useDismiss();
  const close = () => dismiss(onClose);

  useScrollLock();

  useEffect(() => {
    const handler = (event) => event.key === "Escape" && dismiss(onClose);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, dismiss]);

  const value = Number(amount);
  const changed = value !== Number(occurrence.amount);
  const validDate = Boolean(paidOn) && paidOn <= today;
  const valid = Number.isFinite(value) && value > 0 && validDate;

  const submit = (event) => {
    event.preventDefault();
    if (!valid || busy) {
      return;
    }
    onSettle("paid", changed ? amount : undefined, paidOn);
  };

  return (
    <div
      className={cx(styles.overlay, leaving && styles.leavingVeil)}
      onMouseDown={close}
    >
      <div
        className={cx(styles.dialog, leaving && styles.leaving)}
        role="dialog"
        aria-modal="true"
        aria-label={t("occurrence.settle", { title: occurrence.title })}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 className={styles.title}>{occurrence.title}</h2>
          <p className={styles.subtitle}>
            {t("occurrence.settleDue", { date: formatDate(occurrence.dueDate) })} ·{" "}
            {categoryLabel(t, occurrence.category)}
          </p>
        </header>

        <form className={styles.form} onSubmit={submit} noValidate>
          <TextField
            label={t("occurrence.settleAmount")}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            hint={
              changed
                ? t("occurrence.settleChanged", {
                    amount: formatMoney(occurrence.amount, currency),
                  })
                : t("occurrence.settleAmountHint")
            }
            required
            autoFocus
          />

          <DateField
            label={t("occurrence.settlePaidOn")}
            value={paidOn}
            onChange={setPaidOn}
            max={today}
            hint={
              paidOn && paidOn < occurrence.dueDate
                ? t("occurrence.settlePaidEarly")
                : t("occurrence.settlePaidOnHint")
            }
            required
          />

          <div className={styles.actions}>
            <Button variant="secondary" onClick={close} disabled={busy}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={busy} disabled={!valid}>
              {t("occurrence.settleConfirm")}
            </Button>
          </div>
        </form>

        <div className={styles.aside}>
          <button
            type="button"
            className={styles.skip}
            onClick={() => onSettle("skipped")}
            disabled={busy}
          >
            <Icon name="pause" size={15} />
            {t("occurrence.skip")}
          </button>
          <p className={styles.skipHint}>{t("occurrence.skipHint")}</p>
        </div>
      </div>
    </div>
  );
}
