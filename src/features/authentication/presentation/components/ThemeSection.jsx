import { Chip } from "../../../../core/components/Chip/Chip";
import {
  SettingsRow,
  SettingsRows,
  SettingsSection,
} from "../../../../core/components/SettingsSection/SettingsSection";
import { THEME_LIST } from "../../../../core/theme/themes";
import { useTheme } from "../../../../core/theme/useTheme";
import { useTranslation } from "../../../../core/translation/useTranslation";
import styles from "../styles/settings.module.css";

export function ThemeSection() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSection title={t("settings.theme")} description={t("settings.themeHint")}>
      <SettingsRows>
        <SettingsRow
          label={t("settings.theme")}
          value={
            <div className={styles.chips}>
              {THEME_LIST.map((item) => (
                <Chip
                  key={item.code}
                  active={theme === item.code}
                  onClick={() => setTheme(item.code)}
                >
                  {t(item.labelKey)}
                </Chip>
              ))}
            </div>
          }
        />
      </SettingsRows>
    </SettingsSection>
  );
}
