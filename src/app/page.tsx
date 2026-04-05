import Link from "next/link";
import { Map, Clock, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "Live Map",
    description:
      "Real-time prices across 30+ European countries with cross-border energy flows.",
    href: "/map",
  },
  {
    icon: Clock,
    title: "Smart Timer",
    description:
      "Find the cheapest hours to run your appliances and save up to 60% on energy costs.",
    href: "/timer",
  },
  {
    icon: TrendingUp,
    title: "Trading Arena",
    description:
      "Test your trading skills against real market data in a risk-free simulation.",
    href: "/trade",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium mb-8">
          Real-time Energy Data
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] max-w-xl">
          European Energy Intelligence
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-md leading-relaxed">
          Monitor energy prices, optimize consumption, and trade smarter —
          powered by real market data.
        </p>

        <Link
          href="/map"
          className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Explore the Map
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Features */}
      <section className="w-full max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-8 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all"
            >
              <feature.icon className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-12">
          Powered by ENTSO-E Transparency Platform &middot; Open-Meteo &middot;
          100% Free
        </p>
      </section>
    </div>
  );
}
