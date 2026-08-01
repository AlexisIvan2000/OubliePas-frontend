import { Link } from "react-router-dom";

import { PreferenceToggles } from "../PreferenceToggles/PreferenceToggles";
import styles from "./AuthLayout.module.css";

export function AuthLayout({ title, subtitle, children, footer, footnote, aside }) {
  return (
    <main className={styles.wrapper}>
      <div className={styles.column}>
        <div className={styles.topbar}>
          <Link to="/" className={styles.brand}>
            <img className={styles.logo} src="/assets/logo.png" alt="" />
            <span className={styles.wordmark}>Oubliepas</span>
          </Link>
          <PreferenceToggles />
        </div>

        <div className={styles.body}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {children}
          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </div>

        <p className={styles.footnote}>{footnote}</p>
      </div>

      <aside className={styles.aside}>{aside}</aside>
    </main>
  );
}
