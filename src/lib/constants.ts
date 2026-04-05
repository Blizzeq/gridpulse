export interface DevicePreset {
  id: string;
  name: string;
  icon: string;
  power_kw: number;
  duration_h: number;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: "ev", name: "EV Charger", icon: "Car", power_kw: 7.4, duration_h: 4 },
  {
    id: "washer",
    name: "Washing Machine",
    icon: "Shirt",
    power_kw: 2.0,
    duration_h: 2,
  },
  {
    id: "dishwasher",
    name: "Dishwasher",
    icon: "UtensilsCrossed",
    power_kw: 1.8,
    duration_h: 1.5,
  },
  {
    id: "heatpump",
    name: "Heat Pump",
    icon: "Thermometer",
    power_kw: 3.0,
    duration_h: 6,
  },
  {
    id: "dryer",
    name: "Dryer",
    icon: "Wind",
    power_kw: 2.5,
    duration_h: 1.5,
  },
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
