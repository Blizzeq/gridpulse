import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchPrices as fetchFromEntsoe } from "@/lib/entsoe";

type SupabaseInstance = Awaited<ReturnType<typeof createClient>>;

interface PriceRow {
  hour: number;
  price_eur: number;
  date: string;
}

function isToday(date: string): boolean {
  return date === new Date().toISOString().split("T")[0];
}

async function ensurePrices(
  supabase: SupabaseInstance,
  country: string,
  date: string
): Promise<PriceRow[]> {
  const { data, error } = await supabase
    .from("prices")
    .select("hour, price_eur, date")
    .eq("country", country)
    .eq("date", date)
    .order("hour");

  const cached = (!error && data && data.length > 0) ? data as PriceRow[] : null;

  // For today: refetch if we have fewer than 24 hours of data
  // Day-ahead prices are published around 12:00 CET for next day,
  // so today's data should have all 24 hours if available at all
  const needsRefresh = !cached || (isToday(date) && cached.length < 24);

  if (!needsRefresh) return cached;

  try {
    const entsoeData = await fetchFromEntsoe(country, date);
    if (entsoeData.length === 0) return cached ?? [];

    const rows = entsoeData.map((p) => ({
      country,
      date,
      hour: p.hour,
      price_eur: p.price_eur,
      fetched_at: new Date().toISOString(),
    }));

    await supabase.from("prices").upsert(rows, {
      onConflict: "country,date,hour",
      ignoreDuplicates: false,
    });

    return entsoeData as PriceRow[];
  } catch (e) {
    console.error(`ENTSO-E fetch failed for ${country}/${date}:`, e);
    return cached ?? [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const date = searchParams.get("date");
  const hour = searchParams.get("hour");

  const supabase = await createClient();

  // All countries for one hour (map view)
  if (date && hour && !country) {
    const { data, error } = await supabase
      .from("prices")
      .select("country, price_eur")
      .eq("date", date)
      .eq("hour", parseInt(hour));

    // If no data at all, try to fetch for a few key countries to seed
    if ((!data || data.length === 0) && !error) {
      const keyCodes = [
        "DE", "FR", "PL", "ES", "IT_N", "NL", "BE", "AT", "CZ",
        "CH", "DK1", "DK2", "SE1", "SE3", "SE4", "NO1", "NO2",
        "FI", "PT", "GR", "RO", "HU", "BG", "SK", "HR", "SI",
        "EE", "LT", "LV",
      ];
      await Promise.allSettled(
        keyCodes.map((c) => ensurePrices(supabase, c, date))
      );

      // Re-query
      const { data: freshData } = await supabase
        .from("prices")
        .select("country, price_eur")
        .eq("date", date)
        .eq("hour", parseInt(hour));

      if (freshData && freshData.length > 0) {
        return buildAllCountriesResponse(supabase, freshData, date, parseInt(hour));
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return buildAllCountriesResponse(supabase, data ?? [], date, parseInt(hour));
  }

  // Country + date range
  const dateTo = searchParams.get("date_to");
  if (country && date && dateTo) {
    const { data, error } = await supabase
      .from("prices")
      .select("*")
      .eq("country", country)
      .gte("date", date)
      .lte("date", dateTo)
      .order("date")
      .order("hour");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Try to fill missing days
    if (!data || data.length === 0) {
      const result = await ensurePrices(supabase, country, date);
      return NextResponse.json(
        result.map((r) => ({
          country,
          date: r.date,
          hour: r.hour,
          price_eur: r.price_eur,
        }))
      );
    }
    return NextResponse.json(data);
  }

  // Country + date: hourly prices
  if (country && date) {
    const result = await ensurePrices(supabase, country, date);
    return NextResponse.json(
      result.map((r) => ({
        country,
        date: r.date ?? date,
        hour: r.hour,
        price_eur: r.price_eur,
      }))
    );
  }

  return NextResponse.json(
    { error: "Missing required parameters: country+date or date+hour" },
    { status: 400 }
  );
}

async function buildAllCountriesResponse(
  supabase: SupabaseInstance,
  data: { country: string; price_eur: number }[],
  date: string,
  hour: number
) {
  // Calculate change vs yesterday
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate = yesterday.toISOString().split("T")[0];

  const { data: yData } = await supabase
    .from("prices")
    .select("country, price_eur")
    .eq("date", yDate)
    .eq("hour", hour);

  const yMap = new Map<string, number>();
  if (yData) {
    for (const p of yData) {
      yMap.set(p.country as string, p.price_eur as number);
    }
  }

  const result = data.map((p) => {
    const yPrice = yMap.get(p.country);
    return {
      country: p.country,
      price_eur: p.price_eur,
      change_pct:
        yPrice != null && yPrice !== 0
          ? ((p.price_eur - yPrice) / Math.abs(yPrice)) * 100
          : null,
    };
  });

  return NextResponse.json(result);
}
