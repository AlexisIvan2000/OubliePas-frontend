import { useMemo, useState } from "react";

import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { useCommitments } from "../../../commitments/presentation/providers/useCommitments";
import { useOccurrences } from "../../../commitments/presentation/providers/useOccurrences";
import {
  DEFAULT_LEAD_TIME,
  DEFAULT_PREFERENCES,
  scheduledReminders,
} from "../../domain/reminders";
import { ActivityFeedCard } from "../components/ActivityFeedCard";
import { ReminderPreferencesCard } from "../components/ReminderPreferencesCard";
import styles from "../styles/reminders.module.css";

const HORIZON_DAYS = 60;

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoIn(days) {
  const moved = new Date();
  moved.setDate(moved.getDate() + days);
  return moved.toISOString().slice(0, 10);
}

export function RemindersPage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [local, setLocal] = useState(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(null);
  const range = useMemo(() => ({ start: isoToday(), end: isoIn(HORIZON_DAYS) }), []);

  const { items: occurrences, loading: loadingOccurrences } = useOccurrences(range);
  const { items: commitments, loading: loadingCommitments } = useCommitments();

  useDocumentTitle(t("reminders.documentTitle"));

  const entries = useMemo(
    () => scheduledReminders(occurrences, commitments),
    [occurrences, commitments],
  );

  const emailEnabled = user?.reminderEmailEnabled ?? true;
  const preferences = {
    ...local,
    email: emailEnabled,
    leadTime: user?.defaultReminderDays ?? DEFAULT_LEAD_TIME,
  };

  const save = async (id, fields) => {
    setSaving(id);
    try {
      await updateProfile(fields);
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setSaving(null);
    }
  };

  const toggle = (id, value) => {
    if (id !== "email") {
      setLocal((current) => ({ ...current, [id]: value }));
      return;
    }
    return save(id, { reminder_email_enabled: value });
  };

  const setLeadTime = (days) => save("lead", { default_reminder_days: days });

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>{t("reminders.title")}</h1>
        <p className={styles.subtitle}>{t("reminders.subtitle")}</p>
      </header>

      <div className={styles.grid}>
        <ReminderPreferencesCard
          preferences={preferences}
          saving={saving}
          onToggle={toggle}
          onLeadTime={setLeadTime}
        />
        <ActivityFeedCard
          entries={entries}
          muted={!emailEnabled}
          loading={loadingOccurrences || loadingCommitments}
        />
      </div>
    </div>
  );
}
