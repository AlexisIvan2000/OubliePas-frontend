import { cx } from "../../utils/classNames";
import styles from "./Card.module.css";

export function Card({ title, description, children, className }) {
  return (
    <section className={cx(styles.card, className)}>
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
