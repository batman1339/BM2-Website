// Direct PostgREST client for fast, parallel-safe queries.
// Avoids nested joins; uses URLSearchParams composition.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const HEADERS: HeadersInit = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

export type Params = Record<string, string | number | undefined | null>;

export async function get<T = unknown>(table: string, params: Params = {}): Promise<T> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.append(k, String(v));
  }
  const res = await fetch(url.toString(), { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`GET ${table} failed: ${res.status}`, body);
    throw new Error("Data could not be loaded. Please try again.");
  }
  return (await res.json()) as T;
}

// Page through PostgREST's 1000-row cap using Range headers.
export async function getAll<T = unknown>(table: string, params: Params = {}, pageSize = 1000): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  for (let i = 0; i < 50; i++) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "" || k === "limit") continue;
      url.searchParams.append(k, String(v));
    }
    const to = from + pageSize - 1;
    const res = await fetch(url.toString(), {
      headers: { ...HEADERS, Range: `${from}-${to}`, "Range-Unit": "items" },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`GET ${table} failed: ${res.status}`, body);
      throw new Error("Data could not be loaded. Please try again.");
    }
    const batch = (await res.json()) as T[];
    out.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

export const CATEGORIES = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"] as const;
export type Category = (typeof CATEGORIES)[number];

export const categoryColumn = (cat: Category): string =>
  ({
    OC: "oc_closing_cutoff",
    BC: "bc_closing_cutoff",
    BCM: "bcm_closing_cutoff",
    MBC: "mbc_closing_cutoff",
    SC: "sc_closing_cutoff",
    SCA: "sca_closing_cutoff",
    ST: "st_closing_cutoff",
  })[cat];

export type Branch = {
  id: number;
  college_code: number;
  branch_code: string;
  branch_name: string;
  oc_closing_cutoff: number | null;
  bc_closing_cutoff: number | null;
  bcm_closing_cutoff: number | null;
  mbc_closing_cutoff: number | null;
  sc_closing_cutoff: number | null;
  sca_closing_cutoff: number | null;
  st_closing_cutoff: number | null;
};

export type College = { college_code: number; college_name: string };
export type CollegeDistrict = { id: number; college_code: number; district: string };
