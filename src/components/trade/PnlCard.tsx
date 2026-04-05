"use client";

import { TradeScore } from "@/types/trading";
import { Star } from "lucide-react";

interface PnlCardProps {
  score: TradeScore;
}

export function PnlCard({ score }: PnlCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Bids vs Reality
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Accepted
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {score.accepted_hours}/24
          </p>
          <p className="text-xs text-gray-400">hours</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Total P&L
          </p>
          <p
            className={`text-2xl font-bold ${
              score.total_pnl >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {score.total_pnl >= 0 ? "+" : ""}
            {score.total_pnl.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">EUR</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Rating
          </p>
          <div className="flex items-center justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < score.stars
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{score.rating}</p>
        </div>
      </div>

      {/* Per-hour results */}
      <div className="mt-6 max-h-60 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-white">
            <tr className="text-gray-500 uppercase tracking-wider">
              <th className="py-1 text-left">Hour</th>
              <th className="py-1 text-right">Your Bid</th>
              <th className="py-1 text-right">Market</th>
              <th className="py-1 text-right">P&L</th>
              <th className="py-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {score.results.map((r) => (
              <tr key={r.hour} className="border-t border-gray-50">
                <td className="py-1 font-mono text-gray-500">
                  {r.hour.toString().padStart(2, "0")}:00
                </td>
                <td className="py-1 text-right">{r.bid_price.toFixed(1)}</td>
                <td className="py-1 text-right">{r.market_price.toFixed(1)}</td>
                <td
                  className={`py-1 text-right font-medium ${
                    r.pnl >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {r.pnl >= 0 ? "+" : ""}
                  {r.pnl.toFixed(1)}
                </td>
                <td className="py-1 text-center">
                  {r.accepted ? (
                    <span className="text-emerald-500">&#10003;</span>
                  ) : (
                    <span className="text-red-400">&#10007;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
