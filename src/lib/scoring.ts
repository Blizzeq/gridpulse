import { Bid, TradeResult, TradeScore, getRating } from "@/types/trading";
import { Price } from "@/types/energy";

/**
 * Score a trade by comparing user bids against actual market prices.
 * A bid is "accepted" if bid_price >= market_price (user willing to pay at least market rate).
 * P&L = sum of (market_price * volume) for accepted bids.
 */
export function scoreTrade(
  bids: Bid[],
  actualPrices: Price[]
): TradeScore {
  const priceMap = new Map(actualPrices.map((p) => [p.hour, p.price_eur]));

  const results: TradeResult[] = bids.map((bid) => {
    const marketPrice = priceMap.get(bid.hour) ?? 0;
    const accepted = bid.price >= marketPrice;

    return {
      hour: bid.hour,
      bid_price: bid.price,
      market_price: marketPrice,
      volume: bid.volume,
      accepted,
      pnl: accepted ? (bid.price - marketPrice) * bid.volume : 0,
    };
  });

  const acceptedHours = results.filter((r) => r.accepted).length;
  const totalPnl = results.reduce((sum, r) => sum + r.pnl, 0);
  const acceptedRatio = bids.length > 0 ? acceptedHours / bids.length : 0;
  const { rating, stars } = getRating(totalPnl, acceptedRatio);

  return {
    results,
    accepted_hours: acceptedHours,
    total_pnl: Math.round(totalPnl * 100) / 100,
    rating,
    stars,
  };
}
