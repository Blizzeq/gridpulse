"use client";

interface HourSliderProps {
  hour: number;
  onChange: (hour: number) => void;
}

export function HourSlider({ hour, onChange }: HourSliderProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Hour</span>
        <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-0.5 rounded-full">
          {hour.toString().padStart(2, "0")}:00
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={23}
        step={1}
        value={hour}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">00:00</span>
        <span className="text-[10px] text-gray-400">06:00</span>
        <span className="text-[10px] text-gray-400">12:00</span>
        <span className="text-[10px] text-gray-400">18:00</span>
        <span className="text-[10px] text-gray-400">23:00</span>
      </div>
    </div>
  );
}
