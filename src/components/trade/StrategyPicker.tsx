"use client";

import { Bid } from "@/types/trading";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface StrategyPickerProps {
  onApply: (bids: Bid[]) => void;
  disabled?: boolean;
  historyAvg?: number;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  emoji: string;
  generate: (avg: number) => Bid[];
}

const STRATEGIES: Strategy[] = [
  {
    id: "night_buyer",
    name: "Night Owl",
    emoji: "🌙",
    description: "Bid high at night (cheap), skip daytime peaks",
    generate: (avg) =>
      Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        price: h >= 22 || h < 6 ? Math.round(avg * 1.5) : 0,
        volume: h >= 22 || h < 6 ? 15 : 0,
      })),
  },
  {
    id: "peak_shaver",
    name: "Peak Shaver",
    emoji: "📉",
    description: "Low bids during peak hours, moderate elsewhere",
    generate: (avg) =>
      Array.from({ length: 24 }, (_, h) => {
        const isPeak = h >= 17 && h <= 21;
        const isMid = h >= 8 && h <= 16;
        return {
          hour: h,
          price: isPeak
            ? Math.round(avg * 0.5)
            : isMid
            ? Math.round(avg * 0.9)
            : Math.round(avg * 1.2),
          volume: 10,
        };
      }),
  },
  {
    id: "midday_solar",
    name: "Solar Surfer",
    emoji: "☀️",
    description: "Bet on cheap solar hours (10-15), skip morning/evening",
    generate: (avg) =>
      Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        price: h >= 10 && h <= 15 ? Math.round(avg * 1.3) : Math.round(avg * 0.6),
        volume: h >= 10 && h <= 15 ? 20 : 5,
      })),
  },
  {
    id: "all_in",
    name: "All In",
    emoji: "🎰",
    description: "Max bid on every hour - accept all, hope for profit",
    generate: (avg) =>
      Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        price: Math.round(avg * 2),
        volume: 10,
      })),
  },
  {
    id: "contrarian",
    name: "Contrarian",
    emoji: "🔄",
    description: "Bid opposite to typical patterns - high at off-peak, low at peak",
    generate: (avg) =>
      Array.from({ length: 24 }, (_, h) => {
        const typicalCheap = h >= 1 && h <= 5;
        const typicalExpensive = h >= 17 && h <= 20;
        return {
          hour: h,
          price: typicalCheap
            ? Math.round(avg * 0.3)
            : typicalExpensive
            ? Math.round(avg * 1.5)
            : Math.round(avg),
          volume: 10,
        };
      }),
  },
  {
    id: "random",
    name: "Chaos",
    emoji: "🎲",
    description: "Random prices and volumes - pure luck",
    generate: (avg) =>
      Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        price: Math.round((avg * 0.3 + Math.random() * avg * 1.4) * 10) / 10,
        volume: Math.round(5 + Math.random() * 15),
      })),
  },
];

export function StrategyPicker({ onApply, disabled, historyAvg }: StrategyPickerProps) {
  const avg = historyAvg ?? 80;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="gp-kicker mb-2">Optional presets</p>
          <h3 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            Select trading strategy
          </h3>
        </div>
        <div className="flex gap-1.5">
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

      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:-mx-1 sm:px-1"
      >
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => onApply(s.generate(avg))}
            disabled={disabled}
            className={cn(
              "w-52 flex-none snap-start rounded-[20px] border p-5 text-left transition-all sm:w-56 sm:p-6",
              disabled
                ? "cursor-not-allowed border-[#e8e8ea] bg-white opacity-50"
                : "border-white/70 bg-white shadow-[0_24px_70px_-52px_rgba(17,24,39,0.55)] hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_80px_-52px_rgba(17,24,39,0.65)]"
            )}
          >
            <span className="mb-4 block text-2xl">{s.emoji}</span>
            <div>
              <p className="text-sm font-bold text-[#111827]">{s.name}</p>
              <p className="mt-2 text-xs leading-6 text-[#505f76]">
                {s.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
