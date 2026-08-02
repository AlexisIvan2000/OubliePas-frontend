import { Chip } from "../../../../core/components/Chip/Chip";
import { Switch } from "../../../../core/components/Switch/Switch";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { CHANNELS, DIGESTS, LEAD_TIMES } from "../../domain/reminders";
import styles from "../styles/reminders.module.css";

function ToggleRow({ id, available, checked, onChange }) {
  const { t } = useTranslation();
  const label = t(`reminders.channel.${id}.label`);

  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <span className={styles.toggleLabel}>
          {label}
          {available ? null : <span className={styles.soon}>{t("nav.soon")}</span>}
        </span>
        <span className={styles.toggleHint}>{t(`reminders.channel.${id}.description`)}</span>
      </div>
      <Switch
        checked={checked}
        disabled={!available}
        label={label}
        onChange={(next) => onChange(id, next)}
      />
    </div>
  );
}

export function ReminderPreferencesCard({ preferences, onToggle, onLeadTime }) {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{t("reminders.preferences.title")}</h2>
        <p className={styles.cardDescription}>{t("reminders.preferences.description")}</p>
      </header>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t("reminders.channels.title")}</h3>
        {CHANNELS.map((channel) => (
          <ToggleRow
            key={channel.id}
            id={channel.id}
            available={channel.available}
            checked={preferences[channel.id]}
            onChange={onToggle}
          />
        ))}
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t("reminders.digest.title")}</h3>
        {DIGESTS.map((digest) => (
          <ToggleRow
            key={digest.id}
            id={digest.id}
            available={digest.available}
            checked={preferences[digest.id]}
            onChange={onToggle}
          />
        ))}
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t("reminders.lead.title")}</h3>
        <p className={styles.groupHint}>{t("reminders.lead.description")}</p>
        <div className={styles.chips} role="group" aria-label={t("reminders.lead.title")}>
          {LEAD_TIMES.map((days) => (
            <Chip
              key={days}
              active={preferences.leadTime === days}
              onClick={() => onLeadTime(days)}
            >
              {days === 0
                ? t("reminders.lead.sameDay")
                : t("reminders.lead.before", { count: days })}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
