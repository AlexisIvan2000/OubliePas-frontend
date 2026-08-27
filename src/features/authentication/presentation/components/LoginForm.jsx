import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { PasswordField } from "../../../../core/components/PasswordField/PasswordField";
import { TextField } from "../../../../core/components/TextField/TextField";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";
import { GoogleButton } from "./GoogleButton";

export function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [googleNotice, setGoogleNotice] = useState(null);
  const { run, loading, error, fieldErrors } = useAsyncAction(login);

  const redirectTo = location.state?.from ?? "/";

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await run(form);

    if (result.ok) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (result.error?.code === "EMAIL_NOT_VERIFIED") {
      navigate("/verification", { state: { email: form.email } });
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
        onChange={handleChange("email")}
        error={fieldErrors.email}
        required
      />

      <PasswordField
        label={t("auth.passwordLabel")}
        name="password"
        placeholder={t("auth.passwordPlaceholder")}
        value={form.password}
        onChange={handleChange("password")}
        error={fieldErrors.password}
        required
      />

      <div className={styles.row}>
        <span />
        <Link className={styles.link} to="/mot-de-passe-oublie">
          {t("auth.forgotLink")}
        </Link>
      </div>

      <Button type="submit" loading={loading}>
        {t("auth.signIn")}
      </Button>

      <div className={styles.separator}>ou</div>

      <GoogleButton onError={setGoogleNotice} />

      <Alert variant="error">{googleNotice}</Alert>
    </form>
  );
}
