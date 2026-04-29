import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { page: number; totalPages: number; onChange: (p: number) => void };

const buildPages = (page: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
};

const PageNav = ({ page, totalPages, onChange }: Props) => {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 py-6" aria-label="Pagination">
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "h-9 min-w-9 rounded-md border px-3 text-sm font-medium transition-colors",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-secondary",
            )}
          >
            {p}
          </button>
        ),
      )}
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default PageNav;
