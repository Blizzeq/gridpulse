import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchGeneration as fetchFromEntsoe } from "@/lib/entsoe";

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
  const hourNum = hour ? parseInt(hour) : undefined;

  // Check Supabase cache first
  let query = supabase
    .from("generation")
    .select("source_type, value_mw")
    .eq("country", country)
    .eq("date", date);

  if (hourNum !== undefined) {
    query = query.eq("hour", hourNum);
  }

  const { data: dbData } = await query;
  const cachedRows = dbData as { source_type: string; value_mw: number }[] | null;
  const hasCache = cachedRows && cachedRows.length > 0;
  const isToday = date === new Date().toISOString().split("T")[0];

  // Return cached data if it exists AND it's not today
  if (hasCache && !isToday) {
    return NextResponse.json(aggregateBySource(cachedRows));
  }

  // Fetch fresh data from ENTSO-E
  let entsoeData: { source_type: string; hour: number; value_mw: number }[];
  try {
    entsoeData = await fetchFromEntsoe(country, date);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[gen] ENTSO-E fetch failed [${country}/${date}]: ${msg}`);
    // Fallback to cached data on error (even for today)
    if (hasCache) return NextResponse.json(aggregateBySource(cachedRows));
    return NextResponse.json([]);
  }

  if (entsoeData.length === 0) {
    // ENTSO-E returned no data — use cache as fallback
    if (hasCache) return NextResponse.json(aggregateBySource(cachedRows));
    return NextResponse.json([]);
  }

  // Cache in Supabase (best-effort, don't block response)
  const rows = entsoeData.map((g) => ({
    country,
    date,
    hour: g.hour,
    source_type: g.source_type,
    value_mw: g.value_mw,
    fetched_at: new Date().toISOString(),
  }));

  supabase
    .from("generation")
    .upsert(rows, { onConflict: "country,date,hour,source_type", ignoreDuplicates: false })
    .then(({ error }) => {
      if (error) console.error(`[gen] Supabase upsert error: ${error.message}`);
    });

  // Return filtered data
  const filtered =
    hourNum !== undefined
      ? entsoeData.filter((g) => g.hour === hourNum)
      : entsoeData;

  return NextResponse.json(aggregateBySource(filtered));
}

function aggregateBySource(data: { source_type: string; value_mw: number }[]) {
  const agg = new Map<string, number>();
  for (const row of data) {
    agg.set(row.source_type, (agg.get(row.source_type) ?? 0) + row.value_mw);
  }
  const total = Array.from(agg.values()).reduce((a, b) => a + b, 0);

  return Array.from(agg.entries())
    .map(([source_type, value_mw]) => ({
      source_type,
      value_mw: Math.round(value_mw * 100) / 100,
      percentage: total > 0 ? Math.round((value_mw / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value_mw - a.value_mw);
}
