"use client";

interface HourSliderProps {
  hour: number;
  onChange: (hour: number) => void;
}

export function HourSlider({ hour, onChange }: HourSliderProps) {
  return (
    <div className="rounded-[20px] bg-white/88 p-4 shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="gp-metric-label mb-1">Temporal pulse</p>
          <p className="text-sm font-medium text-[#505f76]">
            Explore day-ahead price changes across the grid.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
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
        className="gp-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#e8e8ea]"
      />
      <div className="mt-2 flex justify-between text-[10px] font-medium text-[#6d7a74]">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}
