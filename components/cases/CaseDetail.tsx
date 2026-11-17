"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import { CopyButton } from "@/components/ui/CopyButton";
import { issueLabel } from "@/lib/constants";
import type { CaseRow } from "@/lib/types";
import { formatCurrency, formatDate, prettify } from "@/lib/utils";

const DESKTOP_QUERY = "(min-width: 768px)";

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  );
}

/** Bottom sheet on mobile, side panel on desktop. */
export function CaseDetail({ row, onClose }: { row: CaseRow | null; onClose: () => void }) {
  const isDesktop = useIsDesktop();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!row) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [row, onClose]);

  const panelMotion = isDesktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <AnimatePresence>
      {row && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-title"
            {...panelMotion}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-white shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
          >
            <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-300 md:hidden" aria-hidden="true" />
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Case</p>
                <div className="flex items-center">
                  <h2 id="case-title" className="truncate font-mono text-base font-semibold">
                    {row.ticket_id}
                  </h2>
                  <CopyButton text={String(row.ticket_id)} />
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case details"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-text-secondary hover:text-primary"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={row.decision} />
                {row.status && <StatusChip status={row.status} />}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Meta label="Customer" value={row.customer_name || "—"} />
                <Meta label="Amount" value={formatCurrency(row.amount_inr)} />
                <Meta label="Type" value={issueLabel(row.dispute_type)} />
                <Meta label="Created" value={formatDate(row.created_at)} />
                <Meta label="Assigned to" value={row.assigned_to || "—"} />
                <Meta label="Refund ID" value={row.refund_id || "—"} mono />
              </dl>

              <div className="mt-5 space-y-4">
                <Block label="Complaint" text={row.complaint_text} />
                <Block label="Reason" text={row.reason} />
                <Block label="Policy rule used" text={row.policy_rule_used} />
                <Block label="Customer message" text={row.customer_message} highlight />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl p-3 ring-1 ring-line">
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className={`mt-0.5 truncate font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function Block({ label, text, highlight }: { label: string; text?: string; highlight?: boolean }) {
  return (
    <section>
      <h3 className="text-xs font-medium text-text-muted">{label}</h3>
      <p
        className={`mt-1 whitespace-pre-line text-sm leading-relaxed ${highlight ? "rounded-xl bg-slate-50 p-3 ring-1 ring-line" : ""}`}
      >
        {text ? prettifyIfCode(text) : "—"}
      </p>
    </section>
  );
}

function prettifyIfCode(text: string) {
  return /^[a-z0-9_]+$/.test(text) ? prettify(text) : text;
}
