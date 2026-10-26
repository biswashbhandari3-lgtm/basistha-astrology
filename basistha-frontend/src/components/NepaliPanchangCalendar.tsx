"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  calculateDayPanchang,
  gregorianToBS,
} from "@/lib/vedicPanchangEngine";
import { useLanguage } from "@/context/LanguageContext";

export function NepaliPanchangCalendar() {
  const { language, strings, formatNumber } = useLanguage();

  // Compute today's BS date initially
  const todayBS = useMemo(() => {
    const now = new Date();
    // Nepal Standard Time (UTC+5:45)
    const nstOffset = 5.75 * 60;
    const localUtcMinutes = now.getTime() + now.getTimezoneOffset() * 60000;
    const nstDate = new Date(localUtcMinutes + nstOffset * 60000);
    return gregorianToBS(nstDate);
  }, []);

  // Selected State (Default: Today's real computed Bikram Sambat date)
  const [selectedYear, setSelectedYear] = useState<number>(todayBS.yearBS);
  const [selectedMonth, setSelectedMonth] = useState<number>(todayBS.monthBS);
  const [selectedGate, setSelectedGate] = useState<number>(todayBS.dayBS);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Dynamically calculate full Panchang data for the selected gate, month, year, and language!
  const panchangData = useMemo(() => {
    return calculateDayPanchang(selectedYear, selectedMonth, selectedGate, language);
  }, [selectedYear, selectedMonth, selectedGate, language]);

  // Calendar matrix calculations
  const totalDays = panchangData.totalDaysInMonth;
  const startDayOffset = panchangData.startDayOfWeek; // 0 = Sunday, 6 = Saturday

  // Dynamic Tithi per day of current month
  const currentMonthDaysData = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const p = calculateDayPanchang(selectedYear, selectedMonth, day, language);
      return {
        day,
        tithiName: p.tithi.split(" ")[0],
        dayOfWeek: p.dayOfWeek,
        festival: p.festival
      };
    });
  }, [selectedYear, selectedMonth, totalDays, language]);

  // Previous month overflow days with real tithi names
  const prevMonthDaysData = useMemo(() => {
    const prevMonth = selectedMonth > 1 ? selectedMonth - 1 : 12;
    const prevYear = selectedMonth > 1 ? selectedYear : selectedYear - 1;
    const prevP = calculateDayPanchang(prevYear, prevMonth, 1, language);
    const prevTotal = prevP.totalDaysInMonth;

    return Array.from({ length: startDayOffset }, (_, i) => {
      const day = prevTotal - startDayOffset + 1 + i;
      const p = calculateDayPanchang(prevYear, prevMonth, day, language);
      return {
        day,
        tithiName: p.tithi.split(" ")[0]
      };
    });
  }, [selectedYear, selectedMonth, startDayOffset, language]);

  // Next month overflow days with real tithi names
  const nextMonthDaysData = useMemo(() => {
    const nextMonth = selectedMonth < 12 ? selectedMonth + 1 : 1;
    const nextYear = selectedMonth < 12 ? selectedYear : selectedYear + 1;
    const totalFilled = startDayOffset + totalDays;
    const targetCells = totalFilled > 35 ? 42 : 35;
    const remaining = targetCells - totalFilled;

    return Array.from({ length: remaining }, (_, i) => {
      const day = i + 1;
      const p = calculateDayPanchang(nextYear, nextMonth, day, language);
      return {
        day,
        tithiName: p.tithi.split(" ")[0]
      };
    });
  }, [selectedYear, selectedMonth, startDayOffset, totalDays, language]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth > 1) {
      const prevM = selectedMonth - 1;
      const p = calculateDayPanchang(selectedYear, prevM, 1, language);
      setSelectedMonth(prevM);
      setSelectedGate(Math.min(selectedGate, p.totalDaysInMonth));
    } else {
      const prevY = selectedYear - 1;
      const prevM = 12;
      const p = calculateDayPanchang(prevY, prevM, 1, language);
      setSelectedYear(prevY);
      setSelectedMonth(prevM);
      setSelectedGate(Math.min(selectedGate, p.totalDaysInMonth));
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth < 12) {
      const nextM = selectedMonth + 1;
      const p = calculateDayPanchang(selectedYear, nextM, 1, language);
      setSelectedMonth(nextM);
      setSelectedGate(Math.min(selectedGate, p.totalDaysInMonth));
    } else {
      const nextY = selectedYear + 1;
      const nextM = 1;
      const p = calculateDayPanchang(nextY, nextM, 1, language);
      setSelectedYear(nextY);
      setSelectedMonth(nextM);
      setSelectedGate(Math.min(selectedGate, p.totalDaysInMonth));
    }
  };

  const handleJumpToToday = () => {
    setSelectedYear(todayBS.yearBS);
    setSelectedMonth(todayBS.monthBS);
    setSelectedGate(todayBS.dayBS);
  };

  // Gregorian month name for top subtitle (e.g. "अक्टोबर २०२६" / "OCT 2026")
  const gregorianMonthName = useMemo(() => {
    const d = panchangData.gregorianDate;
    const mEn = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const yStr = d.getFullYear();
    if (language === "en") return `${mEn} ${yStr}`;
    return `${mEn} ${formatNumber(yStr)}`;
  }, [panchangData.gregorianDate, language, formatNumber]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 font-sans">
      {/* ── Outer Shell Frame (White Card with Gentle Rounded Edges) ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-3.5 sm:p-6 lg:p-7 flex flex-col gap-6">

        {/* ── Top Main Layout: Left Visual Card + Right Calendar Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* ══════════════════════════════════════════════════════
              LEFT HERO CARD: Authentic Pagoda Artwork & Date
          ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-4 relative overflow-hidden rounded-3xl border border-amber-200/70 shadow-lg bg-gradient-to-b from-[#143257] via-[#244c79] to-[#fffef8] text-slate-800 p-5 sm:p-6 flex flex-col justify-between min-h-[490px]">
            {/* Pagoda & Himalayan Silhouette Background Artwork */}
            <div className="absolute top-0 inset-x-0 h-52 pointer-events-none overflow-hidden opacity-90 select-none">
              <svg className="w-full h-full object-cover" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0b223d" />
                    <stop offset="60%" stopColor="#1e4674" />
                    <stop offset="100%" stopColor="#4376a8" />
                  </linearGradient>
                  <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="templeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0a192f" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#132742" stopOpacity="0.98" />
                  </linearGradient>
                </defs>
                {/* Sky */}
                <rect width="400" height="220" fill="url(#skyGrad)" />
                {/* Distant Mountain Peaks */}
                <polygon points="20,130 90,60 160,130" fill="url(#snowGrad)" />
                <polygon points="120,135 190,45 270,135" fill="url(#snowGrad)" />
                <polygon points="240,130 310,70 380,130" fill="url(#snowGrad)" />
                {/* Pagoda Roof Tiers (Kathmandu Style) */}
                <path d="M 330 110 L 375 110 L 370 102 L 352 92 L 335 102 Z" fill="#b45309" opacity="0.85" />
                <path d="M 335 92 L 370 92 L 366 84 L 352 76 L 339 84 Z" fill="#92400e" opacity="0.9" />
                <path d="M 342 76 L 363 76 L 360 68 L 352 62 L 345 68 Z" fill="#d97706" opacity="0.95" />
                <circle cx="352.5" cy="58" r="3.5" fill="#fde047" />
                <rect x="345" y="110" width="15" height="40" fill="url(#templeGrad)" />
                {/* Secondary Pagoda Silhouette on Left */}
                <path d="M 30 120 L 75 120 L 70 112 L 52 102 L 35 112 Z" fill="#92400e" opacity="0.6" />
                <path d="M 35 102 L 70 102 L 66 94 L 52 86 L 39 94 Z" fill="#b45309" opacity="0.65" />
                <circle cx="52.5" cy="82" r="2.5" fill="#fde047" opacity="0.8" />
                <rect x="46" y="120" width="13" height="35" fill="url(#templeGrad)" opacity="0.7" />
              </svg>
            </div>

            {/* Top Bar: Bikram Sambat Pill */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-xs">
                <span>📅</span>
                <span>{strings.panchang.bs} {formatNumber(selectedYear)}</span>
              </span>
            </div>

            {/* Center Hero: Circular Gate Emblem + Month & Date Header */}
            <div className="relative z-10 flex items-center gap-4 my-2 text-white">
              {/* Circular Emblem with Gate Number */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#0a1e38] border-2 border-amber-400 shadow-xl flex items-center justify-center text-4xl sm:text-5xl font-black text-white shrink-0 tracking-tight">
                {formatNumber(selectedGate)}
              </div>

              {/* Month Title & Subtitles */}
              <div className="flex flex-col">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md leading-none">
                  {panchangData.monthName}
                </h2>
                <span className="text-sm sm:text-base font-bold text-amber-200 drop-shadow mt-1">
                  {panchangData.dayOfWeekName}, {formatNumber(selectedYear)}
                </span>
                <span className="text-xs font-mono tracking-wider text-slate-200 mt-0.5 uppercase">
                  {panchangData.gregorianDateStr}
                </span>
              </div>
            </div>

            {/* Middle 3 White Badges */}
            <div className="relative z-10 grid grid-cols-3 gap-1.5 my-2 w-full text-center text-[10px] sm:text-[11px] font-bold text-slate-800">
              <div className="bg-white/95 backdrop-blur-md py-1.5 px-1 rounded-xl shadow-2xs border border-amber-100 flex items-center justify-center gap-1">
                <span>🎭</span>
                <span className="truncate">{panchangData.paksha}</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md py-1.5 px-1 rounded-xl shadow-2xs border border-amber-100 flex items-center justify-center gap-1">
                <span>🌙</span>
                <span className="truncate">{panchangData.nepalSambat}</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md py-1.5 px-1 rounded-xl shadow-2xs border border-amber-100 flex items-center justify-center gap-1">
                <span>☀️</span>
                <span className="truncate">{panchangData.suryaRashi} {language === "en" ? "Month" : "मास"}</span>
              </div>
            </div>

            {/* Dark Navy Paksha Pill Banner */}
            <div className="relative z-10 w-full py-2 px-4 rounded-full bg-[#0a2540] hover:bg-[#0f345a] text-amber-300 font-bold text-xs flex items-center justify-between shadow-md transition-colors cursor-pointer my-1">
              <span className="flex items-center gap-2">
                <span>🪷</span>
                <span>{panchangData.monthName} {panchangData.paksha}:</span>
              </span>
              <span className="text-sm font-bold text-amber-400">›</span>
            </div>

            {/* Tithi Detail Line */}
            <div className="relative z-10 text-xs font-bold text-slate-800 text-center leading-relaxed px-1 my-1">
              <span>{panchangData.tithi}</span>{" "}
              <span className="text-[11px] font-medium text-slate-600">
                ({panchangData.tithiGhati} {strings.panchang.ghati}, {panchangData.tithiEnd}, {panchangData.nextTithi})
              </span>
            </div>

            {/* Special Festival Banner (Yellow/Amber Pill) */}
            {panchangData.festival ? (
              <div className="relative z-10 w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-100 to-amber-200/90 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between shadow-xs my-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-red-600 text-base">🚩</span>
                  <span>{panchangData.festival}</span>
                </span>
                <span className="text-sm font-bold text-amber-700">›</span>
              </div>
            ) : (
              <div className="relative z-10 w-full py-2 px-3 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-500 font-medium text-[11px] text-center my-1">
                {strings.panchang.regularDay}
              </div>
            )}

            {/* Bottom Traditional Markers */}
            <div className="relative z-10 flex flex-col items-center gap-1 text-[11px] font-medium text-slate-700 pt-2 border-t border-amber-200/60 w-full text-center">
              <div className="font-bold text-emerald-800">
                🪔 {panchangData.ayana} | {panchangData.ritu}
              </div>
              <div className="font-serif text-purple-900 font-bold">
                🕉️ {panchangData.samvatsar}
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                ⏱️ {language === "en" ? "Dinmaan" : "दिनमान"}: <span className="text-amber-900 font-bold">{panchangData.dinmaanStr}</span> ({panchangData.dinmaanGhati} {strings.panchang.ghati})
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT PANEL: Monthly Calendar Grid & Controls
          ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-slate-200/80 bg-white shadow-sm p-4 sm:p-5 flex flex-col justify-between">
            {/* Top Bar: Prev/Next Month + View Mode Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              {/* Left Month Header with Chevrons */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="अघिल्लो महिना / Previous Month"
                >
                  ❮
                </button>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
                    <span>📅</span>
                    <span>{panchangData.monthName} {formatNumber(selectedYear)}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">
                    ({gregorianMonthName})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="पछिल्लो महिना / Next Month"
                >
                  ❯
                </button>
              </div>

              {/* Right View Switcher Pills */}
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs transition-all cursor-pointer"
                >
                  {strings.panchang.today}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    viewMode === "month"
                      ? "bg-slate-200 text-slate-900 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                  }`}
                >
                  {strings.panchang.month}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    viewMode === "week"
                      ? "bg-slate-200 text-slate-900 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                  }`}
                >
                  साता
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("day")}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    viewMode === "day"
                      ? "bg-slate-200 text-slate-900 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                  }`}
                >
                  {strings.panchang.day}
                </button>
              </div>
            </div>

            {/* Weekday Row Header (आ, सो, मं, बुध, बि, शु, श) */}
            <div className="grid grid-cols-7 text-center font-bold text-xs sm:text-sm pb-2 border-b border-slate-100 text-slate-700">
              {["आ", "सो", "मं", "बुध", "बि", "शु", "श"].map((w, idx) => (
                <div
                  key={w}
                  className={idx === 6 ? "text-red-600 font-black" : "text-slate-800"}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* 7-Column Monthly Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center py-2">
              {/* 1. Previous Month Overflow Trailing Days */}
              {prevMonthDaysData.map((d, idx) => (
                <div
                  key={`prev-${idx}`}
                  className="h-13 sm:h-16 flex flex-col items-center justify-center rounded-xl opacity-40 text-slate-400 select-none"
                >
                  <span className="text-xs sm:text-sm font-semibold">{formatNumber(d.day)}</span>
                  <span className="text-[9px] truncate max-w-[42px]">{d.tithiName}</span>
                </div>
              ))}

              {/* 2. Current Month Real Days */}
              {currentMonthDaysData.map((d) => {
                const isSelected = selectedGate === d.day;
                const isSaturday = d.dayOfWeek === 6;

                return (
                  <button
                    key={`curr-${d.day}`}
                    type="button"
                    onClick={() => setSelectedGate(d.day)}
                    className={`h-13 sm:h-16 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-[#0c2340] text-white shadow-md hover:bg-[#0f2d52] scale-105"
                        : isSaturday
                        ? "text-red-600 hover:bg-red-50/70"
                        : "text-slate-800 hover:bg-slate-100/80"
                    }`}
                  >
                    {/* Gate Number */}
                    <span
                      className={`text-sm sm:text-base font-bold leading-tight ${
                        isSelected
                          ? "text-white font-black"
                          : isSaturday
                          ? "text-red-600 font-black"
                          : "text-slate-800"
                      }`}
                    >
                      {formatNumber(d.day)}
                    </span>

                    {/* Tithi Label */}
                    <span
                      className={`text-[9px] sm:text-[10px] leading-tight truncate max-w-[46px] sm:max-w-[56px] mt-0.5 ${
                        isSelected
                          ? "text-amber-200 font-semibold"
                          : isSaturday
                          ? "text-red-500 font-medium"
                          : "text-slate-500 font-medium"
                      }`}
                    >
                      {d.tithiName}
                    </span>

                    {/* Golden Dot Indicator under selected cell */}
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-xs" />
                    )}
                  </button>
                );
              })}

              {/* 3. Next Month Overflow Days */}
              {nextMonthDaysData.map((d, idx) => (
                <div
                  key={`next-${idx}`}
                  className="h-13 sm:h-16 flex flex-col items-center justify-center rounded-xl opacity-40 text-slate-400 select-none"
                >
                  <span className="text-xs sm:text-sm font-semibold">{formatNumber(d.day)}</span>
                  <span className="text-[9px] truncate max-w-[42px]">{d.tithiName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            BOTTOM STRIP: आजको पञ्चाङ्ग (Micro Panchanga Bar)
        ══════════════════════════════════════════════════════ */}
        <div className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-md p-3.5 sm:p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Section 1: Main Title & Date */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-2xl shadow-xs text-amber-500">
              ☀️
            </div>
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {language === "en" ? "Today's Panchang" : language === "sa" ? "अद्यतनपञ्चाङ्गम्" : "आजको पञ्चाङ्ग"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {panchangData.monthName} {formatNumber(selectedGate)}, {formatNumber(selectedYear)} ({panchangData.dayOfWeekName})
              </p>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-10 bg-slate-200 shrink-0" />

          {/* Section 2: Micro Panchang Items (Horizontal Row) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 flex-1 w-full lg:w-auto">
            {/* 1. Tithi */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-lg">🌙</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold">{strings.panchang.tithi}</span>
                <span className="text-xs font-bold text-slate-900 truncate">{panchangData.tithi.replace(/ तिथि(ः)?/g, "")}</span>
                <span className="text-[10px] text-slate-500 truncate">{panchangData.tithiGhati} {strings.panchang.ghati}</span>
              </div>
            </div>

            {/* 2. Nakshatra */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-lg">⭐</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold">{strings.panchang.nakshatra}</span>
                <span className="text-xs font-bold text-slate-900 truncate">{panchangData.nakshatra}</span>
                <span className="text-[10px] text-slate-500 truncate">{panchangData.nakshatraGhati} {strings.panchang.ghati}</span>
              </div>
            </div>

            {/* 3. Yoga */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-lg">🌼</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold">{strings.panchang.yoga}</span>
                <span className="text-xs font-bold text-slate-900 truncate">{panchangData.yoga}</span>
                <span className="text-[10px] text-slate-500 truncate">{panchangData.yogaGhati} {strings.panchang.ghati}</span>
              </div>
            </div>

            {/* 4. Karana */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-lg">⚖️</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold">{strings.panchang.karana}</span>
                <span className="text-xs font-bold text-slate-900 truncate">{panchangData.karana}</span>
                <span className="text-[10px] text-slate-500 truncate">{panchangData.karanaGhati} {strings.panchang.ghati}</span>
              </div>
            </div>

            {/* 5. Dinmaan */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-lg">⏱️</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold">{language === "en" ? "Dinmaan" : "दिनमान"}</span>
                <span className="text-xs font-bold text-amber-900 truncate">{panchangData.dinmaanGhati} {strings.panchang.ghati}</span>
                <span className="text-[10px] text-slate-500 truncate">{panchangData.dinmaanStr}</span>
              </div>
            </div>

            {/* 6. Sunrise & Sunset */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-lg">☀️</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-500 font-semibold">{strings.panchang.sunrise}</span>
                <span className="text-xs font-bold text-amber-900 truncate">{panchangData.sunrise}</span>
                <span className="text-[10px] text-slate-500 truncate">{strings.panchang.sunset}: {panchangData.sunset}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Right CTA Button */}
          <Link
            href="/kundali"
            className="w-full lg:w-auto bg-[#0c2340] hover:bg-[#12365e] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <span>{language === "en" ? "Detailed Kundali & Panchang" : language === "sa" ? "विस्तृतकुण्डली-पञ्चाङ्गम्" : "विस्तृत कुण्डली तथा पञ्चाङ्ग"}</span>
            <span className="text-base">›</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
