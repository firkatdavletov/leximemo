import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const baseClassName =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60";

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-accent !text-white hover:bg-accent/90",
  secondary: "border border-border bg-white text-foreground hover:bg-slate-50",
  ghost: "text-foreground hover:bg-slate-100",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
};

export function buttonClassName(options: ButtonClassOptions = {}): string {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
  } = options;

  return cn(
    baseClassName,
    variantClassNames[variant],
    sizeClassNames[size],
    fullWidth && "w-full",
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonClassOptions;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
