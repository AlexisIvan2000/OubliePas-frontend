import { useMemo, useState } from "react";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { ConfirmDialog } from "../../../../core/components/ConfirmDialog/ConfirmDialog";
import { Icon } from "../../../../core/components/Icon/Icon";
import { SearchField } from "../../../../core/components/SearchField/SearchField";
import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useAuth } from "../../../authentication/presentation/providers/useAuth";
import { deleteCommitment } from "../../data/commitmentsApi";
import { COMMITMENT_TYPES, matchesQuery } from "../../domain/commitment";
import { formatMoney } from "../../domain/formatting";
import { useCommitments } from "../providers/useCommitments";
import styles from "../styles/commitments.module.css";
import { CommitmentFormDialog } from "./CommitmentFormDialog";
import { CommitmentListSkeleton } from "./CommitmentListSkeleton";
import { CommitmentRow } from "./CommitmentRow";
import { EmptyState } from "./EmptyState";

const MONTHLY_FACTOR = { weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12, oneoff: 0 };

export function CommitmentsView({ type }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const { items, loading, error, reload } = useCommitments(type);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const meta = COMMITMENT_TYPES[type];
  const title = t(meta.titleKey);
  useDocumentTitle(title);

  const visible = useMemo(
    () => items.filter((item) => matchesQuery(t, item, query)),
    [items, query, t],
  );

  const active = useMemo(() => visible.filter((item) => item.status === "active"), [visible]);

  const monthly = useMemo(
    () =>
      active.reduce(
        (total, item) => total + Number(item.amount) * MONTHLY_FACTOR[item.frequency],
        0,
      ),
    [active],
  );

  const currency = user?.currency ?? "CAD";
  const searching = query.trim().length > 0;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (commitment) => {
    setEditing(commitment);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteCommitment(target.id);
      toast.push(t("commitments.deleted", { title: target.title }));
      await reload();
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
        <div className={styles.toolbar}>
          <SearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            label={t("commitments.searchLabel", { kind: title.toLowerCase() })}
            placeholder={t(meta.searchKey)}
          />
          {searching ? (
            <span className={styles.results}>
              {t("commitments.results", { count: visible.length, total: items.length })}
            </span>
          ) : null}
        </div>
      ) : null}

      {active.length ? (
        <div className={styles.total}>
          <span className={styles.totalLabel}>{t("commitments.monthlyEquivalent")}</span>
          <span className={styles.totalValue}>{formatMoney(monthly, currency)}</span>
          <span className={styles.totalNote}>
            {t("commitments.activeLines", { count: active.length })}
            {searching ? t("commitments.shown") : ""}
          </span>
        </div>
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
              index={index}
              onEdit={openEdit}
              onDelete={setPendingDelete}
            />
          ))}
        </ul>
      ) : searching ? (
        <EmptyState
          icon="search"
          title={t("commitments.noResultsTitle", { query: query.trim() })}
          message={t("commitments.noResultsBody")}
          actionLabel={t("commitments.clearSearch")}
          onAction={() => setQuery("")}
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
            reload();
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
