import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { PasswordField } from "../../../../core/components/PasswordField/PasswordField";
import { SelectField } from "../../../../core/components/SelectField/SelectField";
import { TextField } from "../../../../core/components/TextField/TextField";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { currencyOptions, DEFAULT_CURRENCY } from "../../domain/currencies";
import { isEmailValid, isPasswordValid } from "../../domain/validation";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";
import { GoogleButton } from "./GoogleButton";
import { PasswordRules } from "./PasswordRules";

const CURRENCY_OPTIONS = currencyOptions();

export function RegisterForm() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    password: "",
    currency: DEFAULT_CURRENCY,
  });
  const [googleNotice, setGoogleNotice] = useState(null);
  const { run, loading, error, fieldErrors } = useAsyncAction(register);

  const canSubmit =
    form.firstName.trim().length > 0 && isEmailValid(form.email) && isPasswordValid(form.password);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await run(form);
    if (result.ok) {
      navigate("/verification", { state: { email: form.email } });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Alert variant="error" details={error?.fieldErrors}>
        {error ? messageForError(t, error) : null}
      </Alert>

      <div className={styles.grid}>
        <TextField
          label={t("auth.firstNameLabel")}
          name="firstName"
          autoComplete="given-name"
          placeholder={t("auth.firstNamePlaceholder")}
          value={form.firstName}
          onChange={handleChange("firstName")}
          error={fieldErrors.first_name}
          required
        />

        <SelectField
          label={t("auth.currencyLabel")}
          name="currency"
          options={CURRENCY_OPTIONS}
          value={form.currency}
          onChange={handleChange("currency")}
          error={fieldErrors.currency}
        />
      </div>

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
        autoComplete="new-password"
        placeholder={t("auth.passwordPlaceholder")}
        value={form.password}
        onChange={handleChange("password")}
        error={fieldErrors.password}
        required
      />

      <PasswordRules value={form.password} />

      <Button type="submit" loading={loading} disabled={!canSubmit}>
        {t("auth.registerSubmit")}
      </Button>

      <div className={styles.separator}>ou</div>

      <GoogleButton label="S'inscrire avec Google" onError={setGoogleNotice} />

      <Alert variant="error">{googleNotice}</Alert>
    </form>
  );
}
