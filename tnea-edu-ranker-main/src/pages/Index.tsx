import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Nav from "@/components/Nav";
import FilterBar from "@/components/FilterBar";
import type { BranchOption } from "@/components/BranchCombobox";
import ResultCard from "@/components/ResultCard";
import PageNav from "@/components/PageNav";
import {
  CATEGORIES,
  type Branch,
  type Category,
  type College,
  type CollegeDistrict,
  categoryColumn,
  get,
  getAll,
} from "@/lib/api";
import { groupAndSort, type GroupedCard } from "@/lib/sort";
import { useSearch } from "@/contexts/SearchContext";
import { FileSpreadsheet, FileType2, GraduationCap, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const PAGE_SIZE = 15;

const Index = () => {
  const {
    cutoff, setCutoff,
    category, setCategory,
    district, setDistrict,
    branchCode, setBranchCode,
    results, setResults,
    page, setPage,
    searchedCategory, setSearchedCategory,
  } = useSearch();

  const [districts, setDistricts] = useState<string[]>([]);
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [cutoffError, setCutoffError] = useState<string | null>(null);

  const stateRef = useRef({ cutoff, category, district, branchCode });
  stateRef.current = { cutoff, category, district, branchCode };

  // Load dropdowns in parallel on mount
  useEffect(() => {
    (async () => {
      try {
        const [dists, brs] = await Promise.all([
          getAll<{ district: string }>("college_districts", { select: "district", order: "district.asc" }),
          getAll<{ branch_code: string; branch_name: string }>("branches", {
            select: "branch_code,branch_name",
            order: "branch_code.asc",
          }),
        ]);
        // Normalize district casing (DB has both "chennai" and "Chennai")
        const distSet = new Map<string, string>();
        for (const d of dists) {
          if (!d.district) continue;
          const key = d.district.trim().toLowerCase();
          const display = d.district.trim().charAt(0).toUpperCase() + d.district.trim().slice(1).toLowerCase();
          if (!distSet.has(key)) distSet.set(key, display);
        }
        setDistricts(Array.from(distSet.values()).sort());

        // Pick the most-common branch_name per branch_code
        const counts = new Map<string, Map<string, number>>();
        for (const b of brs) {
          if (!b.branch_code) continue;
          const code = b.branch_code;
          const name = (b.branch_name || "").trim();
          if (!counts.has(code)) counts.set(code, new Map());
          const m = counts.get(code)!;
          m.set(name, (m.get(name) ?? 0) + 1);
        }
        const opts: BranchOption[] = Array.from(counts.entries()).map(([code, m]) => {
          let bestName = "";
          let bestCount = -1;
          for (const [n, c] of m) {
            if (c > bestCount && n) {
              bestCount = c;
              bestName = n;
            }
          }
          // Title-case the all-caps names for readability
          const display = bestName
            .toLowerCase()
            .replace(/\b\w/g, (ch) => ch.toUpperCase())
            .replace(/\bAnd\b/g, "and")
            .replace(/\bOf\b/g, "of");
          return { code, name: display || code };
        });
        opts.sort((a, b) => a.code.localeCompare(b.code));
        setBranchOptions(opts);
      } catch (e) {
        console.error("Failed to load filters", e);
        toast.error("Failed to load filters", { description: "Please reload the page and try again." });
      }
    })();
  }, []);

  const runSearch = async () => {
    const cutoffNum = parseFloat(cutoff);
    if (!cutoff || Number.isNaN(cutoffNum)) {
      toast.error("Enter a cutoff score", { description: "Cutoff is required to filter results." });
      setCutoffError("Enter a cutoff score to search.");
      return;
    }
    if (cutoffNum < 0) {
      const msg = "Cutoff must be 0 or higher.";
      toast.error("Invalid cutoff", { description: msg });
      setCutoffError(msg);
      return;
    }
    if (cutoffNum > 200) {
      const msg = `Cutoff ${cutoffNum} is out of range. TNEA cutoffs range from 0 to 200.`;
      toast.error("Invalid cutoff", { description: msg });
      setCutoffError(msg);
      return;
    }
    if (!CATEGORIES.includes(category)) {
      toast.error("Pick a category");
      return;
    }
    setCutoffError(null);
    setLoading(true);
    setSearchedCategory(category);
    try {
      const scoreCol = categoryColumn(category);

      // Step 1: district filter -> allowed college codes (if selected)
      let allowedCodes: number[] | null = null;
      if (district) {
        const rows = await get<{ college_code: number }[]>("college_districts", {
          district: `eq.${district}`,
          select: "college_code",
          limit: 5000,
        });
        allowedCodes = Array.from(new Set(rows.map((r) => r.college_code)));
        if (allowedCodes.length === 0) {
          setResults([]);
          setPage(1);
          setLoading(false);
          return;
        }
      }

      // Step 2: branches with score filter
      const branchParams: Record<string, string | number> = {
        select: "id,college_code,branch_code,branch_name,oc_closing_cutoff,bc_closing_cutoff,bcm_closing_cutoff,mbc_closing_cutoff,sc_closing_cutoff,sca_closing_cutoff,st_closing_cutoff",
        [scoreCol]: `lte.${cutoffNum}`,
        order: `${scoreCol}.desc`,
        limit: 5000,
      };
      // PostgREST: composite filter for not-null on same column via OR-less form: use generic param
      branchParams[`${scoreCol}`] = `lte.${cutoffNum}`;
      // Add not-null via second filter — URLSearchParams allows duplicate keys via append
      // We'll handle in get() (it appends), so use a separate filter syntax:
      // Actually need both: lte AND not-null. PostgREST allows duplicate column filters chained.
      // We'll inject second condition using a side-channel below.
      if (branchCode) branchParams.branch_code = `eq.${branchCode}`;
      if (allowedCodes) branchParams.college_code = `in.(${allowedCodes.join(",")})`;

      // Build URL manually to allow multiple filters on same column
      const base = import.meta.env.VITE_SUPABASE_URL as string;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const u = new URL(`${base}/rest/v1/branches`);
      for (const [k, v] of Object.entries(branchParams)) u.searchParams.append(k, String(v));
      u.searchParams.append(scoreCol, "not.is.null");
      const res = await fetch(u.toString(), {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error(`branches fetch ${res.status}`);
      const branches = (await res.json()) as Branch[];

      if (branches.length === 0) {
        setResults([]);
        setPage(1);
        return;
      }

      // Step 3: parallel fetch colleges + districts for the returned college codes
      const codes = Array.from(new Set(branches.map((b) => b.college_code)));
      const [colleges, allDistricts] = await Promise.all([
        get<College[]>("colleges", {
          select: "college_code,college_name",
          college_code: `in.(${codes.join(",")})`,
          limit: 5000,
        }),
        get<CollegeDistrict[]>("college_districts", {
          select: "id,college_code,district",
          college_code: `in.(${codes.join(",")})`,
          limit: 5000,
        }),
      ]);

      const grouped = groupAndSort(branches, colleges, allDistricts, scoreCol as keyof Branch, cutoffNum);
      setResults(grouped);
      setPage(1);
    } catch (e) {
      console.error("Search failed", e);
      toast.error("Search failed", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setCutoff("");
    setCategory("OC");
    setDistrict("");
    setBranchCode("");
    setResults(null);
    setPage(1);
    setCutoffError(null);
  };

  // Expose globally for debugging per spec
  useEffect(() => {
    (window as unknown as { searchColleges: () => void }).searchColleges = runSearch;
    (window as unknown as { clearFilters: () => void }).clearFilters = clearFilters;
  });

  const totalBranches = useMemo(() => results?.reduce((n, c) => n + c.rows.length, 0) ?? 0, [results]);
  const totalColleges = results?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalColleges / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = results?.slice(pageStart, pageStart + PAGE_SIZE) ?? [];

  const flatRows = useMemo(() => {
    if (!results) return [];
    const out: Array<{
      rank: number;
      college_code: number;
      college_name: string;
      district: string;
      branch_code: string;
      branch_name: string;
      score: number;
      isExact: boolean;
    }> = [];
    results.forEach((c, i) => {
      for (const r of c.rows) {
        out.push({
          rank: i + 1,
          college_code: c.college_code,
          college_name: c.college_name,
          district: c.district,
          branch_code: r.branch_code,
          branch_name: r.branch_name,
          score: r.score,
          isExact: r.isExact,
        });
      }
    });
    return out;
  }, [results]);

  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const baseName = () => `tnea-search-${cutoff || "x"}-${searchedCategory}-${stamp()}`;

  const exportPDF = () => {
    if (flatRows.length === 0) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("TNEA Search Results", 14, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${flatRows.length} branches across ${totalColleges} colleges · cutoff ${cutoff} (${searchedCategory})${district ? ` · ${district}` : ""}${branchCode ? ` · ${branchCode}` : ""}`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["#", "College", "Code", "District", "Branch", "Br.Code", "Cat", "Score", "Exact"]],
      body: flatRows.map((r) => [
        r.rank,
        r.college_name,
        r.college_code,
        r.district,
        r.branch_name,
        r.branch_code,
        searchedCategory,
        r.score.toFixed(2),
        r.isExact ? "✓" : "",
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { cellWidth: 70 }, 4: { cellWidth: 70 } },
    });
    doc.save(`${baseName()}.pdf`);
    toast.success("Exported as PDF");
  };

  const exportExcel = () => {
    if (flatRows.length === 0) return;
    const rows = flatRows.map((r) => ({
      "College Rank": r.rank,
      College: r.college_name,
      "College Code": r.college_code,
      District: r.district,
      Branch: r.branch_name,
      "Branch Code": r.branch_code,
      Category: searchedCategory,
      "Cutoff Score": r.score,
      "Exact Match": r.isExact ? "Yes" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 8 }, { wch: 44 }, { wch: 10 }, { wch: 14 }, { wch: 44 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `${baseName()}.xlsx`);
    toast.success("Exported as Excel");
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container py-6 md:py-8">
        <FilterBar
          cutoff={cutoff}
          setCutoff={setCutoff}
          category={category}
          setCategory={setCategory}
          district={district}
          setDistrict={setDistrict}
          branchCode={branchCode}
          setBranchCode={setBranchCode}
          districts={districts}
          branchOptions={branchOptions}
          onSearch={runSearch}
          onClear={clearFilters}
          loading={loading}
          compact={results !== null}
        />

        {cutoffError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <span className="font-semibold">Invalid cutoff:</span> {cutoffError}
          </div>
        )}

        {results === null && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold">Find your TNEA college</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Enter your cutoff score and category, then optionally narrow by district or branch. Add favorites to your
              priority list.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Press <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to search
            </div>
          </div>
        )}

        {results !== null && (
          <>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">{totalBranches}</span> branch
                {totalBranches === 1 ? "" : "es"} across{" "}
                <span className="font-semibold text-foreground tabular-nums">{totalColleges}</span> college
                {totalColleges === 1 ? "" : "s"}
                {totalPages > 1 && (
                  <span className="ml-2 text-xs tabular-nums">· Page {page} of {totalPages}</span>
                )}
              </p>
              {totalColleges > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={exportPDF}>
                    <FileType2 className="h-4 w-4" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportExcel}>
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </Button>
                </div>
              )}
            </div>

            {totalColleges === 0 ? (
              <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <p className="font-medium">No matches.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a higher cutoff, change category, or remove the district/branch filter.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((card, i) => (
                  <ResultCard
                    key={card.college_code}
                    card={card}
                    rank={pageStart + i + 1}
                    category={searchedCategory}
                  />
                ))}
              </div>
            )}

            <PageNav page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
