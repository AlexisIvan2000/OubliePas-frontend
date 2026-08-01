import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../features/authentication/presentation/providers/useAuth";
import { getSummary } from "../../features/commitments/data/commitmentsApi";
import {
  SummaryTilesSkeleton,
  UpcomingListSkeleton,
} from "../../features/commitments/presentation/components/SummarySkeleton";
import { SummaryTiles } from "../../features/commitments/presentation/components/SummaryTiles";
import { UpcomingList } from "../../features/commitments/presentation/components/UpcomingList";
import { Alert } from "../components/Alert/Alert";
import { Card } from "../components/Card/Card";
import { formatLongDate } from "../utils/formatting";
import { messageForError } from "../network/errorMessages";
import { useTranslation } from "../../core/translation/useTranslation";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useDocumentTitle(t("dashboard.documentTitle"));

  useEffect(() => {
    let active = true;

    getSummary()
      .then((data) => active && setSummary(data))
      .catch((caught) => active && setError(caught));

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>{formatLongDate(new Date())}</div>
          <h1 className={styles.title}>{t("dashboard.greeting", { name: user?.firstName ?? "" })}</h1>
        </div>
      </div>

      {error ? <Alert variant="error">{messageForError(t, error)}</Alert> : null}

      {summary ? <SummaryTiles summary={summary} /> : <SummaryTilesSkeleton />}

      <div className={styles.columns}>
        <Card
          title={t("dashboard.upcomingTitle")}
          description={summary ? t("dashboard.upcomingWindow", { count: summary.upcomingDays }) : undefined}
        >
          {summary ? (
            <UpcomingList
              items={summary.upcoming}
              total={summary.upcomingTotal}
              days={summary.upcomingDays}
              currency={summary.currency}
            />
          ) : (
            <UpcomingListSkeleton />
          )}
        </Card>

        <Card title={t("dashboard.shortcuts")}>
          <div className={styles.shortcuts}>
            <Link to="/abonnements" className={styles.shortcut}>
              {t("dashboard.addSubscription")}
            </Link>
            <Link to="/factures" className={styles.shortcut}>
              {t("dashboard.addInvoice")}
            </Link>
            <Link to="/calendrier" className={styles.shortcut}>
              {t("dashboard.seeCalendar")}
            </Link>
            <Link to="/reglages" className={styles.shortcut}>
              {t("dashboard.editSettings")}
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
