import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GridPulse - European Energy Intelligence",
  description:
    "Real-time European energy prices, smart consumption optimizer, and energy trading simulator. Powered by ENTSO-E data.",
  openGraph: {
    title: "GridPulse - European Energy Intelligence",
    description:
      "Monitor energy prices, optimize consumption, and trade smarter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col pt-[var(--nav-height)]">
            {children}
          </main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
