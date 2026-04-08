"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on full-screen pages
  if (pathname === "/map") return null;

  return <Footer />;
}
