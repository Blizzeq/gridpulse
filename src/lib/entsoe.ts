import { XMLParser } from "fast-xml-parser";
import { COUNTRIES } from "./countries";

const BASE_URL = "https://web-api.tp.entsoe.eu/api";

function getParser() {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
  });
}

function formatDate(date: Date): string {
  // ENTSO-E expects YYYYMMDDHHmm (12 chars)
  return date.toISOString().replace(/[-:T]/g, "").slice(0, 12);
}

function periodDates(dateStr: string): { start: string; end: string } {
  const d = new Date(dateStr + "T00:00:00Z");
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + 1);
  return { start: formatDate(d), end: formatDate(next) };
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// ENTSO-E psrType -> our simplified source categories
const PSR_MAP: Record<string, string> = {
  B01: "other", // Biomass
  B02: "coal", // Fossil Brown coal/Lignite
  B03: "gas", // Fossil Coal-derived gas
  B04: "gas", // Fossil Gas
  B05: "coal", // Fossil Hard coal
  B06: "other", // Fossil Oil
  B07: "other", // Fossil Oil shale
  B08: "other", // Fossil Peat
  B09: "other", // Geothermal
  B10: "hydro", // Hydro Pumped Storage
  B11: "hydro", // Hydro Run-of-river
  B12: "hydro", // Hydro Water Reservoir
  B13: "other", // Marine
  B14: "nuclear", // Nuclear
  B15: "other", // Other renewable
  B16: "solar", // Solar
  B17: "other", // Waste
  B18: "wind", // Wind Offshore
  B19: "wind", // Wind Onshore
  B20: "other", // Other
};

async function entsoeGet(params: Record<string, string>): Promise<string> {
  const token = process.env.ENTSOE_API_TOKEN;
  if (!token) throw new Error("ENTSOE_API_TOKEN not set");
  const url = new URL(BASE_URL);
  url.searchParams.set("securityToken", token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const finalUrl = url.toString();
  const res = await fetch(finalUrl, {
    cache: "no-store",
    headers: { "Accept": "application/xml" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ENTSO-E ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.text();
}

/**
 * Fetch day-ahead prices for a country on a given date.
 * Returns array of {hour, price_eur}.
 */
export async function fetchPrices(
  countryCode: string,
  dateStr: string
): Promise<{ hour: number; price_eur: number; date: string }[]> {
  const country = COUNTRIES[countryCode];
  if (!country) return [];

  const { start, end } = periodDates(dateStr);
  const xml = await entsoeGet({
    documentType: "A44",
    in_Domain: country.eicCode,
    out_Domain: country.eicCode,
    periodStart: start,
    periodEnd: end,
  });

  const doc = getParser().parse(xml);
  const timeSeries = asArray(
    doc?.Publication_MarketDocument?.TimeSeries
  );

  const result: { hour: number; price_eur: number; date: string }[] = [];
  for (const ts of timeSeries) {
    const periods = asArray(ts?.Period);
    for (const period of periods) {
      const points = asArray(period?.Point);
      for (const pt of points) {
        const pos = parseInt(pt?.position ?? "0") - 1;
        const price = parseFloat(pt?.["price.amount"] ?? "0");
        if (!isNaN(pos) && !isNaN(price)) {
          result.push({ hour: pos, price_eur: price, date: dateStr });
        }
      }
    }
  }

  return result;
}

/**
 * Fetch actual generation per type. Falls back to forecast for future dates.
 */
export async function fetchGeneration(
  countryCode: string,
  dateStr: string,
  hour?: number
): Promise<{ source_type: string; hour: number; value_mw: number }[]> {
  const country = COUNTRIES[countryCode];
  if (!country) return [];

  const { start, end } = periodDates(dateStr);

  // Try actual generation first (A75), then installed capacity (A68), then forecast (A69)
  let xml: string;
  const errors: string[] = [];
  try {
    xml = await entsoeGet({
      documentType: "A75",
      processType: "A16",
      in_Domain: country.eicCode,
      periodStart: start,
      periodEnd: end,
    });
  } catch (e) {
    errors.push(`A75: ${e instanceof Error ? e.message.slice(0, 120) : e}`);
    // Fallback to day-ahead generation forecast (A71)
    try {
      xml = await entsoeGet({
        documentType: "A71",
        processType: "A01",
        in_Domain: country.eicCode,
        periodStart: start,
        periodEnd: end,
      });
    } catch (e2) {
      errors.push(`A71: ${e2 instanceof Error ? e2.message.slice(0, 120) : e2}`);
      // Fallback to wind+solar forecast (A69)
      try {
        xml = await entsoeGet({
          documentType: "A69",
          processType: "A01",
          in_Domain: country.eicCode,
          periodStart: start,
          periodEnd: end,
        });
      } catch (e3) {
        errors.push(`A69: ${e3 instanceof Error ? e3.message.slice(0, 120) : e3}`);
        console.error(`[entsoe-gen] All endpoints failed for ${countryCode}: ${errors.join(" | ")}`);
        return [];
      }
    }
  }

  const doc = getParser().parse(xml);
  const timeSeries = asArray(
    doc?.GL_MarketDocument?.TimeSeries
  );
  console.log(`[entsoe-gen] ${countryCode}: parsed ${timeSeries.length} TimeSeries`);

  // Step 1: Average sub-hourly to hourly PER PSR type
  const psrHourly = new Map<string, { sum: number; count: number }>();

  for (const ts of timeSeries) {
    const psrType =
      ts?.MktPSRType?.psrType ?? ts?.["MktPSRType"]?.["psrType"] ?? "B20";

    const periods = asArray(ts?.Period);
    for (const period of periods) {
      const resolution = period?.resolution ?? "PT60M";
      const points = asArray(period?.Point);

      let stepH = 1;
      if (resolution === "PT15M") stepH = 0.25;
      if (resolution === "PT30M") stepH = 0.5;

      for (const pt of points) {
        const pos = parseInt(pt?.position ?? "0") - 1;
        const qty = parseFloat(pt?.quantity ?? "0");
        const h = Math.floor(pos * stepH);

        if (hour !== undefined && h !== hour) continue;
        if (!isNaN(h) && !isNaN(qty)) {
          const key = `${psrType}:${h}`;
          const prev = psrHourly.get(key) ?? { sum: 0, count: 0 };
          psrHourly.set(key, { sum: prev.sum + qty, count: prev.count + 1 });
        }
      }
    }
  }

  // Step 2: Map PSR types to source categories and sum
  const result: { source_type: string; hour: number; value_mw: number }[] = [];
  for (const [key, { sum, count }] of psrHourly) {
    const [psrType, h] = key.split(":");
    const source = PSR_MAP[psrType] ?? "other";
    result.push({
      source_type: source,
      hour: parseInt(h),
      value_mw: Math.round((sum / count) * 100) / 100,
    });
  }

  return result;
}

/**
 * Fetch cross-border physical flows between two countries.
 */
export async function fetchFlows(
  fromCode: string,
  toCode: string,
  dateStr: string
): Promise<{ hour: number; flow_mw: number }[]> {
  const fromCountry = COUNTRIES[fromCode];
  const toCountry = COUNTRIES[toCode];
  if (!fromCountry || !toCountry) return [];

  const { start, end } = periodDates(dateStr);

  let xml: string;
  try {
    xml = await entsoeGet({
      documentType: "A11",
      in_Domain: fromCountry.eicCode,
      out_Domain: toCountry.eicCode,
      periodStart: start,
      periodEnd: end,
    });
  } catch {
    return [];
  }

  const doc = getParser().parse(xml);
  const timeSeries = asArray(
    doc?.Publication_MarketDocument?.TimeSeries
  );

  const result: { hour: number; flow_mw: number }[] = [];
  for (const ts of timeSeries) {
    const periods = asArray(ts?.Period);
    for (const period of periods) {
      const resolution = period?.resolution ?? "PT60M";
      const points = asArray(period?.Point);

      let stepH = 1;
      if (resolution === "PT15M") stepH = 0.25;
      if (resolution === "PT30M") stepH = 0.5;

      for (const pt of points) {
        const pos = parseInt(pt?.position ?? "0") - 1;
        const qty = parseFloat(pt?.quantity ?? "0");
        const h = Math.floor(pos * stepH);

        if (!isNaN(h) && !isNaN(qty)) {
          result.push({ hour: h, flow_mw: qty });
        }
      }
    }
  }

  // Aggregate sub-hourly to hourly
  const hourly = new Map<number, number>();
  for (const r of result) {
    hourly.set(r.hour, (hourly.get(r.hour) ?? 0) + r.flow_mw);
  }
  // Average if multiple points per hour
  const counts = new Map<number, number>();
  for (const r of result) {
    counts.set(r.hour, (counts.get(r.hour) ?? 0) + 1);
  }

  return Array.from(hourly.entries()).map(([hour, total]) => ({
    hour,
    flow_mw: Math.round(total / (counts.get(hour) ?? 1)),
  }));
}
