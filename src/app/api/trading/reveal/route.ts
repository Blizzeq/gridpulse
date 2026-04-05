import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreTrade } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { trade_id } = body;

  if (!trade_id) {
    return NextResponse.json(
      { error: "Missing trade_id" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Get the trade
  const { data: trade, error: tradeError } = await supabase
    .from("trades")
    .select("*")
    .eq("id", trade_id)
    .single();

  if (tradeError || !trade) {
    return NextResponse.json(
      { error: "Trade not found" },
      { status: 404 }
    );
  }

  // Get actual prices for that day
  const { data: prices, error: priceError } = await supabase
    .from("prices")
    .select("*")
    .eq("country", trade.country)
    .eq("date", trade.challenge_date)
    .order("hour");

  if (priceError || !prices || prices.length === 0) {
    return NextResponse.json(
      { error: "Price data not available for this challenge" },
      { status: 404 }
    );
  }

  const score = scoreTrade(trade.bids, prices);

  // Update trade with P&L
  await supabase
    .from("trades")
    .update({
      pnl: score.total_pnl,
      score: score.stars,
    })
    .eq("id", trade_id);

  return NextResponse.json(score);
}
