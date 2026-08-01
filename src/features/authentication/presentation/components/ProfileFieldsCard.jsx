import {
  InlineEditRow,
  InlineSelectRow,
} from "../../../../core/components/InlineEditRow/InlineEditRow";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { currencyOptions } from "../../domain/currencies";
import { useAuth } from "../providers/useAuth";
import styles from "../styles/profileCards.module.css";

export function ProfileFieldsCard() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const { run } = useAsyncAction(updateProfile);

  const save = async (patch, message) => {
    const result = await run(patch);
    if (result.ok) {
      toast.success(message);
    } else {
      toast.error(messageForError(t, result.error));
    }
  };

  const saveFirstName = async (next) => {
    if (!next) {
      toast.error(t("settings.firstNameRequired"));
      return;
    }
    await save({ first_name: next }, t("settings.profileUpdated"));
  };

  const saveLastName = async (next) => {
    await save({ last_name: next || null }, t("settings.profileUpdated"));
  };

  const saveCurrency = async (next) => {
    await save({ currency: next }, t("settings.currencyUpdated"));
  };

  return (
    <section className={styles.card}>
      <div className={styles.rows}>
        <InlineEditRow
          label={t("settings.firstName")}
          name="firstName"
          autoComplete="given-name"
          value={user?.firstName}
          onSave={saveFirstName}
        />
        <InlineEditRow
          label={t("settings.lastName")}
          name="lastName"
          autoComplete="family-name"
          value={user?.lastName}
          placeholder={t("settings.addLastName")}
          onSave={saveLastName}
        />
        <InlineSelectRow
          label={t("settings.currency")}
          name="currency"
          value={user?.currency}
          options={currencyOptions(user?.currency)}
          onChange={saveCurrency}
        />
      </div>
    </section>
  );
}
