"use client";

import { useMemo } from "react";
import { Clock, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Price } from "@/types/energy";

interface PriceInsightsProps {
  prices: Price[];
}

type MoodKey = "great" | "good" | "ok" | "bad" | "terrible";

const MOOD_CONFIG: Record<
  MoodKey,
  {
    label: string;
    sublabel: string;
    color: string;
    bg: string;
  }
> = {
  great: {
    label: "Excellent timing",
    sublabel: "Prices are sitting near the lowest point of the day.",
    color: "text-emerald-700",
    bg: "bg-emerald-50/70 border-emerald-100",
  },
  good: {
    label: "Good timing",
    sublabel: "Current rates are still comfortably below the daily midpoint.",
    color: "text-emerald-700",
    bg: "bg-emerald-50/55 border-emerald-100",
  },
  ok: {
    label: "Average window",
    sublabel: "This hour is usable, but better slots may still appear.",
    color: "text-amber-700",
    bg: "bg-amber-50/75 border-amber-100",
  },
  bad: {
    label: "Expensive hour",
    sublabel: "It is worth delaying flexible consumption if possible.",
    color: "text-orange-700",
    bg: "bg-orange-50/80 border-orange-100",
  },
  terrible: {
    label: "Peak pricing",
    sublabel: "This is one of the costliest windows in the visible range.",
    color: "text-rose-700",
    bg: "bg-rose-50/80 border-rose-100",
  },
};

export function PriceInsights({ prices }: PriceInsightsProps) {
  const insights = useMemo(() => {
    if (prices.length === 0) {
      return null;
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();

    const todayPrices = prices.filter((price) => price.date === today);
    const referencePrices = todayPrices.length > 0 ? todayPrices : prices;

    if (referencePrices.length === 0) {
      return null;
    }

    const currentPrice =
      referencePrices.find((price) => price.hour % 24 === currentHour) ??
      referencePrices[0];

    const values = referencePrices.map((price) => price.price_eur);
    const minPrice = Math.min(...values);
    const maxPrice = Math.max(...values);
    const range = maxPrice - minPrice;
    const position = range > 0 ? ((currentPrice.price_eur - minPrice) / range) * 100 : 50;

    let mood: MoodKey = "ok";
    if (position < 15) {
      mood = "great";
    } else if (position < 35) {
      mood = "good";
    } else if (position < 60) {
      mood = "ok";
    } else if (position < 80) {
      mood = "bad";
    } else {
      mood = "terrible";
    }

    const cheapestPrice = referencePrices.reduce((best, price) =>
      price.price_eur < best.price_eur ? price : best
    );
    const hoursUntilCheapest = cheapestPrice.hour - currentHour;
    const spreadPct =
      maxPrice !== 0
        ? Math.max(0, Math.round(((maxPrice - minPrice) / Math.abs(maxPrice)) * 100))
        : 0;

    return {
      currentPrice: currentPrice.price_eur,
      minPrice,
      maxPrice,
      mood,
      position,
      cheapestHour: cheapestPrice.hour,
      hoursUntilCheapest,
      cheapestIsNow: hoursUntilCheapest === 0,
      cheapestIsPast: hoursUntilCheapest < 0,
      spreadPct,
    };
  }, [prices]);

  if (!insights) {
    return null;
  }

  const mood = MOOD_CONFIG[insights.mood];
  const markerPosition = Math.min(Math.max(insights.position, 2), 98);

  return (
    <div className="space-y-4">
      <div className={cn("gp-card overflow-hidden border p-6 sm:p-8", mood.bg)}>
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                mood.color
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              {mood.label}
            </span>

            <div className="space-y-2">
              <p className="gp-kicker">Live price signal</p>
              <h3 className="max-w-xl text-xl font-medium leading-8 text-[#111827] sm:text-2xl">
                {mood.sublabel}
              </h3>
            </div>
          </div>

          <div className="lg:text-right">
            <p className="gp-metric-label mb-2">Current price</p>
            <p className={cn("text-5xl font-black tracking-[-0.06em]", mood.color)}>
              {insights.currentPrice.toFixed(0)}
            </p>
            <p className="text-sm font-medium text-[#505f76]">EUR / MWh</p>
          </div>
        </div>

        <div className="relative">
          <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
          <div
            className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_10px_25px_rgba(17,24,39,0.18)]"
            style={{
              left: `calc(${markerPosition}% - 12px)`,
              backgroundColor:
                markerPosition < 35
                  ? "#006951"
                  : markerPosition < 65
                    ? "#d97706"
                    : "#e11d48",
            }}
          />

          <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6d7a74]">
            <span>{insights.minPrice.toFixed(0)} low</span>
            <span>{insights.maxPrice.toFixed(0)} high</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="gp-card-subtle p-5">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="gp-metric-label">
              {insights.cheapestIsNow
                ? "Cheapest now"
                : insights.cheapestIsPast
                  ? "Cheapest was"
                  : "Cheapest in"}
            </span>
          </div>

          {insights.cheapestIsNow ? (
            <p className="text-2xl font-black tracking-[-0.04em] text-emerald-700">
              Right now
            </p>
          ) : insights.cheapestIsPast ? (
            <p className="text-lg font-semibold text-[#505f76]">
              {insights.cheapestHour.toString().padStart(2, "0")}:00 today
            </p>
          ) : (
            <p className="text-2xl font-black tracking-[-0.04em] text-[#111827]">
              {insights.hoursUntilCheapest}h
              <span className="ml-2 text-sm font-medium text-[#505f76]">
                ({insights.cheapestHour.toString().padStart(2, "0")}:00)
              </span>
            </p>
          )}

          <p className="mt-2 text-sm text-[#667085]">
            Use this as the nearest low-cost execution window for shiftable demand.
          </p>
        </div>

        <div className="gp-card-subtle p-5">
          <div className="mb-2 flex items-center gap-2">
            {insights.spreadPct > 50 ? (
              <TrendingDown className="h-4 w-4 text-primary" />
            ) : (
              <TrendingUp className="h-4 w-4 text-[#6d7a74]" />
            )}
            <span className="gp-metric-label">Timing impact</span>
          </div>

          <p className="text-2xl font-black tracking-[-0.04em] text-[#111827]">
            {insights.spreadPct}%
          </p>
          <p className="mt-2 text-sm text-[#667085]">
            {insights.spreadPct > 60
              ? "Large intraday spread means timing decisions can materially reduce cost."
              : insights.spreadPct > 30
                ? "There is enough movement today to reward moderate schedule optimization."
                : "Today is relatively flat, so timing matters less than usual."}
          </p>
        </div>
      </div>
    </div>
  );
}
