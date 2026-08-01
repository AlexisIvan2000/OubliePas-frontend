import { Link } from "react-router-dom";

import { AuthLayout } from "../../../../core/components/AuthLayout/AuthLayout";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { AuthBenefitsPanel } from "../components/AuthBenefitsPanel";
import { RegisterForm } from "../components/RegisterForm";
import styles from "../styles/authForms.module.css";

export function RegisterPage() {
  const { t } = useTranslation();

  useDocumentTitle(t("auth.registerDocument"));

  return (
    <AuthLayout
      title={t("auth.createAccountTitle")}
      subtitle={t("auth.registerTitle")}
      aside={<AuthBenefitsPanel />}
      footnote={t("auth.registerFootnote")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link className={styles.link} to="/connexion">
            {t("auth.signIn")}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
