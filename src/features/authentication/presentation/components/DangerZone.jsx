import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import { PasswordField } from "../../../../core/components/PasswordField/PasswordField";
import { TextField } from "../../../../core/components/TextField/TextField";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/profileCards.module.css";

export function DangerZone() {
  const { t } = useTranslation();
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [value, setValue] = useState("");
  const { run, loading, error, reset } = useAsyncAction(deleteAccount);

  const byPassword = Boolean(user?.hasPassword);

  const close = () => {
    setConfirming(false);
    setValue("");
    reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await run(byPassword ? { password: value } : { confirmation: value });
    if (result.ok) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className={styles.danger}>
      <span className={styles.dangerHeading}>
        <Icon name="late" size={16} variant="Bold" />
        {t("settings.dangerTitle")}
      </span>

      <section className={styles.dangerCard}>
        <p className={styles.dangerText}>{t("settings.deleteAccountWarning")}</p>

        {confirming ? (
          <form className={styles.dangerForm} onSubmit={handleSubmit} noValidate>
            <Alert variant="error">{error ? messageForError(t, error) : null}</Alert>

            {byPassword ? (
              <PasswordField
                label={t("settings.deleteAccountPassword")}
                name="password"
                autoComplete="current-password"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            ) : (
              <TextField
                label={t("settings.deleteAccountPrompt", { email: user?.email ?? "" })}
                name="confirmation"
                autoComplete="off"
                placeholder={user?.email ?? ""}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            )}

            <div className={styles.dangerActions}>
              <Button variant="secondary" fullWidth={false} compact onClick={close}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="danger"
                fullWidth={false}
                compact
                loading={loading}
                disabled={value.trim().length === 0}
              >
                {t("settings.deleteAccountConfirm")}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="danger"
            fullWidth={false}
            compact
            onClick={() => setConfirming(true)}
          >
            {t("settings.deleteAccount")}
          </Button>
        )}
      </section>
    </div>
  );
}
