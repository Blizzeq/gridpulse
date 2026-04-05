"use client";

export function Footer() {
  return (
    <footer className="h-12 bg-white border-t border-gray-200 flex items-center px-4 sm:px-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Data by ENTSO-E &middot; Open-Meteo
        </span>
        <span className="text-xs text-gray-400">
          GridPulse &middot; 2026
        </span>
      </div>
    </footer>
  );
}
