import { Link } from "react-router-dom";

import { Icon } from "../../../../core/components/Icon/Icon";
import { SettingsSection } from "../../../../core/components/SettingsSection/SettingsSection";
import { LEGAL } from "../../../../core/pages/legal/legalConfig";
import { LEGAL_PATHS } from "../../../../core/pages/legal/legalDocs";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { formatDate } from "../../../../core/utils/formatting";
import styles from "../styles/settings.module.css";

const ENTRIES = [
  { id: "terms", to: LEGAL_PATHS.terms, labelKey: "legal.terms", hintKey: "legal.termsHint" },
  {
    id: "privacy",
    to: LEGAL_PATHS.privacy,
    labelKey: "legal.privacy",
    hintKey: "legal.privacyHint",
  },
];

export function LegalSection() {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t("legal.sectionTitle")}
      description={t("legal.updated", { date: formatDate(LEGAL.updated) })}
    >
      <div className={styles.legalLinks}>
        {ENTRIES.map((entry) => (
          <Link key={entry.id} to={entry.to} className={styles.legalLink}>
            <span className={styles.legalMain}>
              <span className={styles.legalLabel}>{t(entry.labelKey)}</span>
              <span className={styles.legalHint}>
                {t(entry.hintKey, { entity: LEGAL.entity })}
              </span>
            </span>
            <Icon name="next" size={16} />
          </Link>
        ))}

      </div>
    </SettingsSection>
  );
}

export function SupportSection() {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t("legal.supportTitle")} description={t("legal.supportHint")}>
      <div className={styles.legalLinks}>
        <a href={`mailto:${LEGAL.contactEmail}`} className={styles.legalLink}>
          <span className={styles.legalMain}>
            <span className={styles.legalLabel}>{t("legal.contact")}</span>
            <span className={styles.legalHint}>{LEGAL.contactEmail}</span>
          </span>
          <Icon name="next" size={16} />
        </a>
      </div>
    </SettingsSection>
  );
}
