"use client";
import { useAuthStore } from "@/store/authStore";
import { useWasteData } from "@/hooks/useWasteData";
import { WastePieChart } from "@/components/charts/WastePieChart";
import { WasteLineChart } from "@/components/charts/WasteLineChart";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/lib/categories";

export default function HomePage() {
  const { user } = useAuthStore();
  const { totals, linegraph, error } = useWasteData();

  const totalItems = totals.Recycling + totals.Organic + totals.Garbage;
  const recyclingRate =
    totalItems > 0 ? Math.round((totals.Recycling / totalItems) * 100) : 0;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm font-medium">Welcome back</p>
          <h1 className="text-ink text-2xl font-bold mt-0.5">
            {user?.email?.split("@")[0] ?? "Dashboard"}
          </h1>
        </div>

        {/* Data error */}
        {error && (
          <div className="bg-red-50 rounded-2xl p-4 mb-5 border border-red-100">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Recycling rate hero */}
        <div className="bg-brand rounded-3xl p-6 mb-5 shadow-sm">
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
          {CATEGORY_ORDER.map((key) => {
            const { label, emoji, bg, text, border } = CATEGORY_CONFIG[key];
            return (
              <div key={key} className={`${bg} rounded-2xl p-4 border ${border}`}>
                <div className="text-2xl mb-1">{emoji}</div>
                <div className={`${text} text-2xl font-bold`}>{totals[key]}</div>
                <div className={`${text} text-xs mt-0.5 font-medium`}>{label}</div>
              </div>
            );
          })}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <h2 className="text-ink text-base font-bold mb-4">All-Time Breakdown</h2>
          <WastePieChart totals={totals} />
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-ink text-base font-bold mb-1">Last 7 Days</h2>
          <p className="text-gray-400 text-xs mb-4">
            Daily waste classification trends
          </p>
          <WasteLineChart linegraph={linegraph} />
        </div>
      </div>
    </div>
  );
}
