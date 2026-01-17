import { create } from 'zustand';
import type { Region, PolicyCategory, PolicyStatus } from '@policy-flow/contracts';

interface FilterState {
  region: Region | null;
  category: PolicyCategory | null;
  status: PolicyStatus | null;
  setRegion: (region: Region | null) => void;
  setCategory: (category: PolicyCategory | null) => void;
  setStatus: (status: PolicyStatus | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  region: null,
  category: null,
  status: null,
  setRegion: (region) => set({ region }),
  setCategory: (category) => set({ category }),
  setStatus: (status) => set({ status }),
  resetFilters: () => set({ region: null, category: null, status: null }),
}));
