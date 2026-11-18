# PayFix Front End: Specification

**Product:** PayFix, "UPI disputes, resolved in seconds."
**Scope of this document:** the web front end (Next.js app) only. The n8n workflow, Razorpay and the policy search (RAG) are external systems; this document describes only the data contract the front end uses to talk to them.
**Status:** built and deployed to Vercel.

---

## 1. Purpose

A signed-in user raises a dispute about a UPI payment. The front end sends it to an AI agent (an n8n workflow) through a server-side proxy, shows live progress while the agent works, then shows the decision as a receipt. A separate **Cases** screen lists every dispute the agent has handled, for analysts.

Three decisions can come back:

| Decision value | Shown as | Meaning |
|---|---|---|
| `auto_refund` | Refund approved | Refund issued automatically |
| `escalate` | Escalated to `<assigned_to>` | Sent to a human analyst |
| `reject` | Rejected | Claim contradicted by the payment record |

---

## 2. Technology

| Area | Choice |
|---|---|
| Framework | Next.js 16.4.6 (App Router, Turbopack), React 19.3, TypeScript |
| Styling | Tailwind CSS 4.3 (theme tokens in `app/globals.css`) |
| Validation | zod 4 (one schema shared by browser and server) |
| Icons / motion | lucide-react, framer-motion |
| Login | Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`), email + password |
| Font | Inter (via `next/font`) |
| Hosting | Vercel (Hobby) |
| Database | None in this app. Cases are stored by n8n; accounts are in Supabase Auth |

Next.js 16 note: route protection lives in `proxy.ts` (the new name for middleware).

---

## 3. Routes

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Log in and sign up (two modes on one page) |
| `/auth/callback` | Public | Handles the email-confirmation link, then redirects |
| `/` | Signed in | Home |
| `/raise-dispute` | Signed in | Dispute form, progress log and result. Accepts `?issue=<issue_type>` to pre-select |
| `/cases` | Signed in | Analyst view of all cases |
| `/api/dispute` | Signed in (POST) | Server proxy to n8n for a new dispute |
| `/api/cases` | Signed in (GET) | Server proxy to n8n for the case list |

Route groups: `app/(app)/` holds signed-in pages with navigation; `app/(auth)/` holds the bare login layout.

---

## 4. Design system

### 4.1 Brand
- **Name / logo:** "PayFix"; a white rounded square containing a violet shield with a check mark (`LogoMark`).
- **Tagline:** "UPI disputes, resolved in seconds."
- **Look:** modern fintech. Hairline card borders, restrained shadows, medium and semibold weights, single-colour icons, plain copy.

### 4.2 Colours (theme tokens)

| Token | Value | Use |
|---|---|---|
| `primary` | `#5B2EFF` | Buttons, links, active states |
| `primary-dark` | `#3B1FD1` | Gradient end, hover |
| `primary-soft` | `#EEEAFF` | Icon tiles, selected rows |
| `background` | `#F4F5FA` | Page background |
| `card` | `#FFFFFF` | Cards |
| `success` / `success-ink` | `#16A34A` / `#15803D` | Refunded, resolved |
| `escalated` / `escalated-ink` | `#F59E0B` / `#B45309` | Escalated, with analyst |
| `rejected` / `rejected-ink` | `#DC2626` / `#B91C1C` | Rejected, errors |
| `text-primary` / `text-secondary` / `text-muted` | `#10131F` / `#5B6070` / `#8A8F9E` | Text |
| `line` | `#E6E8EF` | Borders |

Header gradient: `#5B2EFF` to `#3B1FD1`.

### 4.3 Components

| Component | Behaviour |
|---|---|
| `PillButton` | Variants primary, secondary, ghost, white. Sizes md (44px min) and lg (48px min). Disabled state |
| `StatusChip` | Coloured pill with a dot: Refunded, Escalated, With analyst, Rejected, Resolved, Closed |
| `Tooltip` | Opens on hover, focus and tap; closes on Escape |
| `CopyButton` | Copies text with a "Copied" confirmation |
| `Skeleton` / `SkeletonCard` | Loading placeholders |
| `EmptyState` | Icon, title and description ("No cases yet") |
| `PageHeader` | Gradient header with eyebrow, title, subtitle; logo and log-out icon on mobile |

### 4.4 Responsive behaviour
- **Mobile (<768px):** app-like. Gradient header with logo, stacked cards, **fixed bottom navigation**, full-width forms with a **sticky submit button** above the bottom bar, bottom sheet for case details.
- **Desktop (>=768px):** content centred at a maximum width of **1100px**, **top navigation bar** with logo, links and user email plus log-out, two-column layouts where useful, table view for cases, side panel for case details, footer visible.
- Verified at 375px, 768px and 1280px with no horizontal page scroll.
- Tap targets are at least 44px.

### 4.5 Navigation
Two items on both bars: **Home** and **Cases**. "Raise a dispute" is not a nav item; it is reached from Home. Home stays highlighted on `/raise-dispute`.

---

## 5. Screens

### 5.1 Login (`/login`)
- Bare layout (no navigation), gradient brand block above a white card (full-width bottom sheet on mobile).
- **Log in / Sign up** switch.
- Fields: **Email**, **Password** (show/hide toggle).
- Validation (zod, inline): email valid; password required on log in; **8 to 72 characters** on sign up.
- Behaviour:
  - Log in: `signInWithPassword`, then redirect to the `?next=` path (default Home).
  - Sign up: `signUp`. If Supabase has email confirmation off, the user is signed in immediately. If on, a "Check your email" panel is shown.
- Friendly error mapping: wrong credentials, unconfirmed email, existing account, email rate limit, blocked email address, weak password, network failure. Unknown errors show the Supabase code in brackets.
- `?error=confirm` shows a notice that the confirmation link is invalid or expired.
- The form uses `method="post"` so credentials can never end up in a URL if JavaScript fails.
- Open-redirect protection: `?next=` accepts only paths inside the app.

### 5.2 Home (`/`)
- Gradient header: eyebrow "Payment disputes", title "Something wrong with a payment?", subtitle.
- **Highlight card:** "Had a problem with a UPI payment? Our AI agent checks it against company policy in seconds." with a large **Raise a dispute** button.
- **Issue tiles** (grid of 6, 3 columns on mobile and 6 on desktop). Each links to `/raise-dispute?issue=<value>` to pre-select it.
- **How it works:** three steps: *Tell us what happened*, *AI checks your payment and policy*, *Get a decision instantly*.

### 5.3 Raise Dispute (`/raise-dispute`)
**Layout:** form on the left; demo panel on the right (desktop, sticky) or a collapsible card above the form (mobile).

**Form fields** (all required, inline errors, labels on every input):

| Field | Rules |
|---|---|
| Name | 1 to 100 characters |
| Email | valid email, up to 254 characters |
| Razorpay Payment ID | must start with `pay_`, up to 64 characters; placeholder `pay_XXXXXXXX`; help tooltip |
| Issue type | dropdown, one of six values |
| Describe the issue | 1 to 1000 characters, live character counter |

**Issue types:**

| Value | Label |
|---|---|
| `money_debited_not_received` | Money debited but payment failed |
| `paid_twice` | Paid twice |
| `unauthorised_transaction` | I did not make this payment |
| `wrong_amount` | Wrong amount |
| `service_not_received` | Did not receive service |
| `other` | Other |

**Demo panel** ("Try a demo payment"; note: use your own email). Tapping a row fills the Payment ID and the issue type:

| Payment ID | Issue type | Outcome shown as |
|---|---|---|
| `pay_DEMO1` | `wrong_amount` | Refund demo |
| `pay_DEMO2` | `money_debited_not_received` | Reject demo |
| `pay_DEMO3` | `unauthorised_transaction` | Escalation demo |

**Submit:** validates in the browser, then POSTs to `/api/dispute`. The form is replaced by the progress card.

**Progress log ("PayFix AI is working")**
- A step timeline with a progress bar and the elapsed time per step. The live region uses `aria-live="polite"`.
- A new line every **2.5 seconds**:
  1. Calling n8n webhook...
  2. Creating ticket...
  3. Fetching payment from Razorpay...
  4. AI agent searching company policy (RAG)...
  5. Applying policy rules...
  6. Preparing decision...
- Each running line shows a spinner that becomes a green tick when the next line starts.
- If the response arrives early, the log keeps animating through line 6, then ticks everything.
- If still waiting after line 6, line 6 keeps spinning with a pulse and a "Still checking" note.
- When ready, adds **"Ticket `<ticket_id>` created"**, pauses briefly, then shows the result.

**Result (receipt style)**
- Large animated status icon: green check (Refund approved), amber clock (Escalated to `<assigned_to>`), red cross (Rejected).
- Amount in rupees (en-IN formatting).
- Ticket ID with a **Copy** button, amount, date and time, refund ID (if present).
- The `customer_message`.
- Expandable **"How the AI decided"**: payment status, policy rule used, reason.
- Buttons: **Raise another dispute**, **View all cases**.

**Errors:** a card with Retry (and "Edit details"). Cases handled: server error (502), rate limit (429, with minutes remaining), request timeout (65 seconds on the client), network failure, server validation errors (shown inline on the form), and an expired session (401, redirects to login).

### 5.4 Cases (`/cases`)
- Loads `/api/cases` on open; **Refresh** button; skeleton loaders; error card with Retry; empty state "No cases yet"; "No matching cases" when filters match nothing.
- **Summary cards** (horizontal scroll on mobile, four across on desktop): Total; Refunded (decision `auto_refund`); Escalated (status `with_analyst`); Rejected (decision `reject`).
- **Filter chips** by decision (All, Refunded, Escalated, Rejected) and **search** by ticket ID or customer name.
- Sorted **newest first**.
- **Mobile:** each case is a card with ticket ID, name, amount, status chip and date.
- **Desktop:** a table with Ticket, Created (readable date), Customer, Amount, Type, Decision, Assigned to, Status, Refund ID.
- **Detail:** tapping a case opens a **bottom sheet** (mobile) or a **440px side panel** (desktop), with complaint text, reason, policy rule used and customer message. The dialog traps focus handling, closes on Escape and returns focus to where it opened.

### 5.5 Footer (desktop only)
"PayFix - AI dispute agent built with n8n, Razorpay test mode, Gemini RAG on Supabase."

---

## 6. Authentication and access control

- **Provider:** Supabase Auth, email + password. Sessions are stored in cookies via `@supabase/ssr`.
- **`proxy.ts`** runs on every request except static assets:
  - Refreshes the session cookie.
  - Signed-out visitors to a page are redirected to `/login?next=<path>`.
  - Signed-out calls to `/api/*` get `401 {"error":"Please log in to continue."}`.
  - Signed-in users visiting `/login` are sent to Home.
  - If the Supabase variables are missing it **fails closed** with a 503 message.
- **API routes** independently verify the user with `getUser()` (a server round trip to Supabase). The proxy is not the only line of defence.
- **Log out:** a button in the top bar (desktop) and an icon in the header (mobile).
- **Current limitation:** any signed-in user can open Cases. There are no roles yet.

---

## 7. Server routes (front-end server layer)

### `POST /api/dispute`
- Order of checks: signed in, then rate limit, then input validation, then forward.
- **Rate limit:** per IP, in memory, 10-minute window. The limit is set in `lib/rate-limit.ts` (`MAX_REQUESTS`, currently **25**; the original brief specified 5). It resets on cold starts and is not shared between server instances. Returns `429` with a friendly message and a `Retry-After` header.
- **Validation:** the shared zod schema. On failure returns `400 { error, errors: { field: message } }`.
- **Forward:** `POST` JSON to `N8N_DISPUTE_URL` with headers `x-api-key` and `Content-Type: application/json`. **60-second timeout** (`AbortController`); `maxDuration = 60`.
- **Success:** returns n8n's JSON unchanged.
- **Any failure:** `502 { "error": "Something went wrong, please try again." }` with no internal details. Failures are logged on the server with a safe label (status code, server name, short body snippet, or a classified fetch error), never URLs or keys.

Request body:
```json
{
  "name": "string (max 100)",
  "email": "valid email",
  "payment_id": "starts with pay_",
  "issue_type": "one of the six values",
  "complaint_text": "string (max 1000)"
}
```

### `GET /api/cases`
- `export const dynamic = "force-dynamic"`. **30-second timeout.**
- Calls `N8N_CASES_URL` with `x-api-key`.
- Accepts an array, or an object with `data`, `cases` or `rows`.
- **Removes `email` and `customer_email` from every row on the server.**
- Returns the array with `Cache-Control: no-store`; any failure returns the same generic 502.

### `GET /auth/callback`
Exchanges the one-time `code` for a session cookie, then redirects to a safe `next` path; on failure redirects to `/login?error=confirm`.

---

## 8. Data contracts

**Dispute response (from n8n, via `/api/dispute`).** The front end also accepts a one-item array or `{ data: ... }`.

| Field | Type | Notes |
|---|---|---|
| `ticket_id` | string | |
| `decision` | `auto_refund` \| `escalate` \| `reject` | Required; anything else is treated as an error |
| `amount_inr` | number or string | |
| `customer_name` | string | |
| `customer_message` | string | Shown on the receipt |
| `assigned_to` | string | Used in "Escalated to ..." |
| `payment_status` | string | "How the AI decided" |
| `policy_rule_used` | string | "How the AI decided" |
| `reason` | string | "How the AI decided" |
| `refund_id` | string | Optional |
| `created_at` | ISO date string | Falls back to the current time |

**Case row (via `/api/cases`)** has the fields `ticket_id`, `created_at`, `customer_name`, `payment_id`, `amount_inr`, `dispute_type`, `decision`, `assigned_to`, `status`, `complaint_text`, `reason`, `policy_rule_used`, `customer_message`, `refund_id`. Email is never present.

---

## 9. Environment variables

| Name | Runs in | Purpose |
|---|---|---|
| `N8N_DISPUTE_URL` | Server only | n8n production webhook for new disputes |
| `N8N_CASES_URL` | Server only | n8n production webhook for the case list |
| `N8N_API_KEY` | Server only | Sent as the `x-api-key` header |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Supabase project URL (public by design) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Supabase anon / publishable key (public by design) |

Rules:
- The three `N8N_*` values are read only inside route handlers, never carry the `NEXT_PUBLIC_` prefix, and are never logged or returned. Values are trimmed before use.
- Never use the Supabase `service_role` key in this app.
- Use n8n **production** URLs (`/webhook/...`), not test URLs (`/webhook-test/...`).
- A key containing `$` or `#` must be single-quoted with `\$` in `.env.local`. On Vercel it is pasted raw.
- `.env*.local` is git-ignored; `.env.example` lists the names with empty values.

---

## 10. Security summary

- n8n URLs and key never reach the browser. The built client files were searched for `n8n` URLs, `x-api-key` and `N8N_` and none appear (the only "n8n" text is the UI line "Calling n8n webhook...").
- Authentication on pages (proxy) and on the API (route-level re-check).
- zod validation on both the browser and the server.
- Open-redirect protection on `?next=`.
- Passwords are never put in URLs (`method="post"` on the login form).
- Security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, restrictive `Permissions-Policy`; `X-Powered-By` removed.
- Personal data: emails are stripped from case rows on the server.
- Generic errors only to the browser; detail goes to server logs.

---

## 11. Accessibility

- A visible label on every input; errors announced with `role="alert"`.
- Visible focus ring on all interactive elements; "Skip to content" link.
- The progress log and character counter use `aria-live`.
- Dialogs use `role="dialog"` and `aria-modal`, move focus in, close on Escape and restore focus.
- Active navigation uses `aria-current="page"`.
- Reduced-motion preference is respected (animations are shortened).
- Status is never conveyed by colour alone (text labels on every chip).

---

## 12. Project structure

```
proxy.ts                      Login gate for pages and /api
app/
  layout.tsx, globals.css     Root layout, font, theme tokens
  (app)/                      Signed-in pages with navigation
    layout.tsx
    page.tsx                  Home
    raise-dispute/page.tsx    Raise Dispute
    cases/page.tsx            Cases
  (auth)/
    layout.tsx
    login/page.tsx            Login and sign up
  auth/callback/route.ts      Email confirmation handler
  api/dispute/route.ts        POST to n8n
  api/cases/route.ts          GET from n8n
components/
  layout/                     TopNav, BottomNav, PageHeader, Logo, Footer, SignOutButton, nav-links
  dispute/                    DisputeFlow, DisputeForm, DemoPanel, ThinkingLog, ResultCard, ErrorCard
  cases/                      CasesView, CaseDetail
  auth/                       AuthForm
  ui/                         PillButton, StatusChip, Tooltip, CopyButton, SkeletonCard, EmptyState
lib/
  schemas.ts                  zod schemas (dispute, login, signup)
  constants.ts, issue-types.ts, demo.ts, types.ts, utils.ts
  rate-limit.ts, auth.ts, auth-utils.ts, safe-error.ts
  supabase/                   client.ts, server.ts, env.ts
public/favicon.svg
```

---

## 13. Verification performed

- `npm run build` and `npm run lint` pass with no errors.
- All screens checked at 375px, 768px and 1280px, with no horizontal scrolling.
- Without environment values, the form and Cases show the friendly error card instead of crashing.
- Signed-out requests to pages are redirected to `/login`, and to API routes return 401.
- The redirect guard blocks external and malformed `?next=` values.
- The dispute flow, result variants and Cases views were checked with stubbed responses, then against the real n8n workflow locally and on Vercel.

---

## 14. Known limitations and ideas

- **Roles:** every signed-in user sees every case. Add an analyst role (for example a `profiles` table) before opening sign-up publicly.
- **Rate limit:** in memory only. Use a shared store (for example Upstash Redis) for production, and restore a lower limit before sharing publicly.
- **Email:** Supabase's built-in sender is rate limited. Add a custom SMTP provider and turn email confirmation back on before going public.
- **Tests:** there are no automated tests yet. Candidates: schema tests, `safeNext` tests, and an end-to-end login-and-dispute flow.
- **Decision logic** lives entirely in n8n. The front end only displays what it returns, so vague complaint text or a repeated payment can produce an escalation.
