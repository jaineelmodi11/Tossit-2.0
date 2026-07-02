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
  lastScanAt?: unknown;
  /** v2.0 wrote this field name; kept optional for old documents. */
  Timestamp?: unknown;
  linegraph?: Record<string, Partial<WasteTotals>>;
}

export interface ClassificationResponse {
  class: string;
  confidence?: number;
}

export interface ClassificationResult {
  category: WasteCategory;
  /** 0-1 softmax probability of the predicted class, when the server provides it. */
  confidence?: number;
}

export interface HistoryEntry {
  id: string;
  category: WasteCategory;
  timestamp: Date;
}
