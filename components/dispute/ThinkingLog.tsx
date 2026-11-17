"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, LoaderCircle, Ticket } from "lucide-react";
import { THINKING_STEPS, THINKING_STEP_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LAST = THINKING_STEPS.length - 1;
const FINISH_BEAT_MS = 900; // last line spins briefly before ticking
const RESULT_DELAY_MS = 1600; // time to read "Ticket … created"

/**
 * Step-by-step progress log. Lines appear every 2.5s. If the response arrives
 * early we keep going until line 6, then tick everything. If it's late, line 6
 * keeps spinning with a pulse until it arrives.
 */
export function ThinkingLog({
  responseReady,
  ticketId,
  onComplete,
}: {
  responseReady: boolean;
  ticketId?: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [doneAt, setDoneAt] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    startRef.current = performance.now();
  }, []);

  const elapsed = () => (performance.now() - startRef.current) / 1000;

  useEffect(() => {
    if (step >= LAST) return;
    const t = setTimeout(() => {
      setDoneAt((d) => [...d, elapsed()]);
      setStep((s) => s + 1);
    }, THINKING_STEP_MS);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (!responseReady || step < LAST || finished) return;
    const t = setTimeout(() => {
      setDoneAt((d) => [...d, elapsed()]);
      setFinished(true);
    }, FINISH_BEAT_MS);
    return () => clearTimeout(t);
  }, [responseReady, step, finished]);

  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(() => onCompleteRef.current(), RESULT_DELAY_MS);
    return () => clearTimeout(t);
  }, [finished]);

  const waitingLong = step === LAST && !responseReady;
  const progress = finished ? 100 : Math.round((step / THINKING_STEPS.length) * 100);

  return (
    <section
      aria-labelledby="thinking-title"
      aria-busy={!finished}
      className="overflow-hidden rounded-2xl bg-card shadow-raised"
    >
      <div className="px-5 pb-4 pt-5 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="thinking-title" className="text-[17px] font-semibold">
            PayFix AI is working
          </h2>
          <span className="num text-[13px] text-text-muted">{progress}%</span>
        </div>
        <p className="mt-0.5 text-sm text-text-secondary">
          {finished ? "Decision ready." : "Reviewing your dispute against company policy."}
        </p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progress, 6)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <ol className="border-t border-line px-5 py-4 md:px-6" aria-live="polite" aria-relevant="additions">
        {THINKING_STEPS.slice(0, step + 1).map((s, i) => {
          const done = finished || i < step;
          const isLastRow = i === step && !finished;
          return (
            <Row
              key={s.text}
              icon={<s.icon size={16} strokeWidth={1.9} aria-hidden="true" />}
              text={s.text}
              done={done}
              pulse={!done && waitingLong}
              time={done ? doneAt[i] : undefined}
              connector={!isLastRow || finished}
            />
          );
        })}
        {finished && (
          <Row
            icon={<Ticket size={16} strokeWidth={1.9} aria-hidden="true" />}
            text={`Ticket ${ticketId} created`}
            done
            emphasis
            connector={false}
          />
        )}
      </ol>

      {waitingLong && (
        <p className="border-t border-line px-5 py-3 text-[13px] text-text-secondary md:px-6">
          Still checking. This can take up to a minute.
        </p>
      )}
    </section>
  );
}

function Row({
  icon,
  text,
  done,
  pulse,
  time,
  emphasis,
  connector,
}: {
  icon: React.ReactNode;
  text: string;
  done: boolean;
  pulse?: boolean;
  time?: number;
  emphasis?: boolean;
  connector: boolean;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative flex gap-3.5 pb-4 last:pb-0"
    >
      {connector && (
        <span aria-hidden="true" className="absolute left-[15px] top-8 bottom-0 w-px bg-line" />
      )}
      <span
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
          done
            ? emphasis
              ? "bg-success text-white"
              : "bg-success/10 text-success-ink"
            : "bg-primary-soft text-primary",
          pulse && "animate-pulse"
        )}
      >
        {done ? (
          emphasis ? icon : <Check size={15} strokeWidth={2.6} aria-hidden="true" />
        ) : (
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
        )}
      </span>
      <div className="flex min-h-8 flex-1 items-center justify-between gap-3">
        <span
          className={cn(
            "flex items-center gap-2 text-sm",
            emphasis ? "font-semibold text-success-ink" : done ? "text-text-secondary" : "font-medium text-text-primary"
          )}
        >
          {!emphasis && <span className={cn("hidden sm:inline", done ? "text-text-muted" : "text-primary")}>{icon}</span>}
          {text}
          <span className="sr-only">{done ? " (done)" : " (in progress)"}</span>
        </span>
        {time !== undefined && <span className="num shrink-0 text-xs text-text-muted">{time.toFixed(1)}s</span>}
      </div>
    </motion.li>
  );
}
