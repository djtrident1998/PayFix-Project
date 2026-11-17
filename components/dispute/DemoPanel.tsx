"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleCheck, Clock, FlaskConical, Info, CircleX } from "lucide-react";
import { DEMO_PAYMENTS } from "@/lib/demo";
import { cn } from "@/lib/utils";

const OUTCOME_STYLE = {
  refund: { icon: CircleCheck, cls: "bg-success/10 text-success-ink" },
  reject: { icon: CircleX, cls: "bg-rejected/10 text-rejected-ink" },
  escalate: { icon: Clock, cls: "bg-escalated/15 text-escalated-ink" },
} as const;

type Demo = (typeof DEMO_PAYMENTS)[number];

function DemoRows({ selected, onPick }: { selected: string; onPick: (d: Demo) => void }) {
  return (
    <>
      <ul className="space-y-2">
        {DEMO_PAYMENTS.map((demo) => {
          const style = OUTCOME_STYLE[demo.outcome];
          const active = selected === demo.payment_id;
          return (
            <li key={demo.payment_id}>
              <button
                type="button"
                onClick={() => onPick(demo)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                  active
                    ? "border-primary/60 bg-primary-soft/60"
                    : "border-line bg-white hover:border-primary/40 hover:bg-primary-soft/60"
                )}
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", style.cls)}>
                  <style.icon size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[13px] font-medium">{demo.payment_id}</span>
                  <span className="block truncate text-xs text-text-secondary">
                    {demo.title} · {demo.hint}
                  </span>
                </span>
                {active && <span className="text-xs font-medium text-primary">Selected</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-text-secondary">
        <Info size={14} className="mt-px shrink-0" aria-hidden="true" />
        Use your own email. Tapping a row fills the Payment ID and issue type.
      </p>
    </>
  );
}

export function DemoPanel({ selected, onPick }: { selected: string; onPick: (d: Demo) => void }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      {/* Mobile: collapsible card */}
      <section className="rounded-2xl bg-card shadow-card md:hidden" aria-label="Demo payments">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <FlaskConical size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">Try a demo payment</span>
            <span className="block text-xs text-text-secondary">See refund, reject and escalation</span>
          </span>
          <ChevronDown
            size={20}
            aria-hidden="true"
            className={cn("text-text-secondary transition-transform", open && "rotate-180")}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <DemoRows
                  selected={selected}
                  onPick={(d) => {
                    onPick(d);
                    setOpen(false);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Desktop: side panel */}
      <aside className="hidden rounded-2xl bg-card p-5 shadow-card md:block" aria-labelledby="demo-title">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <FlaskConical size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <h2 id="demo-title" className="text-sm font-semibold">
              Try a demo payment
            </h2>
            <p className="text-xs text-text-secondary">Sandbox payments for each outcome</p>
          </div>
        </div>
        <DemoRows selected={selected} onPick={onPick} />
      </aside>
    </>
  );
}
