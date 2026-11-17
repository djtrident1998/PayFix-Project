"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DisputeForm, EMPTY_FORM, type FormValues } from "./DisputeForm";
import { DemoPanel } from "./DemoPanel";
import { ThinkingLog } from "./ThinkingLog";
import { ResultCard } from "./ResultCard";
import { ErrorCard } from "./ErrorCard";
import { GENERIC_ERROR } from "@/lib/constants";
import type { IssueTypeValue } from "@/lib/issue-types";
import type { DisputeFormData } from "@/lib/schemas";
import { normalizeDispute, type DisputeResponse } from "@/lib/types";

type Phase = "form" | "working" | "result" | "error";
type Outcome = { ok: true; data: DisputeResponse } | { ok: false; message: string };

const CLIENT_TIMEOUT_MS = 65_000; // server gives up at 60s

export function DisputeFlow({ initialIssue }: { initialIssue?: IssueTypeValue }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [values, setValues] = useState<FormValues>({ ...EMPTY_FORM, issue_type: initialIssue ?? "" });
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const lastPayload = useRef<DisputeFormData | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const submit = useCallback(async (payload: DisputeFormData) => {
    lastPayload.current = payload;
    setOutcome(null);
    setServerErrors({});
    setPhase("working");
    scrollTop();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (res.status === 401) {
        // Session expired: back to login, then straight back here.
        router.replace("/login?next=/raise-dispute");
        router.refresh();
        return;
      }
      const data: unknown = await res.json().catch(() => null);
      const errMsg =
        data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : GENERIC_ERROR;

      if (res.status === 400 && data && typeof data === "object" && "errors" in data) {
        setServerErrors((data as { errors: Record<string, string> }).errors);
        setPhase("form");
        return;
      }
      if (!res.ok) {
        setOutcome({ ok: false, message: errMsg });
        setPhase("error");
        return;
      }
      const normalized = normalizeDispute(data);
      if (!normalized) {
        setOutcome({ ok: false, message: GENERIC_ERROR });
        setPhase("error");
        return;
      }
      // Success: ThinkingLog finishes its animation, then calls onComplete.
      setOutcome({ ok: true, data: normalized });
    } catch (e) {
      const timedOut = e instanceof DOMException && e.name === "AbortError";
      setOutcome({
        ok: false,
        message: timedOut
          ? "Our AI agent is taking longer than usual. Please try again in a moment."
          : "We couldn't reach PayFix. Check your connection and try again.",
      });
      setPhase("error");
    } finally {
      clearTimeout(timer);
    }
  }, [router]);

  const reset = () => {
    setValues(EMPTY_FORM);
    setOutcome(null);
    setServerErrors({});
    setPhase("form");
    scrollTop();
  };

  const successData = outcome?.ok ? outcome.data : null;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <AnimatePresence mode="wait">
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-6"
          >
            <div className="order-2 md:order-1">
              <DisputeForm
                values={values}
                onChange={setValues}
                serverErrors={serverErrors}
                onSubmit={submit}
              />
            </div>
            <div className="order-1 md:sticky md:top-24 md:order-2">
              <DemoPanel
                selected={values.payment_id}
                onPick={(demo) =>
                  setValues((v) => ({ ...v, payment_id: demo.payment_id, issue_type: demo.issue_type }))
                }
              />
            </div>
          </motion.div>
        )}

        {phase === "working" && (
          <motion.div
            key="working"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-2xl"
          >
            <ThinkingLog
              responseReady={!!successData}
              ticketId={successData?.ticket_id}
              onComplete={() => setPhase("result")}
            />
          </motion.div>
        )}

        {phase === "result" && successData && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-2xl"
          >
            <ResultCard data={successData} onReset={reset} />
          </motion.div>
        )}

        {phase === "error" && outcome && !outcome.ok && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-2xl"
          >
            <ErrorCard
              message={outcome.message}
              onRetry={() => lastPayload.current && submit(lastPayload.current)}
              onEdit={() => setPhase("form")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
