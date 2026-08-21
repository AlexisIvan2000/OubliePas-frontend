import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../features/authentication/presentation/providers/useAuth";
import { getSummary, updateOccurrence } from "../../features/commitments/data/commitmentsApi";
import { useResource } from "../network/useResource";
import { STRIP_DAYS } from "../../features/commitments/domain/calendar";
import { topCategories } from "../../features/commitments/domain/commitment";
import { CategoryDonut } from "../../features/commitments/presentation/components/CategoryDonut";
import {
  CategoryDonutSkeleton,
  SummaryTilesSkeleton,
  UpcomingStripSkeleton,
} from "../../features/commitments/presentation/components/SummarySkeleton";
import { SummaryTiles } from "../../features/commitments/presentation/components/SummaryTiles";
import { UpcomingStrip } from "../../features/commitments/presentation/components/UpcomingStrip";
import {
  upcomingRange,
  useOccurrences,
} from "../../features/commitments/presentation/providers/useOccurrences";
import { Alert } from "../components/Alert/Alert";
import { Card } from "../components/Card/Card";
import { useToast } from "../components/Toast/useToast";
import { formatLongDate, parseDate } from "../utils/formatting";
import { greetingKey, greetingSlot, msUntilNextSlot } from "../utils/greeting";
import { messageForError } from "../network/errorMessages";
import { useTranslation } from "../../core/translation/useTranslation";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useToday } from "../utils/useToday";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useDocumentTitle(t("dashboard.documentTitle"));

  const {
    data: summary,
    error,
    revalidate: reloadSummary,
  } = useResource("summary", getSummary);

  const today = useToday();
  const range = useMemo(() => upcomingRange(parseDate(today), STRIP_DAYS), [today]);
  const { items, loading, error: dueError, setItems } = useOccurrences(range);

  const categories = useMemo(
    () => topCategories(summary?.byCategory ?? []),
    [summary?.byCategory],
  );

  useEffect(() => {
    const timer = setTimeout(() => setNow(new Date()), msUntilNextSlot(now));
    return () => clearTimeout(timer);
  }, [now]);

  const currency = summary?.currency ?? user?.currency ?? "CAD";

  const toggle = async (occurrence) => {
    setBusyId(occurrence.id);
    try {
      const updated = await updateOccurrence(occurrence.id, {
        status: occurrence.status === "paid" ? "pending" : "paid",
      });
      setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      reloadSummary();
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setBusyId(null);
    }
  };

  const failure = error ?? dueError;

  return (
    <>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>{formatLongDate(now)}</div>
          <h1 key={greetingSlot(now)} className={styles.title}>
            {t(greetingKey(now), { name: user?.firstName ?? "" })}
          </h1>
        </div>
      </div>

      {failure ? <Alert variant="error">{messageForError(t, failure)}</Alert> : null}

      {summary ? <SummaryTiles summary={summary} /> : <SummaryTilesSkeleton />}

      <div className={styles.columns}>
        <Card
          title={t("dashboard.upcomingTitle")}
          description={t("dashboard.upcomingWindow", { count: STRIP_DAYS })}
        >
          {loading ? (
            <UpcomingStripSkeleton days={STRIP_DAYS} />
          ) : (
            <UpcomingStrip
              items={items}
              days={STRIP_DAYS}
              currency={currency}
              busyId={busyId}
              onToggle={toggle}
            />
          )}
        </Card>

        <Card
          title={t("dashboard.categoriesTitle")}
          description={t("dashboard.categoriesWindow")}
        >
          {summary ? (
            <CategoryDonut
              slices={categories.slices}
              total={categories.total}
              currency={summary.currency}
            />
          ) : (
            <CategoryDonutSkeleton />
          )}
        </Card>
      </div>
    </>
  );
}
