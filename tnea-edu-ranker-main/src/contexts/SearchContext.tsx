import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import type { Category } from "@/lib/api";
import type { GroupedCard } from "@/lib/sort";

type Ctx = {
  cutoff: string;
  setCutoff: (v: string) => void;
  category: Category;
  setCategory: (v: Category) => void;
  district: string;
  setDistrict: (v: string) => void;
  branchCode: string;
  setBranchCode: (v: string) => void;

  results: GroupedCard[] | null;
  setResults: (r: GroupedCard[] | null) => void;
  page: number;
  setPage: (n: number) => void;
  searchedCategory: Category;
  setSearchedCategory: (c: Category) => void;
  searchedCutoff: string;
  setSearchedCutoff: (s: string) => void;
};

const SearchContext = createContext<Ctx | null>(null);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [cutoff, setCutoff] = useState("");
  const [category, setCategory] = useState<Category>("OC");
  const [district, setDistrict] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [results, setResults] = useState<GroupedCard[] | null>(null);
  const [page, setPage] = useState(1);
  const [searchedCategory, setSearchedCategory] = useState<Category>("OC");
  const [searchedCutoff, setSearchedCutoff] = useState("");

  const value = useMemo(
    () => ({
      cutoff, setCutoff,
      category, setCategory,
      district, setDistrict,
      branchCode, setBranchCode,
      results, setResults,
      page, setPage,
      searchedCategory, setSearchedCategory,
      searchedCutoff, setSearchedCutoff,
    }),
    [cutoff, category, district, branchCode, results, page, searchedCategory, searchedCutoff],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};
