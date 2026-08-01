import { Link } from "react-router-dom";

import { AuthLayout } from "../../../../core/components/AuthLayout/AuthLayout";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { AuthBenefitsPanel } from "../components/AuthBenefitsPanel";
import { VerifyEmailForm } from "../components/VerifyEmailForm";
import styles from "../styles/authForms.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

export function VerifyEmailPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("auth.verifyDocument"));

  return (
    <AuthLayout
      title={t("auth.verifyTitle")}
      subtitle={t("auth.verifySubtitle")}
      aside={<AuthBenefitsPanel />}
      footnote="Le code expire au bout de quelques minutes."
      footer={
        <Link className={styles.link} to="/connexion">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      <VerifyEmailForm />
    </AuthLayout>
  );
}
