export type WasteCategory = "Recycling" | "Organic" | "Garbage";

export interface WasteTotals {
  Recycling: number;
  Organic: number;
  Garbage: number;
}

export interface DailyWasteEntry extends WasteTotals {
  date: string;
}

export interface UserWasteDocument {
  Recycling: number;
  Organic: number;
  Garbage: number;
  Timestamp?: unknown;
  linegraph?: Record<string, WasteTotals>;
}

export interface ClassificationResponse {
  class: string;
}

export interface HistoryEntry {
  id: string;
  category: WasteCategory;
  timestamp: Date;
}
