import { cx } from "../../utils/classNames";
import styles from "./Skeleton.module.css";

export const SHIMMER_STEP = 90;

export function Skeleton({ width = "100%", height = "1rem", radius, delay = 0, className }) {
  return (
    <span
      className={cx(styles.block, className)}
      style={{
        display: "block",
        width,
        height,
        borderRadius: radius,
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
      aria-hidden="true"
    />
  );
}

export function AppSkeleton() {
  return (
    <div className={styles.app} aria-busy="true" aria-label="Chargement de votre espace">
      <div className={styles.sidebar}>
        <Skeleton width="9rem" height="2rem" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Skeleton
            key={index}
            height="2.25rem"
            radius="0.5625rem"
            delay={(index + 1) * SHIMMER_STEP}
          />
        ))}
      </div>

      <div className={styles.content}>
        <Skeleton width="11rem" height="0.75rem" />
        <div style={{ height: "0.625rem" }} />
        <Skeleton width="16rem" height="2.25rem" delay={SHIMMER_STEP} />

        <div className={styles.cards}>
          {[0, 1, 2].map((index) => (
            <div className={styles.card} key={index}>
              <Skeleton width="7rem" height="0.75rem" delay={index * SHIMMER_STEP} />
              <Skeleton width="4.5rem" height="1.75rem" delay={index * SHIMMER_STEP + 40} />
              <Skeleton width="9rem" height="0.75rem" delay={index * SHIMMER_STEP + 80} />
            </div>
          ))}
        </div>

        <div className={cx(styles.card, styles.wide)}>
          <Skeleton width="12rem" height="1rem" />
          <Skeleton height="100%" delay={SHIMMER_STEP} />
        </div>
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className={styles.centered} aria-busy="true" aria-label="Chargement">
      <Skeleton width="9rem" height="2.25rem" />
      <Skeleton width="18rem" height="0.875rem" delay={SHIMMER_STEP} />
      <Skeleton width="14rem" height="0.875rem" delay={SHIMMER_STEP * 2} />
    </div>
  );
}
