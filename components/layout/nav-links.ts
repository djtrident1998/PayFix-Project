import { FolderOpen, House, type LucideIcon } from "lucide-react";

// "Raise a dispute" is reached from the buttons and issue tiles on Home,
// so it is deliberately not a nav item.
export const NAV_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/cases", label: "Cases", icon: FolderOpen },
];

export function isActivePath(pathname: string, href: string) {
  // Raise Dispute is a step started from Home, so keep Home highlighted there.
  if (href === "/") return pathname === "/" || pathname.startsWith("/raise-dispute");
  return pathname.startsWith(href);
}
