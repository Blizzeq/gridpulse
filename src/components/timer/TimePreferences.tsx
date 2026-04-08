"use client";

import { Moon, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePreferencesProps {
  excludeNight: boolean;
  onExcludeNightChange: (v: boolean) => void;
  todayOnly: boolean;
  onTodayOnlyChange: (v: boolean) => void;
}

export function TimePreferences({
  excludeNight,
  onExcludeNightChange,
  todayOnly,
  onTodayOnlyChange,
}: TimePreferencesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ToggleChip
        icon={Moon}
        label="Exclude night (00-06)"
        active={excludeNight}
        onClick={() => onExcludeNightChange(!excludeNight)}
      />
      <ToggleChip
        icon={CalendarDays}
        label="Today only"
        active={todayOnly}
        onClick={() => onTodayOnlyChange(!todayOnly)}
      />
    </div>
  );
}

function ToggleChip({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-transparent bg-[#f3f3f5] text-[#505f76] hover:bg-[#e8e8ea]"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
