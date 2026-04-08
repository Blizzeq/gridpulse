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

export interface DailyStats {
  avg: number;
  min: number;
  max: number;
  prices: Price[];
}

/**
 * Color scale calibrated to real ENTSO-E data (Apr 2026).
 * Median ~66, p25 ~10, p75 ~118, range -200 to +280.
 */
export function getPriceTierColor(price: number): string {
  if (price < 0) return "#06b6d4";     // cyan — negative (surplus)
  if (price < 20) return "#22c55e";    // green — very cheap
  if (price < 50) return "#84cc16";    // lime — cheap
  if (price < 80) return "#eab308";    // yellow — moderate
  if (price < 120) return "#f97316";   // orange — expensive
  if (price < 200) return "#ef4444";   // red — very expensive
  return "#991b1b";                     // dark red — extreme
}

export function getPriceTierLabel(price: number): string {
  if (price < 0) return "Negative";
  if (price < 20) return "Very cheap";
  if (price < 50) return "Cheap";
  if (price < 80) return "Moderate";
  if (price < 120) return "Expensive";
  if (price < 200) return "Very expensive";
  return "Extreme";
}

export const PRICE_LEGEND = [
  { label: "<0", price: -10, description: "Surplus" },
  { label: "0-20", price: 10, description: "Very cheap" },
  { label: "20-50", price: 35, description: "Cheap" },
  { label: "50-80", price: 65, description: "Moderate" },
  { label: "80-120", price: 100, description: "Expensive" },
  { label: "120+", price: 150, description: "Very expensive" },
];
