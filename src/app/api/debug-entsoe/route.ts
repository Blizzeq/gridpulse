import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";
import { XMLParser } from "fast-xml-parser";

const BASE_URL = "https://web-api.tp.entsoe.eu/api";

function getParser() {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
  });
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:T]/g, "").slice(0, 12);
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function GET(request: NextRequest) {
  const token = process.env.ENTSOE_API_TOKEN;
  if (!token) return NextResponse.json({ error: "no token" });

  const countryCode = request.nextUrl.searchParams.get("country") ?? "PL";
  const country = COUNTRIES[countryCode];
  if (!country) return NextResponse.json({ error: "unknown country" });

  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const d = new Date(date + "T00:00:00Z");
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + 1);
  const start = formatDate(d);
  const end = formatDate(next);

  const results: Record<string, unknown> = {
    country: countryCode,
    eicCode: country.eicCode,
    date,
    periodStart: start,
    periodEnd: end,
  };

  // Step 1: Raw fetch A75
  try {
    const url = `${BASE_URL}?securityToken=${token}&documentType=A75&processType=A16&in_Domain=${encodeURIComponent(country.eicCode)}&periodStart=${start}&periodEnd=${end}`;
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/xml" } });
    const text = await res.text();
    results.raw_status = res.status;
    results.raw_length = text.length;

    if (res.ok) {
      // Step 2: Parse XML
      const doc = getParser().parse(text);
      const timeSeries = asArray(doc?.GL_MarketDocument?.TimeSeries);
      results.timeSeries_count = timeSeries.length;

      if (timeSeries.length > 0) {
        const first = timeSeries[0];
        results.first_ts_psrType = first?.MktPSRType?.psrType;
        const periods = asArray(first?.Period);
        results.first_ts_periods = periods.length;
        if (periods.length > 0) {
          results.first_period_resolution = periods[0]?.resolution;
          const points = asArray(periods[0]?.Point);
          results.first_period_points = points.length;
          if (points.length > 0) {
            results.first_point = points[0];
          }
        }
      }

      // Check if doc keys are as expected
      results.doc_keys = Object.keys(doc ?? {});
      if (doc?.GL_MarketDocument) {
        results.doc_sub_keys = Object.keys(doc.GL_MarketDocument);
      }
    } else {
      results.raw_snippet = text.slice(0, 300);
    }
  } catch (e) {
    results.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}
