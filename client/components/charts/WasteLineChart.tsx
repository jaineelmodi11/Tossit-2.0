"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getLast7Days,
  toDateKey,
  toLegacyDateKey,
  toShortLabel,
} from "../../lib/utils/dateHelpers";
import type { WasteTotals } from "../../types";

interface Props {
  linegraph: Record<string, Partial<WasteTotals>>;
}

export function WasteLineChart({ linegraph }: Props) {
  const chartData = getLast7Days().map((day) => {
    // Canonical ISO key first, then the key format v2.0 wrote.
    const entry = linegraph[toDateKey(day)] ?? linegraph[toLegacyDateKey(day)];
    return {
      day: toShortLabel(day),
      Recycling: entry?.Recycling ?? 0,
      Organic: entry?.Organic ?? 0,
      Garbage: entry?.Garbage ?? 0,
    };
  });

  const hasData = chartData.some(
    (d) => d.Recycling > 0 || d.Organic > 0 || d.Garbage > 0
  );

  if (!hasData) {
    return (
      <div className="h-44 flex items-center justify-center">
        <p className="text-gray-400 text-sm text-center">
          No activity in the last 7 days yet.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="Recycling"
          stroke="#60A5FA"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Organic"
          stroke="#68ac53"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Garbage"
          stroke="#9CA3AF"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
