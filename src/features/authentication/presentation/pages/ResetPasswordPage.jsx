import { Link } from "react-router-dom";

import { AuthLayout } from "../../../../core/components/AuthLayout/AuthLayout";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { AuthPreviewPanel } from "../components/AuthPreviewPanel";
import { ResetPasswordForm } from "../components/ResetPasswordForm";
import styles from "../styles/authForms.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("auth.resetDocument"));

  return (
    <AuthLayout
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
      aside={<AuthPreviewPanel />}
      footnote={t("settings.securityHint")}
      footer={
        <Link className={styles.link} to="/mot-de-passe-oublie">
          {t("auth.askNewCode")}
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
