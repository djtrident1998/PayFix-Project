"use client";

import { useId, useRef, useState } from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  label = "More info",
  className,
}: {
  content: string;
  label?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const id = useId();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShow(true);
  };
  const close = () => {
    hideTimer.current = setTimeout(() => setShow(false), 120);
  };

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={show ? id : undefined}
        aria-expanded={show}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={() => setShow((s) => !s)}
        onKeyDown={(e) => e.key === "Escape" && setShow(false)}
        className="-my-3 flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-primary"
      >
        <CircleHelp size={16} aria-hidden="true" />
      </button>
      {show && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1 w-56 -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  );
}
