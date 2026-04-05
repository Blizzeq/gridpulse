"use client";

import { OptimizationResult } from "@/lib/optimizer";

interface CostComparisonProps {
  result: OptimizationResult;
  bestStart: { day: string; hour: string };
  bestEnd: { day: string; hour: string };
  worstStart: { day: string; hour: string };
  worstEnd: { day: string; hour: string };
  greenScore?: number;
}

export function CostComparison({
  result,
  bestStart,
  bestEnd,
  worstStart,
  greenScore,
}: CostComparisonProps) {
  return (
    <div className="bg-emerald-50 rounded-2xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Best time */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Best time
          </p>
          <p className="text-xl font-bold text-gray-900">
            {bestStart.day} {bestStart.hour} - {bestEnd.hour}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {result.best.totalCost.toFixed(2)} EUR
          </p>
        </div>

        {/* Savings */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            You save
          </p>
          <p className="text-xl font-bold text-emerald-600">
            {result.savings_eur.toFixed(2)} EUR ({result.savings_pct.toFixed(0)}
            %)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            vs {worstStart.day} {worstStart.hour} at{" "}
            {result.worst.totalCost.toFixed(2)} EUR
          </p>
        </div>
      </div>

      {/* Green Score */}
      {greenScore !== undefined && greenScore > 0 && (
        <div className="mt-5 pt-4 border-t border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              Green Score
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {greenScore}% renewables
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${greenScore}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
