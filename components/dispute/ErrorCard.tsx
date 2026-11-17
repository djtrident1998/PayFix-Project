"use client";

import { useEffect, useRef } from "react";
import { CloudAlert, PencilLine, RotateCcw } from "lucide-react";
import { PillButton } from "@/components/ui/PillButton";

export function ErrorCard({
  message,
  onRetry,
  onEdit,
  title = "We couldn't finish that",
}: {
  message: string;
  onRetry: () => void;
  onEdit?: () => void;
  title?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <section role="alert" className="rounded-2xl bg-card p-6 text-center shadow-card md:p-8">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rejected/10 text-rejected">
        <CloudAlert size={22} strokeWidth={1.9} aria-hidden="true" />
      </span>
      <h2 ref={ref} tabIndex={-1} className="mt-4 text-[17px] font-semibold focus:outline-none">
        {title}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-text-secondary">{message}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <PillButton onClick={onRetry} size="lg">
          <RotateCcw size={18} aria-hidden="true" /> Retry
        </PillButton>
        {onEdit && (
          <PillButton onClick={onEdit} variant="secondary" size="lg">
            <PencilLine size={18} aria-hidden="true" /> Edit details
          </PillButton>
        )}
      </div>
    </section>
  );
}
