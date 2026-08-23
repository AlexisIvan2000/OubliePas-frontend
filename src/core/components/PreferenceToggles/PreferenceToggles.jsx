import { useAuth } from "../../../features/authentication/presentation/providers/useAuth";
import { messageForError } from "../../network/errorMessages";
import { useTheme } from "../../theme/useTheme";
import { LOCALE_LIST } from "../../translation/locales";
import { useTranslation } from "../../translation/useTranslation";
import { cx } from "../../utils/classNames";
import { Icon } from "../Icon/Icon";
import { useToast } from "../Toast/useToast";
import styles from "./PreferenceToggles.module.css";

export function PreferenceToggles({ className }) {
  const { t, locale, setLocale } = useTranslation();
  const { resolved, setTheme } = useTheme();
  const { isAuthenticated, updateProfile } = useAuth();
  const toast = useToast();

  const changeLocale = async (code) => {
    setLocale(code);
    if (!isAuthenticated) {
      return;
    }
    try {
      await updateProfile({ locale: code });
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    }
  };

  const next = resolved === "dark" ? "light" : "dark";
  const label = t(next === "dark" ? "settings.switchToDark" : "settings.switchToLight");

  return (
    <div className={cx(styles.group, className)}>
      <div className={styles.languages} role="group" aria-label={t("settings.language")}>
        {LOCALE_LIST.map((item) => (
          <button
            key={item.code}
            type="button"
            className={cx(styles.lang, locale === item.code && styles.active)}
            aria-pressed={locale === item.code}
            title={item.label}
            onClick={() => changeLocale(item.code)}
          >
            {item.short}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.theme}
        onClick={() => setTheme(next)}
        aria-label={label}
        title={label}
      >
        <Icon name={next} size={16} />
      </button>
    </div>
  );
}
