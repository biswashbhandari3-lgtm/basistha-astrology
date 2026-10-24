"use client";

import React, { useState } from "react";
import { DashaData } from "@/types/astrology";

interface DashaTableProps {
  dasha: DashaData;
}

export const DashaTable: React.FC<DashaTableProps> = ({ dasha }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-md p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-amber-100 pb-3">
        <div>
          <h3 className="font-bold text-vedic-burgundy text-lg flex items-center gap-2">
            <span>⏳</span> {dasha.dasha_system}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            जन्म समयमा दशा शेष:{" "}
            <span className="font-semibold text-amber-900">
              {dasha.balance_of_dasha.first_lord_ne} (
              {dasha.balance_of_dasha.balance_text || `${dasha.balance_of_dasha.balance_years} वर्ष`}
              )
            </span>
          </p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
          Basistha Dasha Engine
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {dasha.dasha_tree.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          const hasSub = item.sub_dashas && item.sub_dashas.length > 0;

          return (
            <div
              key={item.planet + idx}
              className="border border-slate-200 rounded-xl overflow-hidden transition-all"
            >
              <div
                onClick={() => hasSub && setExpandedIndex(isExpanded ? null : idx)}
                className={`flex justify-between items-center p-3.5 cursor-pointer transition-colors ${
                  isExpanded ? "bg-amber-100/70 font-semibold" : "bg-slate-50 hover:bg-amber-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-vedic-saffron text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {item.planet_ne.substring(0, 2)}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.planet_ne} महादशा ({item.planet})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      अवधि: {item.duration_years} वर्ष
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    {item.start_date} देखि {item.end_date} सम्म
                  </span>
                  {hasSub && (
                    <span className="text-amber-800 text-sm font-bold">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-dashas (Antardasha accordion) */}
              {isExpanded && hasSub && (
                <div className="bg-white p-3 border-t border-amber-200">
                  <h5 className="text-xs font-bold text-slate-700 mb-2">
                    {item.planet_ne} भित्रका अन्तर्दशाहरू (Antardashas):
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {item.sub_dashas!.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center"
                      >
                        <span className="font-semibold text-slate-800">
                          {sub.sub_planet_ne}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {sub.start} - {sub.end}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
