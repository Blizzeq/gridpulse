"use client";

import { useMemo } from "react";
import { Price } from "@/types/energy";
import { cn } from "@/lib/utils";
import { BanknoteArrowDown, Clock3, Sparkles, MoonStar } from "lucide-react";

interface SmartTipsProps {
  prices: Price[];
  deviceName: string;
  savingsEur?: number;
}

interface Tip {
  icon: React.ElementType;
  text: string;
  color: string;
  bgColor: string;
  iconColor: string;
}

export function SmartTips({ prices, deviceName, savingsEur }: SmartTipsProps) {
  const tips = useMemo(() => {
    if (prices.length === 0) return [];

    const result: Tip[] = [];
    const today = prices[0].date;
    const todayPrices = prices.filter((p) => p.date === today);
    const tomorrowPrices = prices.filter((p) => p.date !== today);

    const avg = (arr: Price[]) =>
      arr.length > 0
        ? arr.reduce((s, p) => s + p.price_eur, 0) / arr.length
        : 0;

    const todayAvg = avg(todayPrices);
    const tomorrowAvg = tomorrowPrices.length > 0 ? avg(tomorrowPrices) : null;

    // Monthly savings projection
    if (savingsEur && savingsEur > 0.05) {
      const monthly = savingsEur * 30;
      result.push({
        icon: BanknoteArrowDown,
        text: `By running your ${deviceName} at the right time every day, you'd save ~${monthly.toFixed(0)} EUR/month.`,
        color: "text-emerald-700",
        bgColor: "bg-emerald-50 border-emerald-200",
        iconColor: "bg-emerald-100 text-emerald-700",
      });
    }

    // Tomorrow is cheaper
    if (tomorrowAvg !== null && tomorrowAvg < todayAvg * 0.85) {
      const pct = Math.round(((todayAvg - tomorrowAvg) / todayAvg) * 100);
      result.push({
        icon: Clock3,
        text: `Tomorrow is ${pct}% cheaper — if the ${deviceName} can wait, you'll save more.`,
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200",
        iconColor: "bg-blue-100 text-blue-700",
      });
    }

    // Tomorrow is more expensive - act today
    if (tomorrowAvg !== null && tomorrowAvg > todayAvg * 1.2) {
      result.push({
        icon: Sparkles,
        text: `Prices jump tomorrow — run your ${deviceName} today to lock in savings.`,
        color: "text-amber-700",
        bgColor: "bg-amber-50 border-amber-200",
        iconColor: "bg-amber-100 text-amber-700",
      });
    }

    // Negative prices
    const negativeHours = prices.filter((p) => p.price_eur < 0);
    if (negativeHours.length > 0) {
      const firstNeg = negativeHours[0];
      const day = firstNeg.date === today ? "today" : "tomorrow";
      const negHour = (firstNeg.hour % 24).toString().padStart(2, "0");
      result.push({
        icon: Sparkles,
        text: `Free energy at ${negHour}:00 ${day}! Surplus power means the grid pays you to consume.`,
        color: "text-cyan-700",
        bgColor: "bg-cyan-50 border-cyan-200",
        iconColor: "bg-cyan-100 text-cyan-700",
      });
    }

    // Night dip
    const nightPrices = todayPrices.filter((p) => p.hour >= 22 || p.hour < 6);
    const dayPrices = todayPrices.filter((p) => p.hour >= 8 && p.hour <= 20);
    if (nightPrices.length > 0 && dayPrices.length > 0) {
      const nightAvg = avg(nightPrices);
      const dayAvg = avg(dayPrices);
      if (nightAvg < dayAvg * 0.6) {
        const pct = Math.round(((dayAvg - nightAvg) / dayAvg) * 100);
        result.push({
          icon: MoonStar,
          text: `Night owls win! Prices drop ${pct}% after 22:00 — perfect for scheduled loads.`,
          color: "text-indigo-700",
          bgColor: "bg-indigo-50 border-indigo-200",
          iconColor: "bg-indigo-100 text-indigo-700",
        });
      }
    }

    return result.slice(0, 2);
  }, [prices, deviceName, savingsEur]);

  if (tips.length === 0) return null;

  return (
    <div className="grid gap-3">
      {tips.map((tip, i) => {
        const Icon = tip.icon;

        return (
          <div
            key={i}
            className={cn(
              "gp-card-subtle flex items-start gap-4 border px-5 py-4",
              tip.bgColor
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                tip.iconColor
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className={cn("text-xs font-medium leading-relaxed", tip.color)}>
              {tip.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
