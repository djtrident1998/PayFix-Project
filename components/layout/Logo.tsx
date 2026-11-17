import { cn } from "@/lib/utils";

/** PayFix mark: a shield with a check mark inside a rounded square. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" fill="#FFFFFF" />
      <path
        d="M16 5.5 24.5 8.6v6.6c0 5.2-3.5 9.4-8.5 11.3-5-1.9-8.5-6.1-8.5-11.3V8.6L16 5.5Z"
        fill="#5B2EFF"
      />
      <path
        d="m12.2 16.1 2.7 2.7 5-5.4"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const large = size === "large";
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={large ? 36 : 28} />
      <span className={cn("font-semibold tracking-[-0.02em] text-white", large ? "text-2xl" : "text-[19px]")}>
        PayFix
      </span>
    </span>
  );
}
