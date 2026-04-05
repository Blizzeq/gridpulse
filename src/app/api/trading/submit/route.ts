import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bids, challenge_date, country = "PL" } = body;

  if (!bids || !Array.isArray(bids) || bids.length !== 24) {
    return NextResponse.json(
      { error: "Must provide exactly 24 bids" },
      { status: 400 }
    );
  }

  // Validate bid values
  for (const bid of bids) {
    if (bid.price < 0 || bid.price > 10000) {
      return NextResponse.json(
        { error: `Invalid price for hour ${bid.hour}: must be 0-10000 EUR/MWh` },
        { status: 400 }
      );
    }
    if (bid.volume < 0 || bid.volume > 1000) {
      return NextResponse.json(
        { error: `Invalid volume for hour ${bid.hour}: must be 0-1000 MWh` },
        { status: 400 }
      );
    }
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trades")
    .insert({
      challenge_date,
      country,
      bids,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trade_id: data.id });
}
