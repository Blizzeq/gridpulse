import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - GridPulse",
  description: "GridPulse Terms of Service.",
};

export default function TermsPage() {
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
        Terms of Service
      </h1>

      <div className="space-y-8 text-base leading-8 text-[#505f76]">
        <p>
          <span className="font-semibold text-[#111827]">Last updated:</span>{" "}
          April 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using GridPulse, you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the
            platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            2. Nature of the Service
          </h2>
          <p>
            GridPulse is a personal, educational project providing European
            energy market data visualization and trading simulation. It is
            provided &quot;as is&quot; without warranty of any kind.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              GridPulse is <strong>not</strong> a financial advisory service.
            </li>
            <li>
              The trading arena is a <strong>simulation only</strong> — no real
              money or energy commodities are traded.
            </li>
            <li>
              Energy data is sourced from ENTSO-E and may have delays or
              inaccuracies.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            3. Data Accuracy
          </h2>
          <p>
            While we strive to provide accurate, up-to-date energy market data,
            GridPulse makes no guarantees about data completeness, timeliness, or
            accuracy. Data is sourced from publicly available APIs and cached for
            performance. Do not rely on GridPulse data for real trading or
            investment decisions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            4. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Use automated systems to excessively scrape or overload the
              platform.
            </li>
            <li>
              Attempt to gain unauthorized access to backend systems or
              databases.
            </li>
            <li>
              Misrepresent GridPulse data as official or authoritative market
              data.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            5. Limitation of Liability
          </h2>
          <p>
            GridPulse and its creator shall not be liable for any direct,
            indirect, incidental, or consequential damages arising from the use
            of this platform. This includes, but is not limited to, losses from
            decisions made based on displayed data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            6. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these terms at any time. Continued
            use of the platform after changes constitutes acceptance of the
            updated terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111827]">
            7. Contact
          </h2>
          <p>
            Questions about these terms? Visit the{" "}
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
