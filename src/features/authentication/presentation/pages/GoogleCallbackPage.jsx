import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { AuthLayout } from "../../../../core/components/AuthLayout/AuthLayout";
import { Spinner } from "../../../../core/components/Spinner/Spinner";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { consumeHandshake, readCallbackParams } from "../../domain/googleOAuth";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";

const GOOGLE_ERROR_KEYS = {
  access_denied: "auth.googleDenied",
};

export function GoogleCallbackPage() {
  const { t } = useTranslation();
  const { completeGoogleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [failure, setFailure] = useState(null);
  const started = useRef(false);

  useDocumentTitle(t("auth.googleDocument"));

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    const settle = async () => {
      const { code, state, error: googleError } = readCallbackParams(location.search);

      if (googleError) {
        return GOOGLE_ERROR_KEYS[googleError] ?? "auth.googleInterrupted";
      }

      const codeVerifier = consumeHandshake(state);
      if (!code || !codeVerifier) {
        return "auth.googleStale";
      }

      try {
        await completeGoogleSignIn({ code, codeVerifier });
        return null;
      } catch (caught) {
        return caught;
      }
    };

    settle().then((outcome) => {
      if (outcome) {
        setFailure(outcome);
      } else {
        navigate("/", { replace: true });
      }
    });
  }, [location.search, completeGoogleSignIn, navigate]);

  const message =
    typeof failure === "string" ? t(failure) : failure ? messageForError(t, failure) : null;

  return (
    <AuthLayout
      title={t("auth.googleTitle")}
      subtitle={t("auth.googleSubtitle")}
      footer={
        message ? (
          <Link className={styles.link} to="/connexion">
            {t("auth.backToSignIn")}
          </Link>
        ) : null
      }
    >
      {message ? (
        <Alert variant="error">{message}</Alert>
      ) : (
        <div className={styles.row}>
          <Spinner size={20} />
          <span className={styles.muted}>{t("auth.googleChecking")}</span>
        </div>
      )}
    </AuthLayout>
  );
}
