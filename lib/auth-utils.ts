/**
 * Only allow redirects to paths inside this app, to prevent open-redirect
 * attacks via ?next=https://evil.example or ?next=//evil.example.
 */
export function safeNext(value: string | string[] | null | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return "/";
  if (v.startsWith("/login") || v.startsWith("/auth")) return "/";
  return v;
}

/** Turn Supabase auth errors into short, friendly messages. */
export function friendlyAuthError(err: { message?: string; status?: number; code?: string }): string {
  const msg = (err.message || "").toLowerCase();
  const code = err.code || "";
  if (msg.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (code === "email_address_invalid" || (msg.includes("email address") && msg.includes("invalid")))
    return "That email address isn't accepted. Use a real email address (placeholder domains like example.com are blocked).";
  if (code === "over_email_send_rate_limit" || msg.includes("email rate limit"))
    return "Too many confirmation emails were sent. Wait a while and try again, or turn off email confirmation in Supabase while testing.";
  if (code === "email_send_failed" || msg.includes("sending confirmation email") || msg.includes("error sending"))
    return "We couldn't send the confirmation email. Try again later, or turn off email confirmation in Supabase while testing.";
  if (code === "signup_disabled") return "Sign-ups are turned off right now.";
  if (code === "email_provider_disabled") return "Email login is turned off for this project.";
  if (code === "validation_failed") return "Please check your email and password and try again.";
  if (msg.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (msg.includes("already registered") || err.code === "user_already_exists")
    return "An account with this email already exists. Try logging in instead.";
  if (err.status === 429 || msg.includes("rate limit") || msg.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  if (msg.includes("password") && msg.includes("characters")) return "Password must be at least 8 characters.";
  if (msg.includes("weak") || err.code === "weak_password") return "That password is too easy to guess. Try a longer one.";
  if (msg.includes("fetch") || msg.includes("network")) return "We couldn't reach the login service. Check your connection.";
  // Unknown error: include Supabase's code so it can be diagnosed.
  const ref = code || (err.status ? `HTTP ${err.status}` : "");
  return `Something went wrong, please try again.${ref ? ` (${ref})` : ""}`;
}
