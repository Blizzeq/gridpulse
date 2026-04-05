"use client";

import { COUNTRIES } from "@/lib/countries";
import { CountryPrice, EnergyMix } from "@/types/energy";
import { getPriceTierColor } from "@/types/energy";
import { EnergyMixDonut } from "./EnergyMixDonut";
import { X } from "lucide-react";

interface CountryPanelProps {
  countryCode: string;
  price: CountryPrice | undefined;
  energyMix: EnergyMix[];
  onClose: () => void;
}

export function CountryPanel({
  countryCode,
  price,
  energyMix,
  onClose,
}: CountryPanelProps) {
  const country = COUNTRIES[countryCode];
  if (!country) return null;

  const totalGeneration = energyMix.reduce((sum, m) => sum + m.value_mw, 0);

  return (
    <div className="bg-white border-l border-gray-200 p-6 h-full overflow-y-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {country.flag} {country.name}
          </h2>
          {price && (
            <>
              <div
                className="text-3xl font-bold mt-2"
                style={{ color: getPriceTierColor(price.price_eur) }}
              >
                {price.price_eur.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  EUR/MWh
                </span>
              </div>
              {price.change_pct !== null && (
                <div
                  className={`text-sm mt-1 ${
                    price.change_pct >= 0 ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  {price.change_pct >= 0 ? "+" : ""}
                  {price.change_pct.toFixed(1)}% vs yesterday
                </div>
              )}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Energy Mix */}
      {energyMix.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Energy Mix
          </h3>
          <EnergyMixDonut data={energyMix} totalGw={totalGeneration / 1000} />

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            {energyMix
              .sort((a, b) => b.percentage - a.percentage)
              .map((mix) => (
                <span
                  key={mix.source_type}
                  className="inline-flex items-center text-xs text-gray-600"
                >
                  <span
                    className="w-2 h-2 rounded-full mr-1.5 inline-block"
                    style={{
                      backgroundColor:
                        {
                          wind: "#22c55e",
                          solar: "#facc15",
                          gas: "#f97316",
                          coal: "#78716c",
                          nuclear: "#8b5cf6",
                          hydro: "#3b82f6",
                          other: "#94a3b8",
                        }[mix.source_type] ?? "#94a3b8",
                    }}
                  />
                  {mix.source_type.charAt(0).toUpperCase() +
                    mix.source_type.slice(1)}{" "}
                  {mix.percentage.toFixed(0)}%
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
