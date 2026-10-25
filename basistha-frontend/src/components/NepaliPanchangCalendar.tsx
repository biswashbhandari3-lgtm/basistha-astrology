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

  // Live real-time clock state (NST: Nepal Standard Time UTC+5:45)
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamically calculate full Panchang data for the selected gate, month, year, and language!
  const panchangData = useMemo(() => {
    return calculateDayPanchang(selectedYear, selectedMonth, selectedGate, language);
  }, [selectedYear, selectedMonth, selectedGate, language]);

  // Calendar matrix calculations
  const totalDays = panchangData.totalDaysInMonth;
  const startDayOffset = panchangData.startDayOfWeek; // 0 = Sunday, 6 = Saturday
  const daysArray = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);

  // Previous month overflow days
  const prevMonthDays = useMemo(() => {
    return Array.from({ length: startDayOffset }, (_, i) => 30 - startDayOffset + 1 + i);
  }, [startDayOffset]);

  // Next month overflow days (to fill 35 or 42 grid cells)
  const nextMonthDays = useMemo(() => {
    const totalFilled = startDayOffset + totalDays;
    const targetCells = totalFilled > 35 ? 42 : 35;
    const remaining = targetCells - totalFilled;
    return Array.from({ length: remaining }, (_, i) => i + 1);
  }, [startDayOffset, totalDays]);

  // Navigation handlers
  const handlePrevDay = () => {
    if (selectedGate > 1) {
      setSelectedGate(selectedGate - 1);
    } else {
      // Go to previous month
      if (selectedMonth > 1) {
        const prevMonth = selectedMonth - 1;
        const prevPanchang = calculateDayPanchang(selectedYear, prevMonth, 1, language);
        setSelectedMonth(prevMonth);
        setSelectedGate(prevPanchang.totalDaysInMonth);
      } else {
        const prevYear = selectedYear - 1;
        const prevMonth = 12;
        const prevPanchang = calculateDayPanchang(prevYear, prevMonth, 1, language);
        setSelectedYear(prevYear);
        setSelectedMonth(prevMonth);
        setSelectedGate(prevPanchang.totalDaysInMonth);
      }
    }
  };

  const handleNextDay = () => {
    if (selectedGate < totalDays) {
      setSelectedGate(selectedGate + 1);
    } else {
      // Go to next month
      if (selectedMonth < 12) {
        setSelectedMonth(selectedMonth + 1);
        setSelectedGate(1);
      } else {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(1);
        setSelectedGate(1);
      }
    }
  };

  const handleJumpToToday = () => {
    setSelectedYear(todayBS.yearBS);
    setSelectedMonth(todayBS.monthBS);
    setSelectedGate(todayBS.dayBS);
  };

  // Live Clock calculation
  const hours = currentTime ? currentTime.getHours() : 14;
  const minutes = currentTime ? currentTime.getMinutes() : 33;
  const seconds = currentTime ? currentTime.getSeconds() : 45;

  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  // Format 12-hour digital time
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const isPM = hours >= 12;
  const ampmStr =
    language === "en"
      ? isPM ? "PM" : "AM"
      : language === "sa"
      ? isPM ? "अपरान्हम् (PM)" : "पूर्वाह्नम् (AM)"
      : isPM ? "अपरान्ह (PM)" : "पूर्वाह्न (AM)";

  const formattedDigitalTime = `${formatNumber(String(displayHours).padStart(2, "0"))}:${formatNumber(
    String(minutes).padStart(2, "0")
  )}:${formatNumber(String(seconds).padStart(2, "0"))} ${ampmStr}`;

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
  const formattedIshtakal = `${formatNumber(ghadi)} ${strings.panchang.ghati} ${formatNumber(pala)} ${strings.panchang.pala} ${formatNumber(vipala)} ${strings.panchang.vipala}`;

  // Clock numerals based on language
  const clockNumbers = language === "en"
    ? [
        { num: "12", angle: 0 },
        { num: "1", angle: 30 },
        { num: "2", angle: 60 },
        { num: "3", angle: 90 },
        { num: "4", angle: 120 },
        { num: "5", angle: 150 },
        { num: "6", angle: 180 },
        { num: "7", angle: 210 },
        { num: "8", angle: 240 },
        { num: "9", angle: 270 },
        { num: "10", angle: 300 },
        { num: "11", angle: 330 },
      ]
    : [
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
      ];

  const clockCenterLabel = language === "en" ? "NEPAL" : language === "sa" ? "नेपालम्" : "नेपाल";

  return (
    <div className="w-full bg-[#fdfbf7] border-y border-amber-200/60 py-10 lg:py-16 px-4 sm:px-6 lg:px-12 text-slate-900 selection:bg-amber-600 selection:text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Section Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/50 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              {strings.features.card1Title}
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
            >
              {strings.panchang.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/panchangam"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-orange-900/10 transition-all transform hover:-translate-y-0.5"
            >
              <span>{strings.features.card1Btn}</span>
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
                    onChange={(e) => {
                      const newMonth = parseInt(e.target.value, 10);
                      setSelectedMonth(newMonth);
                      const targetPanchang = calculateDayPanchang(selectedYear, newMonth, 1, language);
                      if (selectedGate > targetPanchang.totalDaysInMonth) {
                        setSelectedGate(targetPanchang.totalDaysInMonth);
                      }
                    }}
                    className="appearance-none bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-slate-800 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {strings.months.map((m, idx) => (
                      <option key={m} value={idx + 1}>
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
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value, 10);
                      setSelectedYear(newYear);
                      const targetPanchang = calculateDayPanchang(newYear, selectedMonth, 1, language);
                      if (selectedGate > targetPanchang.totalDaysInMonth) {
                        setSelectedGate(targetPanchang.totalDaysInMonth);
                      }
                    }}
                    className="appearance-none bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-slate-800 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {[2080, 2081, 2082, 2083, 2084, 2085].map((y) => (
                      <option key={y} value={y}>
                        {formatNumber(y)} {strings.panchang.bs}
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
                  <span>{strings.panchang.standard}</span>
                </div>
              </div>

              {/* Today & Nav Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors shadow-xs"
                >
                  {strings.panchang.today}
                </button>
                <div className="flex items-center rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="px-2.5 py-1.5 hover:bg-amber-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    title="Previous Day"
                  >
                    ❮
                  </button>
                  <div className="w-[1px] h-4 bg-amber-200" />
                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="px-2.5 py-1.5 hover:bg-amber-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    title="Next Day"
                  >
                    ❯
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Main Two-Column Row (Left: Selected Day Details, Right: Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* ── Left Column: Selected Day Panchanga Details Card ── */}
              <div className="md:col-span-5 bg-[#fbf7ed] border border-amber-200/80 rounded-2xl p-5 flex flex-col gap-4 text-center items-center shadow-xs transition-all duration-300">
                
                {/* Big Date Header */}
                <div className="flex flex-col items-center">
                  <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-1">
                    {formatNumber(panchangData.dayBS)} {panchangData.monthName}
                  </h3>
                  <p className="text-sm font-bold text-slate-700">
                    {panchangData.dayOfWeekName}, {formatNumber(panchangData.yearBS)}
                  </p>
                  <p className="text-xs text-slate-500 font-mono tracking-wider mt-0.5">
                    {panchangData.gregorianDateStr}
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

                {/* Special Festival Banner */}
                {panchangData.festival ? (
                  <div className="w-full py-2 px-3 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs animate-in fade-in duration-300">
                    <span className="text-red-600 text-sm">🚩</span>
                    <span>{panchangData.festival}</span>
                  </div>
                ) : (
                  <div className="w-full py-1.5 px-3 rounded-xl bg-slate-100/60 border border-slate-200/70 text-slate-500 font-medium text-[11px]">
                    {strings.panchang.regularDay}
                  </div>
                )}

                {/* Ayana & Ritu & Samvatsar */}
                <div className="flex flex-col items-center gap-1 text-[11px] text-slate-600 pt-1 border-t border-amber-200/60 w-full">
                  <div className="font-semibold text-emerald-800">
                    {panchangData.ayana} | {panchangData.ritu}
                  </div>
                  <div className="flex items-center gap-1 font-serif text-purple-900 font-bold">
                    <span className="text-amber-500">🕉️</span>
                    <span>{panchangData.samvatsar}</span>
                  </div>
                </div>
              </div>

              {/* ── Right Column: Monthly Calendar Grid + Micro-Cards ── */}
              <div className="md:col-span-7 flex flex-col gap-4 relative">
                
                {/* Calendar Days Table */}
                <div className="relative z-10 w-full overflow-hidden">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 text-center font-bold text-xs pb-2 border-b border-slate-200">
                    {strings.weekdaysShort.map((w, idx) => (
                      <div
                        key={w.short}
                        className={`py-1 ${idx === 6 ? "text-red-600" : "text-slate-700"}`}
                        title={w.full}
                      >
                        {w.short}
                      </div>
                    ))}
                  </div>

                  {/* 7-Column Days Matrix */}
                  <div className="grid grid-cols-7 gap-1 pt-2 text-center text-sm">
                    {/* Previous Month Overflow */}
                    {prevMonthDays.map((d) => (
                      <div
                        key={`prev-${d}`}
                        className="py-2 text-xs font-medium text-slate-300 pointer-events-none"
                      >
                        {formatNumber(d)}
                      </div>
                    ))}

                    {/* Current Month Days (1 to TotalDays) */}
                    {daysArray.map((d) => {
                      const isSelected = d === selectedGate;
                      const cellDayOfWeek = (startDayOffset + d - 1) % 7;
                      const isSaturday = cellDayOfWeek === 6;

                      return (
                        <button
                          key={d}
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
                          <span>{formatNumber(d)}</span>
                        </button>
                      );
                    })}

                    {/* Next Month Overflow */}
                    {nextMonthDays.map((d) => (
                      <div
                        key={`next-${d}`}
                        className="py-2 text-xs font-medium text-slate-300 pointer-events-none"
                      >
                        {formatNumber(d)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6 Micro Panchanga Cards Row */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-200 text-center">
                  {/* Nakshatra */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">{strings.panchang.nakshatra}</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.nakshatra}</span>
                    <span className="text-[9px] text-amber-700 font-mono">{panchangData.nakshatraGhati}</span>
                  </div>

                  {/* Yoga */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">{strings.panchang.yoga}</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.yoga}</span>
                    <span className="text-[9px] text-amber-700 font-mono">{panchangData.yogaGhati}</span>
                  </div>

                  {/* Karana */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">{strings.panchang.karana}</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.karana}</span>
                    <span className="text-[9px] text-amber-700 font-mono">{panchangData.karanaGhati}</span>
                  </div>

                  {/* Chandra */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">{strings.panchang.chandra}</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.chandraRashi}</span>
                    <span className="text-[9px] text-amber-700 font-semibold">{panchangData.chandraEndTime}</span>
                  </div>

                  {/* Surya */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">{strings.panchang.surya}</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.suryaRashi}</span>
                  </div>

                  {/* Guru */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
                    <span className="text-[10px] font-medium text-slate-500">{strings.panchang.guru}</span>
                    <span className="text-xs font-bold text-slate-800">{panchangData.guruRashi}</span>
                  </div>
                </div>

                {/* Bottom Legend & Hint */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#964013]" />
                      <span>{language === "en" ? "Selected Date" : language === "sa" ? "चयनित-दिनाङ्कः" : "छानिएको गते"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-bold">
                      <span>{formatNumber(1)}</span>
                      <span>{language === "en" ? "Saturday / Holiday" : language === "sa" ? "शनिवासरः / अवकाशः" : "शनिवार / बिदा"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT CONTAINER (4 COLS): Live Devanagari/English Analog Clock + NST
             ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-amber-200/70 shadow-xl shadow-amber-950/5 flex flex-col items-center justify-between gap-6 text-center">
            
            {/* 1. Header Status */}
            <div className="flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>{language === "en" ? "Live" : language === "sa" ? "प्रत्यक्षम्" : "प्रत्यक्ष"}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                {strings.panchang.liveTime}
              </p>
            </div>

            {/* 2. Round Analog Clock */}
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

                {/* 12 Numerals */}
                {clockNumbers.map(({ num, angle }) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 100 + 70 * Math.sin(rad);
                  const y = 100 - 70 * Math.cos(rad) + 4.5;
                  return (
                    <text
                      key={num}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fill={num === "१२" || num === "12" || num === "३" || num === "3" || num === "६" || num === "6" || num === "९" || num === "9" ? "#964013" : "#374151"}
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
                  {clockCenterLabel}
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

            {/* 3. Digital Clock Display */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif">
                {formattedDigitalTime}
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-1">
                {strings.panchang.bs} {formatNumber(panchangData.yearBS)} {panchangData.monthName} {formatNumber(panchangData.dayBS)} {strings.panchang.gate}, {panchangData.dayOfWeekName}
              </span>
            </div>

            {/* 4. Astronomical Information Rows (Kathmandu Official Sunrise, Sunset, Ishtakal) */}
            <div className="w-full pt-4 border-t border-amber-200/60 flex flex-col gap-2.5 text-xs text-left">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-amber-500">☀️</span> {strings.panchang.sunrise} ({language === "en" ? "KTM" : "काठमाडौँ"}):
                </span>
                <span className="font-bold text-slate-900">{panchangData.sunrise}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-orange-500">🌅</span> {strings.panchang.sunset} ({language === "en" ? "KTM" : "काठमाडौँ"}):
                </span>
                <span className="font-bold text-slate-900">{panchangData.sunset}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="text-purple-600">🕒</span> {strings.panchang.ishtakal}:
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
