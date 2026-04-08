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

  // Check Supabase first
  let query = supabase
    .from("generation")
    .select("source_type, value_mw")
    .eq("country", country)
    .eq("date", date);

  if (hourNum !== undefined) {
    query = query.eq("hour", hourNum);
  }

  const { data: dbData } = await query;
  const isToday = date === new Date().toISOString().split("T")[0];

  // Return cached data only if it exists AND it's not today
  // (today's generation data updates throughout the day)
  if (dbData && dbData.length > 0 && !isToday) {
    return NextResponse.json(
      aggregateBySource(dbData as { source_type: string; value_mw: number }[])
    );
  }

  // Fetch from ENTSO-E
  let entsoeData: { source_type: string; hour: number; value_mw: number }[];
  try {
    console.log(`[gen] Fetching ENTSO-E for ${country}/${date} hour=${hourNum}`);
    entsoeData = await fetchFromEntsoe(country, date);
    console.log(`[gen] ENTSO-E returned ${entsoeData.length} rows for ${country}/${date}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.stack ?? e.message : String(e);
    console.error(`ENTSO-E generation error [${country}/${date}]: ${msg}`);
    return NextResponse.json([]);
  }

  if (entsoeData.length === 0) {
    console.log(`[gen] No ENTSO-E data for ${country}/${date} (hour=${hourNum})`);
    return NextResponse.json([]);
  }

  // Cache in Supabase (best-effort)
  const rows = entsoeData.map((g) => ({
    country,
    date,
    hour: g.hour,
    source_type: g.source_type,
    value_mw: g.value_mw,
    fetched_at: new Date().toISOString(),
  }));

  const { error: upsertErr } = await supabase
    .from("generation")
    .upsert(rows, { onConflict: "country,date,hour,source_type", ignoreDuplicates: false });
  if (upsertErr) {
    await supabase.from("generation").insert(rows);
  }

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
