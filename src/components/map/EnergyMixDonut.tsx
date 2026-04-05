"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { EnergyMix } from "@/types/energy";
import { ENERGY_SOURCE_COLORS } from "@/lib/constants";

interface EnergyMixDonutProps {
  data: EnergyMix[];
  totalGw: number;
}

export function EnergyMixDonut({ data, totalGw }: EnergyMixDonutProps) {
  const chartData = data
    .filter((d) => d.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="relative" style={{ width: 180, height: 180, margin: "0 auto" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            dataKey="percentage"
            nameKey="source_type"
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.source_type}
                fill={ENERGY_SOURCE_COLORS[entry.source_type] ?? "#94a3b8"}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900">
          {totalGw.toFixed(1)}
        </span>
        <span className="text-xs text-gray-400">GW</span>
      </div>
    </div>
  );
}
