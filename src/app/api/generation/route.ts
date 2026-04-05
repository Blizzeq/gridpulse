import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const date = searchParams.get("date");
  const hour = searchParams.get("hour");

  if (!country || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: country, date" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  let query = supabase
    .from("generation")
    .select("source_type, value_mw")
    .eq("country", country)
    .eq("date", date);

  if (hour) {
    query = query.eq("hour", parseInt(hour));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate by source_type if no specific hour
  const aggregated = new Map<string, number>();
  data?.forEach((row) => {
    const prev = aggregated.get(row.source_type) ?? 0;
    aggregated.set(row.source_type, prev + row.value_mw);
  });

  const total = Array.from(aggregated.values()).reduce((a, b) => a + b, 0);

  const result = Array.from(aggregated.entries()).map(([source_type, value_mw]) => ({
    source_type,
    value_mw: Math.round(value_mw * 100) / 100,
    percentage: total > 0 ? Math.round((value_mw / total) * 1000) / 10 : 0,
  }));

  return NextResponse.json(result);
}
