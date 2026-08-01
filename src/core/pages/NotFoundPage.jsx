import { Link } from "react-router-dom";

import { useDocumentTitle } from "../utils/useDocumentTitle";
import styles from "./NotFoundPage.module.css";
import { useTranslation } from "../../core/translation/useTranslation";

export function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("notFound.documentTitle"));

  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <p className={styles.text}>{t("notFound.missing")}</p>
      <Link className={styles.link} to="/">
        {t("notFound.back")}
      </Link>
    </main>
  );
}
