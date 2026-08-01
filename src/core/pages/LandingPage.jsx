import { Link } from "react-router-dom";

import { useTranslation } from "../translation/useTranslation";
import { Icon } from "../components/Icon/Icon";
import { PreferenceToggles } from "../components/PreferenceToggles/PreferenceToggles";
import { formatMoney, formatShortDate } from "../utils/formatting";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import styles from "./LandingPage.module.css";

const PILLARS = [
  { icon: "subscriptions", key: "together" },
  { icon: "wallet", key: "cost" },
  { icon: "calendar", key: "calendar" },
  { icon: "reminders", key: "reminders", soon: true },
];

const PREVIEW = [
  { title: "Loyer", day: "2026-08-01", amount: 1250, tone: "invoice" },
  { title: "Netflix", day: "2026-08-02", amount: 18.99, tone: "subscription" },
  { title: "Assurance auto", day: "2026-08-13", amount: 142, tone: "invoice" },
];

const PREVIEW_TOTAL = 1410.99;
const PREVIEW_SUBSCRIPTIONS = 18.99;
const PREVIEW_INVOICES = 1392;
const PREVIEW_CURRENCY = "CAD";

export function LandingPage() {
  const { t } = useTranslation();

  useDocumentTitle(t("landing.documentTitle"));

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <img className={styles.logo} src="/assets/logo.png" alt="" />
          <span className={styles.wordmark}>Oubliepas</span>
        </div>
        <div className={styles.topActions}>
          <PreferenceToggles />
          <Link to="/connexion" className={styles.topLink}>
            {t("auth.signIn")}
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>{t("landing.eyebrow")}</p>
            <h1 className={styles.title}>{t("landing.title")}</h1>
            <p className={styles.subtitle}>{t("landing.subtitle")}</p>

            <div className={styles.actions}>
              <Link to="/connexion" className={styles.primary}>
                {t("auth.signIn")}
                <Icon name="next" size={16} />
              </Link>
              <span className={styles.aside}>
                {t("landing.noAccount")}{" "}
                <Link to="/inscription">{t("auth.createAccount")}</Link>
              </span>
            </div>

            <p className={styles.footnote}>{t("landing.footnote")}</p>
          </div>

          <aside className={styles.preview} aria-label={t("a11y.appPreview")}>
            <div className={styles.previewLabel}>{t("landing.previewLabel")}</div>
            <div className={styles.previewTotal}>{formatMoney(PREVIEW_TOTAL, PREVIEW_CURRENCY)}</div>
            <div className={styles.previewSplit}>
              <span>
                <Icon name="subscriptions" size={13} /> {formatMoney(PREVIEW_SUBSCRIPTIONS, PREVIEW_CURRENCY)}
              </span>
              <span>
                <Icon name="invoices" size={13} /> {formatMoney(PREVIEW_INVOICES, PREVIEW_CURRENCY)}
              </span>
            </div>

            <div className={styles.previewDivider} />

            <div className={styles.previewRows}>
              {PREVIEW.map((row) => (
                <div className={styles.previewRow} key={row.title}>
                  <span className={`${styles.dot} ${styles[row.tone]}`} />
                  <span className={styles.rowTitle}>{row.title}</span>
                  <span className={styles.rowWhen}>{formatShortDate(row.day)}</span>
                  <span className={styles.rowAmount}>{formatMoney(row.amount, PREVIEW_CURRENCY)}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className={styles.pillars}>
          {PILLARS.map((pillar) => (
            <article className={styles.pillar} key={pillar.key}>
              <span className={styles.pillarIcon}>
                <Icon name={pillar.icon} size={20} />
              </span>
              <h2 className={styles.pillarTitle}>
                {t(`landing.pillars.${pillar.key}Title`)}
                {pillar.soon ? <span className={styles.soon}>{t("nav.soon")}</span> : null}
              </h2>
              <p className={styles.pillarBody}>{t(`landing.pillars.${pillar.key}Body`)}</p>
            </article>
          ))}
        </section>

      </main>

      <footer className={styles.footer}>
        <span>Oubliepas</span>
        <span>{t("landing.tagline")}</span>
      </footer>
    </div>
  );
}
