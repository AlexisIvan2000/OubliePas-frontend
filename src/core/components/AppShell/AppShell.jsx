import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { fullName, initials } from "../../../features/authentication/domain/user";
import { getSummary } from "../../../features/commitments/data/commitmentsApi";
import { useAuth } from "../../../features/authentication/presentation/providers/useAuth";
import { useResource } from "../../network/useResource";
import { useTranslation } from "../../translation/useTranslation";
import { cx } from "../../utils/classNames";
import { Avatar } from "../Avatar/Avatar";
import { Icon } from "../Icon/Icon";
import styles from "./AppShell.module.css";

const NAV_GROUPS = [
  {
    key: "tracking",
    items: [
      { to: "/", key: "dashboard", icon: "dashboard", end: true, counts: "late" },
      { to: "/abonnements", key: "subscriptions", icon: "subscriptions" },
      { to: "/factures", key: "invoices", icon: "invoices" },
      { to: "/calendrier", key: "calendar", icon: "calendar" },
      { to: "/repartition", key: "breakdown", icon: "breakdown" },
    ],
  },
  {
    key: "account",
    items: [
      { to: "/rappels", key: "reminders", icon: "reminders" },
      { to: "/reglages", key: "settings", icon: "settings" },
    ],
  },
];

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { data: summary, revalidate } = useResource("summary", getSummary);

  const firstPath = useRef(pathname);

  useEffect(() => {
    if (firstPath.current === pathname) {
      return;
    }
    firstPath.current = pathname;
    revalidate();
  }, [pathname, revalidate]);

  const late = summary?.lateCount ?? 0;
  let step = 0;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <NavLink to="/" className={styles.brand}>
          <img className={styles.logo} src="/assets/logo.png" alt="" />
          <span className={styles.wordmark}>OubliePas</span>
        </NavLink>

        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.key} className={styles.group}>
              <p className={styles.groupLabel}>{t(`nav.group.${group.key}`)}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  viewTransition
                  style={{ "--enter-delay": `${step++ * 34}ms` }}
                  className={({ isActive }) =>
                    cx(styles.link, styles.enter, isActive && styles.active)
                  }
                >
                  <Icon name={item.icon} size={18} className={styles.icon} />
                  <span className={styles.linkLabel}>{t(`nav.${item.key}`)}</span>
                  {item.counts === "late" && late > 0 ? (
                    <span className={styles.count} title={t("nav.lateCount", { count: late })}>
                      {late}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.foot}>
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
