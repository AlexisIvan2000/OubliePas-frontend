import { Link, useLocation } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { AuthLayout } from "../../../../core/components/AuthLayout/AuthLayout";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { messageForNotice } from "../../domain/sessionNotices";
import { AuthPreviewPanel } from "../components/AuthPreviewPanel";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/authForms.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

export function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { sessionNotice } = useAuth();
  const notice = location.state?.notice ?? messageForNotice(t, sessionNotice);

  useDocumentTitle(t("auth.signInDocument"));

  return (
    <AuthLayout
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      aside={<AuthPreviewPanel />}
      footnote={t("auth.loginFootnote")}
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link className={styles.link} to="/inscription">
            {t("auth.createAccount")}
          </Link>
        </>
      }
    >
      {notice ? (
        <Alert variant="info" className={styles.notice}>
          {notice}
        </Alert>
      ) : null}
      <LoginForm />
    </AuthLayout>
  );
}
