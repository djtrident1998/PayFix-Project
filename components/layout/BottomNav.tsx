"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActivePath } from "./nav-links";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md safe-area-bottom md:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {NAV_LINKS.map((link) => {
          const active = isActivePath(pathname, link.href);
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-text-muted hover:text-text-primary"
                )}
              >
                {active && (
                  <span aria-hidden="true" className="absolute inset-x-8 top-0 h-0.5 rounded-b-full bg-primary" />
                )}
                <link.icon size={22} strokeWidth={active ? 2.1 : 1.75} aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
