import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Code2, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact - GridPulse",
  description: "Get in touch with the GridPulse team.",
};

export default function ContactPage() {
  return (
    <div className="gp-shell max-w-3xl py-12 sm:py-16 lg:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#505f76] transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <h1 className="mb-4 text-[2rem] font-black tracking-[-0.05em] text-[#111827] sm:text-[2.5rem]">
        Contact
      </h1>
      <p className="mb-10 text-lg leading-8 text-[#505f76]">
        GridPulse is a personal project built to visualize European energy market
        data. Have a question, feedback, or found a bug? Get in touch.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="gp-card flex items-start gap-4 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold text-[#111827]">Email</h3>
            <p className="text-sm leading-7 text-[#505f76]">
              For general inquiries and feedback.
            </p>
            <a
              href="mailto:contact@gridpulse.dev"
              className="mt-2 inline-block text-sm font-semibold text-primary transition-colors hover:text-[#008467]"
            >
              contact@gridpulse.dev
            </a>
          </div>
        </div>

        <div className="gp-card flex items-start gap-4 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold text-[#111827]">GitHub</h3>
            <p className="text-sm leading-7 text-[#505f76]">
              Report bugs or request features.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-primary">
              github.com/gridpulse
            </span>
          </div>
        </div>

        <div className="gp-card flex items-start gap-4 p-6 sm:col-span-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold text-[#111827]">
              Data Sources
            </h3>
            <p className="text-sm leading-7 text-[#505f76]">
              GridPulse uses publicly available data from{" "}
              <span className="font-medium text-[#111827]">ENTSO-E</span>{" "}
              (European Network of Transmission System Operators for Electricity)
              and{" "}
              <span className="font-medium text-[#111827]">Open-Meteo</span>{" "}
              weather API. For questions about the underlying data, please
              contact the respective data providers directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
