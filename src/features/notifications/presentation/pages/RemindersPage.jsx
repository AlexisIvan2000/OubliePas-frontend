import { useMemo, useState } from "react";

import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useCommitments } from "../../../commitments/presentation/providers/useCommitments";
import { useOccurrences } from "../../../commitments/presentation/providers/useOccurrences";
import { DEFAULT_PREFERENCES, scheduledReminders } from "../../domain/reminders";
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
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const range = useMemo(() => ({ start: isoToday(), end: isoIn(HORIZON_DAYS) }), []);

  const { items: occurrences, loading: loadingOccurrences } = useOccurrences(range);
  const { items: commitments, loading: loadingCommitments } = useCommitments();

  useDocumentTitle(t("reminders.documentTitle"));

  const entries = useMemo(
    () => scheduledReminders(occurrences, commitments),
    [occurrences, commitments],
  );

  const toggle = (id, value) => setPreferences((current) => ({ ...current, [id]: value }));
  const setLeadTime = (leadTime) => setPreferences((current) => ({ ...current, leadTime }));

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>{t("reminders.title")}</h1>
        <p className={styles.subtitle}>{t("reminders.subtitle")}</p>
      </header>

      <div className={styles.grid}>
        <ReminderPreferencesCard
          preferences={preferences}
          onToggle={toggle}
          onLeadTime={setLeadTime}
        />
        <ActivityFeedCard
          entries={entries}
          loading={loadingOccurrences || loadingCommitments}
        />
      </div>
    </div>
  );
}
