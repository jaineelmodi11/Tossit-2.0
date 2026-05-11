import { create } from "zustand";
import type { WasteTotals, UserWasteDocument } from "../types";

interface WasteState {
  totals: WasteTotals;
  linegraph: Record<string, WasteTotals>;
  setWasteData: (data: UserWasteDocument) => void;
}

export const useWasteStore = create<WasteState>((set) => ({
  totals: { Recycling: 0, Organic: 0, Garbage: 0 },
  linegraph: {},
  setWasteData: (data) =>
    set({
      totals: {
        Recycling: data.Recycling ?? 0,
        Organic: data.Organic ?? 0,
        Garbage: data.Garbage ?? 0,
      },
      linegraph: data.linegraph ?? {},
    }),
}));
