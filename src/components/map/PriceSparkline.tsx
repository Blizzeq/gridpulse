"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Price, getPriceTierColor } from "@/types/energy";

interface PriceSparklineProps {
  prices: Price[];
  currentHour: number;
}

export function PriceSparkline({ prices, currentHour }: PriceSparklineProps) {
  if (prices.length === 0) return null;

  const data = prices.map((p) => ({
    hour: p.hour,
    label: `${p.hour.toString().padStart(2, "0")}:00`,
    price: p.price_eur,
  }));

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const avgPrice = data.reduce((s, d) => s + d.price, 0) / data.length;

  return (
    <div className="gp-card-subtle p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#505f76]">
          Today&apos;s Prices
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-medium text-[#6d7a74]">
          <span>
            Low{" "}
            <span className="font-semibold text-emerald-700">
              {minPrice.toFixed(0)}
            </span>
          </span>
          <span>
            Avg{" "}
            <span className="font-semibold text-[#111827]">
              {avgPrice.toFixed(0)}
            </span>
          </span>
          <span>
            High{" "}
            <span className="font-semibold text-red-500">
              {maxPrice.toFixed(0)}
            </span>
          </span>
        </div>
      </div>
      <div className="rounded-[18px] bg-[#f9f9fb] p-3">
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006951" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#006951" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 9, fill: "#6d7a74" }}
              tickLine={false}
              axisLine={false}
              interval={5}
              tickFormatter={(h) => `${h}h`}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#6d7a74" }}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 5", "dataMax + 5"]}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              formatter={(value) => [
                `${Number(value).toFixed(1)} EUR/MWh`,
                "Price",
              ]}
              labelFormatter={(h) =>
                `${String(h).padStart(2, "0")}:00`
              }
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid rgba(188, 202, 194, 0.4)",
                fontSize: "11px",
                padding: "6px 10px",
              }}
            />
            <ReferenceLine
              x={currentHour}
              stroke="#505f76"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#006951"
              strokeWidth={1.5}
              fill="url(#priceGrad)"
              dot={false}
              activeDot={{ r: 3, fill: "#006951" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
