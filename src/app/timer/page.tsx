"use client";

import { useState } from "react";
import { PriceMonitor } from "@/components/timer/PriceMonitor";
import { BillCalculator } from "@/components/timer/BillCalculator";
import { Scheduler } from "@/components/timer/Scheduler";
import { COUNTRIES, COUNTRY_LIST } from "@/lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "monitor", label: "Live Prices" },
  { id: "calculator", label: "Bill Calculator" },
  { id: "scheduler", label: "Scheduler" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TimerPage() {
  const [country, setCountry] = useState("PL");
  const [activeTab, setActiveTab] = useState<TabId>("monitor");
  const countryData = COUNTRIES[country];

  return (
    <div className="gp-shell py-10 sm:py-12 lg:py-16">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 animate-fade-up md:flex-row md:items-end md:justify-between lg:mb-12">
        <div className="space-y-3">
          <p className="gp-kicker">Energy Monitor</p>
          <h1 className="text-[2rem] font-bold tracking-[-0.04em] text-[#111827] sm:text-[2.4rem]">
            Energy Monitor
          </h1>
          <p className="max-w-xl text-base leading-8 text-[#505f76]">
            Real-time prices, cost estimates, and smart scheduling. Precision
            tools for a sustainable digital grid.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:flex-col md:items-end">
          <Select value={country} onValueChange={(v) => v && setCountry(v)}>
            <SelectTrigger className="min-w-[200px] rounded-full border-white/70 bg-white px-4 py-3 text-sm font-medium text-[#111827] shadow-[0_24px_70px_-52px_rgba(17,24,39,0.7)] hover:bg-[#f3f3f5]">
              <SelectValue>
                {countryData
                  ? `${countryData.flag} ${countryData.name}`
                  : country}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[320px] rounded-2xl border border-white/60 bg-white p-1 shadow-[0_24px_70px_-52px_rgba(17,24,39,0.7)]">
              {COUNTRY_LIST.map((c) => (
                <SelectItem key={c.code} value={c.code} className="rounded-lg">
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-full bg-[#e8e8ea] p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:px-5",
                  activeTab === tab.id
                    ? "bg-white text-[#111827] shadow-[0_16px_40px_-34px_rgba(17,24,39,0.8)]"
                    : "text-[#505f76] hover:text-[#111827]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content with key for re-mount animation */}
      <div key={activeTab} className="animate-fade-up">
        {activeTab === "monitor" && <PriceMonitor country={country} />}
        {activeTab === "calculator" && <BillCalculator country={country} />}
        {activeTab === "scheduler" && <Scheduler country={country} />}
      </div>
    </div>
  );
}
