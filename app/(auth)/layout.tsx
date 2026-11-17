import type { ReactNode } from "react";

/** Bare layout for the login page: no navigation, nothing to click away to. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="flex flex-1 flex-col">
      {children}
    </main>
  );
}
