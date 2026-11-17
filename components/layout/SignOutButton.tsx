"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignOutButton({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "text";
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await createClient().auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      aria-label="Log out"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60",
        variant === "icon" ? "w-11" : "px-4",
        className
      )}
    >
      <LogOut size={18} aria-hidden="true" />
      {variant === "text" && "Log out"}
    </button>
  );
}
