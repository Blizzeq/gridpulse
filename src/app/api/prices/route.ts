import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const date = searchParams.get("date");
  const hour = searchParams.get("hour");

  const supabase = await createClient();

  // If hour provided but no country: return all countries for that hour (map view)
  if (date && hour && !country) {
    const { data, error } = await supabase
      .from("prices")
      .select("country, price_eur")
      .eq("date", date)
      .eq("hour", parseInt(hour));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate change vs yesterday
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];

    const { data: yData } = await supabase
      .from("prices")
      .select("country, price_eur")
      .eq("date", yDate)
      .eq("hour", parseInt(hour));

    const yMap = new Map(yData?.map((p) => [p.country, p.price_eur]) ?? []);

    const result = data?.map((p) => {
      const yPrice = yMap.get(p.country);
      return {
        country: p.country,
        price_eur: p.price_eur,
        change_pct: yPrice ? ((p.price_eur - yPrice) / yPrice) * 100 : null,
      };
    });

    return NextResponse.json(result);
  }

  // Country + date range: return multi-day prices
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
    return NextResponse.json(data);
  }

  // Country + date: return hourly prices
  if (country && date) {
    const { data, error } = await supabase
      .from("prices")
      .select("*")
      .eq("country", country)
      .eq("date", date)
      .order("hour");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  return NextResponse.json(
    { error: "Missing required parameters: country+date or date+hour" },
    { status: 400 }
  );
}
