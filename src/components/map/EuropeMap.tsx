"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { CountryPrice, getPriceTierColor } from "@/types/energy";
import { ISO_NUM_TO_CODE, COUNTRIES } from "@/lib/countries";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const topoRef = useRef<Topology | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const isInitializedRef = useRef(false);

  // Stable refs for event handlers (avoids redraw on every change)
  const onCountryClickRef = useRef(onCountryClick);
  onCountryClickRef.current = onCountryClick;

  const priceMap = useMemo(
    () => new Map(prices.map((p) => [p.country, p])),
    [prices]
  );
  const priceMapRef = useRef(priceMap);
  priceMapRef.current = priceMap;

  const selectedCountryRef = useRef(selectedCountry);
  selectedCountryRef.current = selectedCountry;

  // Draw geometry once (on mount and resize only)
  const initMap = useCallback(async () => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    // Load topology once
    if (!topoRef.current) {
      topoRef.current = (await d3.json("/europe.topo.json")) as Topology;
    }
    const topology = topoRef.current;
    const countries = topojson.feature(
      topology,
      topology.objects.countries as GeometryCollection
    );

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const europeanFeatures = countries.features.filter((f) => {
      const id = f.id as string;
      return !!ISO_NUM_TO_CODE[id];
    });

    const padding = 20;
    const projection = d3
      .geoMercator()
      .fitExtent(
        [
          [padding, padding],
          [width - padding, height - padding],
        ],
        { type: "FeatureCollection", features: europeanFeatures }
      );

    const path = d3.geoPath().projection(projection);

    const g = svg.append("g");
    gRef.current = g.node();

    // Draw country paths
    g.selectAll<SVGPathElement, (typeof countries.features)[0]>("path.country")
      .data(countries.features, (d) => d.id as string)
      .join("path")
      .attr("class", "country")
      .attr("data-id", (d) => d.id as string)
      .attr("d", path as never)
      .attr("fill", (d) => {
        const code = ISO_NUM_TO_CODE[d.id as string];
        const price = code ? priceMapRef.current.get(code) : null;
        if (price) return getPriceTierColor(price.price_eur);
        return "#dfe4e1";
      })
      .attr("stroke", "rgba(255,255,255,0.92)")
      .attr("stroke-width", 0.8)
      .attr("cursor", (d) =>
        ISO_NUM_TO_CODE[d.id as string] ? "pointer" : "default"
      )
      .attr("opacity", (d) => {
        const code = ISO_NUM_TO_CODE[d.id as string];
        if (!code) return 0.25;
        const sel = selectedCountryRef.current;
        if (sel && code !== sel) return 0.6;
        return 1;
      })
      .on("mouseenter", function (_event, d) {
        const code = ISO_NUM_TO_CODE[d.id as string];
        if (!code) return;
        const country = COUNTRIES[code];
        const price = priceMapRef.current.get(code);
        if (!country || !price) return;

        d3.select(this)
          .attr("stroke", "#111827")
          .attr("stroke-width", 1.5)
          .raise();

        const tooltip = tooltipRef.current;
        if (tooltip) {
          tooltip.style.display = "block";
          tooltip.innerHTML = `
            <div class="font-semibold text-sm text-gray-900">${country.flag} ${country.name}</div>
            <div class="text-xl font-bold mt-1" style="color: ${getPriceTierColor(price.price_eur)}">
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
          const rect = containerRef.current!.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const tw = 180;
          const th = 80;
          const tx = x + tw + 14 > width ? x - tw - 14 : x + 14;
          const ty = Math.max(Math.min(y - 10, height - th), 10);
          tooltip.style.left = `${tx}px`;
          tooltip.style.top = `${ty}px`;
        }
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 0.8);
        const tooltip = tooltipRef.current;
        if (tooltip) tooltip.style.display = "none";
      })
      .on("click", (_event, d) => {
        const code = ISO_NUM_TO_CODE[d.id as string];
        if (code) onCountryClickRef.current(code);
      });

    // Country border mesh
    const mesh = topojson.mesh(
      topology,
      topology.objects.countries as GeometryCollection,
      (a, b) => a !== b
    );
    g.append("path")
      .datum(mesh)
      .attr("d", path as never)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.9)")
      .attr("stroke-width", 0.5)
      .attr("pointer-events", "none");

    // Zoom behavior — set up once, never recreated
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;
    isInitializedRef.current = true;
  }, []); // No deps — only runs on mount/resize

  // Init map on mount + resize
  useEffect(() => {
    initMap();

    const observer = new ResizeObserver(() => {
      // Save current transform, reinit, restore
      let savedTransform: d3.ZoomTransform | null = null;
      if (svgRef.current && zoomRef.current) {
        savedTransform = d3.zoomTransform(svgRef.current);
      }
      initMap().then(() => {
        if (
          savedTransform &&
          svgRef.current &&
          zoomRef.current &&
          gRef.current
        ) {
          const svg = d3.select(svgRef.current);
          svg.call(zoomRef.current.transform, savedTransform);
        }
      });
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [initMap]);

  // Update colors/opacity when prices or selection change (no redraw)
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);

    g.selectAll<SVGPathElement, unknown>("path.country").each(function () {
      const el = d3.select(this);
      const id = el.attr("data-id");
      const code = ISO_NUM_TO_CODE[id];

      // Update fill
      const price = code ? priceMap.get(code) : null;
      el.attr("fill", price ? getPriceTierColor(price.price_eur) : "#e5e7eb");

      // Update opacity
      if (!code) {
        el.attr("opacity", 0.25);
      } else if (selectedCountry && code !== selectedCountry) {
        el.attr("opacity", 0.6);
      } else {
        el.attr("opacity", 1);
      }
    });
  }, [priceMap, selectedCountry]);

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    zoomRef.current.scaleBy(svg.transition().duration(300), 1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    zoomRef.current.scaleBy(svg.transition().duration(300), 1 / 1.5);
  }, []);

  const handleReset = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        className="absolute inset-0"
        style={{ cursor: "grab" }}
      />

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <button
          onClick={handleZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-[#505f76] shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md transition-colors hover:text-[#111827]"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-[#505f76] shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md transition-colors hover:text-[#111827]"
          title="Zoom out"
        >
          -
        </button>
        <button
          onClick={handleReset}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-[#505f76] shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md transition-colors hover:text-[#111827]"
          title="Reset view"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-20 hidden rounded-[18px] border border-white/70 bg-white/95 px-3 py-2.5 shadow-[0_24px_80px_-60px_rgba(17,24,39,0.7)] backdrop-blur-md"
        style={{ minWidth: "150px" }}
      />
    </div>
  );
}
