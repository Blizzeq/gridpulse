export interface OptimalWindow {
  startIndex: number;
  endIndex: number;
  totalCost: number;
  avgPrice: number;
}

export interface OptimizationResult {
  best: OptimalWindow;
  worst: OptimalWindow;
  savings_eur: number;
  savings_pct: number;
}

/**
 * Sliding window algorithm to find the cheapest and most expensive
 * time windows for running a device.
 */
export function findOptimalWindows(
  prices: number[],
  durationHours: number,
  powerKw: number,
  excludeNightHours: boolean = false
): OptimizationResult {
  const windowSize = Math.ceil(durationHours);

  if (prices.length < windowSize) {
    throw new Error("Not enough price data for the given duration");
  }

  let bestStart = 0;
  let worstStart = 0;
  let bestCost = Infinity;
  let worstCost = -Infinity;

  for (let i = 0; i <= prices.length - windowSize; i++) {
    if (excludeNightHours) {
      const hour = i % 24;
      if (hour >= 0 && hour < 6) continue;
    }

    let windowCost = 0;
    for (let j = i; j < i + windowSize; j++) {
      windowCost += prices[j] * powerKw;
    }

    // Adjust for partial last hour
    if (durationHours % 1 !== 0) {
      const fraction = durationHours % 1;
      windowCost -= prices[i + windowSize - 1] * powerKw * (1 - fraction);
    }

    if (windowCost < bestCost) {
      bestCost = windowCost;
      bestStart = i;
    }
    if (windowCost > worstCost) {
      worstCost = windowCost;
      worstStart = i;
    }
  }

  const bestAvg =
    bestCost / (powerKw * durationHours);
  const worstAvg =
    worstCost / (powerKw * durationHours);

  // Convert from EUR/MWh * kW to EUR (divide by 1000)
  const bestCostEur = bestCost / 1000;
  const worstCostEur = worstCost / 1000;

  return {
    best: {
      startIndex: bestStart,
      endIndex: bestStart + windowSize - 1,
      totalCost: bestCostEur,
      avgPrice: bestAvg,
    },
    worst: {
      startIndex: worstStart,
      endIndex: worstStart + windowSize - 1,
      totalCost: worstCostEur,
      avgPrice: worstAvg,
    },
    savings_eur: worstCostEur - bestCostEur,
    savings_pct:
      worstCostEur > 0
        ? ((worstCostEur - bestCostEur) / worstCostEur) * 100
        : 0,
  };
}
