import { KeyboardEvent, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Category } from "@/lib/api";
import BranchCombobox, { type BranchOption } from "./BranchCombobox";
import { ChevronDown, Loader2, Search, SlidersHorizontal, X } from "lucide-react";

type Props = {
  cutoff: string;
  setCutoff: (v: string) => void;
  category: Category;
  setCategory: (v: Category) => void;
  district: string;
  setDistrict: (v: string) => void;
  branchCode: string;
  setBranchCode: (v: string) => void;
  districts: string[];
  branchOptions: BranchOption[];
  onSearch: () => void;
  onClear: () => void;
  loading: boolean;
  compact?: boolean;
};

const ANY = "__any__";

const FilterBar = (p: Props) => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") p.onSearch();
  };
  const isMobile = useIsMobile();
  const collapsedOnMobile = !!p.compact && isMobile;
  const [open, setOpen] = useState(false);

  // On mobile after a search: render a tiny sticky summary chip.
  // Tap to expand the full filter panel inline.
  if (collapsedOnMobile && !open) {
    const summary = [
      p.cutoff && `${p.cutoff}`,
      p.category,
      p.district || "Any district",
      p.branchCode || "Any branch",
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <section className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm shadow-card"
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            <span className="font-medium text-foreground">Filters</span>
            <span className="ml-2">{summary}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </section>
    );
  }

  const sticky = !collapsedOnMobile;

  return (
    <section
      className={cn(
        "z-30 -mx-4 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-md md:-mx-6 md:px-6",
        sticky && "sticky top-16",
      )}
      onKeyDown={onKey}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="cutoff" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cutoff score *
          </Label>
          <Input
            id="cutoff"
            type="number"
            inputMode="decimal"
            min={0}
            max={200}
            step="0.01"
            placeholder="e.g. 185.5"
            value={p.cutoff}
            onChange={(e) => p.setCutoff(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category *</Label>
          <Select value={p.category} onValueChange={(v) => p.setCategory(v as Category)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">District</Label>
          <Select value={p.district || ANY} onValueChange={(v) => p.setDistrict(v === ANY ? "" : v)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Any district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any district</SelectItem>
              {p.districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Branch</Label>
          <BranchCombobox value={p.branchCode} onChange={p.setBranchCode} options={p.branchOptions} />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setOpen(false);
              p.onSearch();
            }}
            disabled={p.loading}
            className="h-11 flex-1 shadow-elevated"
          >
            {p.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
          <Button
            onClick={p.onClear}
            variant="outline"
            className="h-11"
            type="button"
            aria-label="Clear filters"
            title="Clear filters"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
          {collapsedOnMobile && open && (
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              className="h-11 md:hidden"
              type="button"
              aria-label="Close filters"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default FilterBar;
