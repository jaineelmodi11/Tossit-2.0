"use client";
import { useHistory } from "@/hooks/useHistory";
import type { WasteCategory } from "@/types";

const CATEGORY_CONFIG: Record<
  WasteCategory,
  { emoji: string; label: string; bg: string; text: string; dot: string }
> = {
  Recycling: {
    emoji: "♻️",
    label: "Recycling",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  Organic: {
    emoji: "🌱",
    label: "Organic / Compost",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  Garbage: {
    emoji: "🗑️",
    label: "Garbage",
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-400",
  },
};

function formatTimestamp(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function groupByDate(
  entries: { id: string; category: WasteCategory; timestamp: Date }[]
): { label: string; items: typeof entries }[] {
  const groups: Record<string, typeof entries> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const entry of entries) {
    const d = entry.timestamp;
    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export default function HistoryPage() {
  const { entries, loading } = useHistory();

  const groups = groupByDate(entries);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[#1E232C] text-2xl font-bold">Scan History</h1>
          <p className="text-gray-400 text-sm mt-1">
            Every item you&apos;ve classified
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-16 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-sm">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-[#1E232C] font-semibold text-lg">No scans yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Head to the Scan tab to classify your first item.
            </p>
          </div>
        )}

        {/* Grouped feed */}
        {!loading && groups.length > 0 && (
          <div className="flex flex-col gap-6">
            {groups.map(({ label, items }) => (
              <div key={label}>
                {/* Date label */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
                  {label}
                </p>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-50">
                  {items.map((entry) => {
                    const cfg = CATEGORY_CONFIG[entry.category];
                    const { time } = formatTimestamp(entry.timestamp);
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        {/* Icon bubble */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                        >
                          <span className="text-2xl">{cfg.emoji}</span>
                        </div>

                        {/* Label + time */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${cfg.text}`}>
                            {cfg.label}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">{time}</p>
                        </div>

                        {/* Category dot */}
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total count */}
        {!loading && entries.length > 0 && (
          <p className="text-center text-gray-300 text-xs mt-6">
            {entries.length} scan{entries.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>
    </div>
  );
}
