import { useDocumentTitle } from "../utils/useDocumentTitle";
import styles from "./ComingSoonPage.module.css";

export function ComingSoonPage({ title, subtitle }) {
  useDocumentTitle(title);

  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.panel}>
        <p className={styles.text}>
          Cette section n&apos;est pas encore disponible.
          <br />
          L&apos;API n&apos;expose pour l&apos;instant que l&apos;authentification et le profil.
        </p>
      </div>
    </>
  );
}
