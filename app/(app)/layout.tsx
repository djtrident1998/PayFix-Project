import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { getUser } from "@/lib/auth";

/** Layout for every signed-in page: navigation, footer, and the user's email. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getUser();

  return (
    <>
      <TopNav email={user?.email ?? null} />
      <main id="main" className="flex-1 pb-28 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
