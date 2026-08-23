import { useEffect, useState } from "react";

import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import { TextField } from "../../../../core/components/TextField/TextField";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { categoryLabel } from "../../domain/commitment";
import { formatDate, formatMoney } from "../../domain/formatting";
import styles from "../styles/settle.module.css";

export function SettleDialog({ occurrence, currency, busy, onSettle, onClose }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(() => String(occurrence.amount));

  useEffect(() => {
    const handler = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const value = Number(amount);
  const changed = value !== Number(occurrence.amount);
  const valid = Number.isFinite(value) && value > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!valid || busy) {
      return;
    }
    onSettle("paid", changed ? amount : undefined);
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.dialog}
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

          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} disabled={busy}>
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
