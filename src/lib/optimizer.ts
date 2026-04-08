export interface OptimalWindow {
  startIndex: number;
  endIndex: number;
  totalCost: number;
  avgPrice: number;
}

export interface OptimizationResult {
  best: OptimalWindow;
  worst: OptimalWindow;
  alternatives: OptimalWindow[];
  savings_eur: number;
  savings_pct: number;
}

interface WindowCandidate {
  startIndex: number;
  cost: number;
}

/**
 * Sliding window algorithm to find the cheapest and most expensive
 * time windows for running a device. Returns top 3 non-overlapping
 * best windows plus the single worst window.
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

  const candidates: WindowCandidate[] = [];
  let worstStart = 0;
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

    candidates.push({ startIndex: i, cost: windowCost });

    if (windowCost > worstCost) {
      worstCost = windowCost;
      worstStart = i;
    }
  }

  // Sort candidates by cost ascending
  candidates.sort((a, b) => a.cost - b.cost);

  // Pick top 3 non-overlapping windows
  const topWindows: WindowCandidate[] = [];
  for (const candidate of candidates) {
    if (topWindows.length >= 3) break;

    const overlaps = topWindows.some(
      (w) =>
        candidate.startIndex < w.startIndex + windowSize &&
        candidate.startIndex + windowSize > w.startIndex
    );

    if (!overlaps) {
      topWindows.push(candidate);
    }
  }

  const makeWindow = (start: number, cost: number): OptimalWindow => ({
    startIndex: start,
    endIndex: start + windowSize - 1,
    totalCost: cost / 1000,
    avgPrice: cost / (powerKw * durationHours),
  });

  const best = makeWindow(topWindows[0].startIndex, topWindows[0].cost);
  const worst = makeWindow(worstStart, worstCost);
  const alternatives = topWindows
    .slice(1)
    .map((w) => makeWindow(w.startIndex, w.cost));

  return {
    best,
    worst,
    alternatives,
    savings_eur: worst.totalCost - best.totalCost,
    savings_pct:
      worst.totalCost > 0
        ? ((worst.totalCost - best.totalCost) / worst.totalCost) * 100
        : 0,
  };
}
