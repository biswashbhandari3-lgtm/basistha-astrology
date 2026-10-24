"use client";

import React from "react";
import { KundaliData } from "@/types/astrology";

interface PlanetaryTableProps {
  data: KundaliData;
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-amber-200 flex justify-between items-center">
        <h3 className="font-bold text-vedic-burgundy text-base flex items-center gap-2">
          <span>🪐</span> ग्रह स्पष्ट तालिका (Planetary Longitudes & Positions)
        </h3>
        <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full">
          अयनांश: {data.ayanamsha_name} ({data.ayanamsha_value}°)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <th className="py-2.5 px-3">ग्रह (Planet)</th>
              <th className="py-2.5 px-3">राशि (Rashi)</th>
              <th className="py-2.5 px-3">अंश (Degree)</th>
              <th className="py-2.5 px-3">कला-विकला (DMS)</th>
              <th className="py-2.5 px-3">नक्षत्र (Nakshatra)</th>
              <th className="py-2.5 px-3">पाद (Pada)</th>
              <th className="py-2.5 px-3">गति (Speed)</th>
              <th className="py-2.5 px-3 text-center">वक्री/मार्गी</th>
              <th className="py-2.5 px-3 text-center">अस्त</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {/* Lagna Row */}
            <tr className="bg-amber-50/60 font-semibold text-vedic-burgundy">
              <td className="py-2 px-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-vedic-saffron"></span>
                लग्न (Ascendant)
              </td>
              <td className="py-2 px-3">{data.lagna.rashi_name_ne} ({data.lagna.rashi_name})</td>
              <td className="py-2 px-3 font-mono">{data.lagna.degree}°</td>
              <td className="py-2 px-3 font-mono">{data.lagna.minute}&apos; {data.lagna.second}&quot;</td>
              <td className="py-2 px-3">{data.lagna.nakshatra_name_ne}</td>
              <td className="py-2 px-3">{data.lagna.nakshatra_pada}</td>
              <td className="py-2 px-3 font-mono">-</td>
              <td className="py-2 px-3 text-center">-</td>
              <td className="py-2 px-3 text-center">-</td>
            </tr>

            {/* Planets */}
            {data.planets.map(p => (
              <tr key={p.name} className="hover:bg-amber-50/40 transition-colors">
                <td className="py-2 px-3 font-semibold text-slate-900">
                  {p.name_ne} ({p.name})
                </td>
                <td className="py-2 px-3">
                  {p.rashi_name_ne} ({p.rashi_name})
                </td>
                <td className="py-2 px-3 font-mono font-semibold">
                  {p.degree}°
                </td>
                <td className="py-2 px-3 font-mono text-slate-600">
                  {p.minute}&apos; {p.second}&quot;
                </td>
                <td className="py-2 px-3">
                  {p.nakshatra_name_ne}
                </td>
                <td className="py-2 px-3">
                  पाद {p.nakshatra_pada}
                </td>
                <td className="py-2 px-3 font-mono text-slate-600">
                  {p.speed}°/दिन
                </td>
                <td className="py-2 px-3 text-center">
                  {p.is_retrograde ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">
                      वक्री
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium">
                      मार्गी
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  {p.is_combust ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                      अस्त
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
