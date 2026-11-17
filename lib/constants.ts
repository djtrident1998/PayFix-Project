import {
  Ban,
  Brain,
  CircleDollarSign,
  CircleHelp,
  CopyX,
  CreditCard,
  FileCheck,
  Scale,
  ShieldAlert,
  Ticket,
  TriangleAlert,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import type { IssueTypeValue } from "./issue-types";

export { ISSUE_TYPE_VALUES, isIssueType, type IssueTypeValue } from "./issue-types";

export const ISSUE_TYPES: {
  value: IssueTypeValue;
  label: string;
  short: string;
  icon: LucideIcon;
  tile: string;
}[] = [
  {
    value: "money_debited_not_received",
    label: "Money debited but payment failed",
    short: "Debited, but failed",
    icon: CircleDollarSign,
    tile: "bg-rose-50 text-rose-600",
  },
  {
    value: "paid_twice",
    label: "Paid twice",
    short: "Paid twice",
    icon: CopyX,
    tile: "bg-orange-50 text-orange-600",
  },
  {
    value: "unauthorised_transaction",
    label: "I did not make this payment",
    short: "Not my payment",
    icon: ShieldAlert,
    tile: "bg-violet-50 text-violet-600",
  },
  {
    value: "wrong_amount",
    label: "Wrong amount",
    short: "Wrong amount",
    icon: TriangleAlert,
    tile: "bg-amber-50 text-amber-700",
  },
  {
    value: "service_not_received",
    label: "Did not receive service",
    short: "No service",
    icon: Ban,
    tile: "bg-sky-50 text-sky-600",
  },
  {
    value: "other",
    label: "Other",
    short: "Other",
    icon: CircleHelp,
    tile: "bg-slate-100 text-slate-600",
  },
];

export function issueLabel(value: string | undefined | null): string {
  if (!value) return "—";
  const match = ISSUE_TYPES.find((t) => t.value === value);
  if (match) return match.label;
  return value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export const THINKING_STEPS: { text: string; icon: LucideIcon }[] = [
  { text: "Calling n8n webhook...", icon: Webhook },
  { text: "Creating ticket...", icon: Ticket },
  { text: "Fetching payment from Razorpay...", icon: CreditCard },
  { text: "AI agent searching company policy (RAG)...", icon: Brain },
  { text: "Applying policy rules...", icon: Scale },
  { text: "Preparing decision...", icon: FileCheck },
];

export const THINKING_STEP_MS = 2500;

export const GENERIC_ERROR = "Something went wrong, please try again.";
