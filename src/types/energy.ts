export interface Price {
  id: number;
  country: string;
  date: string;
  hour: number;
  price_eur: number;
  fetched_at: string;
}

export interface Flow {
  id: number;
  from_country: string;
  to_country: string;
  date: string;
  hour: number;
  flow_mw: number;
  fetched_at: string;
}

export interface Generation {
  id: number;
  country: string;
  date: string;
  hour: number;
  source_type: EnergySource;
  value_mw: number;
  fetched_at: string;
}

export type EnergySource =
  | "wind"
  | "solar"
  | "gas"
  | "coal"
  | "nuclear"
  | "hydro"
  | "other";

export interface CountryPrice {
  country: string;
  price_eur: number;
  change_pct: number | null;
}

export interface EnergyMix {
  source_type: EnergySource;
  value_mw: number;
  percentage: number;
}

export interface CountryData {
  code: string;
  name: string;
  flag: string;
  eicCode: string;
  centroid: [number, number];
}

export const PRICE_TIERS = {
  cheap: 30,
  medium: 80,
  expensive: 150,
} as const;

export function getPriceTierColor(price: number): string {
  if (price < PRICE_TIERS.cheap) return "#22c55e";
  if (price < PRICE_TIERS.medium) return "#eab308";
  if (price < PRICE_TIERS.expensive) return "#f97316";
  return "#ef4444";
}
