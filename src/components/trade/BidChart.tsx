"use client";

import { useRef, useCallback, useState } from "react";
import { Bid } from "@/types/trading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface BidChartProps {
  bids: Bid[];
  onChange: (bids: Bid[]) => void;
  disabled?: boolean;
  historyAvg?: number;
}

export function BidChart({ bids, onChange, disabled, historyAvg }: BidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const data = bids.map((b) => ({
    hour: b.hour.toString().padStart(2, "0"),
    price: b.price,
    volume: b.volume,
    hourNum: b.hour,
  }));

  // Fixed scale based on historyAvg — does not react to bid values
  // so the chart stays stable while dragging
  const baseMax = Math.max(historyAvg ?? 100, 150);
  const yMax = Math.ceil(baseMax / 50) * 50 + 100;

  const getHourFromEvent = useCallback(
    (clientX: number, clientY: number): { hour: number; price: number } | null => {
      const container = containerRef.current;
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      // Chart area offsets (approximate for Recharts with margins)
      const chartLeft = rect.left + 45;
      const chartRight = rect.right - 10;
      const chartTop = rect.top + 10;
      const chartBottom = rect.bottom - 25;
      const chartWidth = chartRight - chartLeft;
      const chartHeight = chartBottom - chartTop;

      const relX = clientX - chartLeft;
      const relY = clientY - chartTop;

      if (relX < 0 || relX > chartWidth || relY < 0 || relY > chartHeight) {
        return null;
      }

      const hour = Math.floor((relX / chartWidth) * 24);
      const price = Math.max(0, Math.round(yMax * (1 - relY / chartHeight)));

      return { hour: Math.min(23, Math.max(0, hour)), price };
    },
    [yMax]
  );

  const updateBidPrice = useCallback(
    (hour: number, price: number) => {
      if (disabled) return;
      onChange(
        bids.map((b) => (b.hour === hour ? { ...b, price: Math.max(0, price) } : b))
      );
    },
    [bids, onChange, disabled]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const result = getHourFromEvent(e.clientX, e.clientY);
      if (result) updateBidPrice(result.hour, result.price);
    },
    [disabled, getHourFromEvent, updateBidPrice]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || disabled) return;
      const result = getHourFromEvent(e.clientX, e.clientY);
      if (result) updateBidPrice(result.hour, result.price);
    },
    [isDragging, disabled, getHourFromEvent, updateBidPrice]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getBarColor = (price: number) => {
    if (price === 0) return "#e5e7eb";
    if (historyAvg && price > historyAvg * 1.2) return "#f87171";
    if (historyAvg && price < historyAvg * 0.8) return "#34d399";
    return "#93c5fd";
  };

  return (
    <div className="gp-card p-6 sm:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <p className="gp-kicker mb-2">Set your bids</p>
          <h3 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            Set Your Bids
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#505f76]">
            {disabled
              ? "Bids locked"
              : "Click or drag on the chart to set prices for each hour"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#505f76]">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-300" /> Your bids
          </span>
          {historyAvg && (
            <span className="flex items-center gap-1">
              <span className="h-0 w-4 border-t border-dashed border-[#6d7a74]" /> Avg
            </span>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="touch-none select-none"
        style={{ cursor: disabled ? "default" : "crosshair" }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "#6d7a74" }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fontSize: 10, fill: "#6d7a74" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(0)} EUR/MWh`, "Your bid"]}
              labelFormatter={(label) => `Hour ${label}:00`}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(188, 202, 194, 0.3)",
                fontSize: "12px",
              }}
            />
            {historyAvg && (
              <ReferenceLine
                y={historyAvg}
                stroke="#6d7a74"
                strokeDasharray="4 4"
                label={{
                  value: `Avg ${historyAvg.toFixed(0)}`,
                  position: "right",
                  fill: "#6d7a74",
                  fontSize: 10,
                }}
              />
            )}
            <Bar dataKey="price" radius={[3, 3, 0, 0]} maxBarSize={20}>
              {data.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.price)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-5 text-xs text-[#505f76]">
        <span>
          Active bids:{" "}
          <span className="font-semibold text-[#111827]">
            {bids.filter((b) => b.price > 0).length}/24
          </span>
        </span>
        <span>
          Avg bid:{" "}
          <span className="font-semibold text-[#111827]">
            {bids.filter((b) => b.price > 0).length > 0
              ? (
                  bids.filter((b) => b.price > 0).reduce((s, b) => s + b.price, 0) /
                  bids.filter((b) => b.price > 0).length
                ).toFixed(0)
              : 0}{" "}
            EUR
          </span>
        </span>
        <span>
          Volume:{" "}
          <span className="font-semibold text-[#111827]">
            {bids.reduce((s, b) => s + (b.price > 0 ? b.volume : 0), 0)} MWh
          </span>
        </span>
      </div>
    </div>
  );
}
