import { useRef } from "react";

import { Avatar } from "../../../../core/components/Avatar/Avatar";
import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { ACCEPTED_AVATAR_TYPES, avatarFileError } from "../../domain/avatar";
import { initials } from "../../domain/user";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/profileCards.module.css";

export function AvatarCard() {
  const { t } = useTranslation();
  const { user, uploadAvatar, deleteAvatar } = useAuth();
  const toast = useToast();
  const input = useRef(null);
  const upload = useAsyncAction(uploadAvatar);
  const remove = useAsyncAction(deleteAvatar);

  const verified = Boolean(user?.isVerified);
  const busy = upload.loading || remove.loading;

  const handlePick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const problem = avatarFileError(file);
    if (problem) {
      toast.error(t(problem));
      return;
    }

    upload.run(file).then((result) => {
      if (result.ok) {
        toast.success(t("settings.photoUpdated"));
      } else {
        toast.error(messageForError(t, result.error));
      }
    });
  };

  const handleRemove = async () => {
    const result = await remove.run();
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
          <input
            ref={input}
            type="file"
            accept={ACCEPTED_AVATAR_TYPES}
            className={styles.fileInput}
            onChange={handlePick}
            tabIndex={-1}
          />
          <Button
            variant="secondary"
            fullWidth={false}
            compact
            loading={upload.loading}
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {t("settings.choosePhoto")}
          </Button>
          <Button
            variant="ghost"
            fullWidth={false}
            onClick={handleRemove}
            loading={remove.loading}
            disabled={busy || !user?.hasCustomAvatar}
          >
            {t("settings.removePhoto")}
          </Button>
        </div>

        <p className={styles.photoHint}>{t("settings.photoHint")}</p>

        <span className={cx(styles.badge, verified ? styles.badgeOk : styles.badgeWarn)}>
          <Icon name={verified ? "verified" : "late"} size={16} variant="Bold" />
          {verified ? t("settings.emailVerified") : t("settings.emailUnverified")}
        </span>
      </div>
    </section>
  );
}
