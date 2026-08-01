import { useState } from "react";

import {
  SettingsRow,
  SettingsRows,
  SettingsSection,
} from "../../../../core/components/SettingsSection/SettingsSection";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAuth } from "../providers/useAuth";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function SecuritySection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const hasPassword = Boolean(user?.hasPassword);

  return (
    <SettingsSection
      title={t("settings.security")}
      description={
        hasPassword ? t("settings.securityDescription") : t("settings.securityDescriptionGoogle")
      }
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      editLabel={hasPassword ? t("settings.changePassword") : t("settings.definePassword")}
    >
      {editing ? (
        <ChangePasswordForm withoutPassword={!hasPassword} onDone={() => setEditing(false)} />
      ) : (
        <SettingsRows>
          <SettingsRow
            label={t("settings.password")}
            value={hasPassword ? t("settings.passwordMasked") : ""}
            placeholder={t("settings.passwordNotSet")}
          />
        </SettingsRows>
      )}
    </SettingsSection>
  );
}
