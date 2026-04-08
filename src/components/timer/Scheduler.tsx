"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DevicePicker } from "./DevicePicker";
import { PriceChart } from "./PriceChart";
import { CostComparison } from "./CostComparison";
import { TimePreferences } from "./TimePreferences";
import { DEVICE_PRESETS, DevicePreset } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SchedulerProps {
  country: string;
}

export function Scheduler({ country }: SchedulerProps) {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(
    DEVICE_PRESETS[0]
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [customPower, setCustomPower] = useState("2");
  const [customDuration, setCustomDuration] = useState("2");
  const [excludeNight, setExcludeNight] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);

  const { data: optimResult } = useQuery({
    queryKey: [
      "optimize",
      country,
      selectedDevice.power_kw,
      selectedDevice.duration_h,
      excludeNight,
      todayOnly,
    ],
    queryFn: async () => {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          power_kw: selectedDevice.power_kw,
          duration_h: selectedDevice.duration_h,
          exclude_night: excludeNight,
          today_only: todayOnly,
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
        category: "other",
      });
      setCustomOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="gp-card p-6 sm:p-8">
        <div className="mb-8">
          <p className="gp-kicker mb-2">Load scheduler</p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#111827]">
            Pick a device to find the cheapest hours to run it.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#505f76]">
            The optimizer compares current and projected prices, then suggests
            the cheapest operating window for the selected device profile.
          </p>
        </div>

        <DevicePicker
          selectedId={selectedDevice.id}
          onSelect={setSelectedDevice}
          onCustom={() => setCustomOpen(true)}
        />

        <div className="mt-6">
          <TimePreferences
            excludeNight={excludeNight}
            onExcludeNightChange={setExcludeNight}
            todayOnly={todayOnly}
            onTodayOnlyChange={setTodayOnly}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {prices.length > 0 ? (
          <PriceChart
            prices={prices}
            bestWindow={optimResult?.best ?? null}
            worstWindow={optimResult?.worst ?? null}
          />
        ) : (
          <div className="gp-card p-8 text-sm text-[#6d7a74]">Calculating the current scheduling window...</div>
        )}

        {optimResult ? (
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)] lg:self-start">
            <CostComparison
              result={optimResult}
              bestStart={optimResult.best_start}
              bestEnd={optimResult.best_end}
              worstStart={optimResult.worst_start}
              worstEnd={optimResult.worst_end}
              alternatives={optimResult.alternatives}
              greenScore={optimResult.green_score}
              deviceName={selectedDevice.name}
            />
          </div>
        ) : (
          <div className="gp-card p-8 text-sm text-[#6d7a74]">Optimizer results will appear here.</div>
        )}
      </div>

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
            <Button
              onClick={handleCustomSubmit}
              className="w-full bg-primary hover:bg-[#008467]"
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
