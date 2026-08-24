import { Link } from "react-router-dom";

import { useAuth } from "../../features/authentication/presentation/providers/useAuth";
import { AppShell } from "../components/AppShell/AppShell";
import { Faq } from "../components/Faq/Faq";
import { Icon } from "../components/Icon/Icon";
import { PreferenceToggles } from "../components/PreferenceToggles/PreferenceToggles";
import { useTranslation } from "../translation/useTranslation";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import styles from "./FaqPage.module.css";

export function FaqPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const signedIn = Boolean(user);

  useDocumentTitle(t("faq.documentTitle"));

  const content = (
    <div className={styles.wrap}>
      <Link to={signedIn ? "/reglages" : "/"} className={styles.back}>
        <Icon name="previous" size={14} />
        {t(signedIn ? "faq.backToSettings" : "faq.backHome")}
      </Link>

      <Faq scroll title={t("faq.title")} description={t("faq.lede")} />
    </div>
  );

  if (signedIn) {
    return <AppShell>{content}</AppShell>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand}>
          <img className={styles.logo} src="/assets/logo.png" alt="" />
          <span className={styles.wordmark}>OubliePas</span>
        </Link>
        <PreferenceToggles />
      </header>
      {content}
    </div>
  );
}
