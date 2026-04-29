import { useState } from "react";
import { Check, ChevronDown, ChevronUp, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScorePill from "./ScorePill";
import { usePriorities, type PriorityItem } from "@/contexts/PrioritiesContext";
import type { GroupedCard } from "@/lib/sort";
import { toast } from "sonner";

type Props = { card: GroupedCard; rank: number; category: string };

const VISIBLE = 5;

const ResultCard = ({ card, rank, category }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const { add, has } = usePriorities();
  const visible = expanded ? card.rows : card.rows.slice(0, VISIBLE);
  const hidden = card.rows.length - VISIBLE;

  const handleAdd = (row: (typeof card.rows)[number]) => {
    const id = `${card.college_code}-${row.branch_code}`;
    if (has(id)) return;
    const item: PriorityItem = {
      id,
      college_code: card.college_code,
      college_name: card.college_name,
      branch_code: row.branch_code,
      branch_name: row.branch_name,
      district: card.district,
      category,
      score: row.score,
    };
    add(item);
    toast.success("Added to priorities", { description: `${card.college_name} — ${row.branch_name}` });
  };

  return (
    <article className="group rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <header className="flex items-start gap-3 border-b border-border p-4">
        <span className="inline-flex h-9 min-w-[44px] shrink-0 items-center justify-center rounded-lg bg-primary px-2 font-display text-sm font-bold text-primary-foreground">
          #{rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold leading-snug break-words">{card.college_name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-secondary px-2 py-0.5 font-medium tabular-nums">
              Code · {card.college_code}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 font-medium text-accent-foreground">
              <MapPin className="h-3 w-3" /> {card.district}
            </span>
            <span className="text-muted-foreground">{card.rows.length} branch{card.rows.length === 1 ? "" : "es"}</span>
          </div>
        </div>
      </header>

      <ul className="divide-y divide-border">
        {visible.map((row) => {
          const id = `${card.college_code}-${row.branch_code}`;
          const added = has(id);
          return (
            <li key={row.branch_id} className="flex items-start gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium leading-snug break-words">{row.branch_name}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{row.branch_code}</div>
              </div>
              <ScorePill score={row.score} isExact={row.isExact} />
              <Button
                size="sm"
                variant={added ? "secondary" : "outline"}
                onClick={() => handleAdd(row)}
                disabled={added}
                className="h-8 px-2.5"
              >
                {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{added ? "Added" : "Add"}</span>
              </Button>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border py-2 text-xs font-medium text-primary hover:bg-accent"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Show {hidden} more
            </>
          )}
        </button>
      )}
    </article>
  );
};

export default ResultCard;
