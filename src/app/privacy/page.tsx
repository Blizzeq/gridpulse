import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - GridPulse",
  description: "GridPulse Privacy Policy - how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="gp-shell max-w-3xl py-12 sm:py-16 lg:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#505f76] transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <h1 className="mb-8 text-[2rem] font-black tracking-[-0.05em] text-[#111827] sm:text-[2.5rem]">
        Privacy Policy
      </h1>

      <div className="space-y-8 text-base leading-8 text-[#505f76]">
        <p>
          <span className="font-semibold text-[#111827]">Last updated:</span>{" "}
          April 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            1. Overview
          </h2>
          <p>
            GridPulse is a personal, non-commercial project that provides
            European energy market data visualization. We take your privacy
            seriously and collect minimal data necessary for the platform to
            function.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            2. Data We Collect
          </h2>
          <p>
            GridPulse does not require user registration. The platform may
            collect:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-medium text-[#111827]">
                Usage analytics:
              </span>{" "}
              Anonymous page views and interaction patterns to improve the
              platform experience.
            </li>
            <li>
              <span className="font-medium text-[#111827]">
                Trading simulation data:
              </span>{" "}
              Bid submissions and game results stored temporarily for leaderboard
              functionality.
            </li>
            <li>
              <span className="font-medium text-[#111827]">
                Technical logs:
              </span>{" "}
              Server logs including IP addresses, browser type, and request
              timestamps for debugging and security.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            3. Third-Party Services
          </h2>
          <p>GridPulse integrates with the following external services:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <span className="font-medium text-[#111827]">ENTSO-E:</span>{" "}
              European energy transparency platform for market data. No personal
              data is shared with ENTSO-E.
            </li>
            <li>
              <span className="font-medium text-[#111827]">Open-Meteo:</span>{" "}
              Weather data API. No personal data is shared.
            </li>
            <li>
              <span className="font-medium text-[#111827]">Supabase:</span>{" "}
              Database hosting for cached energy data and trading simulations.
            </li>
            <li>
              <span className="font-medium text-[#111827]">Vercel:</span>{" "}
              Platform hosting and edge functions.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            4. Cookies
          </h2>
          <p>
            GridPulse uses only essential cookies required for the platform to
            function. We do not use advertising or tracking cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            5. Data Retention
          </h2>
          <p>
            Cached energy data is retained for performance purposes and
            periodically refreshed from source APIs. Trading simulation data may
            be periodically purged.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            6. Contact
          </h2>
          <p>
            For privacy-related inquiries, please reach out via the{" "}
            <Link href="/contact" className="font-medium text-primary underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
