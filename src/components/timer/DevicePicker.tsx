"use client";

import { DEVICE_PRESETS, DevicePreset } from "@/lib/constants";
import {
  Car,
  Shirt,
  UtensilsCrossed,
  Thermometer,
  Wind,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Car,
  Shirt,
  UtensilsCrossed,
  Thermometer,
  Wind,
  Plus,
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
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {DEVICE_PRESETS.map((device) => {
        const Icon = ICONS[device.icon] ?? Wind;
        const isSelected = device.id === selectedId;

        return (
          <button
            key={device.id}
            onClick={() => onSelect(device)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center rounded-xl border p-4 min-w-[120px] transition-all",
              isSelected
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            )}
          >
            <Icon
              className={cn(
                "h-7 w-7 mb-2",
                isSelected ? "text-emerald-500" : "text-gray-500"
              )}
            />
            <span className="text-sm font-semibold text-gray-900">
              {device.name}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              {device.power_kw} kW
            </span>
            <span className="text-xs text-gray-400">{device.duration_h}h</span>
          </button>
        );
      })}

      {/* Custom device */}
      <button
        onClick={onCustom}
        className={cn(
          "flex-shrink-0 flex flex-col items-center rounded-xl border border-dashed p-4 min-w-[120px] transition-all",
          selectedId === "custom"
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 bg-white hover:bg-gray-50"
        )}
      >
        <Plus
          className={cn(
            "h-7 w-7 mb-2",
            selectedId === "custom" ? "text-emerald-500" : "text-gray-400"
          )}
        />
        <span className="text-sm font-semibold text-gray-900">Custom</span>
        <span className="text-xs text-gray-400 mt-1">Set power</span>
        <span className="text-xs text-gray-400">& time</span>
      </button>
    </div>
  );
}
