import { create } from "zustand";
import type { BuildStatus } from "@/types/jenkins";

type StatusFilter = BuildStatus | "all";

interface FilterState {
  search: string;
  statusFilter: StatusFilter;
  setSearch: (s: string) => void;
  setStatusFilter: (s: StatusFilter) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  statusFilter: "all",
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  reset: () => set({ search: "", statusFilter: "all" }),
}));
