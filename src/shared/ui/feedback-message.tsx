import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type FeedbackMessageProps = {
  children: ReactNode;
  variant?: "info" | "success" | "error";
  title?: string;
  action?: ReactNode;
  className?: string;
};

const variantClassNames = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
} as const;

export function FeedbackMessage({
  children,
  variant = "info",
  title,
  action,
  className,
}: FeedbackMessageProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "rounded-2xl border px-4 py-3 shadow-sm",
        variantClassNames[variant],
        className,
      )}
    >
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <div className={cn("text-sm leading-6", title && "mt-1")}>{children}</div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
