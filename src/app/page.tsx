import Link from "next/link";
import {
  Map,
  BarChart3,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Activity,
  Zap,
  Gauge,
  Globe,
  Clock,
  Calendar,
} from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Live Map",
    description:
      "Visualize real-time energy flows across the European interconnected grid with granular node data.",
    href: "/map",
    accent: "group-hover:bg-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Energy Monitor",
    description:
      "Track consumption patterns and generation mix from renewables to nuclear in high-fidelity charts.",
    href: "/timer",
    accent: "group-hover:bg-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Trading Arena",
    description:
      "Simulate market positions and analyze price volatility across all major European power exchanges.",
    href: "/trade",
    accent: "group-hover:bg-emerald-700",
  },
];

const CHECKLIST = [
  "ENTSO-E Direct API Integration",
  "Open-Meteo Weather Correlations",
  "15-Minute Market Granularity",
];

const HERO_METRICS = [
  {
    label: "Peak Demand",
    value: "42.8",
    unit: "GW",
    accent: "bg-primary/10 text-primary",
  },
  {
    label: "Renewable Mix",
    value: "64.2",
    unit: "%",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Market Spread",
    value: "-18 to 141",
    unit: "EUR",
    accent: "bg-slate-100 text-slate-700",
  },
];

const BOTTOM_STATS = [
  {
    icon: Globe,
    label: "Live Map",
    value: "28",
    sub: "Countries online",
  },
  {
    icon: Clock,
    label: "Energy Monitor",
    value: "15m",
    sub: "Granularity window",
  },
  {
    icon: Calendar,
    label: "Trading Arena",
    value: "24h",
    sub: "Challenge horizon",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(0,105,81,0.13),transparent_60%)]" />

        <div className="gp-shell grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Left column */}
          <div className="max-w-xl space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-md">
              <span className="live-dot" />
              Real-time Energy Data
            </div>

            <div className="space-y-5">
              <h1 className="max-w-[14ch] text-[2.75rem] font-black tracking-[-0.05em] text-[#111827] sm:text-[3.5rem] lg:text-[4rem] lg:leading-[1.02]">
                European Energy Intelligence
              </h1>
              <p className="max-w-lg text-lg leading-8 text-[#505f76]">
                Monitor prices, optimize consumption, and simulate trading on a
                premium editorial interface built around live European power
                market data.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row animate-fade-up delay-200">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-primary px-7 py-4 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,105,81,0.4)] transition-all duration-200 hover:scale-[1.02] hover:bg-[#008467]"
              >
                Explore the Map
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/timer"
                className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-white px-7 py-4 text-base font-semibold text-[#111827] shadow-[0_24px_70px_-52px_rgba(17,24,39,0.7)] ring-1 ring-black/5 transition-all duration-200 hover:bg-[#f3f3f5] hover:ring-black/10"
              >
                Open Energy Monitor
              </Link>
            </div>

            <ul className="space-y-3 animate-fade-up delay-400">
              {CHECKLIST.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium text-[#1f2937]"
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                >
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right column — Hero card */}
          <div className="gp-card relative overflow-hidden p-6 sm:p-8 animate-fade-up delay-200">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,105,81,0.12),transparent_35%)]" />
            <div className="relative space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="gp-kicker mb-2">Platform Overview</p>
                  <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#111827]">
                    Intelligence as Infrastructure.
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[#505f76]">
                    Live telemetry, pricing intelligence, and decision support
                    arranged as one coherent operating workspace.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  <span className="live-dot" />
                  Live telemetry
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                {/* Grid Nodes panel */}
                <div className="gp-grid-bg relative min-h-[240px] overflow-hidden rounded-[20px] p-5 sm:min-h-[360px] sm:rounded-[28px] sm:p-6">
                  <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(0,105,81,0.16),transparent_60%)]" />
                  <div className="relative flex h-full flex-col justify-between gap-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="gp-metric-label mb-1">Active Grid Nodes</p>
                        <h3 className="text-lg font-bold tracking-[-0.03em] text-[#111827] sm:text-2xl">
                          Continental overview
                        </h3>
                      </div>
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {HERO_METRICS.map((metric, i) => (
                        <div
                          key={metric.label}
                          className="animate-fade-up rounded-[12px] bg-white/90 p-3 shadow-[0_20px_50px_-42px_rgba(17,24,39,0.7)] backdrop-blur-sm sm:rounded-[18px] sm:p-4"
                          style={{ animationDelay: `${300 + i * 100}ms` }}
                        >
                          <p className="gp-metric-label mb-1 sm:mb-2">{metric.label}</p>
                          <p className="text-lg font-black tracking-[-0.04em] text-[#111827] sm:text-2xl">
                            {metric.value}
                            {metric.unit && (
                              <span className="ml-0.5 text-[10px] font-medium text-[#505f76] sm:ml-1 sm:text-sm">
                                {metric.unit}
                              </span>
                            )}
                          </p>
                          <span
                            className={`mt-2 hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] sm:inline-flex ${metric.accent}`}
                          >
                            <span className="live-dot" />
                            Live
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side cards */}
                <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col">
                  <div className="gp-card-subtle flex-1 p-5 transition-all duration-300 hover:shadow-[0_28px_80px_-52px_rgba(17,24,39,0.4)]">
                    <div className="mb-8 flex items-center justify-between">
                      <div>
                        <p className="gp-metric-label mb-1">Load Shift</p>
                        <p className="text-3xl font-black tracking-[-0.04em] text-[#111827]">
                          32<span className="text-lg font-bold text-[#505f76]">%</span>
                        </p>
                      </div>
                      <Gauge className="h-5 w-5 text-primary" />
                    </div>
                    <div className="h-16 overflow-hidden rounded-2xl bg-[#f3f3f5] p-2">
                      <div className="gp-primary-gradient h-full w-[64%] rounded-xl opacity-90 animate-bar-grow" />
                    </div>
                  </div>
                  <div className="gp-card-subtle flex-1 p-5 transition-all duration-300 hover:shadow-[0_28px_80px_-52px_rgba(17,24,39,0.4)]">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="gp-metric-label mb-1">Trading Pulse</p>
                        <p className="text-3xl font-black tracking-[-0.04em] text-[#111827]">
                          103
                        </p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-end gap-1.5">
                      {[34, 42, 51, 46, 58, 66, 61, 74].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-primary/75 transition-all duration-200 hover:bg-primary animate-bar-grow"
                          style={{
                            height: `${height}px`,
                            animationDelay: `${400 + i * 60}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="gp-shell py-8 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {FEATURES.map((feature, i) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="gp-card group p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_100px_-60px_rgba(17,24,39,0.35)] animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 ${feature.accent} group-hover:text-white group-hover:shadow-[0_8px_20px_-6px_rgba(0,105,81,0.4)]`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#111827]">
                {feature.title}
              </h3>
              <p className="leading-7 text-[#505f76]">{feature.description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                Explore
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bottom Analytics Section ── */}
      <section className="bg-[#f3f3f5] py-20 sm:py-24">
        <div className="gp-shell flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex-1 space-y-8">
            <span className="gp-kicker">Advanced Analytics</span>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#111827] sm:text-4xl leading-tight">
              Precision data for the modern utility manager.
            </h2>
            <p className="text-lg leading-8 text-[#505f76]">
              Our editorial approach to data means you spend less time squinting
              at tables and more time making informed strategic decisions.
            </p>
            <ul className="space-y-4">
              {CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-medium text-[#1f2937]"
                >
                  <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="gp-card w-full flex-1 p-6 sm:p-8">
            <div className="flex h-56 w-full items-end justify-center gap-1.5 rounded-[20px] bg-gradient-to-br from-emerald-50 via-emerald-100/40 to-slate-50 p-6 sm:h-64 sm:gap-2">
              {[40, 55, 45, 70, 60, 85, 75, 90, 65, 50, 80, 95].map(
                (h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/80 transition-all duration-200 hover:bg-primary animate-bar-grow"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                )
              )}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {BOTTOM_STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex items-start gap-3 rounded-[18px] bg-[#f3f3f5] p-4 transition-all duration-200 hover:bg-[#edeef0]"
                >
                  <stat.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="gp-metric-label mb-2">{stat.label}</p>
                    <p className="text-2xl font-black tracking-[-0.04em] text-[#111827]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[#505f76]">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
