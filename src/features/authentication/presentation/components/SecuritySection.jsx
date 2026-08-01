import { useState } from "react";

import {
  SettingsRow,
  SettingsRows,
  SettingsSection,
} from "../../../../core/components/SettingsSection/SettingsSection";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useTranslation } from "../../../../core/translation/useTranslation";

export function SecuritySection() {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  return (
    <SettingsSection
      title={t("settings.security")}
      description={t("settings.securityDescription")}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      editLabel={t("settings.changePassword")}
    >
      {editing ? (
        <ChangePasswordForm onDone={() => setEditing(false)} />
      ) : (
        <SettingsRows>
          <SettingsRow label={t("settings.password")} value={t("settings.passwordMasked")} />
        </SettingsRows>
      )}
    </SettingsSection>
  );
}
