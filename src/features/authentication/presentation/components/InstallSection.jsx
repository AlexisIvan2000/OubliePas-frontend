import { Button } from "../../../../core/components/Button/Button";
import { SettingsSection } from "../../../../core/components/SettingsSection/SettingsSection";
import { AVAILABLE, IDLE, INSTALLED, MANUAL } from "../../../../core/pwa/install";
import { useInstallPrompt } from "../../../../core/pwa/useInstallPrompt";
import { useTranslation } from "../../../../core/translation/useTranslation";
import styles from "../styles/settings.module.css";

const STEPS = ["share", "add", "launch"];

export function InstallSection() {
  const { t } = useTranslation();
  const { state, install } = useInstallPrompt();

  // Un navigateur qui n'installe pas et qui n'est pas un iPhone n'a rien a
  // lire ici : une section qui explique une chose impossible fait douter du
  // reste de l'ecran.
  if (state === IDLE) {
    return null;
  }

  return (
    <SettingsSection title={t("install.title")} description={t("install.hint")}>
      {state === INSTALLED ? <p className={styles.installDone}>{t("install.done")}</p> : null}

      {state === AVAILABLE ? (
        <Button variant="secondary" fullWidth={false} onClick={install}>
          {t("install.action")}
        </Button>
      ) : null}

      {state === MANUAL ? (
        <ol className={styles.installSteps}>
          {STEPS.map((step) => (
            <li key={step} className={styles.installStep}>
              {t(`install.steps.${step}`)}
            </li>
          ))}
        </ol>
      ) : null}
    </SettingsSection>
  );
}
