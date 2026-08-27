import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { TextField } from "../../../../core/components/TextField/TextField";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { isEmailValid } from "../../domain/validation";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { run, loading, error, fieldErrors } = useAsyncAction(forgotPassword);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await run({ email });
    if (result.ok) {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className={styles.form}>
        <Alert variant="success">
          {t("auth.forgotSent")}
        </Alert>
        <Button onClick={() => navigate("/reinitialisation", { state: { email } })}>
          {t("auth.gotMyCode")}
        </Button>
      </div>
    );
  }

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
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
        required
      />

      <Button type="submit" loading={loading} disabled={!isEmailValid(email)}>
        {t("auth.sendCode")}
      </Button>
    </form>
  );
}
