import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "white";
type Size = "md" | "lg";

export function pillClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.005em] transition-colors duration-150 active:translate-y-px",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
    {
      "bg-primary text-white shadow-float hover:bg-primary-dark": variant === "primary",
      "bg-white text-text-primary shadow-card hover:bg-slate-50": variant === "secondary",
      "text-text-secondary hover:bg-primary-soft hover:text-primary": variant === "ghost",
      "bg-white text-primary shadow-md hover:bg-primary-soft": variant === "white",
    },
    {
      "min-h-11 px-5 text-sm": size === "md",
      "min-h-12 px-6 text-[15px]": size === "lg",
    },
    className
  );
}

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function PillButton({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: PillButtonProps) {
  return <button type={type} className={pillClasses(variant, size, className)} {...props} />;
}
