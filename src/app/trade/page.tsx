"use client";

import { useState, useMemo } from "react";
import { BidTable } from "@/components/trade/BidTable";
import { PnlCard } from "@/components/trade/PnlCard";
import { Leaderboard } from "@/components/trade/Leaderboard";
import { useSubmitBids, useRevealTrade } from "@/hooks/useTrading";
import { usePrices } from "@/hooks/usePrices";
import { Bid, TradeScore } from "@/types/trading";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
} from "recharts";

export default function TradePage() {
  // Pick a random date from last 30 days for the challenge
  const [challengeDate] = useState(() => {
    const daysAgo = Math.floor(Math.random() * 25) + 3;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
  });

  const [bids, setBids] = useState<Bid[]>(
    Array.from({ length: 24 }, (_, i) => ({ hour: i, price: 0, volume: 10 }))
  );
  const [tradeResult, setTradeResult] = useState<TradeScore | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const submitMutation = useSubmitBids();
  const revealMutation = useRevealTrade();

  // Context: 7-day price history before challenge date
  const contextStart = useMemo(() => {
    const d = new Date(challengeDate);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  }, [challengeDate]);

  const { data: historyPrices = [] } = usePrices("PL", contextStart);

  const contextChartData = historyPrices.map((p, i) => ({
    idx: i,
    price: p.price_eur,
  }));

  const handleSubmit = async () => {
    const hasAnyBid = bids.some((b) => b.price > 0);
    if (!hasAnyBid) return;

    setSubmitted(true);
    setRevealing(true);

    try {
      const { trade_id } = await submitMutation.mutateAsync({
        bids,
        challenge_date: challengeDate,
        country: "PL",
      });

      // Wait for dramatic effect
      await new Promise((r) => setTimeout(r, 2000));

      const score = await revealMutation.mutateAsync(trade_id);
      setTradeResult(score);
    } catch {
      setSubmitted(false);
    } finally {
      setRevealing(false);
    }
  };

  const formatChallengeDate = new Date(challengeDate).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading Arena</h1>
          <p className="text-sm text-gray-500 mt-1">
            Daily Challenge: {formatChallengeDate} &middot; Poland
          </p>
        </div>
      </div>

      {/* Context chart */}
      {contextChartData.length > 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Market Context — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={contextChartData}>
              <XAxis dataKey="idx" hide />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d1d5db" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d1d5db" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                fill="url(#areaGrad)"
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#6b7280"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bid table or results */}
      {!tradeResult ? (
        <>
          <BidTable bids={bids} onChange={setBids} disabled={submitted} />

          {!submitted && (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-base font-semibold"
            >
              Submit Bids
            </Button>
          )}

          {revealing && (
            <div className="mt-6 text-center">
              <div className="animate-pulse text-lg font-semibold text-gray-400">
                Market closing...
              </div>
            </div>
          )}
        </>
      ) : (
        <PnlCard score={tradeResult} />
      )}

      {/* Leaderboard */}
      <div className="mt-8">
        <Leaderboard />
      </div>
    </div>
  );
}
