import { useState } from "react";

import { useToast } from "../../../../core/components/Toast/useToast";
import { messageForError } from "../../../../core/network/errorMessages";
import { useTranslation } from "../../../../core/translation/useTranslation";
import { updateOccurrence } from "../../data/commitmentsApi";

export function useSettle(onUpdated) {
  const { t } = useTranslation();
  const toast = useToast();
  const [target, setTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const apply = async (occurrence, payload) => {
    setBusyId(occurrence.id);
    try {
      onUpdated(await updateOccurrence(occurrence.id, payload));
      return true;
    } catch (caught) {
      toast.push(messageForError(t, caught), "error");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const pick = (occurrence) => {
    if (occurrence.status === "pending") {
      setTarget(occurrence);
      return;
    }
    apply(occurrence, { status: "pending" });
  };

  const settle = async (status, amount, paidOn) => {
    const done = await apply(target, {
      status,
      ...(amount === undefined ? {} : { amount }),
      ...(paidOn === undefined ? {} : { paid_on: paidOn }),
    });
    if (done) {
      setTarget(null);
    }
  };

  return { target, busyId, pick, settle, close: () => setTarget(null) };
}

export function checkLabel(t, occurrence) {
  if (occurrence.status === "pending") {
    return t("occurrence.settle", { title: occurrence.title });
  }
  return t("occurrence.markPending", { title: occurrence.title });
}
