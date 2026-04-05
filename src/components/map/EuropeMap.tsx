"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { CountryPrice, getPriceTierColor } from "@/types/energy";
import { ISO_A3_TO_CODE, COUNTRIES } from "@/lib/countries";
import type { Topology, GeometryCollection } from "topojson-specification";

interface EuropeMapProps {
  prices: CountryPrice[];
  onCountryClick: (code: string) => void;
  selectedCountry: string | null;
}

export function EuropeMap({
  prices,
  onCountryClick,
  selectedCountry,
}: EuropeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const priceMap = new Map(prices.map((p) => [p.country, p]));

  const drawMap = useCallback(async () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Load TopoJSON
    const topology = (await d3.json("/europe.topo.json")) as Topology;
    const countries = topojson.feature(
      topology,
      topology.objects.countries as GeometryCollection
    );

    // Projection centered on Europe
    const projection = d3
      .geoMercator()
      .center([15, 52])
      .scale(width * 0.9)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Draw countries
    const g = svg.append("g");

    g.selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("d", path as never)
      .attr("fill", (d) => {
        const props = d.properties as { name: string } | undefined;
        const id = d.id as string;
        const countryCode = ISO_A3_TO_CODE[id];
        const price = countryCode ? priceMap.get(countryCode) : null;
        if (price) return getPriceTierColor(price.price_eur);
        // Countries not in ENTSO-E
        return "#f3f4f6";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("cursor", (d) => {
        const id = d.id as string;
        return ISO_A3_TO_CODE[id] ? "pointer" : "default";
      })
      .attr("opacity", (d) => {
        const id = d.id as string;
        const code = ISO_A3_TO_CODE[id];
        if (!code) return 0.4;
        if (selectedCountry && code !== selectedCountry) return 0.7;
        return 1;
      })
      .on("mouseenter", function (event, d) {
        const id = d.id as string;
        const code = ISO_A3_TO_CODE[id];
        if (!code) return;

        const country = COUNTRIES[code];
        const price = priceMap.get(code);
        if (!country || !price) return;

        d3.select(this).attr("stroke", "#111827").attr("stroke-width", 2);

        const tooltip = tooltipRef.current;
        if (tooltip) {
          tooltip.style.display = "block";
          tooltip.innerHTML = `
            <div class="font-semibold text-sm text-gray-900">${country.flag} ${country.name}</div>
            <div class="text-2xl font-bold mt-1" style="color: ${getPriceTierColor(price.price_eur)}">
              ${price.price_eur.toFixed(1)} <span class="text-xs font-normal text-gray-400">EUR/MWh</span>
            </div>
            ${
              price.change_pct !== null
                ? `<div class="text-xs mt-1 ${price.change_pct >= 0 ? "text-red-500" : "text-emerald-500"}">
                    ${price.change_pct >= 0 ? "+" : ""}${price.change_pct.toFixed(1)}% vs yesterday
                  </div>`
                : ""
            }
          `;
        }
      })
      .on("mousemove", (event) => {
        const tooltip = tooltipRef.current;
        if (tooltip) {
          const rect = svgRef.current!.getBoundingClientRect();
          tooltip.style.left = `${event.clientX - rect.left + 12}px`;
          tooltip.style.top = `${event.clientY - rect.top - 10}px`;
        }
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 1);
        const tooltip = tooltipRef.current;
        if (tooltip) tooltip.style.display = "none";
      })
      .on("click", (_event, d) => {
        const id = d.id as string;
        const code = ISO_A3_TO_CODE[id];
        if (code) onCountryClick(code);
      });
  }, [prices, selectedCountry, onCountryClick, priceMap]);

  useEffect(() => {
    drawMap();

    const handleResize = () => drawMap();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawMap]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      />
      <div
        ref={tooltipRef}
        className="absolute hidden bg-white rounded-lg shadow-md border border-gray-100 px-4 py-3 pointer-events-none z-10"
        style={{ minWidth: "160px" }}
      />
    </div>
  );
}
