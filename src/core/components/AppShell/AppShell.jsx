import { NavLink } from "react-router-dom";

import { fullName, initials } from "../../../features/authentication/domain/user";
import { useAuth } from "../../../features/authentication/presentation/providers/useAuth";
import { useTranslation } from "../../translation/useTranslation";
import { cx } from "../../utils/classNames";
import { Avatar } from "../Avatar/Avatar";
import { Icon } from "../Icon/Icon";
import { PreferenceToggles } from "../PreferenceToggles/PreferenceToggles";
import styles from "./AppShell.module.css";

const NAV_ITEMS = [
  { to: "/", key: "dashboard", icon: "dashboard", end: true },
  { to: "/abonnements", key: "subscriptions", icon: "subscriptions" },
  { to: "/calendrier", key: "calendar", icon: "calendar" },
  { to: "/factures", key: "invoices", icon: "invoices" },
  { to: "/rappels", key: "reminders", icon: "reminders", soon: true },
  { to: "/reglages", key: "settings", icon: "settings" },
];

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink to="/" className={styles.brand}>
          <img className={styles.logo} src="/assets/logo.png" alt="" />
          <span className={styles.wordmark}>Oubliepas</span>
        </NavLink>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              viewTransition
              style={{ "--enter-delay": `${index * 34}ms` }}
              className={({ isActive }) => cx(styles.link, styles.enter, isActive && styles.active)}
            >
              <Icon name={item.icon} size={18} className={styles.icon} />
              <span className={styles.linkLabel}>{t(`nav.${item.key}`)}</span>
              {item.soon ? <span className={styles.soon}>{t("nav.soon")}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className={styles.foot}>
          <PreferenceToggles className={styles.prefs} />

          <div className={styles.account}>
            <Avatar
              seed={user?.email ?? ""}
              initials={initials(user)}
              src={user?.avatarUrl ?? undefined}
              size={30}
            />
            <div className={styles.identity}>
              <div className={styles.name}>{fullName(user)}</div>
              <div className={styles.email}>{user?.email}</div>
            </div>
          </div>

          <button type="button" className={styles.signOut} onClick={logout}>
            <Icon name="logout" size={18} className={styles.signOutIcon} />
            <span>{t("nav.signOut")}</span>
          </button>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
