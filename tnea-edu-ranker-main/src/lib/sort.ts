import type { Branch, College, CollegeDistrict } from "./api";

export type ChildRow = {
  branch_id: number;
  branch_code: string;
  branch_name: string;
  score: number;
  isExact: boolean;
};

export type GroupedCard = {
  college_code: number;
  college_name: string;
  district: string;
  rows: ChildRow[];
  bestScore: number;
  hasExact: boolean;
};

/**
 * Sort key: exact-match first, then descending by score (closest below first).
 * Returns negative if a should come before b.
 */
const compareScores = (a: { score: number; isExact: boolean }, b: { score: number; isExact: boolean }) => {
  if (a.isExact !== b.isExact) return a.isExact ? -1 : 1;
  return b.score - a.score;
};

export function groupAndSort(
  branches: Branch[],
  colleges: College[],
  districts: CollegeDistrict[],
  scoreCol: keyof Branch,
  cutoff: number,
): GroupedCard[] {
  const collegeMap = new Map(colleges.map((c) => [c.college_code, c.college_name]));
  const districtMap = new Map(districts.map((d) => [d.college_code, d.district]));

  const groups = new Map<number, GroupedCard>();
  for (const b of branches) {
    const score = b[scoreCol] as number | null;
    if (score == null) continue;
    const isExact = score === cutoff;
    const row: ChildRow = {
      branch_id: b.id,
      branch_code: b.branch_code,
      branch_name: b.branch_name,
      score,
      isExact,
    };
    let g = groups.get(b.college_code);
    if (!g) {
      g = {
        college_code: b.college_code,
        college_name: collegeMap.get(b.college_code) ?? `College #${b.college_code}`,
        district: districtMap.get(b.college_code) ?? "—",
        rows: [],
        bestScore: -Infinity,
        hasExact: false,
      };
      groups.set(b.college_code, g);
    }
    g.rows.push(row);
    if (isExact) g.hasExact = true;
    if (score > g.bestScore) g.bestScore = score;
  }

  const cards = Array.from(groups.values());
  for (const c of cards) c.rows.sort(compareScores);
  cards.sort((a, b) => {
    if (a.hasExact !== b.hasExact) return a.hasExact ? -1 : 1;
    return b.bestScore - a.bestScore;
  });
  return cards;
}
