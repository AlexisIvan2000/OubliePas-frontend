import { useSearchParams } from "react-router-dom";

import { TabPanel, Tabs } from "../../../../core/components/Tabs/Tabs";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { AvatarCard } from "../components/AvatarCard";
import { DangerZone } from "../components/DangerZone";
import { EmailSection } from "../components/EmailSection";
import { LanguageSection } from "../components/LanguageSection";
import { ProfileFieldsCard } from "../components/ProfileFieldsCard";
import { SecuritySection } from "../components/SecuritySection";
import { ThemeSection } from "../components/ThemeSection";
import { UnverifiedBanner } from "../components/UnverifiedBanner";
import styles from "../styles/settings.module.css";

const PARAM = "onglet";
const SECTIONS = ["profil", "securite", "general"];
const DEFAULT_SECTION = SECTIONS[0];

export function ProfilePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  useDocumentTitle(t("settings.documentTitle"));

  const requested = searchParams.get(PARAM);
  const section = SECTIONS.includes(requested) ? requested : DEFAULT_SECTION;

  const handleTabChange = (next) => {
    if (next !== section) {
      setSearchParams(next === DEFAULT_SECTION ? {} : { [PARAM]: next }, { replace: true });
    }
  };

  const tabs = [
    { id: "profil", label: t("settings.tabs.profile") },
    { id: "securite", label: t("settings.tabs.security") },
    { id: "general", label: t("settings.tabs.general") },
  ];

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>{t("settings.title")}</h1>
        <p className={styles.subtitle}>{t("settings.subtitle")}</p>
      </header>

      <UnverifiedBanner />

      <Tabs
        items={tabs}
        value={section}
        onChange={handleTabChange}
        label={t("settings.tabsLabel")}
      />

      {section === "profil" ? (
        <TabPanel id="profil" className={styles.panelStack}>
          <AvatarCard />
          <ProfileFieldsCard />
          <DangerZone />
        </TabPanel>
      ) : null}

      {section === "securite" ? (
        <TabPanel id="securite" className={styles.panelStack}>
          <SecuritySection />
          <EmailSection />
        </TabPanel>
      ) : null}

      {section === "general" ? (
        <TabPanel id="general" className={styles.panelStack}>
          <LanguageSection />
          <ThemeSection />
        </TabPanel>
      ) : null}
    </div>
  );
}
