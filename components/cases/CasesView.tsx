"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Search } from "lucide-react";
import { CaseDetail } from "./CaseDetail";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusChip } from "@/components/ui/StatusChip";
import { ErrorCard } from "@/components/dispute/ErrorCard";
import { GENERIC_ERROR, issueLabel } from "@/lib/constants";
import type { CaseRow } from "@/lib/types";
import { cn, formatCurrency, formatDate, formatShortDate, prettify, timeValue } from "@/lib/utils";

type Filter = "all" | "auto_refund" | "escalate" | "reject";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "auto_refund", label: "Refunded" },
  { value: "escalate", label: "Escalated" },
  { value: "reject", label: "Rejected" },
];

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; rows: CaseRow[] };

export function CasesView() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CaseRow | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/login?next=/cases");
        router.refresh();
        return;
      }
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data)) {
        const msg =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : GENERIC_ERROR;
        setState({ status: "error", message: msg });
        return;
      }
      const rows = (data as CaseRow[])
        .filter((r) => r && typeof r === "object")
        .sort((a, b) => timeValue(b.created_at) - timeValue(a.created_at));
      setState({ status: "ready", rows });
    } catch {
      setState({ status: "error", message: "We couldn't reach PayFix. Check your connection and try again." });
    } finally {
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    // Fetch on mount; state updates happen after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const rows = useMemo(() => (state.status === "ready" ? state.rows : []), [state]);

  const summary = useMemo(
    () => ({
      total: rows.length,
      refunded: rows.filter((r) => r.decision === "auto_refund").length,
      escalated: rows.filter((r) => r.status === "with_analyst").length,
      rejected: rows.filter((r) => r.decision === "reject").length,
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.decision !== filter) return false;
      if (!q) return true;
      return (
        String(r.ticket_id ?? "").toLowerCase().includes(q) ||
        String(r.customer_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  const loading = state.status === "loading";

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <section aria-label="Summary" className="-mx-4 overflow-x-auto px-4 no-scrollbar md:mx-0 md:overflow-visible md:px-0">
        <ul className="flex gap-3 md:grid md:grid-cols-4 md:gap-4">
          <SummaryCard label="Total" value={summary.total} dot="bg-primary" loading={loading} />
          <SummaryCard label="Refunded" value={summary.refunded} dot="bg-success" loading={loading} />
          <SummaryCard label="Escalated" value={summary.escalated} dot="bg-escalated" loading={loading} />
          <SummaryCard label="Rejected" value={summary.rejected} dot="bg-rejected" loading={loading} />
        </ul>
      </section>

      {/* Toolbar */}
      <section className="rounded-2xl bg-card p-4 shadow-card" aria-label="Filters">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <label htmlFor="case-search" className="sr-only">
              Search by ticket ID or name
            </label>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              id="case-search"
              type="search"
              placeholder="Search ticket ID or name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-line bg-background pl-11 pr-4 text-base placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 md:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Filter by decision" className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
                    filter === f.value
                      ? "bg-text-primary text-white"
                      : "bg-background text-text-secondary hover:text-text-primary"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={load}
              disabled={refreshing}
              aria-label="Refresh cases"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-text-secondary shadow-card transition-colors hover:text-text-primary disabled:opacity-60"
            >
              <RefreshCw size={18} aria-hidden="true" className={cn(refreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      {state.status === "error" ? (
        <ErrorCard title="Couldn't load cases" message={state.message} onRetry={load} />
      ) : loading ? (
        <LoadingList />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-card shadow-card">
          <EmptyState />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-card shadow-card">
          <EmptyState title="No matching cases" description="Try a different search or filter." />
        </div>
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {visible.length} cases shown
          </p>

          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {visible.map((r, i) => (
              <li key={`${r.ticket_id}-${i}`}>
                <button
                  type="button"
                  onClick={() => setSelected(r)}
                  className="w-full rounded-2xl bg-card p-4 text-left shadow-card transition-shadow active:shadow-raised"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-[13px] font-medium">{r.ticket_id}</span>
                    <StatusChip status={r.decision} />
                  </div>
                  <p className="mt-1 truncate text-sm text-text-secondary">{r.customer_name || "—"}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="num text-[17px] font-semibold">{formatCurrency(r.amount_inr)}</span>
                    <span className="text-xs text-text-secondary">{formatShortDate(r.created_at)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl bg-card shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <caption className="sr-only">Dispute cases, newest first</caption>
                <thead className="border-b border-line text-xs font-medium text-text-muted">
                  <tr>
                    {["Ticket", "Created", "Customer", "Amount", "Type", "Decision", "Assigned to", "Status", "Refund ID"].map(
                      (h) => (
                        <th key={h} scope="col" className="whitespace-nowrap px-4 py-3">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((r, i) => (
                    <tr
                      key={`${r.ticket_id}-${i}`}
                      onClick={() => setSelected(r)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(r);
                          }}
                          className="rounded font-mono text-[13px] font-medium text-primary hover:underline"
                        >
                          {r.ticket_id}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{formatDate(r.created_at)}</td>
                      <td className="max-w-40 truncate px-4 py-3 font-medium">{r.customer_name || "—"}</td>
                      <td className="num whitespace-nowrap px-4 py-3 font-medium">{formatCurrency(r.amount_inr)}</td>
                      <td className="max-w-44 truncate px-4 py-3 text-text-secondary">{issueLabel(r.dispute_type)}</td>
                      <td className="px-4 py-3">
                        <StatusChip status={r.decision} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{r.assigned_to || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{prettify(r.status)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-text-secondary">{r.refund_id || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <CaseDetail row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  dot,
  loading,
}: {
  label: string;
  value: number;
  dot: string;
  loading: boolean;
}) {
  return (
    <li className="min-w-[140px] shrink-0 rounded-2xl bg-card px-4 py-3.5 shadow-card md:min-w-0 md:px-5 md:py-4">
      <p className="flex items-center gap-2 text-[13px] text-text-secondary">
        <span className={cn("h-2 w-2 rounded-full", dot)} aria-hidden="true" />
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-10" />
      ) : (
        <p className="num mt-1 text-[26px] font-semibold leading-tight">{value}</p>
      )}
    </li>
  );
}

function LoadingList() {
  return (
    <div role="status" aria-label="Loading cases">
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="hidden rounded-2xl bg-card p-2 shadow-card md:block">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-line px-4 py-4 last:border-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
