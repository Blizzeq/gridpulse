# GridPulse - European Energy Intelligence

Real-time European energy market visualization platform. Monitor day-ahead prices across 28+ countries, explore cross-border power flows on an interactive map, optimize consumption timing, and simulate energy trading strategies.

## Features

### Live Map
Interactive D3-based map of Europe showing real-time day-ahead electricity prices with color-coded price tiers. Includes cross-border flow visualization, country detail panels with generation mix breakdowns, and an hour slider to explore price evolution throughout the day.

### Energy Monitor
Track hourly price patterns for any ENTSO-E country. Includes a bill calculator to estimate electricity costs for common appliances, a smart scheduler suggesting optimal usage windows, and price trend insights.

### Trading Arena
Simulate energy market bidding against real historical prices. Set hourly bid prices via an interactive chart, choose from preset strategies (Night Owl, Peak Shaver, Solar Surfer, etc.), and see your P&L compared to actual market outcomes.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Charts:** Recharts + D3.js
- **Data Fetching:** TanStack React Query
- **Database:** Supabase (PostgreSQL)
- **Data Sources:** ENTSO-E Transparency Platform, Open-Meteo Weather API

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- ENTSO-E API token ([request here](https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html))
- Supabase project

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ENTSOE_API_TOKEN=your_entsoe_api_token
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

The app uses Supabase with the following tables:

- `prices` — cached day-ahead electricity prices (country, date, hour, price_eur)
- `flows` — cached cross-border physical flows (from_country, to_country, date, hour, flow_mw)
- `generation` — cached generation mix data (country, date, hour, source_type, value_mw)
- `trades` — trading simulation submissions
- `leaderboard` — trading game scores

Tables are auto-populated on first request via ENTSO-E API calls and cached for subsequent requests. Today's data refreshes automatically every 5 minutes.

## Data Coverage

Day-ahead prices and generation data for 28 ENTSO-E bidding zones including: Austria, Belgium, Bulgaria, Croatia, Czech Republic, Denmark (East/West), Estonia, Finland, France, Germany, Greece, Hungary, Italy North, Latvia, Lithuania, Netherlands, Norway (South/Southwest), Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden (North/Central/South), and Switzerland.

Cross-border physical flows for 40+ interconnector pairs.

## Deployment

Deployed on Vercel. Required environment variables must be set in the Vercel project settings.

## License

Personal project. All energy data sourced from ENTSO-E Transparency Platform (public API).
