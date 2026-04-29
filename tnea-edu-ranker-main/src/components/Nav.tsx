import { NavLink } from "react-router-dom";
import { GraduationCap, Home, ListChecks } from "lucide-react";
import { usePriorities } from "@/contexts/PrioritiesContext";
import { cn } from "@/lib/utils";

const Nav = () => {
  const { items } = usePriorities();
  const linkBase =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-2">
        <NavLink
          to="/"
          aria-label="Home"
          title="Home"
          className="flex min-w-0 items-center gap-2"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-elevated">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-sm font-bold sm:text-base">TNEA Finder</div>
            <div className="hidden truncate text-[11px] text-muted-foreground sm:block">
              Cutoff search & priority list
            </div>
          </div>
        </NavLink>
        <nav className="flex shrink-0 items-center gap-1">
          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                linkBase,
                "px-2 sm:px-3",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
              )
            }
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/priorities"
            className={({ isActive }) =>
              cn(
                linkBase,
                "px-2 sm:px-3",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
              )
            }
          >
            <ListChecks className="h-4 w-4" />
            <span>Priorities</span>
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
              {items.length}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
