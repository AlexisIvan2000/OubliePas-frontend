import { Link } from "react-router-dom";

import { AuthLayout } from "../../../../core/components/AuthLayout/AuthLayout";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { AuthPreviewPanel } from "../components/AuthPreviewPanel";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import styles from "../styles/authForms.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("auth.forgotDocument"));

  return (
    <AuthLayout
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
      aside={<AuthPreviewPanel />}
      footnote={t("auth.forgotPrivacy")}
      footer={
        <Link className={styles.link} to="/connexion">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
