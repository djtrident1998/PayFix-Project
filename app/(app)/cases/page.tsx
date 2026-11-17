import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CasesView } from "@/components/cases/CasesView";

export const metadata: Metadata = { title: "Cases" };

export default function CasesPage() {
  return (
    <>
      <PageHeader eyebrow="Analyst view" title="Cases" subtitle="Every dispute the agent has handled, newest first." />
      <div className="mx-auto -mt-10 max-w-[1100px] px-4 md:-mt-12 md:px-6">
        <CasesView />
      </div>
    </>
  );
}
