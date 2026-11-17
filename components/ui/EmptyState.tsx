import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "No cases yet",
  description = "Disputes you raise will appear here.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-line">
        <Inbox size={22} strokeWidth={1.75} className="text-text-secondary" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
