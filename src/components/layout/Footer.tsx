"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-[#f3f3f5] py-10 sm:py-12">
      <div className="gp-shell flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_18px_50px_-36px_rgba(17,24,39,0.7)] sm:h-11 sm:w-11">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div>
            <span className="block text-lg font-black tracking-[-0.04em] text-[#111827]">
              GridPulse
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#505f76] sm:text-[11px]">
              Powered by ENTSO-E · Open-Meteo
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-medium uppercase tracking-[0.18em] text-[#505f76] sm:gap-5 sm:text-[11px]">
          <Link href="/privacy" className="transition-colors hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/contact" className="transition-colors hover:text-primary">
            Contact
          </Link>
        </div>

        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6d7a74] sm:text-[11px]">
          © 2026 GridPulse Intelligence. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
