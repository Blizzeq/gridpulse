"use client";

import { TradeScore } from "@/types/trading";
import { Star, TrendingUp, TrendingDown, Target, Award, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface ResultsViewProps {
  score: TradeScore;
  onPlayAgain: () => void;
}

export function ResultsView({ score, onPlayAgain }: ResultsViewProps) {
  const isWin = score.total_pnl > 0;

  const chartData = score.results.map((r) => ({
    hour: r.hour.toString().padStart(2, "0"),
    bid: r.bid_price,
    market: r.market_price,
    pnl: r.pnl,
    accepted: r.accepted,
  }));

  const badges = getBadges(score);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* P&L Hero */}
      <div
        className={cn(
          "animate-scale-in rounded-[24px] p-6 sm:rounded-[28px] sm:p-8",
          "flex flex-col gap-6 md:flex-row md:items-center md:justify-between",
          isWin
            ? "bg-[#f0fdf4] border border-emerald-100"
            : "bg-red-50 border border-red-100"
        )}
      >
        <div className="text-center md:text-left">
          <p className="gp-kicker mb-2">Total P&amp;L</p>
          <p
            className={cn(
              "text-4xl font-black tracking-[-0.06em] sm:text-5xl animate-count-up",
              isWin ? "text-emerald-700" : "text-red-500"
            )}
          >
            {isWin ? "+" : ""}
            {score.total_pnl.toFixed(2)} EUR
          </p>

          <div className="mt-4 flex items-center justify-center gap-1 md:justify-start">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  i < score.stars
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            <span className="ml-3 text-lg font-bold text-[#111827]">
              {score.rating}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 sm:gap-4">
          <div className="min-w-[120px] rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-center backdrop-blur-md sm:min-w-[140px] sm:px-5 sm:py-4">
            <div className="mb-1 text-xs font-medium text-[#505f76] sm:text-sm">
              Accepted
            </div>
            <div className="text-xl font-bold text-[#111827] sm:text-2xl">
              {score.accepted_hours}/24
            </div>
          </div>
          <div className="min-w-[120px] rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-center backdrop-blur-md sm:min-w-[140px] sm:px-5 sm:py-4">
            <div className="mb-1 text-xs font-medium text-[#505f76] sm:text-sm">
              Hit Rate
            </div>
            <div className="text-xl font-bold text-[#111827] sm:text-2xl">
              {Math.round((score.accepted_hours / 24) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-up delay-200">
          {badges.map((badge, i) => (
            <span
              key={badge.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm animate-scale-in",
                badge.color
              )}
              style={{ animationDelay: `${200 + i * 75}ms` }}
            >
              <span>{badge.emoji}</span>
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 animate-fade-up delay-300 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
        <div className="gp-card p-5 sm:p-8">
          <h3 className="mb-5 text-lg font-bold tracking-[-0.03em] text-[#111827] sm:text-xl">
            Your Bids vs Market Reality
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: "#6d7a74" }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#6d7a74" }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} EUR/MWh`,
                  name === "bid" ? "Your bid" : "Market price",
                ]}
                labelFormatter={(label) => `Hour ${label}:00`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(188, 202, 194, 0.3)",
                  fontSize: "11px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value) => (
                  <span className="text-[10px] text-[#505f76]">
                    {value === "bid" ? "Your bid" : "Market"}
                  </span>
                )}
              />
              <Bar
                dataKey="bid"
                fill="#93c5fd"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
              <Bar dataKey="market" radius={[3, 3, 0, 0]} maxBarSize={12}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.accepted ? "#10b981" : "#f43f5e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="gp-card p-5 sm:p-8">
          <h3 className="mb-5 text-lg font-bold tracking-[-0.03em] text-[#111827] sm:text-xl">
            Profit & Loss by Hour
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: "#6d7a74" }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#6d7a74" }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(1)} EUR`,
                  "P&L",
                ]}
                labelFormatter={(label) => `Hour ${label}:00`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(188, 202, 194, 0.3)",
                  fontSize: "11px",
                }}
              />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={14}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-5 space-y-3 border-t border-black/5 pt-5 text-sm text-[#505f76]">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>
                Best result:{" "}
                <strong className="text-[#111827]">{score.rating}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isWin ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span>
                Accepted hours:{" "}
                <strong className="text-[#111827]">
                  {score.accepted_hours}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span>
                Precision score:{" "}
                <strong className="text-[#111827]">
                  {Math.round((score.accepted_hours / 24) * 100)}%
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Play Again */}
      <button
        onClick={onPlayAgain}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,105,81,0.4)] transition-all duration-200 hover:scale-[1.01] hover:bg-[#008467]"
      >
        <RotateCcw className="h-4 w-4" />
        Play Again
      </button>
    </div>
  );
}

interface Badge {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

function getBadges(score: TradeScore): Badge[] {
  const badges: Badge[] = [];

  if (score.total_pnl > 0) {
    badges.push({
      id: "profitable",
      emoji: "💰",
      label: "Profitable",
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    });
  }

  if (score.accepted_hours === 24) {
    badges.push({
      id: "perfect_accept",
      emoji: "🎯",
      label: "Full Coverage",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    });
  }

  if (score.accepted_hours >= 20 && score.total_pnl > 0) {
    badges.push({
      id: "sniper",
      emoji: "🔫",
      label: "Sniper",
      color: "bg-purple-50 border-purple-200 text-purple-700",
    });
  }

  const bestHour = score.results.reduce((best, r) =>
    r.pnl > best.pnl ? r : best
  );
  if (bestHour.pnl > 50) {
    badges.push({
      id: "jackpot",
      emoji: "🎰",
      label: `Jackpot at ${bestHour.hour.toString().padStart(2, "0")}:00`,
      color: "bg-amber-50 border-amber-200 text-amber-700",
    });
  }

  const negativeHours = score.results.filter((r) => r.pnl < 0).length;
  if (negativeHours === 0 && score.accepted_hours > 0) {
    badges.push({
      id: "no_losses",
      emoji: "🛡️",
      label: "No Losses",
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    });
  }

  if (score.stars === 5) {
    badges.push({
      id: "master",
      emoji: "👑",
      label: "Master Trader",
      color: "bg-amber-50 border-amber-200 text-amber-700",
    });
  }

  return badges.slice(0, 4);
}
