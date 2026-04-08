"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Price } from "@/types/energy";
import {
  Receipt,
  Zap,
  PiggyBank,
  TrendingDown,
  User,
  Building2,
  House,
  Warehouse,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BillCalculatorProps {
  country: string;
}

const HOUSEHOLD_PRESETS = [
  { label: "Studio / 1 person", kwhMonth: 150, icon: User },
  { label: "Small apartment", kwhMonth: 250, icon: Building2 },
  { label: "Family home", kwhMonth: 400, icon: House },
  { label: "Large house", kwhMonth: 600, icon: Warehouse },
];

const FIXED_TARIFFS: Record<string, number> = {
  PL: 120, DE: 95, FR: 65, ES: 80, IT: 110, NL: 90,
  AT: 85, BE: 100, CZ: 95, DK: 70, FI: 55, SE: 45,
  NO: 40, PT: 90, GR: 105, RO: 100, HU: 110, SK: 100,
  BG: 80, HR: 90, SI: 85, LT: 95, LV: 90, EE: 85,
  IE: 100, CH: 75, RS: 70, BA: 65, ME: 70, MK: 75,
  AL: 60, XK: 65,
};

export function BillCalculator({ country }: BillCalculatorProps) {
  const [monthlyKwh, setMonthlyKwh] = useState(250);
  const [selectedPreset, setSelectedPreset] = useState(1);

  const today = new Date().toISOString().split("T")[0];

  const { data: prices } = useQuery<Price[]>({
    queryKey: ["prices", country, today],
    queryFn: async () => {
      const res = await fetch(`/api/prices?country=${country}&date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch prices");
      return res.json();
    },
  });

  const stats = useMemo(() => {
    if (!prices || prices.length === 0) return null;

    const avgPrice = prices.reduce((s, p) => s + p.price_eur, 0) / prices.length;
    const dailyKwh = monthlyKwh / 30;

    const spotDailyCost = (avgPrice / 1000) * dailyKwh;
    const spotMonthlyCost = spotDailyCost * 30;
    const spotYearlyCost = spotDailyCost * 365;

    const fixedPrice = FIXED_TARIFFS[country] ?? 90;
    const fixedDailyCost = (fixedPrice / 1000) * dailyKwh;
    const fixedMonthlyCost = fixedDailyCost * 30;

    const currentHour = new Date().getHours();
    const currentPrice = prices.find((p) => p.hour === currentHour);
    const currentHourlyCost = currentPrice
      ? (currentPrice.price_eur / 1000) * (dailyKwh / 24)
      : 0;

    const monthlySavings = fixedMonthlyCost - spotMonthlyCost;
    const savingsPct = fixedMonthlyCost > 0
      ? ((fixedMonthlyCost - spotMonthlyCost) / fixedMonthlyCost) * 100
      : 0;

    return {
      avgPrice,
      spotDailyCost,
      spotMonthlyCost,
      spotYearlyCost,
      fixedPrice,
      fixedMonthlyCost,
      currentHourlyCost,
      currentPriceEur: currentPrice?.price_eur ?? 0,
      monthlySavings,
      savingsPct,
      isSpotCheaper: spotMonthlyCost < fixedMonthlyCost,
    };
  }, [prices, monthlyKwh, country]);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Main content */}
      <div className="space-y-8 lg:col-span-8">
        {/* Household presets */}
        <section className="animate-fade-up">
          <p className="gp-kicker mb-5">Select household size</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {HOUSEHOLD_PRESETS.map((preset, i) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    setSelectedPreset(i);
                    setMonthlyKwh(preset.kwhMonth);
                  }}
                  className={cn(
                    "gp-card-subtle flex flex-col gap-3 p-4 text-left transition-all duration-200 sm:gap-4 sm:p-5",
                    selectedPreset === i
                      ? "bg-[#f5fff8] ring-2 ring-primary shadow-[0_12px_32px_-16px_rgba(0,105,81,0.2)]"
                      : "hover:bg-[#f9f9fb] hover:shadow-[0_16px_40px_-32px_rgba(17,24,39,0.2)]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      selectedPreset === i
                        ? "bg-primary/10 text-primary"
                        : "bg-[#f3f3f5] text-[#505f76]"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{preset.label}</p>
                    <p className="mt-1 text-[11px] text-[#505f76]">~{preset.kwhMonth} kWh / mo</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Consumption slider */}
        <section className="gp-card p-6 sm:p-8 lg:p-10 animate-fade-up delay-100">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="gp-kicker mb-2">Estimated monthly consumption</p>
              <p className="text-4xl font-black tracking-[-0.05em] text-[#111827] sm:text-5xl">
                {monthlyKwh}
                <span className="ml-2 text-lg font-medium text-[#505f76] sm:text-xl">kWh</span>
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {selectedPreset >= 0 ? "Avg for this household" : "Custom profile"}
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={1000}
            step={10}
            value={monthlyKwh}
            onChange={(event) => {
              setMonthlyKwh(Number(event.target.value));
              setSelectedPreset(-1);
            }}
            className="gp-range h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8ea]"
          />
          <div className="mt-4 flex justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-[#6d7a74]">
            <span>50 kWh</span>
            <span>1000 kWh</span>
          </div>
        </section>

        {/* Spot vs Fixed comparison */}
        {stats && (
          <section
            className={cn(
              "relative overflow-hidden rounded-[28px] p-6 sm:p-8 animate-fade-up delay-200",
              stats.isSpotCheaper
                ? "bg-[#f5fff8] ring-1 ring-primary/10"
                : "bg-amber-50 ring-1 ring-amber-100"
            )}
          >
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <TrendingDown
                  className={cn(
                    "h-5 w-5",
                    stats.isSpotCheaper ? "text-primary" : "text-amber-600"
                  )}
                />
                <h3
                  className={cn(
                    "text-lg font-bold tracking-[-0.03em]",
                    stats.isSpotCheaper ? "text-primary" : "text-amber-700"
                  )}
                >
                  {stats.isSpotCheaper
                    ? "Spot pricing is cheaper today!"
                    : "Fixed tariff is cheaper today"}
                </h3>
              </div>

              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                <div>
                  <p className="gp-metric-label mb-2">Spot price estimate</p>
                  <p className="text-3xl font-black tracking-[-0.04em] text-primary">
                    €{stats.spotMonthlyCost.toFixed(2)}
                    <span className="ml-1 text-sm font-medium text-primary/70">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-primary/70">
                    Based on avg {stats.avgPrice.toFixed(0)} EUR/MWh day-ahead price.
                  </p>
                </div>

                <div className="border-t border-primary/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <p className="gp-metric-label mb-2">Fixed tariff estimate</p>
                  <p className="text-3xl font-black tracking-[-0.04em] text-[#111827]">
                    €{stats.fixedMonthlyCost.toFixed(2)}
                    <span className="ml-1 text-sm font-medium text-[#505f76]">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-[#505f76]">
                    Based on ~{stats.fixedPrice} EUR/MWh retail tariff.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,105,81,0.4)]">
                  <PiggyBank className="h-4 w-4" />
                  Save €{Math.abs(stats.monthlySavings).toFixed(0)}/month
                </div>
                <div className="inline-flex items-center rounded-xl border border-primary/10 bg-white/65 px-4 py-2.5 text-sm font-semibold text-primary backdrop-blur-sm">
                  {Math.abs(stats.savingsPct).toFixed(0)}% lower
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-primary/5" />
          </section>
        )}

        <p className="text-center text-xs leading-6 text-[#6d7a74]">
          Estimates use current day-ahead market data and approximate country tariffs.
          Your final bill depends on retailer fees, taxes, and consumption profile.
        </p>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4">
        {stats ? (
          <div className="sticky top-[calc(var(--nav-height)+1.5rem)] space-y-4 animate-slide-right">
            <p className="gp-kicker px-1">Cost summary</p>

            <div className="gp-card-subtle p-5 transition-all duration-200 hover:shadow-[0_28px_70px_-52px_rgba(17,24,39,0.35)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="gp-metric-label">Right now</span>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-black tracking-[-0.04em] text-[#111827]">
                €{(stats.currentHourlyCost).toFixed(4)}
                <span className="ml-1 text-sm font-medium text-[#505f76]">/h</span>
              </p>
              <p className="mt-2 text-sm text-[#505f76]">
                at {stats.currentPriceEur.toFixed(0)} EUR/MWh
              </p>
            </div>

            <div className="gp-card-subtle p-5 transition-all duration-200 hover:shadow-[0_28px_70px_-52px_rgba(17,24,39,0.35)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="gp-metric-label">Today&apos;s bill</span>
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-black tracking-[-0.04em] text-[#111827]">
                €{stats.spotDailyCost.toFixed(2)}
              </p>
              <p className="mt-2 text-sm text-[#505f76]">
                ~€{stats.spotMonthlyCost.toFixed(0)} per month
              </p>
            </div>

            <div className="gp-dark-panel rounded-[28px] p-6 text-white shadow-[0_28px_80px_-52px_rgba(17,24,39,0.9)] sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Yearly estimate
                </span>
                <PiggyBank className="h-4 w-4 text-emerald-200" />
              </div>
              <p className="text-5xl font-black tracking-[-0.05em]">
                €{stats.spotYearlyCost.toFixed(0)}
              </p>
              <p className="mt-3 text-sm leading-7 text-emerald-100/80">
                Estimated savings of €
                {Math.max(stats.monthlySavings * 12, 0).toFixed(0)} vs standard
                fixed plans.
              </p>
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#008467] hover:shadow-[0_8px_24px_-8px_rgba(0,105,81,0.4)]">
                Switch to Spot Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="gp-card animate-pulse p-8">
            <div className="h-4 w-32 rounded bg-[#e8e8ea]" />
            <div className="mt-4 h-10 w-24 rounded bg-[#e8e8ea]" />
          </div>
        )}
      </div>
    </div>
  );
}
