import { useMemo, useState } from "react";

import { Picker } from "../../../../core/components/Picker/Picker";
import {
  SettingsRow,
  SettingsRows,
  SettingsSection,
} from "../../../../core/components/SettingsSection/SettingsSection";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { knownTimezones } from "../../../../core/utils/timezone";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/settings.module.css";

export function TimezoneSection() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const courant = user?.timezone ?? null;

  const options = useMemo(() => {
    // Le fuseau du compte est ajoute s'il manque : une base tz plus ancienne
    // que celle du serveur laisserait sinon le reglage vide sur sa propre
    // valeur, et le premier clic la remplacerait sans que personne ne l'ait
    // voulu.
    const zones = new Set(knownTimezones());
    if (courant) {
      zones.add(courant);
    }
    return [...zones].sort().map((zone) => ({ value: zone, label: zone }));
  }, [courant]);

  const changer = async (zone) => {
    if (zone === courant) {
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ timezone: zone });
      toast.push(t("settings.timezoneUpdated"));
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title={t("settings.timezone")}
      description={t("settings.timezoneHint")}
    >
      <SettingsRows>
        <SettingsRow
          label={t("settings.timezone")}
          value={
            <div className={styles.chips}>
              <Picker
                label={t("settings.timezone")}
                value={courant ?? ""}
                options={options}
                disabled={saving}
                onChange={changer}
              />
            </div>
          }
        />
      </SettingsRows>
    </SettingsSection>
  );
}
