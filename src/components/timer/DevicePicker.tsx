"use client";

import { useState, useRef, useEffect } from "react";
import { DEVICE_PRESETS, DEVICE_CATEGORIES, DevicePreset, DeviceCategory } from "@/lib/constants";
import {
  Car,
  Shirt,
  UtensilsCrossed,
  Thermometer,
  Wind,
  Plus,
  CookingPot,
  Snowflake,
  Flame,
  Waves,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Car,
  Shirt,
  UtensilsCrossed,
  Thermometer,
  Wind,
  Plus,
  CookingPot,
  Snowflake,
  Flame,
  Waves,
  Monitor,
};

interface DevicePickerProps {
  selectedId: string;
  onSelect: (device: DevicePreset) => void;
  onCustom: () => void;
}

export function DevicePicker({
  selectedId,
  onSelect,
  onCustom,
}: DevicePickerProps) {
  const [category, setCategory] = useState<DeviceCategory>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filtered =
    category === "all"
      ? DEVICE_PRESETS
      : DEVICE_PRESETS.filter((d) => d.category === category);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el?.removeEventListener("scroll", updateScrollState);
  }, [category]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-5">
      {/* Category filters + scroll arrows */}
      <div className="flex items-center justify-between gap-3">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {DEVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all",
                category === cat.id
                  ? "bg-primary text-white"
                  : "bg-[#e8e8ea] text-[#505f76] hover:bg-[#e2e2e4]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
              canScrollLeft
                ? "border-[#bccac2] bg-white text-[#505f76] hover:bg-[#f3f3f5]"
                : "border-transparent bg-[#f3f3f5] text-[#bccac2]"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
              canScrollRight
                ? "border-[#bccac2] bg-white text-[#505f76] hover:bg-[#f3f3f5]"
                : "border-transparent bg-[#f3f3f5] text-[#bccac2]"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Devices scroll */}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:-mx-1 sm:flex sm:gap-4 sm:px-1"
      >
        {filtered.map((device) => {
          const Icon = ICONS[device.icon] ?? Wind;
          const isSelected = device.id === selectedId;

          return (
            <button
              key={device.id}
              onClick={() => onSelect(device)}
              className={cn(
                "min-w-[160px] flex-shrink-0 snap-start rounded-[20px] border p-4 text-left transition-all sm:min-w-[180px] sm:p-5",
                isSelected
                  ? "border-primary bg-[#f5fff8] shadow-[0_18px_50px_-36px_rgba(17,24,39,0.7)]"
                  : "border-transparent bg-[#f3f3f5] hover:bg-[#e8e8ea]"
              )}
            >
              <Icon
                className={cn(
                  "mb-3 h-5 w-5 sm:mb-4",
                  isSelected ? "text-primary" : "text-[#505f76]"
                )}
              />
              <span className="block text-sm font-bold leading-tight text-[#111827]">
                {device.name}
              </span>
              <span className="mt-1 block text-xs text-[#505f76]">
                {device.power_kw} kW · {device.duration_h}h
              </span>
            </button>
          );
        })}

        <button
          onClick={onCustom}
          className={cn(
            "min-w-[160px] flex-shrink-0 snap-start rounded-[20px] border border-dashed p-4 text-left transition-all sm:min-w-[180px] sm:p-5",
            selectedId === "custom"
              ? "border-primary bg-[#f5fff8]"
              : "border-[#bccac2] bg-white hover:bg-[#f9f9fb]"
          )}
        >
          <Plus
            className={cn(
              "mb-3 h-5 w-5 sm:mb-4",
              selectedId === "custom" ? "text-primary" : "text-[#6d7a74]"
            )}
          />
          <span className="block text-sm font-bold text-[#111827]">Custom</span>
          <span className="mt-1 block text-xs text-[#505f76]">Set power & time</span>
        </button>
      </div>
    </div>
  );
}
