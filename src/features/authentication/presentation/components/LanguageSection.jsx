import { Chip } from "../../../../core/components/Chip/Chip";
import {
  SettingsRow,
  SettingsRows,
  SettingsSection,
} from "../../../../core/components/SettingsSection/SettingsSection";
import { LOCALE_LIST } from "../../../../core/translation/locales";
import { useTranslation } from "../../../../core/translation/useTranslation";
import styles from "../styles/settings.module.css";

export function LanguageSection() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <SettingsSection title={t("settings.language")} description={t("settings.languageHint")}>
      <SettingsRows>
        <SettingsRow
          label={t("settings.language")}
          value={
            <div className={styles.chips}>
              {LOCALE_LIST.map((item) => (
                <Chip
                  key={item.code}
                  active={locale === item.code}
                  onClick={() => setLocale(item.code)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>
          }
        />
      </SettingsRows>
    </SettingsSection>
  );
}
