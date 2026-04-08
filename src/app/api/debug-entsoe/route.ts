import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://web-api.tp.entsoe.eu/api";
const PL_EIC = "10YPL-AREA-----S";

export async function GET(request: NextRequest) {
  const token = process.env.ENTSOE_API_TOKEN;
  if (!token) return NextResponse.json({ error: "no token" });

  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const d = new Date(date + "T00:00:00Z");
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + 1);
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:T]/g, "").slice(0, 12);

  const results: Record<string, unknown> = { date, token: token.slice(0, 4) + "..." };

  // Test A44 (prices - known to work)
  try {
    const url = `${BASE_URL}?securityToken=${token}&documentType=A44&in_Domain=${PL_EIC}&out_Domain=${PL_EIC}&periodStart=${fmt(d)}&periodEnd=${fmt(next)}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    results.A44_prices = { status: res.status, length: text.length, snippet: text.slice(0, 200) };
  } catch (e) {
    results.A44_prices = { error: String(e) };
  }

  // Test A75 (actual generation)
  try {
    const url = `${BASE_URL}?securityToken=${token}&documentType=A75&processType=A16&in_Domain=${PL_EIC}&periodStart=${fmt(d)}&periodEnd=${fmt(next)}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    results.A75_generation = { status: res.status, length: text.length, snippet: text.slice(0, 300) };
  } catch (e) {
    results.A75_generation = { error: String(e) };
  }

  // Test A69 (wind/solar forecast)
  try {
    const url = `${BASE_URL}?securityToken=${token}&documentType=A69&processType=A01&in_Domain=${PL_EIC}&periodStart=${fmt(d)}&periodEnd=${fmt(next)}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    results.A69_forecast = { status: res.status, length: text.length, snippet: text.slice(0, 300) };
  } catch (e) {
    results.A69_forecast = { error: String(e) };
  }

  return NextResponse.json(results);
}
