import type { WasteCategory } from "../types";

export interface CategoryConfig {
  label: string;
  longLabel: string;
  emoji: string;
  description: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

/** Single source of truth for category presentation across all pages. */
export const CATEGORY_CONFIG: Record<WasteCategory, CategoryConfig> = {
  Recycling: {
    label: "Recycling",
    longLabel: "Recycling",
    emoji: "♻️",
    description: "Put this in the blue recycling bin.",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    dot: "bg-blue-400",
  },
  Organic: {
    label: "Organic",
    longLabel: "Organic / Compost",
    emoji: "🌱",
    description: "This goes in the green organics bin.",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-100",
    dot: "bg-green-400",
  },
  Garbage: {
    label: "Garbage",
    longLabel: "Garbage",
    emoji: "🗑️",
    description: "Dispose of this in the general waste bin.",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};

export const CATEGORY_ORDER: WasteCategory[] = ["Recycling", "Organic", "Garbage"];
