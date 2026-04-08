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
  const currentHour = new Date().getHours();
  const today = prices.length > 0 ? prices[0].date : "";
  const chartTitle = bestWindow || worstWindow ? "Price Distribution" : "48-Hour Forecast";
  const chartSubtitle = bestWindow || worstWindow
    ? "Cheapest and most expensive windows for the selected device."
    : "Current hours versus upcoming day-ahead projection.";

  const data = prices.map((p, idx) => ({
    name: `${(p.hour % 24).toString().padStart(2, "0")}`,
    price: p.price_eur,
    index: idx,
    date: p.date,
  }));

  const minPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.price_eur)) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices.map((p) => p.price_eur)) : 0;
  const avgPrice =
    prices.length > 0
      ? prices.reduce((sum, price) => sum + price.price_eur, 0) / prices.length
      : 0;

  const isInBest = (idx: number) =>
    bestWindow && idx >= bestWindow.startIndex && idx <= bestWindow.endIndex;
  const isInWorst = (idx: number) =>
    worstWindow && idx >= worstWindow.startIndex && idx <= worstWindow.endIndex;

  // Find where tomorrow starts
  const tomorrowStart = prices.findIndex(
    (p, i) => i > 0 && p.date !== prices[i - 1].date
  );

  // Find current hour index for NOW marker
  const nowIndex = prices.findIndex(
    (p) => p.date === today && (p.hour % 24) === currentHour
  );

  const getBarColor = (idx: number) => {
    if (isInBest(idx)) return "#10b981";
    if (isInWorst(idx)) return "#fecaca";
    const p = prices[idx];
    if (p && p.price_eur < 0) return "#22d3ee";
    if (p?.date !== today || idx > nowIndex) return "rgba(0, 105, 81, 0.32)";
    if (idx === nowIndex) return "#006951";
    return "#d9dadc";
  };

  return (
    <div className="gp-card h-full p-6 sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="gp-kicker mb-2">Energy curve</p>
          <h3 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            {chartTitle}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#505f76]">{chartSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#505f76]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/35" /> Projection
          </span>
          {bestWindow && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Best
            </span>
          )}
          {worstWindow && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-200" /> Worst
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#6d7a74" }}
            tickLine={false}
            axisLine={false}
            interval={data.length > 30 ? 5 : 2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6d7a74" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            formatter={(value) => [
              `${Number(value).toFixed(1)} EUR/MWh`,
              "Price",
            ]}
            labelFormatter={(label) => `Hour ${label}:00`}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid rgba(188, 202, 194, 0.3)",
              fontSize: "12px",
            }}
          />
          {tomorrowStart > 0 && (
            <ReferenceLine
              x={data[tomorrowStart]?.name}
              stroke="#bccac2"
              strokeDasharray="4 4"
              label={{
                value: "Tomorrow",
                position: "top",
                fill: "#6d7a74",
                fontSize: 10,
              }}
            />
          )}
          {/* NOW marker */}
          {nowIndex >= 0 && (
            <ReferenceLine
              x={data[nowIndex]?.name}
              stroke="#006951"
              strokeWidth={2}
              label={{
                value: "NOW",
                position: "top",
                fill: "#006951",
                fontSize: 10,
                fontWeight: 700,
              }}
            />
          )}
          <Bar dataKey="price" radius={[2, 2, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.index} fill={getBarColor(entry.index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8 grid gap-4 border-t border-black/5 pt-6 sm:grid-cols-3">
        <div>
          <p className="gp-metric-label mb-1">Lowest</p>
          <p className="text-lg font-bold text-emerald-700">
            {minPrice.toFixed(1)}
            <span className="ml-1 text-[11px] font-medium text-[#505f76]">EUR</span>
          </p>
        </div>
        <div>
          <p className="gp-metric-label mb-1">Highest</p>
          <p className="text-lg font-bold text-red-500">
            {maxPrice.toFixed(1)}
            <span className="ml-1 text-[11px] font-medium text-[#505f76]">EUR</span>
          </p>
        </div>
        <div>
          <p className="gp-metric-label mb-1">Average</p>
          <p className="text-lg font-bold text-[#111827]">
            {avgPrice.toFixed(1)}
            <span className="ml-1 text-[11px] font-medium text-[#505f76]">EUR</span>
          </p>
        </div>
      </div>
    </div>
  );
}
