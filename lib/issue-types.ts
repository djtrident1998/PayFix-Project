// Plain values with no UI imports, so server code (schemas, API routes) stays lean.
export const ISSUE_TYPE_VALUES = [
  "money_debited_not_received",
  "paid_twice",
  "unauthorised_transaction",
  "wrong_amount",
  "service_not_received",
  "other",
] as const;

export type IssueTypeValue = (typeof ISSUE_TYPE_VALUES)[number];

export function isIssueType(value: unknown): value is IssueTypeValue {
  return typeof value === "string" && (ISSUE_TYPE_VALUES as readonly string[]).includes(value);
}
