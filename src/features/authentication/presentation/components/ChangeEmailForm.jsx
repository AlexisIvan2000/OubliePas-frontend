import { useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { CodeInput } from "../../../../core/components/CodeInput/CodeInput";
import { PasswordField } from "../../../../core/components/PasswordField/PasswordField";
import { TextField } from "../../../../core/components/TextField/TextField";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { useCooldown } from "../../../../core/utils/useCooldown";
import { isCodeValid, isEmailValid } from "../../domain/validation";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/settings.module.css";

function Steps({ step }) {
  const { t } = useTranslation();

  return (
    <div className={styles.steps}>
      <span className={cx(styles.step, step === "request" ? styles.stepActive : styles.stepDone)}>
        <span className={styles.stepMark}>{step === "request" ? "1" : "✓"}</span>
        {t("auth.stepAddress")}
      </span>
      <span className={styles.stepBar} />
      <span className={cx(styles.step, step === "confirm" && styles.stepActive)}>
        <span className={styles.stepMark}>2</span>
        {t("auth.stepCode")}
      </span>
    </div>
  );
}

export function ChangeEmailForm({ onDone }) {
  const { t } = useTranslation();
  const { user, requestEmailChange, confirmEmailChange, resendEmailChange } = useAuth();
  const [step, setStep] = useState("request");
  const [form, setForm] = useState({ newEmail: "", password: "" });
  const [code, setCode] = useState("");
  const toast = useToast();

  const requestChange = useAsyncAction(requestEmailChange);
  const confirmChange = useAsyncAction(confirmEmailChange);
  const resend = useAsyncAction(resendEmailChange);
  const cooldown = useCooldown();

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    const result = await requestChange.run(form);
    if (result.ok) {
      setStep("confirm");
    }
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    const result = await confirmChange.run({ code });
    if (result.ok) {
      toast.success(t("settings.emailUpdated"));
      onDone?.();
    }
  };

  const handleResend = async () => {
    const result = await resend.run();
    if (result.ok) {
      cooldown.start();
      toast.success(t("auth.resent"));
    }
  };

  if (step === "confirm") {
    const activeError = confirmChange.error ?? resend.error;

    return (
      <form className={styles.form} onSubmit={handleConfirm} noValidate>
        <Steps step="confirm" />

        <Alert variant="error" details={activeError?.fieldErrors}>
          {activeError ? messageForError(t, activeError) : null}
        </Alert>

        <p className={styles.muted}>
          {t("auth.codeSentTo", { email: form.newEmail })}
        </p>

        <CodeInput
          label={t("auth.codeLabel")}
          value={code}
          onChange={setCode}
          error={confirmChange.fieldErrors.code}
        />

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleResend}
            loading={resend.loading}
            disabled={cooldown.waiting}
          >
            {cooldown.waiting ? t("auth.resendIn", { count: cooldown.left }) : t("auth.resend")}
          </Button>
          <Button type="submit" loading={confirmChange.loading} disabled={!isCodeValid(code)}>
            {t("auth.confirm")}
          </Button>
        </div>

        <Button variant="ghost" fullWidth={false} onClick={() => setStep("request")}>
          {t("auth.backToAddress")}
        </Button>
      </form>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleRequest} noValidate>
      <Steps step="request" />

      <Alert variant="error" details={requestChange.error?.fieldErrors}>
        {requestChange.error ? messageForError(t, requestChange.error) : null}
      </Alert>

      <p className={styles.muted}>{t("settings.currentAddress", { email: user?.email ?? "" })}</p>

      <TextField
        label={t("auth.newEmailLabel")}
        type="email"
        name="newEmail"
        placeholder={t("auth.newEmailPlaceholder")}
        value={form.newEmail}
        onChange={handleChange("newEmail")}
        error={requestChange.fieldErrors.new_email}
      />

      <PasswordField
        label={t("auth.passwordLabel")}
        name="password"
        value={form.password}
        onChange={handleChange("password")}
        error={requestChange.fieldErrors.password}
      />

      <Button
        type="submit"
        loading={requestChange.loading}
        disabled={!isEmailValid(form.newEmail) || form.password.length === 0}
      >
        {t("auth.sendCode")}
      </Button>
    </form>
  );
}
