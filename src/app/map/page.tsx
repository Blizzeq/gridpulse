"use client";

import { useState } from "react";
import { EuropeMap } from "@/components/map/EuropeMap";
import { CountryPanel } from "@/components/map/CountryPanel";
import { HourSlider } from "@/components/map/HourSlider";
import { useAllPrices, usePrices } from "@/hooks/usePrices";
import { useGeneration } from "@/hooks/useGeneration";
import { useFlows } from "@/hooks/useFlows";
import { getPriceTierColor, PRICE_LEGEND } from "@/types/energy";
import { X } from "lucide-react";

function localToUtc(localDateStr: string, localHour: number) {
  const [y, m, d] = localDateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, localHour, 0, 0);
  return {
    date: dt.toISOString().split("T")[0],
    hour: dt.getUTCHours(),
  };
}

function getLocalDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function MapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hour, setHour] = useState(() => new Date().getHours());

  const localDate = getLocalDate();
  const utc = localToUtc(localDate, hour);

  const { data: prices = [], isLoading } = useAllPrices(utc.date, utc.hour);
  const { data: energyMix = [] } = useGeneration(
    selectedCountry ?? "PL",
    utc.date,
    utc.hour
  );
  const { data: flows = [] } = useFlows(utc.date, utc.hour);

  const { data: dailyPrices = [] } = usePrices(
    selectedCountry ?? "",
    utc.date
  );

  const selectedPrice = prices.find((p) => p.country === selectedCountry);

  const avgPrice =
    prices.length > 0
      ? prices.reduce((s, p) => s + p.price_eur, 0) / prices.length
      : 0;
  const minPrice =
    prices.length > 0 ? Math.min(...prices.map((p) => p.price_eur)) : 0;
  const maxPrice =
    prices.length > 0 ? Math.max(...prices.map((p) => p.price_eur)) : 0;

  return (
    <div className="h-[calc(100vh-var(--nav-height))] overflow-hidden bg-[#f3f3f5] p-3 sm:p-4 lg:p-6">
      <div className="flex h-full flex-col gap-3 lg:flex-row lg:gap-4">
        {/* Map panel */}
        <div className="gp-card relative min-h-[400px] flex-1 overflow-hidden rounded-[24px] p-0 sm:min-h-[520px] sm:rounded-[32px]">
          <div className="gp-grid-bg absolute inset-0" />

          {/* Stats overlays */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2 sm:left-6 sm:top-6 sm:flex-row sm:gap-3">
            <div className="rounded-[14px] bg-white/88 px-3 py-2 shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md sm:rounded-[18px] sm:px-4 sm:py-3">
              <p className="gp-metric-label mb-0.5 sm:mb-1">Avg price</p>
              <p className="text-lg font-black tracking-[-0.04em] text-[#111827] sm:text-2xl">
                {avgPrice.toFixed(0)}
                <span className="ml-1 text-[10px] font-medium text-[#505f76] sm:text-sm">
                  EUR/MWh
                </span>
              </p>
            </div>
            <div className="rounded-[14px] bg-white/88 px-3 py-2 shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md sm:rounded-[18px] sm:px-4 sm:py-3">
              <p className="gp-metric-label mb-0.5 sm:mb-1">Range</p>
              <p className="text-base font-bold tracking-[-0.03em] text-[#111827] sm:text-lg">
                <span className="text-emerald-600">{minPrice.toFixed(0)}</span>
                <span className="mx-1.5 text-[#bccac2] sm:mx-2">/</span>
                <span className="text-red-500">{maxPrice.toFixed(0)}</span>
              </p>
            </div>
          </div>

          {/* Hour slider */}
          <div className="absolute left-1/2 top-3 z-10 w-[min(100%-1.5rem,42rem)] -translate-x-1/2 sm:top-6 sm:w-[min(100%-3rem,42rem)]">
            <HourSlider hour={hour} onChange={setHour} />
          </div>

          {/* Map */}
          <div className="absolute inset-0 min-h-0">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-pulse rounded-full bg-white/85 px-4 py-2 text-sm text-[#505f76] shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md">
                  Loading map data...
                </div>
              </div>
            ) : (
              <EuropeMap
                prices={prices}
                onCountryClick={setSelectedCountry}
                selectedCountry={selectedCountry}
              />
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-10 hidden rounded-[18px] bg-white/88 p-4 shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md sm:bottom-6 sm:left-6 sm:block">
            <p className="gp-metric-label mb-3">Price legend (EUR/MWh)</p>
            <div className="flex flex-wrap items-center gap-3">
              {PRICE_LEGEND.map((tier) => (
                <span
                  key={tier.label}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-[#505f76]"
                >
                  <span
                    className="h-2.5 w-10 rounded-full"
                    style={{ backgroundColor: getPriceTierColor(tier.price) }}
                  />
                  {tier.label}
                </span>
              ))}
            </div>
          </div>

          {/* Grid coverage */}
          <div className="absolute bottom-3 right-3 z-10 rounded-[14px] bg-white/88 px-3 py-2 text-right shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md sm:bottom-6 sm:right-6 sm:rounded-[18px] sm:px-4 sm:py-3">
            <p className="gp-metric-label mb-0.5 sm:mb-1">Grid coverage</p>
            <p className="text-base font-bold tracking-[-0.03em] text-[#111827] sm:text-lg">
              {prices.length} countries
            </p>
            <p className="text-xs text-[#505f76] sm:text-sm">
              {flows.length} cross-border flows
            </p>
          </div>
        </div>

        {/* Country detail panel */}
        {selectedCountry && (
          <div className="gp-card max-h-[45vh] w-full shrink-0 animate-slide-right overflow-hidden rounded-[24px] sm:rounded-[32px] lg:max-h-full lg:w-[400px] xl:w-[440px]">
            <CountryPanel
              countryCode={selectedCountry}
              price={selectedPrice}
              energyMix={energyMix}
              dailyPrices={dailyPrices}
              flows={flows}
              currentHour={hour}
              onClose={() => setSelectedCountry(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
