import type { Metadata } from "next";
import { LogoMark } from "@/components/layout/Logo";
import { AuthForm } from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/auth-utils";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const linkProblem = params.error === "confirm";

  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-br from-primary to-primary-dark md:items-center md:justify-center md:px-6 md:py-10">
      <div className="px-6 pb-9 pt-[calc(env(safe-area-inset-top)+56px)] text-white md:w-full md:max-w-[420px] md:p-0 md:pb-7">
        <div className="flex items-center gap-2.5">
          <LogoMark size={36} />
          <span className="text-2xl font-semibold tracking-[-0.02em]">PayFix</span>
        </div>
        <p className="mt-3 text-[15px] text-white/80">UPI disputes, resolved in seconds</p>
      </div>

      <div className="flex-1 rounded-t-3xl bg-card px-6 pb-10 pt-8 shadow-raised md:w-full md:max-w-[420px] md:flex-none md:rounded-2xl md:p-8">
        <AuthForm next={next} linkProblem={linkProblem} />
      </div>
    </div>
  );
}
