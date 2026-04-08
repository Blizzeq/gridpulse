"use client";

import { COUNTRIES } from "@/lib/countries";
import {
  CountryPrice,
  EnergyMix,
  Price,
  Flow,
  getPriceTierLabel,
  getPriceTierColor,
} from "@/types/energy";
import { EnergyMixDonut } from "./EnergyMixDonut";
import { PriceSparkline } from "./PriceSparkline";
import { ENERGY_SOURCE_COLORS } from "@/lib/constants";
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRightLeft,
} from "lucide-react";

interface CountryPanelProps {
  countryCode: string;
  price: CountryPrice | undefined;
  energyMix: EnergyMix[];
  dailyPrices: Price[];
  flows: Flow[];
  currentHour: number;
  onClose: () => void;
}

export function CountryPanel({
  countryCode,
  price,
  energyMix,
  dailyPrices,
  flows,
  currentHour,
  onClose,
}: CountryPanelProps) {
  const country = COUNTRIES[countryCode];
  if (!country) return null;

  const totalGeneration = energyMix.reduce((sum, m) => sum + m.value_mw, 0);
  const renewablesPct = energyMix
    .filter((m) => ["wind", "solar", "hydro"].includes(m.source_type))
    .reduce((sum, m) => sum + m.percentage, 0);

  const ChangeIcon =
    price?.change_pct && price.change_pct > 2
      ? TrendingUp
      : price?.change_pct && price.change_pct < -2
      ? TrendingDown
      : Minus;

  // Calculate import/export from flows
  const countryFlows = flows.filter(
    (f) => f.from_country === countryCode || f.to_country === countryCode
  );
  const totalImport = countryFlows
    .filter((f) => f.to_country === countryCode && f.flow_mw > 0)
    .reduce((s, f) => s + f.flow_mw, 0) +
    countryFlows
      .filter((f) => f.from_country === countryCode && f.flow_mw < 0)
      .reduce((s, f) => s + Math.abs(f.flow_mw), 0);
  const totalExport = countryFlows
    .filter((f) => f.from_country === countryCode && f.flow_mw > 0)
    .reduce((s, f) => s + f.flow_mw, 0) +
    countryFlows
      .filter((f) => f.to_country === countryCode && f.flow_mw < 0)
      .reduce((s, f) => s + Math.abs(f.flow_mw), 0);

  return (
    <div className="flex h-full flex-col bg-white p-6 sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4 shrink-0">
        <div>
          <p className="gp-kicker mb-2">Regional detail</p>
          <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#111827]">
            {country.flag} {country.name}
          </h2>
          {price && (
            <>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className="text-6xl font-black tracking-[-0.06em] tabular-nums"
                  style={{ color: getPriceTierColor(price.price_eur) }}
                >
                  {price.price_eur.toFixed(0)}
                </span>
                <span className="text-base font-medium text-[#505f76]">EUR/MWh</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {price.change_pct !== null && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      price.change_pct >= 0
                        ? "bg-red-50 text-red-500"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <ChangeIcon className="h-3 w-3" />
                    {price.change_pct >= 0 ? "+" : ""}
                    {price.change_pct.toFixed(1)}%
                  </span>
                )}
                <span className="rounded-full bg-[#f3f3f5] px-3 py-1.5 text-xs font-medium text-[#505f76]">
                  {getPriceTierLabel(price.price_eur)}
                </span>
              </div>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-[#6d7a74] transition-colors hover:bg-[#f3f3f5] hover:text-[#111827]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto min-h-0 pr-1">
        {dailyPrices.length > 0 && (
          <PriceSparkline prices={dailyPrices} currentHour={currentHour} />
        )}

        {energyMix.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[18px] bg-[#f3f3f5] p-4">
              <div className="gp-metric-label mb-2">Generation</div>
              <div className="text-2xl font-black tracking-[-0.04em] text-[#111827]">
                {(totalGeneration / 1000).toFixed(1)}{" "}
                <span className="text-xs font-medium text-[#505f76]">GW</span>
              </div>
            </div>
            <div className="rounded-[18px] bg-emerald-50 p-4">
              <div className="gp-metric-label mb-2">Renewables</div>
              <div className="text-2xl font-black tracking-[-0.04em] text-emerald-700">
                {renewablesPct.toFixed(0)}
                <span className="text-xs font-medium">%</span>
              </div>
            </div>
          </div>
        )}

        {countryFlows.length > 0 && (
          <div className="gp-card-subtle p-5">
            <h3 className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#505f76]">
              <ArrowRightLeft className="h-3 w-3" />
              Cross-border Flows
            </h3>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-blue-50 p-4">
                <div className="gp-metric-label mb-2">Import</div>
                <div className="text-lg font-bold text-blue-700">
                  {(totalImport / 1000).toFixed(1)}{" "}
                  <span className="text-xs font-medium">GW</span>
                </div>
              </div>
              <div className="rounded-[16px] bg-orange-50 p-4">
                <div className="gp-metric-label mb-2">Export</div>
                <div className="text-lg font-bold text-orange-600">
                  {(totalExport / 1000).toFixed(1)}{" "}
                  <span className="text-xs font-medium">GW</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {countryFlows
                .filter((f) => Math.abs(f.flow_mw) > 10)
                .sort((a, b) => Math.abs(b.flow_mw) - Math.abs(a.flow_mw))
                .slice(0, 8)
                .map((f) => {
                  const isExport = f.from_country === countryCode ? f.flow_mw > 0 : f.flow_mw < 0;
                  const partner = f.from_country === countryCode ? f.to_country : f.from_country;
                  const partnerData = COUNTRIES[partner];
                  return (
                    <div
                      key={`${f.from_country}-${f.to_country}`}
                      className="flex items-center justify-between rounded-[14px] bg-[#f9f9fb] px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-[#3d4944]">
                        {partnerData?.flag ?? ""} {partnerData?.name ?? partner}
                      </span>
                      <span
                        className={`font-medium tabular-nums ${
                          isExport ? "text-orange-600" : "text-blue-700"
                        }`}
                      >
                        {isExport ? "-" : "+"}
                        {(Math.abs(f.flow_mw) / 1000).toFixed(2)} GW
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {energyMix.length > 0 && (
          <div className="gp-card-subtle p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#505f76]">
              Energy Mix
            </h3>
            <EnergyMixDonut data={energyMix} totalGw={totalGeneration / 1000} />

            <div className="mt-5 space-y-2">
              {energyMix
                .sort((a, b) => b.percentage - a.percentage)
                .filter((m) => m.percentage > 0)
                .map((mix) => (
                  <div key={mix.source_type}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium capitalize text-[#3d4944]">
                        {mix.source_type}
                      </span>
                      <span className="font-semibold tabular-nums text-[#111827]">
                        {mix.percentage.toFixed(0)}%
                        <span className="ml-1 text-[#6d7a74]">
                          {(mix.value_mw / 1000).toFixed(1)} GW
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#edeef0]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(mix.percentage, 100)}%`,
                          backgroundColor:
                            ENERGY_SOURCE_COLORS[mix.source_type] ?? "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {energyMix.length === 0 && (
          <div className="rounded-[20px] bg-[#f3f3f5] p-5 text-center">
            <p className="text-xs text-[#6d7a74]">
              Generation data not yet available for this hour.
            </p>
            <p className="mt-1 text-[10px] text-[#bccac2]">
              Data is fetched automatically from ENTSO-E
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
