import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/settings.module.css";

export function UnverifiedBanner() {
  const { t } = useTranslation();
  const { user, resendVerification } = useAuth();
  const toast = useToast();
  const { run, loading } = useAsyncAction(resendVerification);

  if (!user || user.isVerified) {
    return null;
  }

  const handleResend = async () => {
    const result = await run({ email: user.email });
    if (result.ok) {
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
        disabled={loading}
      >
        {loading ? t("auth.sending") : t("auth.resend")}
      </button>
    </div>
  );
}
