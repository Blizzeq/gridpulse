"use client";

import { useState } from "react";
import { EuropeMap } from "@/components/map/EuropeMap";
import { CountryPanel } from "@/components/map/CountryPanel";
import { HourSlider } from "@/components/map/HourSlider";
import { useAllPrices } from "@/hooks/usePrices";
import { useGeneration } from "@/hooks/useGeneration";
import { getPriceTierColor } from "@/types/energy";

export default function MapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hour, setHour] = useState(() => new Date().getHours());

  const today = new Date().toISOString().split("T")[0];

  const { data: prices = [], isLoading } = useAllPrices(today, hour);
  const { data: energyMix = [] } = useGeneration(
    selectedCountry ?? "PL",
    today,
    hour
  );

  const selectedPrice = prices.find((p) => p.country === selectedCountry);

  return (
    <div className="h-[calc(100vh-64px-48px)] flex flex-col lg:flex-row">
      {/* Map */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">Loading map data...</div>
            </div>
          ) : (
            <EuropeMap
              prices={prices}
              onCountryClick={setSelectedCountry}
              selectedCountry={selectedCountry}
            />
          )}
        </div>

        {/* Hour slider */}
        <div className="border-t border-gray-200 bg-white">
          <HourSlider hour={hour} onChange={setHour} />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 py-2 bg-white border-t border-gray-100">
          {[
            { label: "<30", price: 20 },
            { label: "30-80", price: 50 },
            { label: "80-150", price: 100 },
            { label: ">150", price: 200 },
          ].map((tier) => (
            <span key={tier.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getPriceTierColor(tier.price) }}
              />
              {tier.label}
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-2">EUR/MWh</span>
        </div>
      </div>

      {/* Country panel (sidebar) */}
      {selectedCountry && (
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white">
          <CountryPanel
            countryCode={selectedCountry}
            price={selectedPrice}
            energyMix={energyMix}
            onClose={() => setSelectedCountry(null)}
          />
        </div>
      )}
    </div>
  );
}
