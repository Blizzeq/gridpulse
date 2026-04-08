"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/map", label: "Live Map" },
  { href: "/timer", label: "Energy Monitor" },
  { href: "/trade", label: "Trading Arena" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-header border-b border-white/40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : "glass-header border-b border-transparent"
      )}
    >
      <div className="gp-shell flex h-[var(--nav-height)] items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <span className="text-xl font-black tracking-[-0.04em] text-[#111827]">
            GridPulse
          </span>
        </Link>

        {/* Desktop navigation pills */}
        <div className="hidden items-center gap-1 rounded-full bg-white/70 p-1 shadow-[0_16px_40px_-32px_rgba(17,24,39,0.55)] backdrop-blur-sm md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/timer" && pathname?.startsWith("/timer"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#f3f3f5] text-[#111827] shadow-[0_12px_32px_-28px_rgba(17,24,39,0.7)]"
                    : "text-[#505f76] hover:text-[#111827]"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary/60" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Spacer for desktop to keep nav centered */}
        <div className="hidden w-[100px] md:block" />

        {/* Mobile menu (Sheet) */}
        <Sheet>
          <SheetTrigger
            className="rounded-full p-2.5 text-[#505f76] transition-colors hover:bg-white/80 hover:text-[#111827] md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="top"
            className="border-b border-white/40 bg-white/95 p-0 backdrop-blur-xl"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="gp-shell space-y-2 py-6">
              {NAV_ITEMS.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all animate-fade-up",
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "text-[#505f76] hover:bg-[#f3f3f5] hover:text-[#111827]"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {item.label}
                    {isActive && <span className="live-dot" />}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
