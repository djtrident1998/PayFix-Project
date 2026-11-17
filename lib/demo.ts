import type { IssueTypeValue } from "./issue-types";

export const DEMO_PAYMENTS: {
  payment_id: string;
  issue_type: IssueTypeValue;
  title: string;
  outcome: "refund" | "reject" | "escalate";
  hint: string;
}[] = [
  {
    payment_id: "pay_DEMO1",
    issue_type: "wrong_amount",
    title: "Wrong amount",
    outcome: "refund",
    hint: "Refund demo",
  },
  {
    payment_id: "pay_DEMO2",
    issue_type: "money_debited_not_received",
    title: "Claim contradicted",
    outcome: "reject",
    hint: "Reject demo",
  },
  {
    payment_id: "pay_DEMO3",
    issue_type: "unauthorised_transaction",
    title: "Unauthorised payment",
    outcome: "escalate",
    hint: "Escalation demo",
  },
];
