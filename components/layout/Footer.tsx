export function Footer() {
  return (
    <footer className="hidden md:block mt-16 border-t border-line bg-white">
      <div className="mx-auto max-w-[1100px] px-6 py-6 text-center text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">PayFix</span> - AI dispute agent built with
        n8n, Razorpay test mode, Gemini RAG on Supabase.
      </div>
    </footer>
  );
}
