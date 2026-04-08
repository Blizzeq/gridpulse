"""Fetch real ENTSO-E data and seed into Supabase."""

import os
import sys
from datetime import datetime, timedelta

import pandas as pd
from entsoe import EntsoePandasClient
from supabase import create_client

# Config
API_KEY = os.environ.get("ENTSOE_API_TOKEN", "2ceb3b1c-8f1f-4660-9ce5-1d49ca07bf8e")
SUPABASE_URL = os.environ.get(
    "NEXT_PUBLIC_SUPABASE_URL", "https://pfhmxiscodgkepxbavpv.supabase.co"
)
SUPABASE_KEY = os.environ.get(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmaG14aXNjb2Rna2VweGJhdnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMjU0MTEsImV4cCI6MjA5MDkwMTQxMX0.ISAWr96uKFlVGfExEosn3McedY4ZdJoQfhmRo8tqjgk",
)

# ENTSO-E bidding zones: our DB code -> ENTSO-E area code
ZONES = {
    "AT": "10YAT-APG------L",
    "BE": "10YBE----------2",
    "BG": "10YCA-BULGARIA-R",
    "CH": "10YCH-SWISSGRIDZ",
    "CZ": "10YCZ-CEPS-----N",
    "DE": "10Y1001A1001A83F",
    "DK1": "10YDK-1--------W",
    "DK2": "10YDK-2--------M",
    "EE": "10Y1001A1001A39I",
    "ES": "10YES-REE------0",
    "FI": "10YFI-1--------U",
    "FR": "10YFR-RTE------C",
    "GR": "10YGR-HTSO-----Y",
    "HR": "10YHR-HEP------M",
    "HU": "10YHU-MAVIR----U",
    "IT_N": "10Y1001A1001A73I",
    "LT": "10YLT-1001A0008Q",
    "LV": "10YLV-1001A00074",
    "NL": "10YNL----------L",
    "NO1": "10YNO-1--------2",
    "NO2": "10YNO-2--------T",
    "PL": "10YPL-AREA-----S",
    "PT": "10YPT-REN------W",
    "RO": "10YRO-TEL------P",
    "SE1": "10Y1001A1001A44P",
    "SE3": "10Y1001A1001A46L",
    "SE4": "10Y1001A1001A47J",
    "SI": "10YSI-ELES-----O",
    "SK": "10YSK-SEPS-----K",
    "GB": "10YGB----------A",
}

# Generation source mapping
GEN_TYPES = {
    "Biomass": "other",
    "Fossil Brown coal/Lignite": "coal",
    "Fossil Coal-derived gas": "gas",
    "Fossil Gas": "gas",
    "Fossil Hard coal": "coal",
    "Fossil Oil": "other",
    "Fossil Oil shale": "other",
    "Fossil Peat": "other",
    "Geothermal": "other",
    "Hydro Pumped Storage": "hydro",
    "Hydro Run-of-river and poundage": "hydro",
    "Hydro Water Reservoir": "hydro",
    "Marine": "other",
    "Nuclear": "nuclear",
    "Other": "other",
    "Other renewable": "other",
    "Solar": "solar",
    "Waste": "other",
    "Wind Offshore": "wind",
    "Wind Onshore": "wind",
}


def seed_prices(client: EntsoePandasClient, supabase, start, end):
    """Fetch day-ahead prices for all zones."""
    print("\n=== Seeding PRICES ===")
    total = 0

    for code, zone in ZONES.items():
        try:
            print(f"  {code} ({zone})...", end=" ", flush=True)
            prices = client.query_day_ahead_prices(zone, start=start, end=end)

            if prices.empty:
                print("no data")
                continue

            # Deduplicate: keep last value per (country, date, hour)
            deduped = {}
            for ts, price in prices.items():
                if pd.isna(price):
                    continue
                key = (code, ts.strftime("%Y-%m-%d"), ts.hour)
                deduped[key] = {
                    "country": code,
                    "date": ts.strftime("%Y-%m-%d"),
                    "hour": ts.hour,
                    "price_eur": round(float(price), 2),
                }

            rows = list(deduped.values())
            if rows:
                for i in range(0, len(rows), 500):
                    batch = rows[i : i + 500]
                    supabase.table("prices").upsert(
                        batch, on_conflict="country,date,hour"
                    ).execute()
                total += len(rows)
                print(f"{len(rows)} rows")
            else:
                print("empty")

        except Exception as e:
            print(f"ERROR: {e}")

    print(f"  Total prices: {total}")


def seed_generation(client: EntsoePandasClient, supabase, start, end):
    """Fetch generation per type for key countries."""
    print("\n=== Seeding GENERATION ===")
    key_countries = ["DE", "FR", "PL", "ES", "GB", "NL", "SE3", "NO1", "FI", "AT", "CZ", "IT_N", "BE", "DK1"]
    total = 0

    for code in key_countries:
        zone = ZONES.get(code)
        if not zone:
            continue

        try:
            print(f"  {code}...", end=" ", flush=True)
            gen = client.query_generation(zone, start=start, end=end)

            if gen.empty:
                print("no data")
                continue

            rows = []
            for ts in gen.index:
                for col in gen.columns:
                    col_name = col[0] if isinstance(col, tuple) else col
                    val = gen.loc[ts, col]
                    if pd.isna(val) or float(val) <= 0:
                        continue
                    source = GEN_TYPES.get(str(col_name), "other")
                    rows.append(
                        {
                            "country": code,
                            "date": ts.strftime("%Y-%m-%d"),
                            "hour": ts.hour,
                            "source_type": source,
                            "value_mw": round(float(val), 2),
                        }
                    )

            if rows:
                # Aggregate by source type per hour
                agg = {}
                for r in rows:
                    key = (r["country"], r["date"], r["hour"], r["source_type"])
                    if key in agg:
                        agg[key]["value_mw"] += r["value_mw"]
                    else:
                        agg[key] = r.copy()

                agg_rows = list(agg.values())
                # Batch upsert (max 1000 at a time)
                for i in range(0, len(agg_rows), 1000):
                    batch = agg_rows[i : i + 1000]
                    supabase.table("generation").upsert(
                        batch, on_conflict="country,date,hour,source_type"
                    ).execute()

                total += len(agg_rows)
                print(f"{len(agg_rows)} rows")
            else:
                print("empty")

        except Exception as e:
            print(f"ERROR: {e}")

    print(f"  Total generation: {total}")


def seed_flows(client: EntsoePandasClient, supabase, start, end):
    """Fetch cross-border flows for key pairs."""
    print("\n=== Seeding FLOWS ===")
    flow_pairs = [
        ("DE", "PL"), ("DE", "CZ"), ("DE", "AT"), ("DE", "NL"), ("DE", "FR"),
        ("FR", "ES"), ("FR", "GB"), ("FR", "BE"), ("FR", "CH"),
        ("PL", "CZ"), ("PL", "SK"), ("PL", "SE4"),
        ("NL", "BE"), ("NL", "GB"),
        ("NO1", "SE3"), ("SE3", "FI"),
        ("AT", "HU"), ("AT", "CZ"), ("AT", "CH"),
        ("ES", "PT"),
    ]
    total = 0

    for from_code, to_code in flow_pairs:
        from_zone = ZONES.get(from_code)
        to_zone = ZONES.get(to_code)
        if not from_zone or not to_zone:
            continue

        try:
            print(f"  {from_code}->{to_code}...", end=" ", flush=True)
            flows = client.query_crossborder_flows(from_zone, to_zone, start=start, end=end)

            if flows.empty:
                print("no data")
                continue

            # Deduplicate: keep last value per (from, to, date, hour)
            deduped = {}
            for ts, flow in flows.items():
                if pd.isna(flow):
                    continue
                key = (from_code, to_code, ts.strftime("%Y-%m-%d"), ts.hour)
                deduped[key] = {
                    "from_country": from_code,
                    "to_country": to_code,
                    "date": ts.strftime("%Y-%m-%d"),
                    "hour": ts.hour,
                    "flow_mw": round(float(flow), 2),
                }

            rows = list(deduped.values())
            if rows:
                for i in range(0, len(rows), 500):
                    batch = rows[i : i + 500]
                    supabase.table("flows").upsert(
                        batch, on_conflict="from_country,to_country,date,hour"
                    ).execute()
                total += len(rows)
                print(f"{len(rows)} rows")
            else:
                print("empty")

        except Exception as e:
            print(f"ERROR: {e}")

    print(f"  Total flows: {total}")


def main():
    print("GridPulse ENTSO-E Data Seeder")
    print(f"API Key: {API_KEY[:8]}...{API_KEY[-4:]}")

    # Date range: last 14 days + tomorrow
    end = pd.Timestamp(datetime.now() + timedelta(days=2), tz="Europe/Berlin")
    start = pd.Timestamp(datetime.now() - timedelta(days=14), tz="Europe/Berlin")
    print(f"Date range: {start.date()} to {end.date()}")

    # Init clients
    entsoe_client = EntsoePandasClient(api_key=API_KEY)
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # First clear old synthetic data
    print("\nClearing old synthetic data...")
    supabase.table("prices").delete().neq("id", 0).execute()
    supabase.table("flows").delete().neq("id", 0).execute()
    supabase.table("generation").delete().neq("id", 0).execute()
    print("Done.")

    seed_prices(entsoe_client, supabase, start, end)
    seed_generation(entsoe_client, supabase, start, end)
    seed_flows(entsoe_client, supabase, start, end)

    print("\n=== DONE ===")


if __name__ == "__main__":
    main()
