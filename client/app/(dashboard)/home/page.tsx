"use client";
import { useAuthStore } from "@/store/authStore";
import { useWasteData } from "@/hooks/useWasteData";
import { WastePieChart } from "@/components/charts/WastePieChart";
import { WasteLineChart } from "@/components/charts/WasteLineChart";

const CATEGORY_CONFIG = [
  {
    key: "Recycling" as const,
    label: "Recycling",
    emoji: "♻️",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  {
    key: "Organic" as const,
    label: "Organic",
    emoji: "🌱",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-100",
  },
  {
    key: "Garbage" as const,
    label: "Garbage",
    emoji: "🗑️",
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-100",
  },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const { totals, linegraph } = useWasteData();

  const totalItems = totals.Recycling + totals.Organic + totals.Garbage;
  const recyclingRate =
    totalItems > 0 ? Math.round((totals.Recycling / totalItems) * 100) : 0;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm font-medium">Welcome back</p>
          <h1 className="text-[#1E232C] text-2xl font-bold mt-0.5">
            {user?.email?.split("@")[0] ?? "Dashboard"}
          </h1>
        </div>

        {/* Recycling rate hero */}
        <div
          className="rounded-3xl p-6 mb-5 shadow-sm"
          style={{ backgroundColor: "#68ac53" }}
        >
          <p className="text-white/80 text-sm font-medium mb-1">Recycling Rate</p>
          <div className="flex items-end gap-1">
            <span className="text-white text-5xl font-bold">{recyclingRate}</span>
            <span className="text-white text-3xl font-bold mb-1">%</span>
          </div>
          <p className="text-white/70 text-sm mt-2">
            {totalItems} total items classified
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {CATEGORY_CONFIG.map(({ key, label, emoji, bg, text, border }) => (
            <div
              key={key}
              className={`${bg} rounded-2xl p-4 border ${border}`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className={`${text} text-2xl font-bold`}>{totals[key]}</div>
              <div className={`${text} text-xs mt-0.5 font-medium`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <h2 className="text-[#1E232C] text-base font-bold mb-4">
            All-Time Breakdown
          </h2>
          <WastePieChart totals={totals} />
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-[#1E232C] text-base font-bold mb-1">Last 7 Days</h2>
          <p className="text-gray-400 text-xs mb-4">
            Daily waste classification trends
          </p>
          <WasteLineChart linegraph={linegraph} />
        </div>
      </div>
    </div>
  );
}
