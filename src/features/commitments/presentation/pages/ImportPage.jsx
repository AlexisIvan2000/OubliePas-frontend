import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert } from "../../../../core/components/Alert/Alert";
import { Button } from "../../../../core/components/Button/Button";
import { Icon } from "../../../../core/components/Icon/Icon";
import { SearchField } from "../../../../core/components/SearchField/SearchField";
import { useToast } from "../../../../core/components/Toast/useToast";
import { ApiError } from "../../../../core/network/ApiError";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { cx } from "../../../../core/utils/classNames";
import { useAsyncAction } from "../../../../core/utils/useAsyncAction";
import { useDocumentTitle } from "../../../../core/utils/useDocumentTitle";
import { useToday } from "../../../../core/utils/useToday";
import { createCommitments } from "../../data/commitmentsApi";
import { CATALOG, catalogLabel } from "../../domain/catalog";
import { COMMITMENT_TYPES, categoryLabel, normalizeSearch } from "../../domain/commitment";
import {
  MAX_IMPORT_LINES,
  emptyLine,
  lineErrors,
  rowErrors as mapRowErrors,
  toBatch,
} from "../../domain/importing";
import { ImportLine } from "../components/ImportLine";
import styles from "../styles/importing.module.css";

const TYPES = ["subscription", "invoice"];

function entryOf(line) {
  return CATALOG[line.type].find((entry) => entry.id === line.entryId);
}

export function ImportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const today = useToday();

  const [step, setStep] = useState("pick");
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState([]);
  const [rows, setRows] = useState(new Map());

  useDocumentTitle(t("import.documentTitle"));

  const save = useAsyncAction(createCommitments);

  const sections = useMemo(() => {
    const needle = normalizeSearch(query);
    return TYPES.map((type) => ({
      type,
      entries: CATALOG[type].filter(
        (entry) => !needle || normalizeSearch(catalogLabel(t, entry)).includes(needle),
      ),
    })).filter((section) => section.entries.length);
  }, [query, t]);

  const chosen = useMemo(() => new Set(lines.map((line) => line.key)), [lines]);
  const full = lines.length >= MAX_IMPORT_LINES;

  const toggle = (entry, type) => {
    const key = `${type}:${entry.id}`;
    setLines((current) => {
      const without = current.filter((line) => line.key !== key);
      if (without.length !== current.length) {
        return without;
      }
      return current.length >= MAX_IMPORT_LINES ? current : [...current, emptyLine(entry, type)];
    });
  };

  const change = (key, patch) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  const remove = (key) => setLines((current) => current.filter((line) => line.key !== key));

  const submit = async () => {
    const local = new Map();
    lines.forEach((line, index) => {
      const found = lineErrors(line, today);
      if (Object.keys(found).length) {
        local.set(index, found);
      }
    });

    if (local.size) {
      setRows(local);
      return;
    }

    setRows(new Map());
    const result = await save.run(toBatch(t, lines, today, entryOf));

    if (result.ok) {
      toast.push(t("import.created", { count: result.data.length }));
      navigate("/abonnements");
      return;
    }

    if (result.error instanceof ApiError && result.error.fieldErrors.length) {
      setRows(mapRowErrors(result.error.fieldErrors));
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>{t("import.title")}</h1>
        <p className={styles.subtitle}>
          {step === "pick" ? t("import.pickSubtitle") : t("import.fillSubtitle")}
        </p>
      </header>

      {step === "pick" ? (
        <>
          <SearchField
            className={styles.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            label={t("import.searchLabel")}
            placeholder={t("import.searchPlaceholder")}
          />

          {full ? <Alert variant="info">{t("import.full", { count: MAX_IMPORT_LINES })}</Alert> : null}

          {sections.length === 0 ? (
            <p className={styles.none}>{t("import.noMatch", { query: query.trim() })}</p>
          ) : (
            sections.map((section) => (
              <section key={section.type} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {t(COMMITMENT_TYPES[section.type].titleKey)}
                </h2>
                <div className={styles.grid}>
                  {section.entries.map((entry, index) => {
                    const key = `${section.type}:${entry.id}`;
                    const active = chosen.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={cx(styles.tile, active && styles.tileActive)}
                        style={{ "--enter-delay": `${Math.min(index, 24) * 12}ms` }}
                        aria-pressed={active}
                        disabled={!active && full}
                        onClick={() => toggle(entry, section.type)}
                      >
                        <span className={styles.tileName}>{catalogLabel(t, entry)}</span>
                        <span className={styles.tileCategory}>
                          {categoryLabel(t, entry.category)}
                        </span>
                        {active ? (
                          <Icon name="done" size={15} className={styles.tileCheck} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}

          <div className={styles.bar}>
            <button type="button" className={styles.escape} onClick={() => navigate("/abonnements")}>
              {t("import.escape")}
            </button>
            <Button
              fullWidth={false}
              disabled={lines.length === 0}
              onClick={() => setStep("fill")}
            >
              {t("import.continue", { count: lines.length })}
            </Button>
          </div>
        </>
      ) : (
        <>
          {save.error && !save.error.fieldErrors?.length ? (
            <Alert variant="error">{messageForError(t, save.error)}</Alert>
          ) : null}
          {rows.size ? <Alert variant="error">{t("import.fixLines", { count: rows.size })}</Alert> : null}

          <ul className={styles.lines}>
            {lines.map((line, index) => (
              <ImportLine
                key={line.key}
                line={line}
                title={catalogLabel(t, entryOf(line))}
                today={today}
                errors={rows.get(index)}
                index={index}
                onChange={(patch) => change(line.key, patch)}
                onRemove={() => remove(line.key)}
              />
            ))}
          </ul>

          <div className={styles.bar}>
            <button type="button" className={styles.escape} onClick={() => setStep("pick")}>
              <Icon name="previous" size={14} />
              {t("import.back")}
            </button>
            <Button fullWidth={false} loading={save.loading} onClick={submit}>
              {t("import.submit", { count: lines.length })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
