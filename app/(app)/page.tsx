import Link from "next/link";
import { ArrowRight, ChevronRight, MessageSquareText, ScanSearch, CircleCheckBig } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { pillClasses } from "@/components/ui/PillButton";
import { ISSUE_TYPES } from "@/lib/constants";

const STEPS = [
  { icon: MessageSquareText, title: "Tell us what happened", text: "Your payment ID and a short note is all we need." },
  { icon: ScanSearch, title: "AI checks your payment and policy", text: "We look up the payment and match it to the refund policy." },
  { icon: CircleCheckBig, title: "Get a decision instantly", text: "A refund, a hand-off to our team, or a clear reason why not." },
];

export default function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Payment disputes"
        title="Something wrong with a payment?"
        subtitle="Raise a dispute on any UPI payment. Each decision is checked against the refund policy and your payment record."
      />

      <div className="mx-auto -mt-10 max-w-[1100px] space-y-8 px-4 md:-mt-12 md:space-y-10 md:px-6">
        {/* Highlight card */}
        <section
          aria-labelledby="hero-title"
          className="rounded-2xl bg-card p-5 shadow-raised md:flex md:items-center md:justify-between md:gap-10 md:p-7"
        >
          <div>
            <h2 id="hero-title" className="text-lg font-semibold md:text-xl">
              Had a problem with a UPI payment?
            </h2>
            <p className="mt-1 max-w-md text-[15px] leading-relaxed text-text-secondary">
              Our AI agent checks it against company policy in seconds.
            </p>
          </div>
          <Link
            href="/raise-dispute"
            className={pillClasses("primary", "lg", "mt-5 w-full shrink-0 md:mt-0 md:w-auto")}
          >
            Raise a dispute <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>

        {/* Issue tiles */}
        <section aria-labelledby="issues-title">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="issues-title" className="text-[15px] font-semibold">
              Choose an issue
            </h2>
            <span className="text-[13px] text-text-muted">Pick the closest match</span>
          </div>
          <ul className="grid grid-cols-3 gap-2.5 md:grid-cols-6 md:gap-3">
            {ISSUE_TYPES.map((issue) => (
              <li key={issue.value}>
                <Link
                  href={`/raise-dispute?issue=${issue.value}`}
                  className="group flex h-full min-h-[116px] flex-col rounded-2xl bg-card p-3.5 shadow-card transition-shadow hover:shadow-raised"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <issue.icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="mt-3 flex flex-1 items-start justify-between gap-1 text-[13px] font-medium leading-snug">
                    {issue.label}
                    <ChevronRight
                      size={15}
                      aria-hidden="true"
                      className="mb-0.5 hidden shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 md:block"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title">
          <h2 id="how-title" className="mb-3 text-[15px] font-semibold">
            How it works
          </h2>
          <ol className="overflow-hidden rounded-2xl bg-card shadow-card md:grid md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 border-line p-5 not-last:border-b md:flex-col md:gap-5 md:p-6 md:not-last:border-b-0 md:not-last:border-r"
              >
                <div className="flex items-center gap-3 md:justify-between">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-line">
                    <step.icon size={19} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
                  </span>
                  <span className="num hidden text-xs font-medium text-text-muted md:block">0{i + 1}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
