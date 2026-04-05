"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DevicePicker } from "@/components/timer/DevicePicker";
import { PriceChart } from "@/components/timer/PriceChart";
import { CostComparison } from "@/components/timer/CostComparison";
import { DEVICE_PRESETS, DevicePreset } from "@/lib/constants";
import { COUNTRIES, COUNTRY_LIST } from "@/lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TimerPage() {
  const [country, setCountry] = useState("PL");
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(
    DEVICE_PRESETS[0]
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [customPower, setCustomPower] = useState("2");
  const [customDuration, setCustomDuration] = useState("2");

  const { data: optimResult } = useQuery({
    queryKey: ["optimize", country, selectedDevice.power_kw, selectedDevice.duration_h],
    queryFn: async () => {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          power_kw: selectedDevice.power_kw,
          duration_h: selectedDevice.duration_h,
        }),
      });
      if (!res.ok) throw new Error("Optimization failed");
      return res.json();
    },
  });

  const prices = optimResult?.prices ?? [];

  const handleCustomSubmit = () => {
    const power = parseFloat(customPower);
    const duration = parseFloat(customDuration);
    if (power > 0 && duration > 0) {
      setSelectedDevice({
        id: "custom",
        name: "Custom",
        icon: "Plus",
        power_kw: power,
        duration_h: duration,
      });
      setCustomOpen(false);
    }
  };

  const countryData = COUNTRIES[country];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          When should I turn it on?
        </h1>
        <p className="text-base text-gray-500 mt-2">
          Find the cheapest hours based on real energy prices
        </p>

        <div className="mt-4">
          <Select value={country} onValueChange={(v) => v && setCountry(v)}>
            <SelectTrigger className="w-56">
              <SelectValue>
                {countryData
                  ? `${countryData.flag} ${countryData.name}`
                  : country}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_LIST.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Device Picker */}
      <div className="mb-8">
        <DevicePicker
          selectedId={selectedDevice.id}
          onSelect={setSelectedDevice}
          onCustom={() => setCustomOpen(true)}
        />
      </div>

      {/* Price Chart */}
      {prices.length > 0 && (
        <div className="mb-6">
          <PriceChart
            prices={prices}
            bestWindow={optimResult?.best ?? null}
            worstWindow={optimResult?.worst ?? null}
          />
        </div>
      )}

      {/* Results */}
      {optimResult && (
        <CostComparison
          result={optimResult}
          bestStart={optimResult.best_start}
          bestEnd={optimResult.best_end}
          worstStart={optimResult.worst_start}
          worstEnd={optimResult.worst_end}
        />
      )}

      {/* Custom Device Dialog */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Power (kW)
              </label>
              <Input
                type="number"
                value={customPower}
                onChange={(e) => setCustomPower(e.target.value)}
                min="0.1"
                step="0.1"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Duration (hours)
              </label>
              <Input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                min="0.5"
                step="0.5"
                className="mt-1"
              />
            </div>
            <Button onClick={handleCustomSubmit} className="w-full bg-emerald-500 hover:bg-emerald-600">
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
