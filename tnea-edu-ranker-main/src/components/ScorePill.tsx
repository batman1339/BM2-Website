import { cn } from "@/lib/utils";

type Props = { score: number; isExact: boolean; className?: string };

const ScorePill = ({ score, isExact, className }: Props) => (
  <span
    className={cn(
      "inline-flex min-w-[64px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
      isExact
        ? "bg-highlight-soft text-highlight-soft-foreground ring-1 ring-highlight/30"
        : "bg-success-soft text-success-soft-foreground ring-1 ring-success/20",
      className,
    )}
    title={isExact ? "Exact match to your cutoff" : "Below your cutoff"}
  >
    {score.toFixed(2)}
  </span>
);

export default ScorePill;
