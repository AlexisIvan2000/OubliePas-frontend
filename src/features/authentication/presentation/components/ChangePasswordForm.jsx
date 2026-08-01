import { useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { PasswordField } from "../../../../core/components/PasswordField/PasswordField";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { isPasswordValid } from "../../domain/validation";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";
import { PasswordRules } from "./PasswordRules";

export function ChangePasswordForm({ onDone, withoutPassword = false }) {
  const { t } = useTranslation();
  const { changePassword, setPassword } = useAuth();
  const [googleOnly, setGoogleOnly] = useState(withoutPassword);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const toast = useToast();

  const change = useAsyncAction(changePassword);
  const create = useAsyncAction(setPassword);
  const active = googleOnly ? create : change;

  const canSubmit =
    isPasswordValid(form.newPassword) && (googleOnly || form.currentPassword.length > 0);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (googleOnly) {
      const result = await create.run({ newPassword: form.newPassword });
      if (result.ok) {
        toast.success(t("auth.passwordSet"));
        setForm({ currentPassword: "", newPassword: "" });
        onDone?.();
      }
      return;
    }

    const result = await change.run(form);
    if (!result.ok && result.error?.code === "GOOGLE_ONLY_ACCOUNT") {
      setGoogleOnly(true);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Alert variant="error" details={active.error?.fieldErrors}>
        {active.error && active.error.code !== "GOOGLE_ONLY_ACCOUNT"
          ? messageForError(t, active.error)
          : null}
      </Alert>

      <Alert variant="info">
        {googleOnly
          ? t("auth.googleOnly")
          : null}
      </Alert>

      {googleOnly ? null : (
        <PasswordField
          label={t("auth.currentPasswordLabel")}
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange("currentPassword")}
          error={change.fieldErrors.current_password}
        />
      )}

      <PasswordField
        label={t("auth.newPasswordLabel")}
        name="newPassword"
        autoComplete="new-password"
        value={form.newPassword}
        onChange={handleChange("newPassword")}
        error={active.fieldErrors.new_password}
      />

      <PasswordRules value={form.newPassword} />

      <p className={styles.muted}>
        {googleOnly
          ? t("auth.stayConnected")
          : t("auth.sessionsClosed")}
      </p>

      <Button type="submit" loading={active.loading} disabled={!canSubmit}>
        {googleOnly ? t("auth.setPassword") : t("auth.changePasswordSubmit")}
      </Button>
    </form>
  );
}
