import { useTranslation } from "../translation/useTranslation";
import { ComingSoonPage } from "./ComingSoonPage";

export function RemindersPage() {
  const { t } = useTranslation();

  return <ComingSoonPage title={t("reminders.title")} subtitle={t("reminders.subtitle")} />;
}
