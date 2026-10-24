"use client";

import React, { useState } from "react";
import { KundaliData, PlanetaryPosition } from "@/types/astrology";

interface NorthIndianChartProps {
  data: KundaliData;
  title?: string;
  chartType?: "D1" | "D9" | "Moon";
}

// Fixed house coordinate centroids in 400x400 SVG box
const HOUSE_CENTROIDS: Record<number, { x: number; y: number; rashiPos: { x: number; y: number } }> = {
  1:  { x: 200, y: 110, rashiPos: { x: 200, y: 70 } },
  2:  { x: 100, y: 55,  rashiPos: { x: 140, y: 40 } },
  3:  { x: 50,  y: 105, rashiPos: { x: 40,  y: 70 } },
  4:  { x: 110, y: 200, rashiPos: { x: 160, y: 200 } },
  5:  { x: 50,  y: 295, rashiPos: { x: 40,  y: 330 } },
  6:  { x: 100, y: 345, rashiPos: { x: 140, y: 360 } },
  7:  { x: 200, y: 290, rashiPos: { x: 200, y: 330 } },
  8:  { x: 300, y: 345, rashiPos: { x: 260, y: 360 } },
  9:  { x: 350, y: 295, rashiPos: { x: 360, y: 330 } },
  10: { x: 290, y: 200, rashiPos: { x: 240, y: 200 } },
  11: { x: 350, y: 105, rashiPos: { x: 360, y: 70 } },
  12: { x: 300, y: 55,  rashiPos: { x: 260, y: 40 } },
};

const PLANET_SHORT_NE: Record<string, string> = {
  Sun: "सू",
  Moon: "चं",
  Mars: "मं",
  Mercury: "बु",
  Jupiter: "गु",
  Venus: "शु",
  Saturn: "श",
  Rahu: "रा",
  Ketu: "के",
  Uranus: "यु",
  Neptune: "ने",
  Pluto: "प्लू"
};

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  data,
  title = "लग्न कुण्डली (North Indian D1)",
  chartType = "D1"
}) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetaryPosition | null>(null);

  // Determine base Lagna Rashi for this chart
  let lagnaRashi = data.lagna.rashi_id; // 1-12
  if (chartType === "D9" && data.divisional_charts?.Lagna?.D9_Navamsha) {
    lagnaRashi = data.divisional_charts.Lagna.D9_Navamsha;
  } else if (chartType === "Moon") {
    const moon = data.planets.find(p => p.planet_id === 1);
    if (moon) lagnaRashi = moon.rashi_id;
  }

  // Calculate Rashi for each of the 12 houses
  const houseRashiMap: Record<number, number> = {};
  for (let h = 1; h <= 12; h++) {
    houseRashiMap[h] = ((lagnaRashi - 1 + (h - 1)) % 12) + 1;
  }

  // Group planets by house based on matching Rashi
  const housePlanets: Record<number, PlanetaryPosition[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    7: [], 8: [], 9: [], 10: [], 11: [], 12: []
  };

  data.planets.forEach(p => {
    let pRashi = p.rashi_id;
    if (chartType === "D9" && data.divisional_charts?.[p.name]?.D9_Navamsha) {
      pRashi = data.divisional_charts[p.name].D9_Navamsha;
    }
    // Find which house holds this rashi
    for (let h = 1; h <= 12; h++) {
      if (houseRashiMap[h] === pRashi) {
        housePlanets[h].push(p);
        break;
      }
    }
  });

  return (
    <div className="flex flex-col items-center bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-md">
      <div className="flex justify-between items-center w-full mb-3 px-2">
        <h3 className="font-semibold text-vedic-burgundy text-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-vedic-saffron inline-block"></span>
          {title}
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
          Basistha SVG Engine
        </span>
      </div>

      <div className="relative w-full max-w-[420px] aspect-square">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-sm select-none"
        >
          {/* Background */}
          <rect x="0" y="0" width="400" height="400" fill="#fffdfa" rx="12" />

          {/* Outer Border */}
          <rect
            x="4"
            y="4"
            width="392"
            height="392"
            fill="none"
            stroke="#ea580c"
            strokeWidth="3"
            rx="8"
          />

          {/* Diagonals */}
          <line x1="4" y1="4" x2="396" y2="396" stroke="#d97706" strokeWidth="1.5" />
          <line x1="396" y1="4" x2="4" y2="396" stroke="#d97706" strokeWidth="1.5" />

          {/* Inner Diamond (Kendra Rhombus) */}
          <polygon
            points="200,4 396,200 200,396 4,200"
            fill="none"
            stroke="#ea580c"
            strokeWidth="2"
          />

          {/* House 1 highlight (Lagna) */}
          <polygon
            points="200,4 300,102 200,200 100,102"
            fill="#ffedd5"
            opacity="0.4"
          />

          {/* Render 12 Houses: Rashi Numbers & Planets */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map(houseNum => {
            const centroid = HOUSE_CENTROIDS[houseNum];
            const rashiNum = houseRashiMap[houseNum];
            const planets = housePlanets[houseNum] || [];

            return (
              <g key={`house-${houseNum}`}>
                {/* Rashi Number in small golden badge */}
                <text
                  x={centroid.rashiPos.x}
                  y={centroid.rashiPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#9a3412"
                  className="font-serif"
                >
                  {rashiNum}
                </text>

                {/* Planets inside this house */}
                <g>
                  {planets.map((p, idx) => {
                    const row = Math.floor(idx / 2);
                    const col = idx % 2;
                    const offsetX = (col - (planets.length > 1 ? 0.5 : 0)) * 28;
                    const offsetY = row * 16;
                    const px = centroid.x + offsetX;
                    const py = centroid.y + offsetY - (planets.length > 2 ? 8 : 0);

                    const shortName = PLANET_SHORT_NE[p.name] || p.name.substring(0, 2);
                    const isRetro = p.is_retrograde;
                    const isComb = p.is_combust;

                    return (
                      <g
                        key={`p-${p.name}`}
                        className="cursor-pointer transition-transform hover:scale-125"
                        onMouseEnter={() => setHoveredPlanet(p)}
                        onMouseLeave={() => setHoveredPlanet(null)}
                      >
                        <circle
                          cx={px}
                          cy={py}
                          r="10"
                          fill={isRetro ? "#fee2e2" : isComb ? "#fef3c7" : "#f1f5f9"}
                          stroke={isRetro ? "#dc2626" : isComb ? "#d97706" : "#475569"}
                          strokeWidth="1"
                        />
                        <text
                          x={px}
                          y={py}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="9"
                          fontWeight="bold"
                          fill={isRetro ? "#b91c1c" : "#0f172a"}
                        >
                          {shortName}
                          {isRetro ? "व" : ""}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPlanet && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md border border-slate-700 animate-fade-in pointer-events-none">
            <div className="flex justify-between items-center font-bold text-amber-300 border-b border-slate-700 pb-1 mb-1">
              <span>{hoveredPlanet.name_ne} ({hoveredPlanet.name})</span>
              <span>{hoveredPlanet.rashi_name_ne} {hoveredPlanet.degree}° {hoveredPlanet.minute}&apos;</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
              <div>नक्षत्र: <span className="text-white">{hoveredPlanet.nakshatra_name_ne} (पाद {hoveredPlanet.nakshatra_pada})</span></div>
              <div>गति: <span className="text-white">{hoveredPlanet.speed}°/दिन</span></div>
              <div>स्थिति: <span className={hoveredPlanet.is_retrograde ? "text-red-400 font-bold" : "text-emerald-400"}>{hoveredPlanet.is_retrograde ? "वक्री (Retrograde)" : "मार्गी (Direct)"}</span></div>
              <div>अस्त: <span className={hoveredPlanet.is_combust ? "text-amber-400 font-bold" : "text-emerald-400"}>{hoveredPlanet.is_combust ? "अस्त (Combust)" : "उदित"}</span></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-500 inline-block"></span>
          (व) = वक्री
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-500 inline-block"></span>
          अस्त = दग्ध
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-orange-100 border border-orange-400 inline-block"></span>
          १ = लग्न भाव
        </span>
      </div>
    </div>
  );
};
