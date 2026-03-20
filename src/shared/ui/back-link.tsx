import Link from "next/link";

import { cn } from "@/shared/lib/cn";

type BackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export function BackLink({
  href,
  label = "Назад",
  className,
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        className,
      )}
    >
      <span aria-hidden="true">{"<"}</span>
      <span>{label}</span>
    </Link>
  );
}
