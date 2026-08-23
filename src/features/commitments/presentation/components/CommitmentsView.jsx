import { useMemo, useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { Chip } from "../../../../core/components/Chip/Chip";
import { ConfirmDialog } from "../../../../core/components/ConfirmDialog/ConfirmDialog";
import { Icon } from "../../../../core/components/Icon/Icon";
import { SearchField } from "../../../../core/components/SearchField/SearchField";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useToday } from "../../../../core/utils/useToday";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { deleteCommitment, updateCommitment } from "../../data/commitmentsApi";
import {
  COMMITMENT_TYPES,
  SORTS,
  STATUS_TOAST_KEYS,
  categoryCounts,
  categoryLabel,
  matchesQuery,
  nextUp,
  runRate,
  sortCommitments,
} from "../../domain/commitment";
import { parseDate } from "../../domain/formatting";
import { monthRange, useOccurrences } from "../providers/useOccurrences";
import { useCommitments } from "../providers/useCommitments";
import styles from "../styles/commitments.module.css";
import { CommitmentFormDialog } from "./CommitmentFormDialog";
import { CommitmentListSkeleton } from "./CommitmentListSkeleton";
import { CommitmentRow } from "./CommitmentRow";
import { CommitmentStats } from "./CommitmentStats";
import { EmptyState } from "./EmptyState";

export function CommitmentsView({ type }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const { items, loading, error, reload } = useCommitments(type);

  const today = useToday();
  const range = useMemo(() => monthRange(parseDate(today)), [today]);
  const { items: occurrences, loading: dueLoading, reload: reloadDue } = useOccurrences(range);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("due");
  const [picked, setPicked] = useState(() => new Set());
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const meta = COMMITMENT_TYPES[type];
  const title = t(meta.titleKey);
  useDocumentTitle(title);

  const archivedCount = useMemo(
    () => items.filter((item) => item.status === "archived").length,
    [items],
  );

  const pool = useMemo(
    () => (showArchived ? items : items.filter((item) => item.status !== "archived")),
    [items, showArchived],
  );

  const buckets = useMemo(() => categoryCounts(pool), [pool]);

  const visible = useMemo(
    () =>
      sortCommitments(
        pool.filter(
          (item) =>
            (picked.size === 0 || picked.has(item.category)) && matchesQuery(t, item, query),
        ),
        sort,
      ),
    [pool, picked, query, sort, t],
  );

  const active = useMemo(() => visible.filter((item) => item.status === "active"), [visible]);
  const rate = useMemo(() => runRate(active), [active]);
  const next = useMemo(() => nextUp(active), [active]);

  const dueThisMonth = useMemo(() => {
    const ids = new Set(visible.map((item) => item.id));
    return occurrences.filter(
      (row) => row.status !== "skipped" && ids.has(row.commitmentId),
    );
  }, [occurrences, visible]);

  const monthTotal = useMemo(
    () => dueThisMonth.reduce((total, row) => total + Number(row.amount), 0),
    [dueThisMonth],
  );

  const currency = user?.currency ?? "CAD";
  const searching = query.trim().length > 0;
  const filtering = searching || picked.size > 0;

  const refresh = () => Promise.all([reload(), reloadDue()]);

  const toggleCategory = (category) =>
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(category)) {
        next.add(category);
      }
      return next;
    });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (commitment) => {
    setEditing(commitment);
    setFormOpen(true);
  };

  const changeStatus = async (commitment, status) => {
    try {
      await updateCommitment(commitment.id, { status });
      toast.push(t(STATUS_TOAST_KEYS[status], { title: commitment.title }));
      await refresh();
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    }
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteCommitment(target.id);
      toast.push(t("commitments.deleted", { title: target.title }));
      await refresh();
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{t(meta.subtitleKey)}</p>
        </div>
        <Button fullWidth={false} compact onClick={openCreate} className={styles.addButton}>
          <Icon name="add" size={16} />
          {t("common.add")}
        </Button>
      </header>

      {items.length ? (
        <>
          <CommitmentStats
            month={monthTotal}
            due={dueThisMonth.length}
            pending={dueLoading}
            rate={rate}
            next={next}
            currency={currency}
          />

          <div className={styles.toolbar}>
            <SearchField
              className={styles.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
              label={t("commitments.searchLabel", { kind: title.toLowerCase() })}
              placeholder={t(meta.searchKey)}
            />

            <select
              className={styles.sort}
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label={t("commitments.sortLabel")}
            >
              {SORTS.map((value) => (
                <option key={value} value={value}>
                  {t(`commitments.sort_${value}`)}
                </option>
              ))}
            </select>

            {archivedCount || showArchived ? (
              <Chip active={showArchived} onClick={() => setShowArchived((current) => !current)}>
                {t("commitments.showArchived", { count: archivedCount })}
              </Chip>
            ) : null}
          </div>

          {buckets.length > 1 ? (
            <div className={styles.filters}>
              <Chip
                className={styles.filterChip}
                active={picked.size === 0}
                onClick={() => setPicked(new Set())}
              >
                {t("commitments.allCategories", { count: pool.length })}
              </Chip>
              {buckets.map((bucket) => (
                <Chip
                  key={bucket.category}
                  className={styles.filterChip}
                  active={picked.has(bucket.category)}
                  onClick={() => toggleCategory(bucket.category)}
                >
                  {categoryLabel(t, bucket.category)}
                  <span className={styles.filterCount}>{bucket.count}</span>
                </Chip>
              ))}
            </div>
          ) : null}

          {filtering ? (
            <p className={styles.results}>
              {t("commitments.results", { count: visible.length, total: pool.length })}
            </p>
          ) : null}
        </>
      ) : null}

      {error ? <Alert variant="error">{messageForError(t, error)}</Alert> : null}

      {loading ? (
        <CommitmentListSkeleton />
      ) : visible.length ? (
        <ul className={styles.list}>
          {visible.map((commitment, index) => (
            <CommitmentRow
              key={commitment.id}
              commitment={commitment}
              currency={currency}
              today={today}
              index={index}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onStatusChange={changeStatus}
            />
          ))}
        </ul>
      ) : filtering ? (
        <EmptyState
          icon="search"
          title={
            searching
              ? t("commitments.noResultsTitle", { query: query.trim() })
              : t("commitments.noCategoryTitle")
          }
          message={t("commitments.noResultsBody")}
          actionLabel={t("commitments.clearFilters")}
          onAction={() => {
            setQuery("");
            setPicked(new Set());
          }}
        />
      ) : archivedCount ? (
        <EmptyState
          icon="archive"
          title={t("commitments.onlyArchivedTitle", { count: archivedCount })}
          message={t("commitments.onlyArchivedBody")}
          actionLabel={t("commitments.revealArchived")}
          onAction={() => setShowArchived(true)}
        />
      ) : (
        <EmptyState
          icon={meta.icon}
          title={t(meta.emptyTitleKey)}
          message={t(meta.emptyBodyKey)}
          actionLabel={t(meta.addKey)}
          onAction={openCreate}
        />
      )}

      {formOpen ? (
        <CommitmentFormDialog
          key={editing?.id ?? "new"}
          type={type}
          commitment={editing}
          onClose={() => setFormOpen(false)}
          onSaved={(saved) => {
            toast.push(
              t(editing ? "commitments.updated" : "commitments.created", { title: saved.title }),
            );
            refresh();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("commitments.deleteTitle", { title: pendingDelete?.title ?? "" })}
        message={t("commitments.deleteMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
