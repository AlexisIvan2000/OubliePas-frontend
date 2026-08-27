import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { CodeInput } from "../../../../core/components/CodeInput/CodeInput";
import { TextField } from "../../../../core/components/TextField/TextField";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { isCodeValid, isEmailValid } from "../../domain/validation";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";

export function VerifyEmailForm() {
  const { t } = useTranslation();
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [code, setCode] = useState("");
  const toast = useToast();

  const verify = useAsyncAction(verifyEmail);
  const resend = useAsyncAction(resendVerification);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await verify.run({ email, code });
    if (result.ok) {
      navigate("/", { replace: true });
    }
  };

  const handleResend = async () => {
    const result = await resend.run({ email });
    if (result.ok) {
      toast.success(t("auth.resent"));
      setCode("");
    }
  };

  const activeError = verify.error ?? resend.error;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Alert variant="error" details={activeError?.fieldErrors}>
        {activeError ? messageForError(t, activeError) : null}
      </Alert>

      {location.state?.email ? null : (
        <TextField
          label={t("auth.emailLabel")}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      )}

      <CodeInput
        label={t("auth.codeLabel")}
        value={code}
        onChange={setCode}
        error={verify.fieldErrors.code}
        required
      />

      <Button type="submit" loading={verify.loading} disabled={!isCodeValid(code) || !isEmailValid(email)}>
        {t("auth.verifySubmitLong")}
      </Button>

      <Button
        variant="secondary"
        onClick={handleResend}
        loading={resend.loading}
        disabled={!isEmailValid(email)}
      >
        Renvoyer un code
      </Button>
    </form>
  );
}
