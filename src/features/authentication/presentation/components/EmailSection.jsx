import { useState } from "react";

import {
  SettingsRow,
  SettingsRows,
  SettingsSection,
} from "../../../../core/components/SettingsSection/SettingsSection";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAuth } from "../providers/useAuth";
import { ChangeEmailForm } from "./ChangeEmailForm";

export function EmailSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  return (
    <SettingsSection
      title={t("settings.email")}
      description={t("settings.emailHint")}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={() => setEditing(false)}
      editLabel={t("settings.changeEmail")}
    >
      {editing ? (
        <ChangeEmailForm onDone={() => setEditing(false)} />
      ) : (
        <SettingsRows>
          <SettingsRow label={t("settings.email")} value={user?.email} />
        </SettingsRows>
      )}
    </SettingsSection>
  );
}
