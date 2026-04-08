"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { BidChart } from "@/components/trade/BidChart";
import { StrategyPicker } from "@/components/trade/StrategyPicker";
import { ResultsView } from "@/components/trade/ResultsView";
import { useSubmitBids, useRevealTrade } from "@/hooks/useTrading";
import { useQuery } from "@tanstack/react-query";
import { Bid, TradeScore } from "@/types/trading";
import { Button } from "@/components/ui/button";
import { COUNTRIES, COUNTRY_LIST } from "@/lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";

type Difficulty = "easy" | "hard";

const DIFFICULTY_CONFIG = {
  easy: { label: "Normal", daysAgo: { min: 3, max: 15 } },
  hard: { label: "Hard", daysAgo: { min: 15, max: 60 } },
};

function pickChallengeDate(difficulty: Difficulty): string {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const daysAgo =
    cfg.daysAgo.min +
    Math.floor(Math.random() * (cfg.daysAgo.max - cfg.daysAgo.min));
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

// Stable initial date (7 days ago) to avoid SSR/client mismatch
function getStableInitialDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0];
}

export default function TradePage() {
  const [country, setCountry] = useState("PL");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [challengeDate, setChallengeDate] = useState(getStableInitialDate);
  const [bids, setBids] = useState<Bid[]>(
    Array.from({ length: 24 }, (_, i) => ({ hour: i, price: 0, volume: 10 }))
  );
  const [tradeResult, setTradeResult] = useState<TradeScore | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [revealing, setRevealing] = useState(false);

  // Randomize challenge date on mount (client only)
  useEffect(() => {
    setChallengeDate(pickChallengeDate("easy"));
  }, []);

  const submitMutation = useSubmitBids();
  const revealMutation = useRevealTrade();

  const countryData = COUNTRIES[country];

  const contextRange = useMemo(() => {
    const end = new Date(challengeDate);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }, [challengeDate]);

  const { data: historyPrices = [] } = useQuery({
    queryKey: ["prices-history", country, contextRange.start, contextRange.end],
    queryFn: async () => {
      const res = await fetch(
        `/api/prices?country=${country}&date=${contextRange.start}&date_to=${contextRange.end}`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const historyAvg = useMemo(() => {
    if (historyPrices.length === 0) return undefined;
    return (
      historyPrices.reduce(
        (s: number, p: { price_eur: number }) => s + p.price_eur,
        0
      ) / historyPrices.length
    );
  }, [historyPrices]);

  const contextChartData = historyPrices.map(
    (p: { price_eur: number; hour: number; date: string }, i: number) => ({
      idx: i,
      price: p.price_eur,
    })
  );

  const handleSubmit = async () => {
    const hasAnyBid = bids.some((b) => b.price > 0);
    if (!hasAnyBid) return;

    setSubmitted(true);
    setRevealing(true);

    try {
      const { trade_id } = await submitMutation.mutateAsync({
        bids,
        challenge_date: challengeDate,
        country,
      });

      await new Promise((r) => setTimeout(r, 1500));

      const score = await revealMutation.mutateAsync(trade_id);
      setTradeResult(score);
    } catch {
      setSubmitted(false);
    } finally {
      setRevealing(false);
    }
  };

  const handlePlayAgain = useCallback(() => {
    const newDate = pickChallengeDate(difficulty);
    setChallengeDate(newDate);
    setBids(
      Array.from({ length: 24 }, (_, i) => ({ hour: i, price: 0, volume: 10 }))
    );
    setTradeResult(null);
    setSubmitted(false);
  }, [difficulty]);

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    const newDate = pickChallengeDate(d);
    setChallengeDate(newDate);
    setBids(
      Array.from({ length: 24 }, (_, i) => ({ hour: i, price: 0, volume: 10 }))
    );
    setTradeResult(null);
    setSubmitted(false);
  };

  const formatChallengeDate = new Date(challengeDate).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <div className="gp-shell space-y-8 py-10 sm:py-12 lg:py-16">
      {/* Header */}
      <section className="flex flex-col gap-6 animate-fade-up md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="gp-kicker">Trading Arena</p>
          <h1 className="text-[2rem] font-black tracking-[-0.05em] text-[#111827] sm:text-[2.5rem]">
            Trading Arena
          </h1>
          <p className="text-base font-medium text-[#505f76] sm:text-lg">
            Predict energy prices and compete for the best P&L
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={country} onValueChange={(v) => v && setCountry(v)}>
            <SelectTrigger className="min-w-[180px] rounded-xl border-white/70 bg-white px-4 py-3 text-sm font-semibold text-[#111827] shadow-[0_24px_70px_-52px_rgba(17,24,39,0.7)] sm:min-w-[220px]">
              <SelectValue>
                {countryData
                  ? `${countryData.flag} ${countryData.name}`
                  : country}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[320px] rounded-2xl border border-white/60 bg-white p-1 shadow-[0_24px_70px_-52px_rgba(17,24,39,0.7)]">
              {COUNTRY_LIST.map((c) => (
                <SelectItem key={c.code} value={c.code} className="rounded-lg">
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-xl bg-[#e8e8ea] p-1">
            {(["easy", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d)}
                disabled={submitted}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  difficulty === d
                    ? "bg-white text-[#111827] shadow-[0_16px_40px_-34px_rgba(17,24,39,0.8)]"
                    : "text-[#505f76] hover:text-[#111827]"
                )}
              >
                {DIFFICULTY_CONFIG[d].label}
              </button>
            ))}
          </div>

          <span className="rounded-xl border border-white/60 bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-[0_24px_70px_-52px_rgba(17,24,39,0.7)]">
            Challenge: {formatChallengeDate}
          </span>
        </div>
      </section>

      {/* Context chart */}
      {contextChartData.length > 0 && !tradeResult && (
        <div className="gp-card p-5 animate-fade-up delay-100 sm:p-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h3 className="text-base font-bold tracking-[-0.03em] text-[#111827] sm:text-lg">
              Market Context — 7 Days Before Challenge
            </h3>
            {historyAvg && (
              <span className="text-sm font-semibold text-[#505f76]">
                Avg: {historyAvg.toFixed(0)} EUR/MWh
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={contextChartData}>
              <XAxis dataKey="idx" hide />
              <YAxis
                tick={{ fontSize: 10, fill: "#6d7a74" }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(1)} EUR/MWh`,
                  "Price",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(188, 202, 194, 0.3)",
                  fontSize: "11px",
                }}
              />
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006951" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#006951" stopOpacity={0} />
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
                stroke="#505f76"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trading content */}
      {!tradeResult ? (
        <div className="space-y-8 animate-fade-up delay-200">
          <StrategyPicker
            onApply={setBids}
            disabled={submitted}
            historyAvg={historyAvg}
          />

          <BidChart
            bids={bids}
            onChange={setBids}
            disabled={submitted}
            historyAvg={historyAvg}
          />

          {!submitted && (
            <Button
              onClick={handleSubmit}
              disabled={
                submitMutation.isPending || !bids.some((b) => b.price > 0)
              }
              className="w-full rounded-xl bg-primary py-6 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,105,81,0.4)] transition-all duration-200 hover:scale-[1.01] hover:bg-[#008467] hover:shadow-[0_12px_32px_-8px_rgba(0,105,81,0.5)]"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Bids & Reveal Market
            </Button>
          )}

          {revealing && (
            <div className="py-6 text-center animate-fade-in">
              <div className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-lg font-semibold text-[#505f76] shadow-[0_24px_70px_-52px_rgba(17,24,39,0.7)]">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Comparing with real market data...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-up">
          <ResultsView score={tradeResult} onPlayAgain={handlePlayAgain} />
        </div>
      )}

    </div>
  );
}
