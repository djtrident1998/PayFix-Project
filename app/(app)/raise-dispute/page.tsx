import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { DisputeFlow } from "@/components/dispute/DisputeFlow";
import { isIssueType } from "@/lib/issue-types";

export const metadata: Metadata = { title: "Raise a dispute" };

export default async function RaiseDisputePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { issue } = await searchParams;
  const initialIssue = isIssueType(issue) ? issue : undefined;

  return (
    <>
      <PageHeader
        eyebrow="New dispute"
        title="Raise a dispute"
        subtitle="Give us the payment ID and a short description. You'll get a decision on this screen."
      />
      <div className="mx-auto -mt-10 max-w-[1100px] px-4 md:-mt-12 md:px-6">
        <DisputeFlow key={initialIssue ?? "none"} initialIssue={initialIssue} />
      </div>
    </>
  );
}
