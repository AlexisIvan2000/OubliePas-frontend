import { Link } from "react-router-dom";

import { cx } from "../utils/classNames";

import { useTranslation } from "../translation/useTranslation";
import { BrandMarquee } from "../components/BrandMarquee/BrandMarquee";
import { Icon } from "../components/Icon/Icon";
import { PreferenceToggles } from "../components/PreferenceToggles/PreferenceToggles";
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

export function LandingPage() {
  const { t } = useTranslation();
  const [bandRef, bandShown] = useReveal();
  const [pillarsRef, pillarsShown] = useReveal();
  const [faqRef, faqShown] = useReveal();

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
            className={cx(styles.mockup, styles.rise)}
            style={{ "--rise": "260ms" }}
            aria-label={t("a11y.appPreview")}
          >
            <div className={styles.lid}>
              <div className={styles.screen}>
                <img
                  className={styles.shot}
                  src="/assets/hero-dashboard.png"
                  width="1918"
                  height="907"
                  alt=""
                  fetchPriority="high"
                />
              </div>
            </div>
            <div className={styles.base} aria-hidden="true">
              <span className={styles.notch} />
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

        <section ref={faqRef} className={cx(styles.faqCta, faqShown && styles.faqCtaShown)}>
          <p className={styles.faqPrompt}>{t("landing.faqPrompt")}</p>
          <Link to="/faq" className={styles.faqLink}>
            {t("landing.faqLink")}
            <Icon name="next" size={15} />
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerBrand}>OubliePas</span>
        <nav className={styles.footerLinks} aria-label={t("legal.footerAria")}>
          <Link to="/conditions">{t("legal.terms")}</Link>
          <Link to="/confidentialite">{t("legal.privacy")}</Link>
          <a href={`mailto:${LEGAL.contactEmail}`}>{t("legal.contact")}</a>
        </nav>
        <span className={styles.footerTagline}>{t("landing.tagline")}</span>
      </footer>
    </div>
  );
}
