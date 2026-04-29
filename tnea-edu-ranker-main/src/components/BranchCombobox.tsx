import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type BranchOption = { code: string; name: string };

type Props = {
  value: string;
  onChange: (code: string) => void;
  options: BranchOption[];
};

const BranchCombobox = ({ value, onChange, options }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((o) => o.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    const tokens = q.split(/\s+/);
    return options.filter((o) => {
      const hay = `${o.code} ${o.name}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [query, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-h-11 h-auto w-full justify-between py-2 font-normal"
        >
          <span className="block min-w-0 flex-1 whitespace-normal break-words text-left leading-snug">
            {selected ? (
              <>
                <span className="font-mono text-xs font-semibold text-primary">{selected.code}</span>
                <span className="ml-2 text-muted-foreground">{selected.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Any branch</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by code or name…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-72">
            <CommandEmpty>No branch found.</CommandEmpty>
            <CommandGroup>
              {!query && (
                <CommandItem
                  value="__any__"
                  onSelect={() => {
                    onChange("");
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === "" ? "opacity-100" : "opacity-0")} />
                  <span className="text-muted-foreground">Any branch</span>
                </CommandItem>
              )}
              {filtered.map((opt) => (
                <CommandItem
                  key={opt.code}
                  value={opt.code}
                  onSelect={() => {
                    onChange(opt.code);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="items-start"
                >
                  <Check className={cn("mr-2 mt-0.5 h-4 w-4 shrink-0", value === opt.code ? "opacity-100" : "opacity-0")} />
                  <span className="mt-0.5 inline-flex w-12 shrink-0 font-mono text-xs font-semibold text-primary">
                    {opt.code}
                  </span>
                  <span className="whitespace-normal break-words leading-snug">{opt.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BranchCombobox;
