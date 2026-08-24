import { Link } from "react-router-dom";

import { cx } from "../../utils/classNames";
import { PreferenceToggles } from "../PreferenceToggles/PreferenceToggles";
import styles from "./AuthLayout.module.css";

export function AuthLayout({ title, subtitle, children, footer, footnote, aside }) {
  return (
    <main className={styles.wrapper}>
      <div className={styles.aura} aria-hidden="true" />

      <div className={styles.column}>
        <div className={cx(styles.topbar, styles.rise)} style={{ "--rise": "0ms" }}>
          <Link to="/" className={styles.brand}>
            <img className={styles.logo} src="/assets/logo.png" alt="" />
            <span className={styles.wordmark}>OubliePas</span>
          </Link>
          <PreferenceToggles />
        </div>

        <div className={styles.body}>
          <h1 className={cx(styles.title, styles.rise)} style={{ "--rise": "80ms" }}>
            {title}
          </h1>
          {subtitle ? (
            <p className={cx(styles.subtitle, styles.rise)} style={{ "--rise": "140ms" }}>
              {subtitle}
            </p>
          ) : null}
          <div className={cx(styles.fields, styles.rise)} style={{ "--rise": "200ms" }}>
            {children}
          </div>
          {footer ? (
            <div className={cx(styles.footer, styles.rise)} style={{ "--rise": "280ms" }}>
              {footer}
            </div>
          ) : null}
        </div>

        <p className={cx(styles.footnote, styles.rise)} style={{ "--rise": "340ms" }}>
          {footnote}
        </p>
      </div>

      <aside className={cx(styles.aside, styles.asideRise)}>{aside}</aside>
    </main>
  );
}
