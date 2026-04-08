"use client";

import { useLeaderboard } from "@/hooks/useTrading";
import { Trophy } from "lucide-react";

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-50",
  2: "bg-gray-50",
  3: "bg-orange-50",
};

const RANK_MEDALS: Record<number, string> = {
  1: "\u{1F947}",
  2: "\u{1F948}",
  3: "\u{1F949}",
};

export function Leaderboard() {
  const { data: entries = [], isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="gp-card p-6 sm:p-8">
        <div className="text-sm text-[#6d7a74]">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="gp-card overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-black/5 px-6 py-5 sm:px-8">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">Challenge Leaderboard</h3>
      </div>

      {entries.length === 0 ? (
        <p className="px-6 py-8 text-sm text-[#6d7a74] sm:px-8">
          No trades yet. Be the first to play!
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f3f3f5] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#505f76]">
              <th className="px-6 py-4 text-left sm:px-8 w-16">Rank</th>
              <th className="px-6 py-4 text-left sm:px-8">Player</th>
              <th className="px-6 py-4 text-right sm:px-8">P&amp;L</th>
              <th className="px-6 py-4 text-right sm:px-8">Streak</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={entry.id}
                className={`border-t border-black/5 transition-colors hover:bg-[#f9f9fb] ${
                  RANK_STYLES[idx + 1] ?? ""
                }`}
              >
                <td className="px-6 py-5 sm:px-8 font-medium">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#111827] shadow-[0_18px_50px_-40px_rgba(17,24,39,0.65)]">
                    {RANK_MEDALS[idx + 1] ?? idx + 1}
                  </span>
                </td>
                <td className="px-6 py-5 font-medium text-[#111827] sm:px-8">
                  {entry.nickname}
                </td>
                <td
                  className={`px-6 py-5 text-right font-semibold sm:px-8 ${
                    entry.total_pnl >= 0 ? "text-emerald-700" : "text-red-500"
                  }`}
                >
                  {entry.total_pnl >= 0 ? "+" : ""}
                  {entry.total_pnl.toFixed(0)} EUR
                </td>
                <td className="px-6 py-5 text-right text-[#505f76] sm:px-8">
                  {entry.win_streak > 0 && (
                    <span>
                      {"🔥"} {entry.win_streak}d
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
