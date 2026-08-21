import { SHIMMER_STEP, Skeleton } from "../../../../core/components/Skeleton/Skeleton";
import { cx } from "../../../../core/utils/classNames";
import styles from "../styles/skeletons.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

export function SummaryTilesSkeleton() {
  const { t } = useTranslation();
  return (
    <div className={styles.tiles} aria-busy="true" aria-label={t("a11y.loadingSummary")}>
      {[0, 1, 2].map((index) => (
        <div className={cx(styles.tile, index === 0 && styles.feature)} key={index}>
          <Skeleton width="6.5rem" height="0.6875rem" delay={index * SHIMMER_STEP} />
          <Skeleton
            width={index === 0 ? "9rem" : "5.5rem"}
            height="1.75rem"
            delay={index * SHIMMER_STEP + 50}
            className={styles.tileValue}
          />
          <Skeleton
            width="7.5rem"
            height="0.6875rem"
            delay={index * SHIMMER_STEP + 100}
            className={styles.tileNote}
          />
        </div>
      ))}
    </div>
  );
}

export function CategoryDonutSkeleton({ rows = 4 }) {
  const { t } = useTranslation();

  return (
    <div className={styles.categories} aria-busy="true" aria-label={t("a11y.loadingCategories")}>
      <Skeleton width="11rem" height="11rem" radius="50%" className={styles.ring} />
      <div className={styles.legend}>
        {Array.from({ length: rows }, (_, index) => (
          <div className={styles.legendRow} key={index}>
            <Skeleton width="0.625rem" height="0.625rem" delay={index * SHIMMER_STEP} />
            <Skeleton
              width={["6rem", "4.5rem", "7rem", "5rem"][index % 4]}
              height="0.875rem"
              delay={index * SHIMMER_STEP + 40}
              className={styles.legendName}
            />
            <Skeleton width="4rem" height="0.875rem" delay={index * SHIMMER_STEP + 80} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UpcomingStripSkeleton({ days = 14, rows = 3 }) {
  const { t } = useTranslation();

  return (
    <div aria-busy="true" aria-label={t("a11y.loadingUpcoming")}>
      <div className={styles.strip}>
        {Array.from({ length: days }, (_, index) => (
          <Skeleton
            key={index}
            height="3.75rem"
            radius="0.625rem"
            delay={(index % 7) * SHIMMER_STEP}
          />
        ))}
      </div>

      <div className={styles.upcoming}>
        {Array.from({ length: rows }, (_, index) => (
          <div className={styles.upcomingRow} key={index}>
            <Skeleton width="1.75rem" height="1.75rem" radius="50%" delay={index * SHIMMER_STEP} />
            <Skeleton
              width={["6rem", "7.5rem", "5rem"][index % 3]}
              height="0.875rem"
              delay={index * SHIMMER_STEP + 40}
              className={styles.upcomingTitle}
            />
            <Skeleton width="4rem" height="0.875rem" delay={index * SHIMMER_STEP + 80} />
          </div>
        ))}
      </div>
    </div>
  );
}
