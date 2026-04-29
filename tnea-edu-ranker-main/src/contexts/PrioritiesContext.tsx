import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type PriorityItem = {
  id: string; // `${college_code}-${branch_code}`
  college_code: number;
  college_name: string;
  branch_code: string;
  branch_name: string;
  district: string;
  category: string;
  score: number;
};

type Ctx = {
  items: PriorityItem[];
  add: (item: PriorityItem) => void;
  remove: (id: string) => void;
  reorder: (ids: string[]) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

const STORAGE_KEY = "tnea.priorities.v1";
const PrioritiesContext = createContext<Ctx | null>(null);

export const PrioritiesProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<PriorityItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PriorityItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items]);

  const add = useCallback((item: PriorityItem) => {
    setItems((prev) => (prev.some((p) => p.id === item.id) ? prev : [...prev, item]));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const reorder = useCallback((ids: string[]) => {
    setItems((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      const next: PriorityItem[] = [];
      for (const id of ids) {
        const v = map.get(id);
        if (v) next.push(v);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id: string) => items.some((p) => p.id === id), [items]);

  const value = useMemo(() => ({ items, add, remove, reorder, clear, has }), [items, add, remove, reorder, clear, has]);

  return <PrioritiesContext.Provider value={value}>{children}</PrioritiesContext.Provider>;
};

export const usePriorities = () => {
  const ctx = useContext(PrioritiesContext);
  if (!ctx) throw new Error("usePriorities must be used within PrioritiesProvider");
  return ctx;
};
