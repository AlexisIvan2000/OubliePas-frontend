import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../features/authentication/presentation/providers/useAuth";
import {
  getSummary,
  listLateOccurrences,
} from "../../features/commitments/data/commitmentsApi";
import { useResource } from "../network/useResource";
import { STRIP_DAYS } from "../../features/commitments/domain/calendar";
import { topCategories } from "../../features/commitments/domain/commitment";
import { CategoryDonut } from "../../features/commitments/presentation/components/CategoryDonut";
import { LateBanner } from "../../features/commitments/presentation/components/LateBanner";
import {
  CategoryDonutSkeleton,
  SummaryTilesSkeleton,
  UpcomingStripSkeleton,
} from "../../features/commitments/presentation/components/SummarySkeleton";
import { SummaryTiles } from "../../features/commitments/presentation/components/SummaryTiles";
import { SettleDialog } from "../../features/commitments/presentation/components/SettleDialog";
import { UpcomingStrip } from "../../features/commitments/presentation/components/UpcomingStrip";
import {
  upcomingRange,
  useOccurrences,
} from "../../features/commitments/presentation/providers/useOccurrences";
import { useSettle } from "../../features/commitments/presentation/providers/useSettle";
import { Alert } from "../components/Alert/Alert";
import { Card } from "../components/Card/Card";
import { Icon } from "../components/Icon/Icon";
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
  const [now, setNow] = useState(() => new Date());

  useDocumentTitle(t("dashboard.documentTitle"));

  const {
    data: summary,
    error,
    revalidate: reloadSummary,
  } = useResource("summary", getSummary);

  const { data: late, setData: setLate } = useResource("late", listLateOccurrences);

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

  const settle = useSettle((updated) => {
    setItems((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setLate((current) =>
      (current ?? [])
        .map((row) => (row.id === updated.id ? updated : row))
        .filter((row) => row.status === "pending"),
    );
    reloadSummary();
  });

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

      <LateBanner
        items={late ?? []}
        currency={currency}
        busyId={settle.busyId}
        onToggle={settle.pick}
      />

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
              busyId={settle.busyId}
              onToggle={settle.pick}
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

          <div className={styles.cardFooter}>
            <Link to="/repartition" className={styles.seeMore}>
              {t("dashboard.seeBreakdown")}
              <Icon name="next" size={14} />
            </Link>
          </div>
        </Card>
      </div>

      {settle.target ? (
        <SettleDialog
          occurrence={settle.target}
          currency={currency}
          busy={settle.busyId === settle.target.id}
          onSettle={settle.settle}
          onClose={settle.close}
        />
      ) : null}
    </>
  );
}
