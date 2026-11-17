"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Clock, FolderOpen, RotateCcw, X } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { PillButton, pillClasses } from "@/components/ui/PillButton";
import { cn, formatCurrency, formatDate, prettify } from "@/lib/utils";
import type { DisputeResponse } from "@/lib/types";

const VARIANTS = {
  auto_refund: {
    icon: Check,
    title: () => "Refund approved",
    ring: "bg-success/15",
    disc: "bg-success",
    band: "from-success/10",
  },
  escalate: {
    icon: Clock,
    title: (d: DisputeResponse) => `Escalated to ${d.assigned_to || "an analyst"}`,
    ring: "bg-escalated/20",
    disc: "bg-escalated",
    band: "from-escalated/15",
  },
  reject: {
    icon: X,
    title: () => "Rejected",
    ring: "bg-rejected/15",
    disc: "bg-rejected",
    band: "from-rejected/10",
  },
} as const;

export function ResultCard({ data, onReset }: { data: DisputeResponse; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const v = VARIANTS[data.decision];
  const when = formatDate(data.created_at || new Date().toISOString());

  return (
    <article aria-labelledby="result-title" className="overflow-hidden rounded-2xl bg-card shadow-raised">
      {/* Status */}
      <div className="px-5 pb-6 pt-8 text-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className={cn("mx-auto flex h-20 w-20 items-center justify-center rounded-full", v.ring)}
        >
          <span className={cn("flex h-14 w-14 items-center justify-center rounded-full text-white", v.disc)}>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 14 }}
            >
              <v.icon size={28} strokeWidth={2.75} aria-hidden="true" />
            </motion.span>
          </span>
        </motion.div>
        <h2 id="result-title" role="status" className="mt-4 text-xl font-semibold">
          {v.title(data)}
        </h2>
        <p className="num mt-2 text-[34px] font-semibold leading-none text-text-primary">
          {formatCurrency(data.amount_inr)}
        </p>
      </div>

      {/* Receipt */}
      <div className="relative px-5 md:px-7">
        <div aria-hidden="true" className="relative">
          <span className="absolute -left-8 -top-3 h-6 w-6 rounded-full bg-background shadow-[inset_-1px_0_0_rgb(16_19_31/0.06)] md:-left-10" />
          <span className="absolute -right-8 -top-3 h-6 w-6 rounded-full bg-background shadow-[inset_1px_0_0_rgb(16_19_31/0.06)] md:-right-10" />
          <div className="border-t border-dashed border-slate-300" />
        </div>
        <dl className="divide-y divide-line text-sm">
          <div className="flex items-center justify-between gap-3 py-2">
            <dt className="text-text-secondary">Ticket ID</dt>
            <dd className="flex min-w-0 items-center gap-1">
              <span className="truncate font-mono text-[13px] font-medium">{data.ticket_id}</span>
              <CopyButton text={data.ticket_id} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-3.5">
            <dt className="text-text-secondary">Amount</dt>
            <dd className="num font-medium">{formatCurrency(data.amount_inr)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-3.5">
            <dt className="text-text-secondary">Date &amp; time</dt>
            <dd className="num text-right font-medium">{when}</dd>
          </div>
          {data.refund_id && (
            <div className="flex items-center justify-between gap-3 py-3.5">
              <dt className="text-text-secondary">Refund ID</dt>
              <dd className="truncate font-mono text-[13px] font-medium">{data.refund_id}</dd>
            </div>
          )}
        </dl>

        {data.customer_message && (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-text-primary ring-1 ring-line">
            {data.customer_message}
          </p>
        )}

        {/* How the AI decided */}
        <div className="mt-3 rounded-xl ring-1 ring-line">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold"
          >
            How the AI decided
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={cn("text-text-secondary transition-transform", open && "rotate-180")}
            />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={detailsId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <dl className="space-y-3 px-4 pb-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Payment status</dt>
                    <dd className="mt-0.5">{prettify(data.payment_status)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Policy rule used</dt>
                    <dd className="mt-0.5">{data.policy_rule_used || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Reason</dt>
                    <dd className="mt-0.5 leading-relaxed">{data.reason || "—"}</dd>
                  </div>
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5 md:flex-row md:p-7">
        <PillButton onClick={onReset} size="lg" className="w-full md:flex-1">
          <RotateCcw size={18} aria-hidden="true" /> Raise another dispute
        </PillButton>
        <Link href="/cases" className={pillClasses("secondary", "lg", "w-full md:flex-1")}>
          <FolderOpen size={18} aria-hidden="true" /> View all cases
        </Link>
      </div>
    </article>
  );
}
