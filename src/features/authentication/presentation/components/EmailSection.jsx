import { useState } from "react";

import {
  SettingsRow,
  SettingsRows,
  SettingsSection,
} from "../../../../core/components/SettingsSection/SettingsSection";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/settings.module.css";
import { ChangeEmailForm } from "./ChangeEmailForm";

export function EmailSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const hasPassword = Boolean(user?.hasPassword);

  return (
    <SettingsSection
      title={t("settings.email")}
      description={t("settings.emailHint")}
      editing={editing}
      onEdit={hasPassword ? () => setEditing(true) : undefined}
      onCancel={() => setEditing(false)}
      editLabel={t("settings.changeEmail")}
    >
      {editing ? (
        <ChangeEmailForm onDone={() => setEditing(false)} />
      ) : (
        <>
          <SettingsRows>
            <SettingsRow label={t("settings.email")} value={user?.email} />
          </SettingsRows>
          {hasPassword ? null : (
            <p className={styles.muted}>{t("settings.emailNeedsPassword")}</p>
          )}
        </>
      )}
    </SettingsSection>
  );
}
