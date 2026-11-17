"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";
import { NAV_LINKS, isActivePath } from "./nav-links";
import { cn } from "@/lib/utils";

export function TopNav({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-40 hidden bg-linear-to-r from-primary to-primary-dark md:block"
    >
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-6">
        <Link href="/" aria-label="PayFix home" className="rounded-lg">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors",
                      active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <span aria-hidden="true" className="mx-2 h-6 w-px bg-white/20" />
          {email && (
            <span className="max-w-[180px] truncate text-[13px] text-white/75" title={email}>
              {email}
            </span>
          )}
          <SignOutButton variant="text" />
        </div>
      </div>
    </nav>
  );
}
