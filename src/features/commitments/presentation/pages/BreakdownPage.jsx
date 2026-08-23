import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Card } from "../../../../core/components/Card/Card";
import { Icon } from "../../../../core/components/Icon/Icon";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useToday } from "../../../../core/utils/useToday";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import {
  HORIZON_DAYS,
  categoryBreakdown,
  heaviest,
  monthlyTotals,
  withinMonth,
} from "../../domain/breakdown";
import {
  COMMITMENT_TYPES,
  categoryLabel,
  runRate,
  topCategories,
} from "../../domain/commitment";
import {
  formatMoney,
  formatMonth,
  formatMonthShort,
  formatPercent,
  parseDate,
} from "../../domain/formatting";
import { CategoryDonut } from "../components/CategoryDonut";
import { useCommitments } from "../providers/useCommitments";
import { upcomingRange, useOccurrences } from "../providers/useOccurrences";
import styles from "../styles/breakdown.module.css";

function monthStart(iso) {
  const date = parseDate(iso);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function BreakdownPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = useToday();

  useDocumentTitle(t("breakdown.documentTitle"));

  const range = useMemo(
    () => upcomingRange(monthStart(today), HORIZON_DAYS),
    [today],
  );
  const { items, loading, error } = useOccurrences(range);
  const { items: commitments, loading: loadingCommitments } = useCommitments();

  const currency = user?.currency ?? "CAD";
  const month = today.slice(0, 7);
  const monthLabel = useMemo(() => {
    const label = formatMonth(month);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [month]);

  const breakdown = useMemo(() => categoryBreakdown(withinMonth(items, month)), [items, month]);
  const donut = useMemo(
    () => topCategories(breakdown.rows.map((row) => ({ ...row, total: row.total }))),
    [breakdown.rows],
  );
  const months = useMemo(() => monthlyTotals(items), [items]);
  const rate = useMemo(() => runRate(commitments.filter((c) => c.status === "active")), [commitments]);
  const top = useMemo(() => heaviest(commitments), [commitments]);
  const peak = Math.max(...months.map((row) => row.total), 0);

  const busy = loading || loadingCommitments;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <Link to="/" className={styles.back}>
          <Icon name="previous" size={14} />
          {t("breakdown.back")}
        </Link>
        <h1 className={styles.title}>{t("breakdown.title")}</h1>
        <p className={styles.subtitle}>{t("breakdown.subtitle")}</p>
      </header>

      {error ? <Alert variant="error">{messageForError(t, error)}</Alert> : null}

      <Card
        title={t("breakdown.monthTitle", { month: monthLabel })}
        description={t("breakdown.monthDescription")}
      >
        {busy ? (
          <p className={styles.loading}>{t("common.loading")}</p>
        ) : breakdown.rows.length === 0 ? (
          <p className={styles.empty}>{t("breakdown.monthEmpty")}</p>
        ) : (
          <div className={styles.split}>
            <CategoryDonut slices={donut.slices} total={donut.total} currency={currency} />

            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{t("breakdown.columnCategory")}</th>
                  <th scope="col" className={styles.numeric}>
                    {t("breakdown.columnCount")}
                  </th>
                  <th scope="col" className={styles.numeric}>
                    {t("breakdown.columnAmount")}
                  </th>
                  <th scope="col" className={styles.numeric}>
                    {t("breakdown.columnShare")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdown.rows.map((row) => (
                  <tr key={row.category}>
                    <th scope="row">{categoryLabel(t, row.category)}</th>
                    <td className={styles.numeric}>{row.count}</td>
                    <td className={styles.numeric}>{formatMoney(row.total, currency)}</td>
                    <td className={styles.numeric}>{formatPercent(row.share)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">{t("breakdown.total")}</th>
                  <td className={styles.numeric}>
                    {breakdown.rows.reduce((sum, row) => sum + row.count, 0)}
                  </td>
                  <td className={styles.numeric}>{formatMoney(breakdown.total, currency)}</td>
                  <td className={styles.numeric} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <div className={styles.columns}>
        <Card title={t("breakdown.rateTitle")} description={t("breakdown.rateDescription")}>
          {busy ? (
            <p className={styles.loading}>{t("common.loading")}</p>
          ) : rate.annual === null ? (
            <p className={styles.empty}>{t("breakdown.rateEmpty")}</p>
          ) : (
            <>
              <div className={styles.figures}>
                <div className={styles.figure}>
                  <span className={styles.figureValue}>
                    {formatMoney(rate.annual, currency)}
                  </span>
                  <span className={styles.figureLabel}>{t("breakdown.perYear")}</span>
                </div>
                <div className={styles.figure}>
                  <span className={styles.figureValue}>
                    {formatMoney(rate.monthly, currency)}
                  </span>
                  <span className={styles.figureLabel}>{t("breakdown.perMonth")}</span>
                </div>
              </div>
              <p className={styles.note}>
                {t("breakdown.rateNote", { count: rate.lines })}
                {rate.oneoff ? ` ${t("breakdown.rateOneoff", { count: rate.oneoff })}` : ""}
              </p>
            </>
          )}
        </Card>

        <Card title={t("breakdown.comingTitle")} description={t("breakdown.comingDescription")}>
          {busy ? (
            <p className={styles.loading}>{t("common.loading")}</p>
          ) : months.length === 0 ? (
            <p className={styles.empty}>{t("breakdown.comingEmpty")}</p>
          ) : (
            <ol className={styles.columns}>
              {months.map((row, index) => (
                <li
                  key={row.month}
                  className={styles.column}
                  style={{ "--enter-delay": `${index * 70}ms` }}
                  aria-label={t("breakdown.columnAria", {
                    month: formatMonth(row.month),
                    amount: formatMoney(row.total, currency),
                    count: row.count,
                  })}
                >
                  <span className={styles.columnTip} aria-hidden="true">
                    {t("breakdown.dueCount", { count: row.count })}
                  </span>
                  <span className={styles.columnValue}>
                    {formatMoney(row.total, currency)}
                  </span>
                  <span className={styles.columnPlot} aria-hidden="true">
                    <span
                      className={styles.columnBar}
                      style={{ height: `${peak ? Math.max((row.total / peak) * 100, 3) : 0}%` }}
                    />
                  </span>
                  <span className={styles.columnName}>{formatMonthShort(row.month)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card title={t("breakdown.heaviestTitle")} description={t("breakdown.heaviestDescription")}>
        {busy ? (
          <p className={styles.loading}>{t("common.loading")}</p>
        ) : top.rows.length === 0 ? (
          <p className={styles.empty}>{t("breakdown.heaviestEmpty")}</p>
        ) : (
          <ul className={styles.ranking}>
            {top.rows.map((item, index) => (
              <li key={item.id} className={styles.rank} style={{ "--enter-delay": `${index * 55}ms` }}>
                <Icon name={COMMITMENT_TYPES[item.type].icon} size={15} className={styles.rankIcon} />
                <span className={styles.rankMain}>
                  <span className={styles.rankTitle}>{item.title}</span>
                  <span className={styles.rankMeta}>{categoryLabel(t, item.category)}</span>
                </span>
                <span className={styles.rankTrack} aria-hidden="true">
                  <span className={styles.rankBar} style={{ "--fill": item.share }} />
                </span>
                <span className={styles.rankValue}>
                  {t("breakdown.perYearValue", { amount: formatMoney(item.annual, currency) })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
