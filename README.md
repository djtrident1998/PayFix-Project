# PayFix

**UPI disputes, resolved in seconds.** PayFix is the front end for an AI dispute agent. A customer raises a dispute, and an n8n workflow fetches the payment from Razorpay (test mode). It then searches company policy with Gemini RAG on Supabase and returns a decision: auto refund, escalate or reject.

Built with Next.js (App Router, TypeScript), Tailwind CSS v4, zod, lucide-react, framer-motion and Supabase Auth (email + password login). There is no database of its own: cases live in n8n.

## Screens

- **Login / Sign up**: email + password through Supabase. Every other page and API route requires a signed-in user.
- **Home**: issue tiles, how it works, and a test mode notice.
- **Raise Dispute**: a validated form with demo payments. While the AI works it shows a live reasoning log, then a receipt-style result.
- **Cases**: an analyst view with summary cards, filters, search, a table (desktop) or cards (mobile), and case details.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the five values
npm run dev
```

Open http://localhost:3000. Without real values the app still runs. Submitting a dispute or opening Cases shows a friendly "Something went wrong" card.

## Environment variables

| Name                            | Where it runs | What it is                                              |
| ------------------------------- | ------------- | ------------------------------------------------------- |
| `N8N_DISPUTE_URL`               | server only   | n8n webhook that processes a new dispute                |
| `N8N_CASES_URL`                 | server only   | n8n webhook that returns all cases                      |
| `N8N_API_KEY`                   | server only   | Sent to n8n as the `x-api-key` header                   |
| `NEXT_PUBLIC_SUPABASE_URL`      | browser + server | Supabase project URL (public by design)              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | Supabase anon / publishable key (public by design)   |

The three `N8N_*` values are **server-only**: they are read only inside `app/api/*` route handlers and never use the `NEXT_PUBLIC_` prefix, so they are never sent to the browser.

The two Supabase values *do* use `NEXT_PUBLIC_` because the browser needs them to log in. They are safe to expose; protection comes from Supabase Auth. **Never use the `service_role` / secret key in this app.**

`.env*.local` is git-ignored. Never commit real values.

> **Special characters:** if a value contains `$` or `#` (common in API keys), quote it and escape each `$` with a backslash in `.env.local`, for example `N8N_API_KEY='ab\$cd#ef'`. Next.js otherwise treats `#` as a comment and `$name` as a variable. Vercel needs no quoting.

## Set up Supabase login

1. Create a project at supabase.com. Open **Project Settings -> API** and copy the **Project URL** and the **anon / publishable** key into `.env.local`.
2. **Authentication -> Providers -> Email**: make sure Email is enabled. Choose whether to keep **Confirm email** on:
   - **On** (default): new users get a link by email and must click it before logging in.
   - **Off**: new users are signed in immediately. Convenient for a demo.
3. **Authentication -> URL Configuration**:
   - **Site URL**: `http://localhost:3000` while developing, your Vercel URL in production.
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`.
4. Restart `npm run dev` after editing `.env.local`.

Supabase's built-in email sender is rate limited (a few emails per hour). For heavy use, add your own SMTP provider under **Authentication -> SMTP**.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repo (framework: Next.js, defaults are fine).
3. Under **Settings → Environment Variables**, add all five variables from the table above for Production (and Preview if you want). Paste values as they are, without the quotes or backslashes used in `.env.local`.
4. In Supabase **Authentication → URL Configuration**, set the Site URL to your Vercel address and add its `/auth/callback` URL to Redirect URLs.
5. Deploy. `/api/dispute` sets `maxDuration = 60` to allow for the AI agent's response time.

## Security notes

- `proxy.ts` sends signed-out visitors to `/login` and answers API calls with 401. Both API routes also verify the user with Supabase themselves, so a proxy mistake cannot expose n8n.
- Post-login redirects (`?next=`) only accept paths inside the app, which blocks open-redirect attacks.
- Any signed-in user can open **Cases**. With open sign-up, that means anyone who registers can see every case (emails are already removed). To restrict it to analysts, turn off sign-up in Supabase or add a role check.
- `/api/dispute` validates input with zod (the same schema the form uses). It forwards to n8n with a 60-second timeout. Any failure returns `{"error":"Something went wrong, please try again."}` with status 502 and no internal details.
- `/api/cases` removes `email` from every row on the server before responding.
- `/api/dispute` is rate limited to 5 requests per IP per 10 minutes, in memory. The limit resets on cold starts and is not shared between instances. Use Redis or Upstash for real production.
- To verify after `npm run build`, search `.next/static` for `x-api-key` and `N8N_`. Both should return nothing. The only `n8n` match should be the UI text "Calling n8n webhook...".


## Project structure

```
proxy.ts                   Login gate for pages and /api (Next 16's "middleware")
app/
  (app)/                   Signed-in pages with navigation
    page.tsx               Home
    raise-dispute/page.tsx Raise Dispute
    cases/page.tsx         Cases
  (auth)/login/page.tsx    Login + sign up
  auth/callback/route.ts   Email-confirmation link handler
  api/dispute/route.ts     POST -> n8n (server only)
  api/cases/route.ts       GET  -> n8n (server only, emails stripped)
components/
  layout/                  TopNav, BottomNav, PageHeader, Logo, Footer
  dispute/                 DisputeFlow, DisputeForm, DemoPanel, ThinkingLog, ResultCard, ErrorCard
  cases/                   CasesView, CaseDetail
  auth/                    AuthForm
  ui/                      PillButton, StatusChip, Tooltip, CopyButton, Skeleton, EmptyState
lib/                       schemas (zod), supabase clients, auth helpers, demo payments, rate limit, types, utils
```
