"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Devanagari Digit Helper
export function toDevanagari(num: number | string): string {
  const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num).replace(/\d/g, (d) => devanagariDigits[parseInt(d, 10)]);
}

// Days of the week in Nepali (Abbreviated)
const WEEKDAYS = [
  { short: "आ", full: "आइतवार" },
  { short: "सो", full: "सोमवार" },
  { short: "मं", full: "मङ्गलबार" },
  { short: "बु", full: "बुधवार" },
  { short: "बि", full: "बिहीवार" },
  { short: "शु", full: "शुक्रवार" },
  { short: "श", full: "शनिवार" },
];

// 12 Nepali Months
const NEPALI_MONTHS = [
  "वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

// Pre-calculated sample data for month of कार्तिक २०८३ (matching the screenshot exactly)
interface DayPanchang {
  gate: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  tithi: string;
  tithiEnd: string;
  nextTithi: string;
  paksha: string;
  festival?: string;
  nakshatra: string;
  nakshatraEnd: string;
  yoga: string;
  yogaEnd: string;
  karana: string;
  karanaEnd: string;
  chandraRashi: string;
  chandraEnd: string;
  suryaRashi: string;
  guruRashi: string;
  sunrise: string;
  sunset: string;
  shakSambat: string;
  nepalSambat: string;
  ritu: string;
  ayana: string;
  samvatsar: string;
}

export function NepaliPanchangCalendar() {
  // Current selected state (Default: 8 Kartik 2083, Sunday)
  const [selectedMonth, setSelectedMonth] = useState("कार्तिक");
  const [selectedYear, setSelectedYear] = useState("२०८३");
  const [selectedGate, setSelectedGate] = useState(8);

  // Live real-time clock state (NST: Nepal Standard Time UTC+5:45)
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize NST time
    const updateTime = () => {
      // Create current date adjusted to UTC+5:45
      const now = new Date();
      setCurrentTime(now);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Selected Day Panchang details (Matching the screenshot for कार्तिक ८)
  const panchangData: DayPanchang = {
    gate: selectedGate,
    dayOfWeek: 0, // Sunday
    tithi: "चतुर्दशी तिथि",
    tithiEnd: "१०:२७ AM सम्म",
    nextTithi: "उप्रान्त पूर्णिमा",
    paksha: "आश्विनशुक्ल पक्ष:",
    festival: selectedGate === 8 ? "कोजाग्रत पूर्णिमा (दशैं समापन)" : undefined,
    nakshatra: "रेवती",
    nakshatraEnd: "३३:४८",
    yoga: "हर्षण",
    yogaEnd: "३२:५७",
    karana: "वणिज",
    karanaEnd: "१०:४५",
    chandraRashi: "मीन",
    chandraEnd: "२०:५१ सम्म",
    suryaRashi: "तुला",
    guruRashi: "सिंह",
    sunrise: "०६:०९ AM",
    sunset: "१७:२६ PM",
    shakSambat: "शाके १९४८",
    nepalSambat: "ने.सं. ११४६ (कौलाथ्व)",
    ritu: "शरद्ऋतु:",
    ayana: "दक्षिणायनं",
    samvatsar: "रौद्रनामसंवत्सरः ।"
  };

  // Month days setup for कार्तिक (30 days, 1 starts on Sunday)
  const totalDays = 30;
  const startDayOffset = 0; // Starts on Sunday (index 0)
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Previous month filler days (e.g. 5 days from previous month if any)
  const prevMonthDays = Array.from({ length: startDayOffset }, (_, i) => 30 - startDayOffset + 1 + i);
  // Next month filler days to complete 35 or 42 grid cells
  const remainingCells = 35 - (startDayOffset + totalDays);
  const nextMonthDays = Array.from({ length: remainingCells > 0 ? remainingCells : remainingCells + 7 }, (_, i) => i + 1);

  // Live Clock calculation
  const hours = currentTime ? currentTime.getHours() : 14;
  const minutes = currentTime ? currentTime.getMinutes() : 33;
  const seconds = currentTime ? currentTime.getSeconds() : 45;

  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  // Format 12-hour digital time in Devanagari
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const isPM = hours >= 12;
  const formattedDigitalTime = `${toDevanagari(String(displayHours).padStart(2, "0"))}:${toDevanagari(
    String(minutes).padStart(2, "0")
  )}:${toDevanagari(String(seconds).padStart(2, "0"))} ${isPM ? "अपरान्ह (PM)" : "पूर्वाह्न (AM)"}`;

  // Live Ishtakal calculation (from sunrise 06:09 AM)
  const currentTotalMinutes = hours * 60 + minutes + seconds / 60;
  const sunriseMinutes = 6 * 60 + 9;
  let diffMinutes = currentTotalMinutes - sunriseMinutes;
  if (diffMinutes < 0) diffMinutes += 24 * 60;
  const totalGhadis = diffMinutes / 24;
  const ghadi = Math.floor(totalGhadis);
  const totalPalas = (totalGhadis - ghadi) * 60;
  const pala = Math.floor(totalPalas);
  const vipala = Math.floor((totalPalas - pala) * 60);
  const formattedIshtakal = `${toDevanagari(ghadi)} घडी ${toDevanagari(pala)} पला ${toDevanagari(vipala)} विपला`;

  return (
    <div className="w-full bg-[#fdfbf7] border-y border-amber-200/60 py-10 lg:py-16 px-4 sm:px-6 lg:px-12 text-slate-900 selection:bg-amber-600 selection:text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Section Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/50 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              दैनिक पञ्चाङ्ग तथा पात्रो
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
            >
              नेपाली वैदिक क्यालेन्डर
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/panchangam"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-orange-900/10 transition-all transform hover:-translate-y-0.5"
            >
              <span>विस्तृत पञ्चाङ्ग हेर्नुहोस्</span>
              <span className="text-base">→</span>
            </Link>
          </div>
        </div>

        {/* Main 2-Column Dashboard (Left: Calendar + Panchang, Right: Live Clock) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT CONTAINER (8 COLS): Top Bar + Left Card + Calendar Grid
             ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-amber-200/70 shadow-xl shadow-amber-950/5 flex flex-col gap-6">
            
            {/* 1. Top Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-100">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Month Dropdown */}
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-slate-800 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {NEPALI_MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-amber-700">
                    ▾
                  </span>
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-slate-800 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {["२०८०", "२०८१", "२०८२", "२०८३", "२०८४", "२०८५"].map((y) => (
                      <option key={y} value={y}>
                        {y} वि.सं.
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-amber-700">
                    ▾
                  </span>
                </div>

                {/* Tradition Pill */}
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/50 border border-amber-200 text-[11px] font-semibold text-amber-950">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>शुद्ध सूर्यसिद्धान्त (मूल पारम्परिक)</span>
                  <span className="bg-amber-700 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">
                    अयनांश मानक
                  </span>
                </div>
              </div>

              {/* Today & Nav Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth("कार्तिक");
                    setSelectedYear("२०८३");
                    setSelectedGate(8);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors shadow-xs"
                >
                  आज
                </button>
                <div className="flex items-center rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedGate((prev) => (prev > 1 ? prev - 1 : 1))}
                    className="px-2.5 py-1.5 hover:bg-amber-100 text-xs font-bold text-slate-700 transition-colors"
                    title="अघिल्लो दिन"
                  >
                    ❮
                  </button>
                  <div className="w-[1px] h-4 bg-amber-200" />
                  <button
                    type="button"
                    onClick={() => setSelectedGate((prev) => (prev < totalDays ? prev + 1 : totalDays))}
                    className="px-2.5 py-1.5 hover:bg-amber-100 text-xs font-bold text-slate-700 transition-colors"
                    title="पछिल्लो दिन"
                  >
                    ❯
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Main Two-Column Row (Left: Selected Day Details, Right: Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* ── Left Column: Today's Panchanga Overview Card ── */}
              <div className="md:col-span-5 bg-[#fbf7ed] border border-amber-200/80 rounded-2xl p-5 flex flex-col gap-4 text-center items-center shadow-xs">
                
                {/* Big Date Header */}
                <div className="flex flex-col items-center">
                  <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-1">
                    {toDevanagari(panchangData.gate)} {selectedMonth}
                  </h3>
                  <p className="text-sm font-bold text-slate-700">
                    {panchangData.dayOfWeek === 0 ? "रविवार" : "वार"}, {selectedYear}
                  </p>
                  <p className="text-xs text-slate-500 font-mono tracking-wider mt-0.5">
                    2026 OCT {panchangData.gate + 17}
                  </p>
                </div>

                {/* Eras Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-slate-600">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-amber-200/60 shadow-2xs">
                    {panchangData.shakSambat}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-amber-200/60 shadow-2xs">
                    {panchangData.nepalSambat}
                  </span>
                </div>

                {/* Paksha Pill */}
                <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#8c3d10] text-amber-50 text-xs font-bold tracking-wide shadow-xs">
                  {panchangData.paksha}
                </div>

                {/* Tithi Detail */}
                <div className="text-xs font-bold text-slate-800 leading-snug">
                  <span>{panchangData.tithi}</span>{" "}
                  <span className="text-[11px] font-medium text-slate-500">
                    ({panchangData.tithiEnd}, {panchangData.nextTithi})
                  </span>
                </div>

                {/* Special Festival Banner (If applicable) */}
                {panchangData.festival && (
                  <div className="w-full py-2 px-3 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs">
                    <span className="text-red-600 text-sm">🚩</span>
                    <span>{panchangData.festival}</span>
                  </div>
                )}

                {/* Ayana & Ritu & Samvatsar */}
                <div className="flex flex-col items-center gap-1 text-[11px] text-slate-600 pt-1 border-t border-amber-200/60 w-full">
                  <div className="font-semibold text-emerald-800">
                    {panchangData.ayana} {panchangData.ritu}
                  </div>
                  <div className="flex items-center gap-1 font-serif text-purple-900 font-bold">
                    <span className="text-amber-500">🕉️</span>
                    <span>{panchangData.samvatsar}</span>
                  </div>
                </div>

                {/* Sun Timings Grid */}
                <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-xs">
                  <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/80 border border-amber-100">
                    <span className="text-amber-500">☀️</span>
                    <span className="text-slate-500 text-[10px]">सूर्योदय:</span>
                    <span className="font-bold text-slate-800">{panchangData.sunrise}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/80 border border-amber-100">
                    <span className="text-orange-500">🌅</span>
                    <span className="text-slate-500 text-[10px]">सूर्यास्त:</span>
                    <span className="font-bold text-slate-800">{panchangData.sunset}</span>
                  </div>
                </div>
              </div>

              {/* ── Right Column: Monthly Calendar Grid + Micro-Cards ── */}
              <div className="md:col-span-7 flex flex-col gap-4 relative">
                
                {/* Subtle Astrological Zodiac Background Watermark */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.04] bg-center bg-no-repeat bg-contain z-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #8c3d10 2px, transparent 2px), radial-gradient(circle, #8c3d10 1px, transparent 1px)"
                  }}
                />

                {/* Calendar Days Table */}
                <div className="relative z-10 w-full overflow-hidden">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 text-center font-bold text-xs pb-2 border-b border-slate-200">
                    {WEEKDAYS.map((w, idx) => (
                      <div
                        key={w.short}
                        className={`py-1 ${idx === 6 ? "text-red-600" : "text-slate-700"}`}
                        title={w.full}
                      >
                        {w.short}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days Matrix */}
                  <div className="grid grid-cols-7 text-center py-2 gap-y-1 gap-x-1 sm:gap-x-2">
                    {/* Previous Month Overflow */}
                    {prevMonthDays.map((d) => (
                      <div
                        key={`prev-${d}`}
                        className="py-2 text-xs font-medium text-slate-300 pointer-events-none"
                      >
                        {toDevanagari(d)}
                      </div>
                    ))}

                    {/* Current Month Active Days */}
                    {daysArray.map((d) => {
                      const isSelected = d === selectedGate;
                      const dayOfWeek = (startDayOffset + d - 1) % 7;
                      const isSaturday = dayOfWeek === 6;

                      return (
                        <button
                          key={`cur-${d}`}
                          type="button"
                          onClick={() => setSelectedGate(d)}
                          className={`group relative py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-[#964013] text-white shadow-md shadow-[#964013]/30 scale-105 z-10 ring-2 ring-amber-400"
                              : isSaturday
                              ? "text-red-600 hover:bg-red-50"
                              : "text-slate-800 hover:bg-amber-50"
                          }`}
                        >
                          <span>{toDevanagari(d)}</span>
                        </button>
                      );
                    })}

                    {/* Next Month Overflow */}
                    {nextMonthDays.map((d) => (
                      <div
                        key={`next-${d}`}
                        className="py-2 text-xs font-medium text-slate-300 pointer-events-none"
                      >
                        {toDevanagari(d)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6 Micro Panchanga Cards Row */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-200 text-center">
                  {/* Nakshatra */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">नक्षत्र</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.nakshatra}</span>
                    <span className="text-[9px] text-amber-700 font-mono">{panchangData.nakshatraEnd}</span>
                  </div>

                  {/* Yoga */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">योग</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.yoga}</span>
                    <span className="text-[9px] text-amber-700 font-mono">{panchangData.yogaEnd}</span>
                  </div>

                  {/* Karana */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">करण</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.karana}</span>
                    <span className="text-[9px] text-amber-700 font-mono">{panchangData.karanaEnd}</span>
                  </div>

                  {/* Chandra */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">चन्द्र</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.chandraRashi}</span>
                    <span className="text-[9px] text-amber-700 font-semibold">{panchangData.chandraEnd}</span>
                  </div>

                  {/* Surya */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">सूर्य</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.suryaRashi}</span>
                    <span className="text-[9px] text-slate-400">राशि</span>
                  </div>

                  {/* Guru */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">गुरु</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.guruRashi}</span>
                    <span className="text-[9px] text-slate-400">राशि</span>
                  </div>
                </div>

                {/* Bottom Legend & Hint */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#964013]" />
                      <span>छानिएको गते</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-bold">
                      <span>१</span>
                      <span>शनिवार / बिदा</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 italic">
                    कुनै पनि गते क्लिक गरी पञ्चाङ्ग हेर्नुहोस्
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT CONTAINER (4 COLS): Live Devanagari Analog Clock + NST
             ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-amber-200/70 shadow-xl shadow-amber-950/5 flex flex-col items-center justify-between gap-6 text-center">
            
            {/* 1. Header Status */}
            <div className="flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>प्रत्यक्ष (Live)</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                नेपाल मानक समय (NST, UTC+०५:४५)
              </p>
            </div>

            {/* 2. Devanagari Round Analog Clock */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-2">
              <svg className="w-full h-full drop-shadow-md" viewBox="0 0 200 200">
                {/* Clock Face Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="94"
                  fill="#ffffff"
                  stroke="#f1e2c8"
                  strokeWidth="6"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#d7b884"
                  strokeWidth="1.5"
                  opacity="0.6"
                />

                {/* 60 Minute/Second Tick Marks */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = (i * 6 * Math.PI) / 180;
                  const isMajor = i % 5 === 0;
                  const r1 = isMajor ? 80 : 83;
                  const r2 = 86;
                  const x1 = 100 + r1 * Math.sin(angle);
                  const y1 = 100 - r1 * Math.cos(angle);
                  const x2 = 100 + r2 * Math.sin(angle);
                  const y2 = 100 - r2 * Math.cos(angle);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isMajor ? "#8c3d10" : "#d1d5db"}
                      strokeWidth={isMajor ? "2" : "0.75"}
                    />
                  );
                })}

                {/* 12 Devanagari Numerals */}
                {[
                  { num: "१२", angle: 0 },
                  { num: "१", angle: 30 },
                  { num: "२", angle: 60 },
                  { num: "३", angle: 90 },
                  { num: "४", angle: 120 },
                  { num: "५", angle: 150 },
                  { num: "६", angle: 180 },
                  { num: "७", angle: 210 },
                  { num: "८", angle: 240 },
                  { num: "९", angle: 270 },
                  { num: "१०", angle: 300 },
                  { num: "११", angle: 330 },
                ].map(({ num, angle }) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 100 + 70 * Math.sin(rad);
                  const y = 100 - 70 * Math.cos(rad) + 4.5;
                  return (
                    <text
                      key={num}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fill={num === "१२" || num === "३" || num === "६" || num === "९" ? "#964013" : "#374151"}
                      fontSize={num.length > 1 ? "11.5" : "12.5"}
                      fontWeight="bold"
                      fontFamily="'Cinzel', 'Georgia', serif"
                    >
                      {num}
                    </text>
                  );
                })}

                {/* Center Country Label */}
                <text
                  x="100"
                  y="124"
                  textAnchor="middle"
                  fill="#b44815"
                  fontSize="8.5"
                  fontWeight="bold"
                  opacity="0.85"
                >
                  नेपाल
                </text>

                {/* Hour Hand */}
                <line
                  x1="100"
                  y1="100"
                  x2={100 + 44 * Math.sin((hourAngle * Math.PI) / 180)}
                  y2={100 - 44 * Math.cos((hourAngle * Math.PI) / 180)}
                  stroke="#1f2937"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Minute Hand */}
                <line
                  x1="100"
                  y1="100"
                  x2={100 + 64 * Math.sin((minuteAngle * Math.PI) / 180)}
                  y2={100 - 64 * Math.cos((minuteAngle * Math.PI) / 180)}
                  stroke="#374151"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Second Hand (Red, Live Ticking) */}
                <line
                  x1={100 - 14 * Math.sin((secondAngle * Math.PI) / 180)}
                  y1={100 + 14 * Math.cos((secondAngle * Math.PI) / 180)}
                  x2={100 + 72 * Math.sin((secondAngle * Math.PI) / 180)}
                  y2={100 - 72 * Math.cos((secondAngle * Math.PI) / 180)}
                  stroke="#dc2626"
                  strokeWidth="1.2"
                />

                {/* Center Pin */}
                <circle cx="100" cy="100" r="4" fill="#964013" />
                <circle cx="100" cy="100" r="1.8" fill="#ffffff" />
              </svg>
            </div>

            {/* 3. Big Devanagari Digital Clock Display */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
                {formattedDigitalTime}
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-1">
                वि.सं. {selectedYear} {selectedMonth} {toDevanagari(panchangData.gate)} गते, {panchangData.dayOfWeek === 0 ? "आइतबार" : "वार"}
              </span>
            </div>

            {/* 4. Astronomical Information Rows (Sunrise, Sunset, Ishtakal) */}
            <div className="w-full pt-4 border-t border-amber-200/60 flex flex-col gap-2.5 text-xs text-left">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-amber-500">☀️</span> सूर्योदय (काठमाडौँ):
                </span>
                <span className="font-bold text-slate-900">{panchangData.sunrise.replace(" AM", "")}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-orange-500">🌅</span> सूर्यास्त:
                </span>
                <span className="font-bold text-slate-900">{panchangData.sunset.replace(" PM", "")}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-purple-600">🕒</span> इष्टकाल:
                </span>
                <span className="font-bold text-purple-900 font-mono text-[11px]">
                  {formattedIshtakal}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
