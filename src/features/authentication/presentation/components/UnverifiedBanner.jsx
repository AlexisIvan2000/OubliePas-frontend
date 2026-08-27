import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { useCooldown } from "../../../../core/utils/useCooldown";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/settings.module.css";

export function UnverifiedBanner() {
  const { t } = useTranslation();
  const { user, resendVerification } = useAuth();
  const toast = useToast();
  const { run, loading } = useAsyncAction(resendVerification);
  const cooldown = useCooldown();

  if (!user || user.isVerified) {
    return null;
  }

  const handleResend = async () => {
    const result = await run({ email: user.email });
    if (result.ok) {
      cooldown.start();
      toast.success(t("auth.resent"));
    } else {
      toast.error(messageForError(t, result.error));
    }
  };

  return (
    <div className={styles.banner} role="status">
      <span className={styles.bannerText}>{t("auth.unverifiedBanner")}</span>
      <button
        type="button"
        className={styles.bannerAction}
        onClick={handleResend}
        disabled={loading || cooldown.waiting}
      >
        {loading ? t("auth.sending") : null}
        {!loading && cooldown.waiting
          ? t("auth.resendIn", { count: cooldown.left })
          : null}
        {!loading && !cooldown.waiting ? t("auth.resend") : null}
      </button>
    </div>
  );
}
