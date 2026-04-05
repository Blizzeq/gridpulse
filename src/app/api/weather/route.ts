import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat") ?? "52.23";
  const lon = searchParams.get("lon") ?? "21.01";

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_direction_10m,shortwave_radiation,temperature_2m&forecast_days=2&timezone=Europe%2FBerlin`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
