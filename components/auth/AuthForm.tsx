"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth-utils";
import { loginSchema, signupSchema, type AuthField } from "@/lib/schemas";
import { PillButton } from "@/components/ui/PillButton";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

const inputCls = (invalid: boolean) =>
  cn(
    "block h-12 w-full rounded-xl border bg-white px-4 text-base text-text-primary placeholder:text-slate-400 transition-colors",
    "focus:outline-none focus:ring-4",
    invalid
      ? "border-rejected focus:border-rejected focus:ring-rejected/15"
      : "border-line hover:border-slate-300 focus:border-primary focus:ring-primary/15"
  );

export function AuthForm({ next, linkProblem }: { next: string; linkProblem: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<AuthField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const schema = mode === "login" ? loginSchema : signupSchema;
  const result = schema.safeParse({ email, password });
  const errors: Partial<Record<AuthField, string>> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const f = issue.path[0] as AuthField;
      if (f && !errors[f]) errors[f] = issue.message;
    }
  }
  const errorFor = (f: AuthField) => ((submitted || touched[f]) && errors[f] ? errors[f] : undefined);

  const switchMode = (m: Mode) => {
    setMode(m);
    setFormError(null);
    setSubmitted(false);
    setTouched({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    if (!result.success) {
      document.getElementById(errors.email ? "email" : "password")?.focus();
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setFormError("Login isn't configured yet. Please try again later.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword(result.data);
        if (error) {
          console.error("[auth] log-in failed:", error.code, error.status, error.message);
          setFormError(friendlyAuthError(error));
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        ...result.data,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        console.error("[auth] sign-up failed:", error.code, error.status, error.message);
        setFormError(friendlyAuthError(error));
        return;
      }
      if (data.session) {
        // Email confirmation is switched off in Supabase: signed in straight away.
        router.replace(next);
        router.refresh();
        return;
      }
      setConfirmEmail(result.data.email);
    } catch (err) {
      console.error("[auth] unexpected error:", err);
      setFormError("Something went wrong, please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (confirmEmail) {
    return (
      <div className="text-center" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MailCheck size={22} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Check your email</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          We sent a confirmation link to <span className="font-medium text-text-primary">{confirmEmail}</span>. Open
          it to finish creating your account, then log in.
        </p>
        <PillButton
          variant="secondary"
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            setConfirmEmail(null);
            switchMode("login");
          }}
        >
          Back to log in
        </PillButton>
      </div>
    );
  }

  return (
    // method="post": if JavaScript ever fails to load, the browser must never fall back to a
    // GET that would put the email and password into the URL and server logs.
    <form noValidate method="post" onSubmit={handleSubmit} aria-labelledby="auth-title">
      <h1 id="auth-title" className="text-xl font-semibold">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {mode === "login" ? "Log in to raise and track disputes." : "It takes less than a minute."}
      </p>

      {/* Mode switch */}
      <div className="mt-5 grid grid-cols-2 rounded-full bg-slate-100 p-1" role="group" aria-label="Log in or sign up">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "min-h-11 rounded-full text-sm font-medium transition-colors",
              mode === m ? "bg-white text-text-primary shadow-card" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      {linkProblem && !formError && (
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          That confirmation link is invalid or has expired. Log in, or sign up again to get a new one.
        </p>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={!!errorFor("email")}
            aria-describedby={errorFor("email") ? "email-error" : undefined}
            className={inputCls(!!errorFor("email"))}
          />
          {errorFor("email") && (
            <p id="email-error" role="alert" className="mt-1.5 text-sm font-medium text-rejected-ink">
              {errorFor("email")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={!!errorFor("password")}
              aria-describedby={errorFor("password") ? "password-error" : undefined}
              className={cn(inputCls(!!errorFor("password")), "pr-12")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {errorFor("password") && (
            <p id="password-error" role="alert" className="mt-1.5 text-sm font-medium text-rejected-ink">
              {errorFor("password")}
            </p>
          )}
        </div>
      </div>

      {formError && (
        <p role="alert" className="mt-4 rounded-xl bg-rejected/10 p-3 text-sm font-medium text-rejected-ink">
          {formError}
        </p>
      )}

      <PillButton type="submit" size="lg" disabled={busy} className="mt-6 w-full">
        {busy && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
        {mode === "login" ? "Log in" : "Create account"}
      </PillButton>

      <p className="mt-5 text-center text-sm text-text-secondary">
        {mode === "login" ? "New to PayFix? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          className="inline-flex min-h-11 items-center px-1 font-semibold text-primary hover:underline"
        >
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
    </form>
  );
}
