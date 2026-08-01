import { SHIMMER_STEP, Skeleton } from "../../../../core/components/Skeleton/Skeleton";
import styles from "../styles/skeletons.module.css";
import { useTranslation } from "../../../../core/translation/useTranslation";

const WIDTHS = ["7.5rem", "5.5rem", "9rem", "6.5rem", "8rem"];

export function CommitmentListSkeleton({ rows = 4 }) {
  const { t } = useTranslation();
  return (
    <ul className={styles.list} aria-busy="true" aria-label={t("a11y.loadingList")}>
      {Array.from({ length: rows }, (_, index) => (
        <li className={styles.row} key={index}>
          <div className={styles.main}>
            <Skeleton
              width={WIDTHS[index % WIDTHS.length]}
              height="0.9375rem"
              delay={index * SHIMMER_STEP}
            />
            <Skeleton
              width="11rem"
              height="0.6875rem"
              delay={index * SHIMMER_STEP + 40}
              className={styles.meta}
            />
          </div>

          <div className={styles.due}>
            <Skeleton width="6.5rem" height="0.8125rem" delay={index * SHIMMER_STEP + 60} />
            <Skeleton
              width="4rem"
              height="0.6875rem"
              delay={index * SHIMMER_STEP + 90}
              className={styles.meta}
            />
          </div>

          <Skeleton
            width="4.5rem"
            height="0.9375rem"
            delay={index * SHIMMER_STEP + 110}
            className={styles.amount}
          />

          <div className={styles.actions}>
            <Skeleton width="2rem" height="2rem" radius="0.5rem" delay={index * SHIMMER_STEP} />
            <Skeleton
              width="2rem"
              height="2rem"
              radius="0.5rem"
              delay={index * SHIMMER_STEP + 40}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
