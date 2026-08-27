import { useState } from "react";

import { Button } from "../../../../core/components/Button/Button";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { startGoogleSignIn } from "../../data/authApi";
import { createHandshake } from "../../domain/googleOAuth";
import styles from "../styles/GoogleButton.module.css";

export function GoogleButton({ label, onError, ...rest }) {
  const { t } = useTranslation();
  const [redirecting, setRedirecting] = useState(false);

  const start = async () => {
    setRedirecting(true);
    onError?.(null);
    try {
      const { state, codeChallenge } = await createHandshake();
      const { authorization_url: url } = await startGoogleSignIn({ state, codeChallenge });
      window.location.assign(url);
    } catch (caught) {
      setRedirecting(false);
      onError?.(messageForError(t, caught));
    }
  };

  return (
    <Button variant="secondary" onClick={start} loading={redirecting} {...rest}>
      {redirecting ? null : (
        <img className={styles.icon} src="/assets/google-icon-logo.svg" alt="" />
      )}
      {label ?? t("auth.googleContinue")}
    </Button>
  );
}
