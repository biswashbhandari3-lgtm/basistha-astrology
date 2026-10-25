"use client";

import React from "react";
import { PanchangData } from "@/types/astrology";

interface PanchangaCardProps {
  panchang: PanchangData;
}

export const PanchangaCard: React.FC<PanchangaCardProps> = ({ panchang }) => {
  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-md p-5 flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-amber-100 pb-3">
        <div>
          <h3 className="font-bold text-vedic-burgundy text-lg flex items-center gap-2">
            <span>📅</span> दैनिक पञ्चाङ्ग (Daily Vedic Panchanga)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            मिति: {panchang.date_str} • {panchang.vara.name_ne}
          </p>
        </div>
        <span className="text-xs bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-bold">
          Basistha Panchang
        </span>
      </div>

      {/* Sun times grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-xs">
        <div>
          <span className="text-slate-500">सूर्योदय (काठमाडौँ):</span>
          <p className="text-sm font-bold text-amber-900">{panchang.sunrise}</p>
        </div>
        <div>
          <span className="text-slate-500">सूर्यास्त (काठमाडौँ):</span>
          <p className="text-sm font-bold text-amber-900">{panchang.sunset}</p>
        </div>
        <div>
          <span className="text-slate-500">दिनमान (Day Duration):</span>
          <p className="text-sm font-bold text-amber-900">{panchang.day_length_ghati}</p>
        </div>
        <div>
          <span className="text-slate-500">अभिजित मुहूर्त:</span>
          <p className="text-sm font-bold text-emerald-700">
            {panchang.abhijit_muhurta.start} - {panchang.abhijit_muhurta.end}
          </p>
        </div>
      </div>

      {/* 5 Angas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Tithi */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">१. तिथि (Tithi)</span>
          <h4 className="font-bold text-slate-800 text-sm mt-1">{panchang.tithi.name_ne}</h4>
          <span className="text-[10px] text-slate-500">{panchang.tithi.name}</span>
          {panchang.tithi.ghati && (
            <span className="text-[10px] font-bold text-amber-900 mt-1">{panchang.tithi.ghati} ({panchang.tithi.end_time} सम्म)</span>
          )}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-vedic-saffron h-full rounded-full" style={{ width: `${panchang.tithi.progress_percentage}%` }}></div>
          </div>
        </div>

        {/* Vara */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">२. वार (Vara)</span>
          <h4 className="font-bold text-slate-800 text-sm mt-1">{panchang.vara.name_ne}</h4>
          <span className="text-[10px] text-slate-500">{panchang.vara.name}</span>
          <span className="text-[10px] font-bold text-emerald-800 mt-1">अहोरात्रमान ६० घटी</span>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* Nakshatra */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">३. नक्षत्र (Nakshatra)</span>
          <h4 className="font-bold text-slate-800 text-sm mt-1">{panchang.nakshatra.name_ne}</h4>
          <span className="text-[10px] text-slate-500">{panchang.nakshatra.name}</span>
          {panchang.nakshatra.ghati && (
            <span className="text-[10px] font-bold text-amber-900 mt-1">{panchang.nakshatra.ghati} ({panchang.nakshatra.end_time} सम्म)</span>
          )}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-vedic-saffron h-full rounded-full" style={{ width: `${panchang.nakshatra.progress_percentage}%` }}></div>
          </div>
        </div>

        {/* Yoga */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">४. योग (Yoga)</span>
          <h4 className="font-bold text-slate-800 text-sm mt-1">{panchang.yoga.name_ne}</h4>
          <span className="text-[10px] text-slate-500">{panchang.yoga.name}</span>
          {panchang.yoga.ghati && (
            <span className="text-[10px] font-bold text-amber-900 mt-1">{panchang.yoga.ghati} ({panchang.yoga.end_time} सम्म)</span>
          )}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-vedic-saffron h-full rounded-full" style={{ width: `${panchang.yoga.progress_percentage}%` }}></div>
          </div>
        </div>

        {/* Karana */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">५. करण (Karana)</span>
          <h4 className="font-bold text-slate-800 text-sm mt-1">{panchang.karana.name_ne}</h4>
          <span className="text-[10px] text-slate-500">{panchang.karana.name}</span>
          {panchang.karana.ghati && (
            <span className="text-[10px] font-bold text-amber-900 mt-1">{panchang.karana.ghati} ({panchang.karana.end_time} सम्म)</span>
          )}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-vedic-saffron h-full rounded-full" style={{ width: `${panchang.karana.progress_percentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Choghadiya Day Section */}
      {panchang.choghadiya_day && panchang.choghadiya_day.length > 0 && (
        <div className="mt-1">
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <span>☀️</span> दिवा चौघडिया / बारवेला (Day Choghadiya Muhurtas)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-8 gap-2 text-center text-xs">
            {panchang.choghadiya_day.map(c => {
              const isGood = c.name === "Amrit" || c.name === "Shubh" || c.name === "Labh";
              return (
                <div
                  key={c.order}
                  className={`p-2 rounded-lg border ${
                    isGood
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  }`}
                >
                  <p className="font-bold text-[11px]">{c.name_ne}</p>
                  <p className="text-[10px] font-mono mt-0.5 opacity-80">{c.start}-{c.end}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
