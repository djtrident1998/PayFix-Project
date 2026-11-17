import { z } from "zod";
import { ISSUE_TYPE_VALUES } from "./issue-types";

/**
 * Shared by the client form (inline errors) and the /api/dispute route
 * (authoritative validation), so both always agree.
 */
export const disputeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .max(254, "Email is too long")
    .pipe(z.email("Please enter a valid email address")),
  payment_id: z
    .string()
    .trim()
    .min(1, "Please enter the payment ID")
    .max(64, "Payment ID is too long")
    .refine((val) => val.startsWith("pay_"), {
      message: 'Payment ID must start with "pay_"',
    }),
  issue_type: z.enum(ISSUE_TYPE_VALUES, {
    error: "Please pick an issue type",
  }),
  complaint_text: z
    .string()
    .trim()
    .min(1, "Please describe what happened")
    .max(1000, "Description must be 1000 characters or less"),
});

export type DisputeFormData = z.infer<typeof disputeSchema>;
export type DisputeField = keyof DisputeFormData;

export const COMPLAINT_MAX = 1000;

// --- Auth ---------------------------------------------------------------

const authEmail = z
  .string()
  .trim()
  .min(1, "Please enter your email")
  .max(254, "Email is too long")
  .pipe(z.email("Please enter a valid email address"));

export const loginSchema = z.object({
  email: authEmail,
  password: z.string().min(1, "Please enter your password").max(72, "Password is too long"),
});

export const signupSchema = z.object({
  email: authEmail,
  // bcrypt (used by Supabase) only reads the first 72 bytes.
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72, "Password is too long (max 72 characters)"),
});

export type AuthField = "email" | "password";
