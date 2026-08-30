import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { Chip } from "../../../../core/components/Chip/Chip";
import { ConfirmDialog } from "../../../../core/components/ConfirmDialog/ConfirmDialog";
import { Icon } from "../../../../core/components/Icon/Icon";
import { Picker } from "../../../../core/components/Picker/Picker";
import { SearchField } from "../../../../core/components/SearchField/SearchField";
import { useToast } from "../../../../core/components/Toast/useToast";
import { UndoBar } from "../../../../core/components/UndoBar/UndoBar";
import { messageForCode, messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useToday } from "../../../../core/utils/useToday";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import {
  deleteAllCommitments,
  deleteCommitment,
  deleteManyCommitments,
  emptyTrash,
  restoreCommitments,
  setStatusMany,
  updateCommitment,
} from "../../data/commitmentsApi";
import {
  BULK_CONFIRM_ABOVE,
  COMMITMENT_TYPES,
  REVERSIBLE_STATUS,
  SORTS,
  STATUS_TOAST_KEYS,
  bulkActions,
  categoryCounts,
  categoryLabel,
  matchesQuery,
  nextUp,
  previousStatuses,
  quotaState,
  runRate,
  sortCommitments,
  undoSteps,
} from "../../domain/commitment";
import { parseDate } from "../../domain/formatting";
import { useSelection } from "../hooks/useSelection";
import { monthRange, useOccurrences } from "../providers/useOccurrences";
import { useCommitments, useTrash } from "../providers/useCommitments";
import styles from "../styles/commitments.module.css";
import { CommitmentFormDialog } from "./CommitmentFormDialog";
import { CommitmentListSkeleton } from "./CommitmentListSkeleton";
import { CommitmentRow } from "./CommitmentRow";
import { CommitmentStats } from "./CommitmentStats";
import { SelectionBar } from "./SelectionBar";
import { EmptyState } from "./EmptyState";
import { TrashList } from "./TrashList";

const BULK_DONE_KEYS = {
  active: "commitments.bulkActiveDone",
  paused: "commitments.bulkPausedDone",
  archived: "commitments.bulkArchivedDone",
};

export function CommitmentsView({ type }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const { items, loading, error, reload } = useCommitments(type);
  const { items: trashed, reload: reloadTrash } = useTrash(type);

  const today = useToday();
  const range = useMemo(() => monthRange(parseDate(today)), [today]);
  const { items: occurrences, loading: dueLoading, reload: reloadDue } = useOccurrences(range);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("due");
  const [picked, setPicked] = useState(() => new Set());
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmingWipe, setConfirmingWipe] = useState(false);
  const [confirmingPurge, setConfirmingPurge] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [undo, setUndo] = useState(null);
  const [undoing, setUndoing] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmingBulk, setConfirmingBulk] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const selection = useSelection();
  const { picking, selected } = selection;

  const meta = COMMITMENT_TYPES[type];
  const title = t(meta.titleKey);
  useDocumentTitle(title);

  const quota = useMemo(
    () => quotaState(items, user?.commitmentLimit),
    [items, user?.commitmentLimit],
  );

  const archivedCount = useMemo(
    () => items.filter((item) => item.status === "archived").length,
    [items],
  );

  // La vue des archives est exclusive, pas additive : les melanger aux lignes
  // vivantes rendait possible une selection a cheval sur les deux, ou la moitie
  // des actions n'a aucun sens. L'archive est une sortie, la pause une
  // parenthese : seule la premiere quitte le flux.
  const pool = useMemo(
    () =>
      items.filter((item) =>
        showArchived ? item.status === "archived" : item.status !== "archived",
      ),
    [items, showArchived],
  );

  const buckets = useMemo(() => categoryCounts(pool), [pool]);

  const sortOptions = useMemo(
    () => SORTS.map((value) => ({ value, label: t(`commitments.sort_${value}`) })),
    [t],
  );

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

  const pickedRows = useMemo(
    () => visible.filter((item) => selected.has(item.id)),
    [visible, selected],
  );

  const actions = useMemo(() => bulkActions(pickedRows), [pickedRows]);

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

  const refresh = () => Promise.all([reload(), reloadDue(), reloadTrash()]);

  const dismissUndo = useCallback(() => setUndo(null), []);

  const runUndo = async () => {
    setUndoing(true);
    try {
      await undo.run();
      await refresh();
      setUndo(null);
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setUndoing(false);
    }
  };

  const toggleCategory = (category) =>
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(category)) {
        next.add(category);
      }
      return next;
    });

  const openCreate = () => {
    // Au plafond, ouvrir le formulaire pour le refuser a l'envoi ferait perdre
    // une saisie entiere : la reponse arrive avant la premiere frappe.
    if (quota?.tone === "full") {
      toast.push(
        messageForCode(t, "COMMITMENT_LIMIT_REACHED", { type, limit: quota.limit }) ||
          t("errors.unexpected"),
        "error",
      );
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (commitment) => {
    setEditing(commitment);
    setFormOpen(true);
  };

  const startPicking = useCallback(
    (commitment) => {
      selection.start(commitment?.id);
      setAnnouncement(t("commitments.selectionOn"));
    },
    [selection, t],
  );

  const stopPicking = useCallback(() => {
    selection.stop();
    setAnnouncement(t("commitments.selectionOff"));
  }, [selection, t]);

  useEffect(() => {
    if (!picking || confirmingBulk) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === "Escape") {
        stopPicking();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picking, confirmingBulk, stopPicking]);

  const togglePick = (commitment) => {
    if (!picking) {
      startPicking(commitment);
      return;
    }
    selection.toggle(commitment.id);
  };

  const toggleAll = () => selection.toggleAll(visible.map((item) => item.id));

  const replay = async (steps) => {
    for (const step of steps) {
      await setStatusMany(step.ids, step.status);
    }
  };

  const report = (status, changed, blocked, previous) => {
    if (!changed.length) {
      toast.push(t("commitments.bulkNothing"));
      return;
    }

    const done = t(BULK_DONE_KEYS[status], { count: changed.length });
    const message = blocked.length
      ? `${done} ${t("commitments.bulkBlocked", { count: blocked.length })}`
      : done;

    if (REVERSIBLE_STATUS.has(status)) {
      setUndo({ message, run: () => replay(undoSteps(previous, changed)) });
    } else {
      toast.push(message);
    }
  };

  const applyBulk = async (action) => {
    setConfirmingBulk(false);
    const ids = pickedRows.map((item) => item.id);
    if (!ids.length) {
      return;
    }

    setBulkBusy(true);
    try {
      if (action === "deleted") {
        const { deleted, ids: removed } = await deleteManyCommitments(ids);
        await refresh();
        stopPicking();
        setUndo({
          message: t("commitments.bulkDeleted", { count: deleted }),
          run: () => restoreCommitments(removed),
        });
        return;
      }

      // L'etat d'avant est releve sur la liste en main, avant l'appel : apres
      // le rafraichissement il aurait disparu, et l'annulation ne saurait plus
      // a quoi rendre chaque ligne.
      const previous = previousStatuses(items, ids);
      const { changed, blocked } = await setStatusMany(ids, action);
      await refresh();
      stopPicking();
      report(action, changed, blocked, previous);
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setBulkBusy(false);
    }
  };

  const runBulk = (action) => {
    if (action === "deleted" && selected.size > BULK_CONFIRM_ABOVE) {
      setConfirmingBulk(true);
      return;
    }
    applyBulk(action);
  };

  const changeStatus = async (commitment, status) => {
    const previous = commitment.status;
    try {
      await updateCommitment(commitment.id, { status });
      await refresh();
      const message = t(STATUS_TOAST_KEYS[status], { title: commitment.title });
      if (REVERSIBLE_STATUS.has(status)) {
        setUndo({
          message,
          run: () => updateCommitment(commitment.id, { status: previous }),
        });
      } else {
        toast.push(message);
      }
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    }
  };

  const removeOne = async (commitment) => {
    try {
      const { ids } = await deleteCommitment(commitment.id);
      await refresh();
      setUndo({
        message: t("commitments.deleted", { title: commitment.title }),
        run: () => restoreCommitments(ids),
      });
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    }
  };

  const restoreOne = async (commitment) => {
    setRestoringId(commitment.id);
    try {
      await restoreCommitments([commitment.id]);
      await refresh();
      toast.push(t("commitments.restored", { title: commitment.title }));
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    } finally {
      setRestoringId(null);
    }
  };

  const purgeTrash = async () => {
    setConfirmingPurge(false);
    try {
      await emptyTrash({ type });
      await refresh();
      setShowTrash(false);
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    }
  };

  const removeAll = async () => {
    setConfirmingWipe(false);
    try {
      const { deleted, ids } = await deleteAllCommitments({ type });
      await refresh();
      setUndo({
        message: t(meta.wipeDoneKey, { count: deleted }),
        run: () => restoreCommitments(ids),
      });
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            {quota?.tone === "full" ? t("commitments.quotaFull") : t(meta.subtitleKey)}
          </p>
        </div>
        <div className={styles.headerActions}>
          {quota ? (
            <span
              className={cx(
                styles.quota,
                quota.tone === "alert" && styles.quotaAlert,
                quota.tone === "full" && styles.quotaFull,
              )}
            >
              <span aria-hidden="true">
                {t("commitments.quota", { used: quota.used, limit: quota.limit })}
              </span>
              <span className={styles.reader}>
                {t("commitments.quotaReader", {
                  used: quota.used,
                  limit: quota.limit,
                  kind: title.toLowerCase(),
                })}
              </span>
            </span>
          ) : null}
          <Button fullWidth={false} compact onClick={openCreate} className={styles.addButton}>
            <Icon name="add" size={16} />
            {t("common.add")}
          </Button>
        </div>
      </header>

      {items.length && !showArchived ? (
        <CommitmentStats
          month={monthTotal}
          due={dueThisMonth.length}
          pending={dueLoading}
          rate={rate}
          next={next}
          currency={currency}
        />
      ) : null}

      {/* La corbeille doit rester atteignable meme quand la liste est vide :
          c'est precisement le cas ou l'on vient de tout supprimer. */}
      {items.length || trashed.length ? (
        <div className={styles.toolbar}>
          {items.length ? (
            <div className={styles.searchRow}>
              <SearchField
                className={styles.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClear={() => setQuery("")}
                label={t("commitments.searchLabel", { kind: title.toLowerCase() })}
                placeholder={t(meta.searchKey)}
              />

              <Picker
                className={styles.sort}
                label={t("commitments.sortLabel")}
                value={sort}
                options={sortOptions}
                variant="toolbar"
                onChange={setSort}
              />
            </div>
          ) : null}

          {archivedCount || showArchived ? (
            <Chip
              active={showArchived}
              onClick={() => {
                stopPicking();
                setShowArchived((current) => !current);
              }}
            >
              {t("commitments.showArchived", { count: archivedCount })}
            </Chip>
          ) : null}

          {trashed.length ? (
            <Chip active={showTrash} onClick={() => setShowTrash((current) => !current)}>
              {t("commitments.showTrash", { count: trashed.length })}
            </Chip>
          ) : null}

          {items.length && !showArchived ? (
            <button
              type="button"
              className={styles.wipe}
              onClick={() => setConfirmingWipe(true)}
            >
              <Icon name="delete" size={15} />
              {t("commitments.wipe", { count: items.length })}
            </button>
          ) : null}
        </div>
      ) : null}

      {items.length ? (
        <>
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

      {showTrash && trashed.length ? (
        <TrashList
          items={trashed}
          currency={currency}
          busyId={restoringId}
          onRestore={restoreOne}
          onEmpty={() => setConfirmingPurge(true)}
        />
      ) : null}

      {error ? <Alert variant="error">{messageForError(t, error)}</Alert> : null}

      <p className={styles.reader} role="status" aria-live="polite">
        {announcement}
      </p>

      {picking ? (
        <SelectionBar
          count={selected.size}
          total={visible.length}
          allPicked={selected.size >= visible.length && visible.length > 0}
          actions={actions}
          busy={bulkBusy}
          onAction={runBulk}
          onToggleAll={toggleAll}
          onCancel={stopPicking}
        />
      ) : null}

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
              onDelete={removeOne}
              onStatusChange={changeStatus}
              picking={picking}
              picked={selected.has(commitment.id)}
              onTogglePick={togglePick}
              onStartPicking={() => startPicking(commitment)}
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
      ) : showArchived ? (
        // Desarchiver le dernier element vide la vue : la quitter d'office
        // deplacerait l'utilisateur sans qu'il l'ait demande, on lui rend la
        // main a la place.
        <EmptyState
          icon="archive"
          title={t("commitments.emptyArchiveTitle")}
          message={t("commitments.emptyArchiveBody")}
          actionLabel={t("commitments.backToList")}
          onAction={() => setShowArchived(false)}
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
            // Une ligne neuve nait active : la laisser derriere le filtre des
            // archives annoncerait une creation que rien ne montre. Modifier
            // une archive, en revanche, ne fait pas quitter le placard.
            if (!editing) {
              setShowArchived(false);
            }
            refresh();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={confirmingWipe}
        title={t(meta.wipeTitleKey, { count: items.length })}
        message={t("commitments.wipeMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={removeAll}
        onCancel={() => setConfirmingWipe(false)}
      />

      <ConfirmDialog
        open={confirmingBulk}
        title={t("commitments.bulkDeleteTitle", { count: selected.size })}
        message={t("commitments.bulkDeleteMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => applyBulk("deleted")}
        onCancel={() => setConfirmingBulk(false)}
      />

      <ConfirmDialog
        open={confirmingPurge}
        title={t("commitments.purgeTitle", { count: trashed.length })}
        message={t("commitments.purgeMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={purgeTrash}
        onCancel={() => setConfirmingPurge(false)}
      />

      {undo ? (
        <UndoBar
          key={undo.message}
          message={undo.message}
          busy={undoing}
          onUndo={runUndo}
          onDismiss={dismissUndo}
        />
      ) : null}
    </div>
  );
}
