import { useMemo, useState } from "react";

import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { addDaysIso, todayIso } from "../../../../core/utils/formatting";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { useCommitments } from "../../../commitments/presentation/providers/useCommitments";
import { useOccurrences } from "../../../commitments/presentation/providers/useOccurrences";
import { blockingReason } from "../../domain/push";
import {
  DEFAULT_LEAD_TIME,
  DEFAULT_PREFERENCES,
  FAMILIES,
  scheduledReminders,
} from "../../domain/reminders";
import { ActivityFeedCard } from "../components/ActivityFeedCard";
import { ReminderPreferencesCard } from "../components/ReminderPreferencesCard";
import { SENT, usePush } from "../hooks/usePush";
import styles from "../styles/reminders.module.css";

const HORIZON_DAYS = 60;

function isoToday() {
  return todayIso();
}

function isoIn(days) {
  return addDaysIso(todayIso(), days);
}

export function RemindersPage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [local, setLocal] = useState(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(null);
  const push = usePush();
  const range = useMemo(() => ({ start: isoToday(), end: isoIn(HORIZON_DAYS) }), []);

  const { items: occurrences, loading: loadingOccurrences } = useOccurrences(range);
  const { items: commitments, loading: loadingCommitments } = useCommitments();

  useDocumentTitle(t("reminders.documentTitle"));

  const entries = useMemo(
    () => scheduledReminders(occurrences, commitments),
    [occurrences, commitments],
  );

  const emailEnabled = user?.reminderEmailEnabled ?? true;
  // L'interrupteur parle de cet appareil, pas seulement du compte : le reglage
  // peut etre allume depuis un autre telephone alors que celui-ci n'est abonne
  // a rien, et l'afficher au vert serait une promesse vide.
  const pushEnabled = (user?.reminderPushEnabled ?? false) && push.subscribed;
  const reason = blockingReason(push.state);
  const preferences = {
    ...local,
    email: emailEnabled,
    push: pushEnabled,
    notice: user?.reminderNoticeEnabled ?? true,
    overdue: user?.reminderOverdueEnabled ?? true,
    action: user?.reminderActionEnabled ?? true,
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

  const togglePush = async (value) => {
    setSaving("push");
    try {
      if (!value) {
        await updateProfile({ reminder_push_enabled: false });
        await push.disable();
        return;
      }
      const outcome = await push.enable();
      if (outcome !== SENT) {
        toast.push(t(`reminders.push.${outcome}`), "error");
        return;
      }
      await updateProfile({ reminder_push_enabled: true });
      toast.push(t("reminders.push.sent"));
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setSaving(null);
    }
  };

  const toggle = (id, value) => {
    if (id === "email") {
      return save(id, { reminder_email_enabled: value });
    }
    if (id === "push") {
      return togglePush(value);
    }
    const family = FAMILIES.find((entry) => entry.id === id);
    if (family) {
      return save(id, { [family.field]: value });
    }
    setLocal((current) => ({ ...current, [id]: value }));
    return undefined;
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
          push={{
            busy: push.busy,
            locked: Boolean(reason),
            noteKey: reason ? `reminders.push.${reason}` : null,
          }}
          onToggle={toggle}
          onLeadTime={setLeadTime}
        />
        <ActivityFeedCard
          entries={entries}
          muted={!emailEnabled && !pushEnabled}
          loading={loadingOccurrences || loadingCommitments}
        />
      </div>
    </div>
  );
}
