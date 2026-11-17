import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";

/**
 * Gradient header. On mobile it carries the logo (there is no top bar);
 * on desktop it continues the sticky top nav's gradient.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="bg-linear-to-r from-primary to-primary-dark text-white">
      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-[calc(env(safe-area-inset-top)+16px)] md:px-6 md:pb-20 md:pt-10">
        <div className="mb-7 flex items-center justify-between md:hidden">
          <Logo />
          <SignOutButton className="-mr-2" />
        </div>
        {eyebrow && <p className="mb-2 text-[13px] font-medium text-white/70">{eyebrow}</p>}
        <h1 className="text-[26px] font-semibold leading-tight md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/80">{subtitle}</p>}
        {children}
      </div>
    </header>
  );
}
