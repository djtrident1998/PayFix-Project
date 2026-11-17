// The Supabase project URL and anon/publishable key are designed to be public:
// they are safe in the browser because access is enforced by Supabase auth and
// row-level security. That is why these two (unlike the n8n values) DO use the
// NEXT_PUBLIC_ prefix. NEVER put the service_role key in this app.

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}
