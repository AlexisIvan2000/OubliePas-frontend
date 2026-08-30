import { Button } from "../../../../core/components/Button/Button";
import { Chip } from "../../../../core/components/Chip/Chip";
import { cx } from "../../../../core/utils/classNames";
import { Switch } from "../../../../core/components/Switch/Switch";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { CHANNELS, DIGESTS, FAMILIES, LEAD_TIMES } from "../../domain/reminders";
import styles from "../styles/reminders.module.css";

function ToggleRow({
  id,
  group = "channel",
  soon = false,
  disabled = false,
  noteKey = null,
  action = null,
  checked,
  onChange,
}) {
  const { t } = useTranslation();
  const label = t(`reminders.${group}.${id}.label`);

  return (
    <div
      className={cx(
        styles.toggleRow,
        !disabled && checked && styles.toggleOn,
        disabled && styles.toggleOff,
      )}
    >
      <div className={styles.toggleText}>
        <span className={styles.toggleLabel}>
          {label}
          {soon ? <span className={styles.soon}>{t("nav.soon")}</span> : null}
        </span>
        <span className={styles.toggleHint}>{t(`reminders.${group}.${id}.description`)}</span>
        {/* Un interrupteur grise sans un mot laisse chercher la panne : la
            raison compte plus que le blocage. */}
        {noteKey ? <span className={styles.toggleNote}>{t(noteKey)}</span> : null}
        {action ? <div className={styles.toggleAction}>{action}</div> : null}
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        label={label}
        onChange={(next) => onChange(id, next)}
      />
    </div>
  );
}

export function ReminderPreferencesCard({ preferences, saving, push, onToggle, onLeadTime }) {
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
            soon={!channel.available}
            disabled={
              !channel.available ||
              saving === channel.id ||
              (channel.id === "push" && (push.locked || push.busy))
            }
            noteKey={channel.id === "push" ? push.noteKey : null}
            action={
              channel.id === "push" && push.onTest ? (
                <Button
                  variant="secondary"
                  compact
                  fullWidth={false}
                  loading={push.testing}
                  disabled={push.busy}
                  onClick={push.onTest}
                >
                  {t("reminders.push.testLabel")}
                </Button>
              ) : null
            }
            checked={preferences[channel.id]}
            onChange={onToggle}
          />
        ))}
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t("reminders.families.title")}</h3>
        <p className={styles.groupHint}>{t("reminders.families.description")}</p>
        {FAMILIES.map((family) => (
          <ToggleRow
            key={family.id}
            id={family.id}
            group="family"
            disabled={(!preferences.email && !preferences.push) || saving === family.id}
            checked={preferences[family.id]}
            onChange={onToggle}
          />
        ))}
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t("reminders.digest.title")}</h3>
        {/* Le recapitulatif ne part que par courriel : l'offrir canal coupe
            promettrait un envoi qui n'a aucun chemin pour sortir. */}
        {DIGESTS.map((digest) => (
          <ToggleRow
            key={digest.id}
            id={digest.id}
            soon={!digest.available}
            disabled={!digest.available || !preferences.email || saving === digest.id}
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
              disabled={saving === "lead"}
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
