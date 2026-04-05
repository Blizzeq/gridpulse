import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findOptimalWindows } from "@/lib/optimizer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    country = "PL",
    power_kw,
    duration_h,
    exclude_night = false,
  } = body;

  if (!power_kw || !duration_h) {
    return NextResponse.json(
      { error: "Missing required: power_kw, duration_h" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Get today and tomorrow prices
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("prices")
    .select("hour, price_eur, date")
    .eq("country", country)
    .in("date", [today, tomorrow])
    .order("date")
    .order("hour");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "No price data available" },
      { status: 404 }
    );
  }

  const prices = data.map((d) => d.price_eur);
  const result = findOptimalWindows(prices, duration_h, power_kw, exclude_night);

  // Add formatted time info
  const formatHour = (index: number) => {
    const isToday = index < 24;
    const hour = index % 24;
    return {
      day: isToday ? "Today" : "Tomorrow",
      hour: `${hour.toString().padStart(2, "0")}:00`,
    };
  };

  return NextResponse.json({
    ...result,
    best_start: formatHour(result.best.startIndex),
    best_end: formatHour(result.best.endIndex),
    worst_start: formatHour(result.worst.startIndex),
    worst_end: formatHour(result.worst.endIndex),
    prices: data,
  });
}
