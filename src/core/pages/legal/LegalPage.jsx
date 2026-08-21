import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../features/authentication/presentation/providers/useAuth";
import { AppShell } from "../../components/AppShell/AppShell";
import { Icon } from "../../components/Icon/Icon";
import { PreferenceToggles } from "../../components/PreferenceToggles/PreferenceToggles";
import { Skeleton } from "../../components/Skeleton/Skeleton";
import { useTranslation } from "../../translation/useTranslation";
import { formatDate } from "../../utils/formatting";
import { useDocumentTitle } from "../../utils/useDocumentTitle";
import { LEGAL, fill } from "./legalConfig";
import { LEGAL_PATHS, loadLegalDoc } from "./legalDocs";
import styles from "./LegalPage.module.css";

function Document({ doc, name }) {
  const { t } = useTranslation();
  const other = name === "terms" ? "privacy" : "terms";

  if (!doc) {
    return (
      <div className={styles.sheet} aria-busy="true" aria-label={t("legal.loading")}>
        <Skeleton width="10rem" height="0.75rem" />
        <Skeleton width="18rem" height="2rem" />
        <Skeleton height="4rem" />
        <Skeleton height="10rem" />
      </div>
    );
  }

  return (
    <>
      <article className={styles.sheet}>
        <p className={styles.updated}>
          {t("legal.updated", { date: formatDate(LEGAL.updated) })}
        </p>
        <h1 className={styles.title}>{doc.title}</h1>
        <p className={styles.intro}>{fill(doc.intro)}</p>

        {doc.sections.map((section) => (
          <section key={section.id} className={styles.section}>
            <h2 className={styles.heading}>{section.heading}</h2>

            {(section.body ?? []).map((line, index) => (
              <p key={index} className={styles.body}>
                {fill(line)}
              </p>
            ))}

            {section.list ? (
              <ul className={styles.list}>
                {section.list.map((line, index) => (
                  <li key={index}>{fill(line)}</li>
                ))}
              </ul>
            ) : null}

            {(section.groups ?? []).map((group) => (
              <div key={group.label} className={styles.group}>
                <h3 className={styles.groupLabel}>{group.label}</h3>
                <ul className={styles.list}>
                  {group.items.map((line, index) => (
                    <li key={index}>{fill(line)}</li>
                  ))}
                </ul>
              </div>
            ))}

            {(section.after ?? []).map((line, index) => (
              <p key={index} className={styles.body}>
                {fill(line)}
              </p>
            ))}
          </section>
        ))}
      </article>

      <nav className={styles.crossNav} aria-label={t("legal.footerAria")}>
        <Link to={LEGAL_PATHS[other]} className={styles.crossLink}>
          <Icon name="next" size={14} />
          {t(other === "privacy" ? "legal.privacy" : "legal.terms")}
        </Link>
        <a href={`mailto:${LEGAL.contactEmail}`} className={styles.crossLink}>
          {t("legal.contact")}
        </a>
      </nav>
    </>
  );
}

export function LegalPage({ name }) {
  const { t, locale } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [loaded, setLoaded] = useState(null);

  const key = `${name}|${locale}`;
  const doc = loaded?.key === key ? loaded.doc : null;

  useDocumentTitle(doc ? doc.title : t("legal.loading"));

  useEffect(() => {
    let active = true;

    loadLegalDoc(name, locale).then((content) => {
      if (active) {
        setLoaded({ key: `${name}|${locale}`, doc: content });
      }
    });

    return () => {
      active = false;
    };
  }, [name, locale]);

  if (isAuthenticated) {
    return (
      <AppShell>
        <div className={styles.inShell}>
          <Document doc={doc} name={name} />
        </div>
      </AppShell>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.brand}>
          <img className={styles.logo} src="/assets/logo.png" alt="" />
          <span className={styles.wordmark}>{LEGAL.entity}</span>
        </Link>
        <PreferenceToggles />
      </header>

      <main className={styles.standalone}>
        <Document doc={doc} name={name} />
      </main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.crossLink}>
          {t("legal.backHome")}
        </Link>
      </footer>
    </div>
  );
}
