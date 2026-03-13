import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type PageTitleProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PageTitle({
  title,
  description,
  action,
  className,
}: PageTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
