"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { Price } from "@/types/energy";
import { OptimalWindow } from "@/lib/optimizer";

interface PriceChartProps {
  prices: Price[];
  bestWindow: OptimalWindow | null;
  worstWindow: OptimalWindow | null;
}

export function PriceChart({ prices, bestWindow, worstWindow }: PriceChartProps) {
  const data = prices.map((p, idx) => ({
    name: `${p.hour.toString().padStart(2, "0")}`,
    price: p.price_eur,
    index: idx,
    date: p.date,
  }));

  const isInBest = (idx: number) =>
    bestWindow && idx >= bestWindow.startIndex && idx <= bestWindow.endIndex;
  const isInWorst = (idx: number) =>
    worstWindow && idx >= worstWindow.startIndex && idx <= worstWindow.endIndex;

  // Find where tomorrow starts
  const tomorrowStart = prices.findIndex(
    (p, i) => i > 0 && p.date !== prices[i - 1].date
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Hourly Prices
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Today & Tomorrow</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Best
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-200" /> Worst
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)} EUR/MWh`, "Price"]}
            labelFormatter={(label) => `Hour ${label}:00`}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />
          {tomorrowStart > 0 && (
            <ReferenceLine
              x={data[tomorrowStart]?.name}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
              label={{
                value: "Tomorrow",
                position: "top",
                fill: "#9ca3af",
                fontSize: 10,
              }}
            />
          )}
          <Bar dataKey="price" radius={[2, 2, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.index}
                fill={
                  isInBest(entry.index)
                    ? "#10b981"
                    : isInWorst(entry.index)
                    ? "#fecaca"
                    : "#e5e7eb"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
