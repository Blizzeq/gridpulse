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
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
        <div className="text-sm text-gray-400">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">
          No trades yet. Be the first to play!
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="py-2 text-left w-10">Rank</th>
              <th className="py-2 text-left">Player</th>
              <th className="py-2 text-right">P&L</th>
              <th className="py-2 text-right">Streak</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={entry.id}
                className={`border-t border-gray-100 ${
                  RANK_STYLES[idx + 1] ?? ""
                }`}
              >
                <td className="py-2 font-medium">
                  {RANK_MEDALS[idx + 1] ?? idx + 1}
                </td>
                <td className="py-2 font-medium text-gray-900">
                  {entry.nickname}
                </td>
                <td
                  className={`py-2 text-right font-medium ${
                    entry.total_pnl >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {entry.total_pnl >= 0 ? "+" : ""}
                  {entry.total_pnl.toFixed(0)} EUR
                </td>
                <td className="py-2 text-right text-gray-500">
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
