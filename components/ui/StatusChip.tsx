import { cn, prettify } from "@/lib/utils";

const STYLES: Record<string, { cls: string; label: string }> = {
  auto_refund: { cls: "bg-success/10 text-success-ink", label: "Refunded" },
  refunded: { cls: "bg-success/10 text-success-ink", label: "Refunded" },
  resolved: { cls: "bg-success/10 text-success-ink", label: "Resolved" },
  closed: { cls: "bg-slate-100 text-slate-700", label: "Closed" },
  escalate: { cls: "bg-escalated/15 text-escalated-ink", label: "Escalated" },
  escalated: { cls: "bg-escalated/15 text-escalated-ink", label: "Escalated" },
  with_analyst: { cls: "bg-escalated/15 text-escalated-ink", label: "With analyst" },
  reject: { cls: "bg-rejected/10 text-rejected-ink", label: "Rejected" },
  rejected: { cls: "bg-rejected/10 text-rejected-ink", label: "Rejected" },
};

export function StatusChip({ status, className }: { status?: string | null; className?: string }) {
  const key = (status ?? "").toLowerCase();
  const style = STYLES[key] ?? { cls: "bg-slate-100 text-slate-700", label: prettify(status) };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        style.cls,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {style.label}
    </span>
  );
}
