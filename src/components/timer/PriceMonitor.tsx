"use client";

import { useQuery } from "@tanstack/react-query";
import { Price } from "@/types/energy";
import { PriceChart } from "./PriceChart";
import { PriceInsights } from "./PriceInsights";
import { SmartTips } from "./SmartTips";
import { AlertCircle, RefreshCw } from "lucide-react";

interface PriceMonitorProps {
  country: string;
}

export function PriceMonitor({ country }: PriceMonitorProps) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const {
    data: todayPrices,
    isLoading: loadingToday,
    isError: errorToday,
    refetch,
  } = useQuery<Price[]>({
    queryKey: ["prices", country, today],
    queryFn: async () => {
      const res = await fetch(`/api/prices?country=${country}&date=${today}`);
      if (!res.ok) throw new Error("Failed to fetch prices");
      return res.json();
    },
  });

  const { data: tomorrowPrices } = useQuery<Price[]>({
    queryKey: ["prices", country, tomorrow],
    queryFn: async () => {
      const res = await fetch(`/api/prices?country=${country}&date=${tomorrow}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const allPrices = [...(todayPrices ?? []), ...(tomorrowPrices ?? [])];

  // Loading state
  if (loadingToday) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
        <div className="space-y-5">
          <div className="gp-card animate-pulse p-8">
            <div className="h-4 w-32 rounded bg-[#e8e8ea]" />
            <div className="mt-4 h-10 w-24 rounded bg-[#e8e8ea]" />
            <div className="mt-6 h-3 w-full rounded-full bg-[#e8e8ea]" />
          </div>
          <div className="gp-card-subtle animate-pulse p-5">
            <div className="h-3 w-20 rounded bg-[#e8e8ea]" />
            <div className="mt-3 h-6 w-16 rounded bg-[#e8e8ea]" />
          </div>
        </div>
        <div className="gp-card animate-pulse p-8">
          <div className="h-4 w-40 rounded bg-[#e8e8ea]" />
          <div className="mt-6 flex items-end gap-1">
            {[65, 45, 80, 55, 70, 90, 50, 75, 60, 85, 40, 95, 55, 70, 45, 80, 60, 75, 50, 85, 65, 70, 55, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-[#e8e8ea]"
                style={{ height: `${h}%`, minHeight: 20 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error or no data state
  if (errorToday || !todayPrices || todayPrices.length === 0) {
    return (
      <div className="gp-card mx-auto max-w-lg p-10 text-center animate-fade-up">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-[#111827]">
          No price data available
        </h3>
        <p className="mb-6 text-sm leading-7 text-[#505f76]">
          Day-ahead prices for this market are not yet published, or the data
          source is temporarily unavailable. ENTSO-E usually publishes around
          13:00 CET.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#008467]"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
      <div className="space-y-5 animate-fade-up">
        <PriceInsights prices={allPrices} />
        <SmartTips prices={allPrices} deviceName="appliances" />
      </div>
      <div className="animate-fade-up delay-150">
        <PriceChart prices={allPrices} bestWindow={null} worstWindow={null} />
      </div>
    </div>
  );
}
