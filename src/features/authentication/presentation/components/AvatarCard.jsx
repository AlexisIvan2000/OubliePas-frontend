import { Avatar } from "../../../../core/components/Avatar/Avatar";
import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { initials } from "../../domain/user";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/profileCards.module.css";

export function AvatarCard() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const { run, loading } = useAsyncAction(updateProfile);

  const verified = Boolean(user?.isVerified);

  const handleRemove = async () => {
    const result = await run({ avatar_url: null });
    if (result.ok) {
      toast.success(t("settings.photoRemoved"));
    } else {
      toast.error(messageForError(t, result.error));
    }
  };

  return (
    <section className={styles.card}>
      <Avatar
        seed={user?.email ?? ""}
        initials={initials(user)}
        src={user?.avatarUrl ?? undefined}
        size={80}
        shape="rounded"
      />

      <div className={styles.photoBody}>
        <div className={styles.photoActions}>
          <Button variant="secondary" fullWidth={false} compact disabled>
            {t("settings.choosePhoto")}
          </Button>
          <Button
            variant="ghost"
            fullWidth={false}
            onClick={handleRemove}
            loading={loading}
            disabled={!user?.avatarUrl}
          >
            {t("settings.removePhoto")}
          </Button>
        </div>

        <p className={styles.photoHint}>{t("settings.photoSoon")}</p>

        <span className={cx(styles.badge, verified ? styles.badgeOk : styles.badgeWarn)}>
          <Icon name={verified ? "verified" : "late"} size={16} variant="Bold" />
          {verified ? t("settings.emailVerified") : t("settings.emailUnverified")}
        </span>
      </div>
    </section>
  );
}
