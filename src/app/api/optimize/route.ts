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
    today_only = false,
  } = body;

  if (!power_kw || !duration_h) {
    return NextResponse.json(
      { error: "Missing required: power_kw, duration_h" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const dates = today_only ? [today] : [today, tomorrow];

  const { data, error } = await supabase
    .from("prices")
    .select("hour, price_eur, date")
    .eq("country", country)
    .in("date", dates)
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

  const formatHour = (index: number) => {
    const dateEntry = data[index];
    if (!dateEntry) {
      const isToday = index < 24;
      return { day: isToday ? "Today" : "Tomorrow", hour: `${(index % 24).toString().padStart(2, "0")}:00` };
    }
    const isToday = dateEntry.date === today;
    return {
      day: isToday ? "Today" : "Tomorrow",
      hour: `${dateEntry.hour.toString().padStart(2, "0")}:00`,
    };
  };

  // Calculate green score from generation data
  let green_score: number | null = null;
  try {
    const bestDate = data[result.best.startIndex]?.date ?? today;
    const bestStartHour = data[result.best.startIndex]?.hour ?? 0;
    const bestEndHour = data[result.best.endIndex]?.hour ?? 23;

    const { data: genData } = await supabase
      .from("generation")
      .select("source_type, value_mw")
      .eq("country", country)
      .eq("date", bestDate)
      .gte("hour", bestStartHour)
      .lte("hour", bestEndHour);

    if (genData && genData.length > 0) {
      const renewables = ["wind", "solar", "hydro"];
      let renewableTotal = 0;
      let total = 0;
      for (const row of genData) {
        total += row.value_mw;
        if (renewables.includes(row.source_type)) {
          renewableTotal += row.value_mw;
        }
      }
      if (total > 0) {
        green_score = Math.round((renewableTotal / total) * 100);
      }
    }
  } catch {
    // Green score is optional, don't fail the request
  }

  // Format alternatives
  const alternatives = result.alternatives.map((alt) => ({
    ...alt,
    start: formatHour(alt.startIndex),
    end: formatHour(alt.endIndex),
  }));

  return NextResponse.json({
    ...result,
    alternatives,
    best_start: formatHour(result.best.startIndex),
    best_end: formatHour(result.best.endIndex),
    worst_start: formatHour(result.worst.startIndex),
    worst_end: formatHour(result.worst.endIndex),
    green_score,
    prices: data,
  });
}
