"use client";

import { useMutation } from "@tanstack/react-query";
import { Bid, TradeScore } from "@/types/trading";

async function submitBids(payload: {
  bids: Bid[];
  challenge_date: string;
  country: string;
}): Promise<{ trade_id: string }> {
  const res = await fetch("/api/trading/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit bids");
  return res.json();
}

async function revealTrade(tradeId: string): Promise<TradeScore> {
  const res = await fetch("/api/trading/reveal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trade_id: tradeId }),
  });
  if (!res.ok) throw new Error("Failed to reveal trade");
  return res.json();
}

export function useSubmitBids() {
  return useMutation({ mutationFn: submitBids });
}

export function useRevealTrade() {
  return useMutation({ mutationFn: revealTrade });
}
