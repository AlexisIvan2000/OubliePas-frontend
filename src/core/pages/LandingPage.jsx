import { Link } from "react-router-dom";

import { cx } from "../utils/classNames";

import { useTranslation } from "../translation/useTranslation";
import { BrandMarquee } from "../components/BrandMarquee/BrandMarquee";
import { Icon } from "../components/Icon/Icon";
import { PreferenceToggles } from "../components/PreferenceToggles/PreferenceToggles";
import { formatMoney, formatShortDate } from "../utils/formatting";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useReveal } from "../utils/useReveal";
import { LEGAL } from "./legal/legalConfig";
import styles from "./LandingPage.module.css";

const PILLARS = [
  { icon: "subscriptions", key: "together" },
  { icon: "wallet", key: "cost" },
  { icon: "calendar", key: "calendar" },
  { icon: "reminders", key: "reminders", soon: true },
];

const PREVIEW = [
  { id: "rent", labelKey: "landing.sampleRent", day: "2026-08-01", amount: 1250, tone: "invoice" },
  { id: "netflix", title: "Netflix", day: "2026-08-02", amount: 18.99, tone: "subscription" },
  {
    id: "insurance",
    labelKey: "landing.sampleInsurance",
    day: "2026-08-13",
    amount: 142,
    tone: "invoice",
  },
];

const PREVIEW_TOTAL = 1410.99;
const PREVIEW_SUBSCRIPTIONS = 18.99;
const PREVIEW_INVOICES = 1392;
const PREVIEW_CURRENCY = "CAD";

export function LandingPage() {
  const { t } = useTranslation();
  const [bandRef, bandShown] = useReveal();
  const [pillarsRef, pillarsShown] = useReveal();

  useDocumentTitle(t("landing.documentTitle"));

  return (
    <div className={styles.page}>
      <div className={styles.aura} aria-hidden="true" />
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <img className={styles.logo} src="/assets/logo.png" alt="" />
          <span className={styles.wordmark}>OubliePas</span>
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
            <p className={cx(styles.eyebrow, styles.rise)} style={{ "--rise": "0ms" }}>
              {t("landing.eyebrow")}
            </p>
            <h1 className={cx(styles.title, styles.rise)} style={{ "--rise": "90ms" }}>
              {t("landing.title")}
            </h1>
            <p className={cx(styles.subtitle, styles.rise)} style={{ "--rise": "180ms" }}>
              {t("landing.subtitle")}
            </p>

            <div className={cx(styles.actions, styles.rise)} style={{ "--rise": "270ms" }}>
              <Link to="/connexion" className={styles.primary}>
                {t("auth.signIn")}
                <Icon name="next" size={16} />
              </Link>
              <span className={styles.aside}>
                {t("landing.noAccount")}{" "}
                <Link to="/inscription">{t("auth.createAccount")}</Link>
              </span>
            </div>

            <p className={cx(styles.footnote, styles.rise)} style={{ "--rise": "360ms" }}>
              {t("landing.footnote")}
            </p>
          </div>

          <aside
            className={cx(styles.preview, styles.rise)}
            style={{ "--rise": "260ms" }}
            aria-label={t("a11y.appPreview")}
          >
            <span className={styles.sheen} aria-hidden="true" />
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
                <div className={styles.previewRow} key={row.id}>
                  <span className={`${styles.dot} ${styles[row.tone]}`} />
                  <span className={styles.rowTitle}>
                    {row.labelKey ? t(row.labelKey) : row.title}
                  </span>
                  <span className={styles.rowWhen}>{formatShortDate(row.day)}</span>
                  <span className={styles.rowAmount}>{formatMoney(row.amount, PREVIEW_CURRENCY)}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section
          ref={bandRef}
          className={cx(styles.band, bandShown && styles.bandShown)}
          aria-hidden={bandShown ? undefined : "true"}
        >
          <p className={styles.bandLabel}>{t("landing.bandLabel")}</p>
          <BrandMarquee label={t("landing.bandAria")} />
        </section>

        <section ref={pillarsRef} className={styles.pillars}>
          {PILLARS.map((pillar, index) => (
            <article
              className={cx(styles.pillar, pillarsShown && styles.pillarShown)}
              style={{ "--rise": `${index * 90}ms` }}
              key={pillar.key}
            >
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
        <span className={styles.footerBrand}>OubliePas</span>
        <nav className={styles.footerLinks} aria-label={t("legal.footerAria")}>
          <Link to="/faq">{t("faq.settingsTitle")}</Link>
          <Link to="/conditions">{t("legal.terms")}</Link>
          <Link to="/confidentialite">{t("legal.privacy")}</Link>
          <a href={`mailto:${LEGAL.contactEmail}`}>{t("legal.contact")}</a>
        </nav>
        <span className={styles.footerTagline}>{t("landing.tagline")}</span>
      </footer>
    </div>
  );
}
