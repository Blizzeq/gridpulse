export interface Bid {
  hour: number;
  price: number;
  volume: number;
}

export interface Trade {
  id: string;
  user_id: string;
  challenge_date: string;
  country: string;
  bids: Bid[];
  pnl: number | null;
  score: number | null;
  submitted_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  nickname: string;
  total_pnl: number;
  games_played: number;
  win_streak: number;
  best_streak: number;
  updated_at: string;
}

export interface TradeResult {
  hour: number;
  bid_price: number;
  market_price: number;
  volume: number;
  accepted: boolean;
  pnl: number;
}

export interface TradeScore {
  results: TradeResult[];
  accepted_hours: number;
  total_pnl: number;
  rating: string;
  stars: number;
}

export type Difficulty = "easy" | "hard";

export function getRating(pnl: number, acceptedRatio: number): { rating: string; stars: number } {
  if (acceptedRatio >= 0.9 && pnl > 0) return { rating: "Master Trader", stars: 5 };
  if (acceptedRatio >= 0.75 && pnl > 0) return { rating: "Senior Trader", stars: 4 };
  if (acceptedRatio >= 0.6) return { rating: "Trader", stars: 3 };
  if (acceptedRatio >= 0.4) return { rating: "Junior Trader", stars: 2 };
  return { rating: "Rookie", stars: 1 };
}
