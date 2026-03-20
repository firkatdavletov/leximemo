import { Container } from "@/shared/ui/container";

type PageSkeletonProps = {
  compact?: boolean;
  blocks?: number;
};

export function PageSkeleton({
  compact = false,
  blocks = 3,
}: PageSkeletonProps) {
  return (
    <Container className={compact ? "max-w-md py-10" : "space-y-6 py-2"}>
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="h-4 w-28 rounded-full bg-slate-200" />
        <div className="h-8 w-3/4 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-100" />
        <div className="h-4 w-5/6 rounded-full bg-slate-100" />
      </div>

      <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
        {Array.from({ length: blocks }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="h-5 w-1/2 rounded-full bg-slate-200" />
            <div className="h-4 w-full rounded-full bg-slate-100" />
            <div className="h-4 w-4/5 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </Container>
  );
}
