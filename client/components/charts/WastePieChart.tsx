"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WasteTotals } from "../../types";

interface Props {
  totals: WasteTotals;
}

const COLORS = {
  Recycling: "#ADD8E6",
  Organic: "#68ac53",
  Garbage: "#9CA3AF",
};

export function WastePieChart({ totals }: Props) {
  const total = totals.Recycling + totals.Organic + totals.Garbage;

  if (total === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center gap-2">
        <span className="text-5xl">📭</span>
        <p className="text-gray-400 text-sm text-center">
          No items classified yet.
          <br />
          Start scanning to see your breakdown!
        </p>
      </div>
    );
  }

  const data = (
    [
      { name: "Recycling", value: totals.Recycling },
      { name: "Organic", value: totals.Organic },
      { name: "Garbage", value: totals.Garbage },
    ] as const
  ).filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            `${value} (${Math.round((Number(value) / total) * 100)}%)`,
            name,
          ]}
        />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
