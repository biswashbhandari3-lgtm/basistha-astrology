"use client";

import React from "react";
import { KundaliData } from "@/types/astrology";

interface SouthIndianChartProps {
  data: KundaliData;
  title?: string;
}

// South Indian fixed sign grid coordinates (4x4 grid, center 2x2 is empty title)
const SIGN_GRID_POSITIONS: Record<number, { col: number; row: number; name: string }> = {
  12: { col: 0, row: 0, name: "मीन" },
  1:  { col: 1, row: 0, name: "मेष" },
  2:  { col: 2, row: 0, name: "वृष" },
  3:  { col: 3, row: 0, name: "मिथुन" },
  4:  { col: 3, row: 1, name: "कर्कट" },
  5:  { col: 3, row: 2, name: "सिंह" },
  6:  { col: 3, row: 3, name: "कन्या" },
  7:  { col: 2, row: 3, name: "तुला" },
  8:  { col: 1, row: 3, name: "वृश्चिक" },
  9:  { col: 0, row: 3, name: "धनु" },
  10: { col: 0, row: 2, name: "मकर" },
  11: { col: 0, row: 1, name: "कुम्भ" },
};

const PLANET_SHORT_NE: Record<string, string> = {
  Sun: "सू", Moon: "चं", Mars: "मं", Mercury: "बु",
  Jupiter: "गु", Venus: "शु", Saturn: "श", Rahu: "रा", Ketu: "के"
};

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
  data,
  title = "दक्षिण भारतीय कुण्डली (South Indian Chart)"
}) => {
  const lagnaRashi = data.lagna.rashi_id;

  // Group planets by Rashi
  const rashiPlanets: Record<number, string[]> = {};
  for (let r = 1; r <= 12; r++) rashiPlanets[r] = [];

  data.planets.forEach(p => {
    const s = `${PLANET_SHORT_NE[p.name] || p.name.substring(0, 2)}${p.is_retrograde ? "(व)" : ""}`;
    rashiPlanets[p.rashi_id]?.push(s);
  });

  return (
    <div className="flex flex-col items-center bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-md">
      <div className="flex justify-between items-center w-full mb-3 px-2">
        <h3 className="font-semibold text-vedic-burgundy text-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-vedic-saffron inline-block"></span>
          {title}
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
          Fixed Signs
        </span>
      </div>

      <div className="w-full max-w-[420px] aspect-square">
        <div className="grid grid-cols-4 grid-rows-4 w-full h-full border-2 border-vedic-saffron rounded-xl overflow-hidden bg-white shadow-inner">
          {Array.from({ length: 4 }).map((_, rIdx) =>
            Array.from({ length: 4 }).map((_, cIdx) => {
              // Center 2x2 box
              if ((rIdx === 1 || rIdx === 2) && (cIdx === 1 || cIdx === 2)) {
                if (rIdx === 1 && cIdx === 1) {
                  return (
                    <div
                      key="center-box"
                      className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-amber-100/50 p-2 text-center border border-amber-300"
                    >
                      <span className="font-bold text-vedic-burgundy text-sm">
                        Basistha Astro
                      </span>
                      <span className="text-xs text-amber-800 font-medium mt-1">
                        लग्न: {data.lagna.rashi_name_ne} ({data.lagna.degree}°)
                      </span>
                    </div>
                  );
                }
                return null;
              }

              // Find sign that belongs to (cIdx, rIdx)
              const signEntry = Object.entries(SIGN_GRID_POSITIONS).find(
                ([_, pos]) => pos.col === cIdx && pos.row === rIdx
              );

              if (!signEntry) return <div key={`${rIdx}-${cIdx}`} className="border border-amber-200" />;

              const rashiId = parseInt(signEntry[0]);
              const { name } = signEntry[1];
              const isLagna = rashiId === lagnaRashi;
              const planets = rashiPlanets[rashiId] || [];

              return (
                <div
                  key={`sign-${rashiId}`}
                  className={`relative p-1.5 border border-amber-300 flex flex-col justify-between ${
                    isLagna ? "bg-orange-100/60 font-semibold" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>{name}</span>
                    {isLagna && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold">
                        लग्न
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {planets.map((pStr, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-slate-900 border border-amber-300 shadow-2xs"
                      >
                        {pStr}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
