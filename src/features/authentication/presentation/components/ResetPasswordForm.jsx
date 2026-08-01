import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { CodeInput } from "../../../../core/components/CodeInput/CodeInput";
import { PasswordField } from "../../../../core/components/PasswordField/PasswordField";
import { TextField } from "../../../../core/components/TextField/TextField";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { isCodeValid, isEmailValid, isPasswordValid } from "../../domain/validation";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";
import { PasswordRules } from "./PasswordRules";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email ?? "",
    code: "",
    newPassword: "",
  });
  const { run, loading, error, fieldErrors } = useAsyncAction(resetPassword);

  const canSubmit =
    isEmailValid(form.email) && isCodeValid(form.code) && isPasswordValid(form.newPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await run(form);
    if (result.ok) {
      navigate("/connexion", {
        replace: true,
        state: { notice: t("auth.resetDone") },
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Alert variant="error" details={error?.fieldErrors}>
        {error ? messageForError(t, error) : null}
      </Alert>

      <TextField
        label={t("auth.emailLabel")}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={t("auth.emailPlaceholder")}
        value={form.email}
        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        error={fieldErrors.email}
        required
      />

      <CodeInput
        label={t("auth.codeLabel")}
        value={form.code}
        onChange={(code) => setForm((current) => ({ ...current, code }))}
        error={fieldErrors.code}
        required
      />

      <PasswordField
        label={t("auth.newPasswordLabel")}
        name="newPassword"
        autoComplete="new-password"
        value={form.newPassword}
        onChange={(event) =>
          setForm((current) => ({ ...current, newPassword: event.target.value }))
        }
        error={fieldErrors.new_password}
        required
      />

      <PasswordRules value={form.newPassword} />

      <Button type="submit" loading={loading} disabled={!canSubmit}>
        {t("auth.resetSubmitLong")}
      </Button>
    </form>
  );
}
