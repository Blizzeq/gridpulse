"use client";

import { Flow } from "@/types/energy";
import { COUNTRIES, FLOW_PAIRS } from "@/lib/countries";

interface FlowArrowsProps {
  flows: Flow[];
  projection: (coords: [number, number]) => [number, number] | null;
}

export function FlowArrows({ flows, projection }: FlowArrowsProps) {
  const flowMap = new Map(
    flows.map((f) => [`${f.from_country}-${f.to_country}`, f])
  );

  return (
    <g className="flow-arrows">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="4"
          refX="5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0, 6 2, 0 4" fill="#9ca3af" />
        </marker>
      </defs>
      {FLOW_PAIRS.map(([from, to]) => {
        const flow =
          flowMap.get(`${from}-${to}`) ?? flowMap.get(`${to}-${from}`);
        if (!flow) return null;

        const fromCountry = COUNTRIES[from];
        const toCountry = COUNTRIES[to];
        if (!fromCountry || !toCountry) return null;

        const fromPoint = projection(fromCountry.centroid as [number, number]);
        const toPoint = projection(toCountry.centroid as [number, number]);
        if (!fromPoint || !toPoint) return null;

        const isReverse = flow.flow_mw < 0;
        const [x1, y1] = isReverse ? toPoint : fromPoint;
        const [x2, y2] = isReverse ? fromPoint : toPoint;
        const absMw = Math.abs(flow.flow_mw);

        // Scale stroke width by flow volume
        const strokeWidth = Math.max(0.5, Math.min(3, absMw / 1000));
        const opacity = Math.max(0.2, Math.min(0.6, absMw / 2000));

        return (
          <line
            key={`${from}-${to}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#9ca3af"
            strokeWidth={strokeWidth}
            strokeDasharray="4 3"
            opacity={opacity}
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </g>
  );
}
