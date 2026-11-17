export type Decision = "auto_refund" | "escalate" | "reject";

export const DECISIONS: readonly Decision[] = ["auto_refund", "escalate", "reject"];

export interface DisputeResponse {
  ticket_id: string;
  decision: Decision;
  amount_inr?: number | string;
  customer_name?: string;
  customer_message?: string;
  assigned_to?: string;
  payment_status?: string;
  policy_rule_used?: string;
  reason?: string;
  refund_id?: string;
  created_at?: string;
}

export interface CaseRow {
  ticket_id: string;
  created_at?: string;
  customer_name?: string;
  payment_id?: string;
  amount_inr?: number | string;
  dispute_type?: string;
  decision?: Decision | string;
  assigned_to?: string;
  status?: string;
  complaint_text?: string;
  reason?: string;
  policy_rule_used?: string;
  customer_message?: string;
  refund_id?: string;
}

/** n8n may answer with an object, a one-item array, or {data: …}. */
export function normalizeDispute(raw: unknown): DisputeResponse | null {
  let obj: unknown = raw;
  if (Array.isArray(obj)) obj = obj[0];
  if (obj && typeof obj === "object" && "data" in obj && !("decision" in obj)) {
    obj = (obj as { data: unknown }).data;
    if (Array.isArray(obj)) obj = obj[0];
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.decision !== "string" || !DECISIONS.includes(o.decision as Decision)) return null;
  return {
    ...(o as unknown as DisputeResponse),
    ticket_id: o.ticket_id ? String(o.ticket_id) : "—",
  };
}
