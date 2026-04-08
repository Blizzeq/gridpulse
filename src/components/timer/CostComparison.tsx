"use client";

import { OptimizationResult } from "@/lib/optimizer";
import { Leaf, Trophy, Medal, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeLabel {
  day: string;
  hour: string;
}

interface AlternativeWindow {
  startIndex: number;
  endIndex: number;
  totalCost: number;
  avgPrice: number;
  start: TimeLabel;
  end: TimeLabel;
}

interface CostComparisonProps {
  result: OptimizationResult;
  bestStart: TimeLabel;
  bestEnd: TimeLabel;
  worstStart: TimeLabel;
  worstEnd: TimeLabel;
  alternatives?: AlternativeWindow[];
  greenScore?: number | null;
  deviceName: string;
}

export function CostComparison({
  result,
  bestStart,
  bestEnd,
  worstStart,
  alternatives = [],
  greenScore,
  deviceName,
}: CostComparisonProps) {
  const monthlySavings = result.savings_eur * 30;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[28px] bg-[#f5fff8] p-6 ring-1 ring-primary/10 sm:p-7">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/5" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <p className="gp-kicker">
              Run your {deviceName} at
            </p>
          </div>

          <p className="text-4xl font-black tracking-[-0.05em] text-[#111827]">
            {bestStart.day} {bestStart.hour}
            <span className="mx-1 text-[#bccac2]">-</span>
            {bestEnd.hour}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-[#505f76]">
                Cost: <span className="font-semibold text-[#111827]">{result.best.totalCost.toFixed(2)} EUR</span>
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#bccac2]" />
            <div>
              <p className="text-sm text-[#6d7a74] line-through">
                {result.worst.totalCost.toFixed(2)} EUR at worst
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-primary/10 pt-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div>
                <span className="text-2xl font-black text-primary">
                  {result.savings_pct.toFixed(0)}%
                </span>
                <span className="ml-1 text-sm font-medium text-primary">
                  cheaper
                </span>
              </div>
              <span className="text-xs text-[#bccac2]">|</span>
              <p className="text-sm font-medium text-primary">
                Save {result.savings_eur.toFixed(2)} EUR today
              </p>
              {monthlySavings > 1 && (
                <>
                  <span className="text-xs text-[#bccac2]">|</span>
                  <p className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    ~{monthlySavings.toFixed(0)} EUR/month
                  </p>
                </>
              )}
            </div>
          </div>

          {greenScore != null && greenScore > 0 && (
            <div className="mt-4 border-t border-primary/10 pt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#505f76]">
                  <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                  {greenScore >= 70
                    ? "Very green!"
                    : greenScore >= 40
                    ? "Partly green"
                    : "Mostly fossil"}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  {greenScore}% renewables
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#d9dadc]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${greenScore}%`,
                    background:
                      greenScore >= 70
                        ? "#10b981"
                        : greenScore >= 40
                        ? "#84cc16"
                        : "#f97316",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="space-y-3">
          <p className="gp-kicker px-1">
            Also good times
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {alternatives.map((alt, i) => (
              <div
                key={alt.startIndex}
                className={cn(
                  "gp-card-subtle flex items-center justify-between p-4",
                  i === 0
                    ? "bg-emerald-50/70"
                    : "bg-[#f9f9fb]"
                )}
              >
                <div>
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <Medal
                      className={cn(
                        "h-3.5 w-3.5",
                        i === 0 ? "text-emerald-500" : "text-[#6d7a74]"
                      )}
                    />
                    <p className="text-sm font-semibold text-[#111827]">
                      {alt.start.day} {alt.start.hour} - {alt.end.hour}
                    </p>
                  </div>
                  <p className="ml-5 text-xs text-[#505f76]">
                    {alt.totalCost.toFixed(2)} EUR
                  </p>
                </div>
                <span className="rounded-full bg-[#edeef0] px-2 py-0.5 text-xs font-medium text-[#505f76]">
                  +{(alt.totalCost - result.best.totalCost).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
