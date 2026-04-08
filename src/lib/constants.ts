export interface DevicePreset {
  id: string;
  name: string;
  icon: string;
  power_kw: number;
  duration_h: number;
  category: DeviceCategory;
}

export type DeviceCategory = "all" | "transport" | "laundry" | "kitchen" | "climate" | "other";

export const DEVICE_CATEGORIES: { id: DeviceCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "transport", label: "Transport" },
  { id: "laundry", label: "Laundry" },
  { id: "kitchen", label: "Kitchen" },
  { id: "climate", label: "Climate" },
  { id: "other", label: "Other" },
];

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: "ev", name: "EV Charger", icon: "Car", power_kw: 7.4, duration_h: 4, category: "transport" },
  { id: "washer", name: "Washing Machine", icon: "Shirt", power_kw: 2.0, duration_h: 2, category: "laundry" },
  { id: "dryer", name: "Dryer", icon: "Wind", power_kw: 2.5, duration_h: 1.5, category: "laundry" },
  { id: "dishwasher", name: "Dishwasher", icon: "UtensilsCrossed", power_kw: 1.8, duration_h: 1.5, category: "kitchen" },
  { id: "oven", name: "Oven", icon: "CookingPot", power_kw: 2.5, duration_h: 1.5, category: "kitchen" },
  { id: "heatpump", name: "Heat Pump", icon: "Thermometer", power_kw: 3.0, duration_h: 6, category: "climate" },
  { id: "ac", name: "AC Unit", icon: "Snowflake", power_kw: 2.0, duration_h: 3, category: "climate" },
  { id: "boiler", name: "Water Heater", icon: "Flame", power_kw: 3.0, duration_h: 2, category: "climate" },
  { id: "pool", name: "Pool Pump", icon: "Waves", power_kw: 1.5, duration_h: 8, category: "other" },
  { id: "gaming", name: "Gaming PC", icon: "Monitor", power_kw: 0.5, duration_h: 4, category: "other" },
];

export const ENERGY_SOURCE_COLORS: Record<string, string> = {
  wind: "#22c55e",
  solar: "#facc15",
  gas: "#f97316",
  coal: "#78716c",
  nuclear: "#8b5cf6",
  hydro: "#3b82f6",
  other: "#94a3b8",
};

export const ENERGY_SOURCE_LABELS: Record<string, string> = {
  wind: "Wind",
  solar: "Solar",
  gas: "Gas",
  coal: "Coal",
  nuclear: "Nuclear",
  hydro: "Hydro",
  other: "Other",
};
