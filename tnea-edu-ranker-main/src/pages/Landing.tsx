import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Download,
  Filter,
  GraduationCap,
  ListChecks,
  MapPin,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Colleges", value: "500+", icon: Building2 },
  { label: "Branches", value: "80+", icon: GraduationCap },
  { label: "Districts", value: "38", icon: MapPin },
];

const steps = [
  {
    n: "01",
    title: "Enter your cutoff",
    body: "Type your TNEA cutoff score and pick your category — OC, BC, BCM, MBC, SC, SCA or ST.",
    icon: Target,
  },
  {
    n: "02",
    title: "Filter & explore",
    body: "Narrow results by district or branch. We rank exact-cutoff matches first, then closest below.",
    icon: Filter,
  },
  {
    n: "03",
    title: "Build your list",
    body: "Add favourites to a personal priority list, drag to reorder, then export as PDF, Excel or TXT.",
    icon: ListChecks,
  },
];

const features = [
  {
    title: "Smart cutoff matching",
    body: "Exact matches surface first. Everything else ranks by closest score below your cutoff.",
    icon: Sparkles,
  },
  {
    title: "District & branch filters",
    body: "Searchable branch list — find Computer Science, Mechanical or AI/DS in seconds.",
    icon: Search,
  },
  {
    title: "Drag-and-drop shortlist",
    body: "Build your counselling priority order with smooth, touch-friendly drag handles.",
    icon: ListChecks,
  },
  {
    title: "Export anywhere",
    body: "Download your shortlist or full search as PDF, Excel or plain text. No account needed.",
    icon: Download,
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-[-120px] top-40 h-[360px] w-[360px] rounded-full bg-highlight/20 blur-3xl" />
        </div>

        <div className="container py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              TNEA 2024 cutoff data · Tamil Nadu
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Find your TNEA college<br />
              <span className="bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Search 500+ Tamil Nadu engineering colleges by cutoff, district and branch — then build a
              priority list you can export for counselling.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-6 shadow-elevated">
                <Link to="/search">
                  <Search className="h-4 w-4" /> Start searching
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/priorities">
                  <ListChecks className="h-4 w-4" /> View priorities
                </Link>
              </Button>
            </div>

            {/* stats strip */}
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card px-4 py-4 text-left shadow-card"
                >
                  <s.icon className="h-4 w-4 text-primary" />
                  <div className="mt-2 font-display text-2xl font-bold tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Three steps from cutoff score to a counselling-ready shortlist.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-3xl font-bold text-primary/15">{s.n}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Built for counselling week</h2>
            <p className="mt-3 text-muted-foreground">
              Every feature designed to save you time when it matters most.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-elevated"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/70 px-6 py-12 text-center text-primary-foreground shadow-elevated md:px-12 md:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to find your fit?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm opacity-90 md:text-base">
              No sign-up. Your priority list stays private in this browser.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7 h-12 px-7">
              <Link to="/search">
                Start searching <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        TNEA Finder · A free tool for Tamil Nadu engineering aspirants
      </footer>
    </div>
  );
};

export default Landing;