import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePriorities, type PriorityItem as TItem } from "@/contexts/PrioritiesContext";

type Props = { item: TItem; rank: number };

const PriorityItem = ({ item, rank }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const { remove } = usePriorities();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-card transition-shadow ${
        isDragging ? "shadow-elevated ring-2 ring-primary/30" : ""
      }`}
    >
      <button
        type="button"
        className="touch-none rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-lg bg-primary px-2 font-display text-sm font-bold text-primary-foreground tabular-nums">
        #{rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium leading-snug break-words">{item.college_name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80 break-words">{item.branch_name}</span>
          <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px]">{item.branch_code}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{item.district}</span>
          <span>· {item.category} {item.score.toFixed(2)}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Remove">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PriorityItem;
