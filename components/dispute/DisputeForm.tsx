"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, Send } from "lucide-react";
import { ISSUE_TYPES } from "@/lib/constants";
import { COMPLAINT_MAX, disputeSchema, type DisputeField, type DisputeFormData } from "@/lib/schemas";
import { PillButton } from "@/components/ui/PillButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export type FormValues = Record<DisputeField, string>;

export const EMPTY_FORM: FormValues = {
  name: "",
  email: "",
  payment_id: "",
  issue_type: "",
  complaint_text: "",
};

const FIELDS: DisputeField[] = ["name", "email", "payment_id", "issue_type", "complaint_text"];

function validate(values: FormValues) {
  const result = disputeSchema.safeParse(values);
  const errors: Partial<Record<DisputeField, string>> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const f = issue.path[0] as DisputeField;
      if (f && !errors[f]) errors[f] = issue.message;
    }
  }
  return { errors, data: result.success ? result.data : null };
}

const inputCls = (invalid: boolean) =>
  cn(
    "block w-full rounded-xl border bg-white px-4 text-base text-text-primary placeholder:text-slate-400 transition-colors",
    "focus:outline-none focus-visible:outline-none focus:ring-4",
    invalid
      ? "border-rejected focus:border-rejected focus:ring-rejected/15"
      : "border-line hover:border-slate-300 focus:border-primary focus:ring-primary/15"
  );

function Field({
  id,
  label,
  extra,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  extra?: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center text-sm font-medium">
          {label}
          
          {extra}
        </label>
        {hint}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-rejected-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function DisputeForm({
  values,
  onChange,
  serverErrors,
  onSubmit,
}: {
  values: FormValues;
  onChange: (updater: (v: FormValues) => FormValues) => void;
  serverErrors: Record<string, string>;
  onSubmit: (data: DisputeFormData) => void;
}) {
  const [touched, setTouched] = useState<Partial<Record<DisputeField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const { errors } = validate(values);
  const errorFor = (f: DisputeField) =>
    (submitted || touched[f]) && errors[f] ? errors[f] : serverErrors[f];

  const set = (f: DisputeField, v: string) => onChange((prev) => ({ ...prev, [f]: v }));
  const blur = (f: DisputeField) => setTouched((t) => ({ ...t, [f]: true }));

  const aria = (f: DisputeField) => {
    const err = errorFor(f);
    return { "aria-invalid": !!err, "aria-describedby": err ? `${f}-error` : undefined };
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const { data, errors: errs } = validate(values);
    if (!data) {
      const first = FIELDS.find((f) => errs[f]);
      if (first) {
        const el = document.getElementById(first);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    onSubmit(data);
  };

  const count = values.complaint_text.length;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby="form-title"
      className="rounded-2xl bg-card shadow-raised"
    >
      <div className="space-y-5 p-5 md:p-7">
        <div>
          <h2 id="form-title" className="text-[17px] font-semibold">
            Dispute details
          </h2>
          <p className="mt-0.5 text-sm text-text-secondary">All fields are required. We only use your email to send the decision.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field id="name" label="Name" error={errorFor("name")}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              maxLength={100}
              placeholder="Your full name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => blur("name")}
              className={cn(inputCls(!!errorFor("name")), "h-12")}
              {...aria("name")}
            />
          </Field>
          <Field id="email" label="Email" error={errorFor("email")}>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => blur("email")}
              className={cn(inputCls(!!errorFor("email")), "h-12")}
              {...aria("email")}
            />
          </Field>
        </div>

        <Field
          id="payment_id"
          label="Razorpay Payment ID"
          error={errorFor("payment_id")}
          extra={
            <Tooltip
              label="Where do I find my payment ID?"
              content='Find it in your payment receipt or SMS. It starts with "pay_", for example pay_DEMO1.'
            />
          }
        >
          <input
            id="payment_id"
            name="payment_id"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="pay_XXXXXXXX"
            value={values.payment_id}
            onChange={(e) => set("payment_id", e.target.value)}
            onBlur={() => blur("payment_id")}
            className={cn(inputCls(!!errorFor("payment_id")), "h-12 font-mono tracking-wide")}
            {...aria("payment_id")}
          />
        </Field>

        <Field id="issue_type" label="Issue type" error={errorFor("issue_type")}>
          <div className="relative">
            <select
              id="issue_type"
              name="issue_type"
              value={values.issue_type}
              onChange={(e) => {
                set("issue_type", e.target.value);
                blur("issue_type");
              }}
              onBlur={() => blur("issue_type")}
              required
              className={cn(
                inputCls(!!errorFor("issue_type")),
                "h-12 cursor-pointer appearance-none pr-11",
                values.issue_type === "" && "text-slate-400"
              )}
              {...aria("issue_type")}
            >
              <option value="" disabled>
                Select an issue type
              </option>
              {ISSUE_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="text-text-primary">
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
            />
          </div>
        </Field>

        <Field
          id="complaint_text"
          label="Describe the issue"
          error={errorFor("complaint_text")}
          hint={
            <span
              className={cn(
                "text-xs tabular-nums",
                count > COMPLAINT_MAX ? "font-semibold text-rejected-ink" : "text-text-secondary"
              )}
              aria-live="polite"
            >
              {count}/{COMPLAINT_MAX}
            </span>
          }
        >
          <textarea
            id="complaint_text"
            name="complaint_text"
            rows={5}
            maxLength={COMPLAINT_MAX}
            placeholder="E.g. I was charged ₹999 but the order was for ₹499."
            value={values.complaint_text}
            onChange={(e) => set("complaint_text", e.target.value)}
            onBlur={() => blur("complaint_text")}
            className={cn(inputCls(!!errorFor("complaint_text")), "resize-y py-3 leading-relaxed")}
            {...aria("complaint_text")}
          />
        </Field>
      </div>

      {/* Sticky on mobile, sitting just above the bottom navigation */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 rounded-b-2xl border-t border-line bg-white/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:px-7 md:pb-7 md:pt-0">
        <PillButton type="submit" size="lg" className="w-full md:w-auto">
          <Send size={18} aria-hidden="true" /> Submit dispute
        </PillButton>
      </div>
    </form>
  );
}
