"use client";

import React, { useMemo } from "react";
import { BirthDetails, KundaliData, PanchangData } from "@/types/astrology";
import { useLanguage } from "@/context/LanguageContext";
import { calculateJanmaPanchang } from "@/lib/janmaPanchangEngine";

interface PanchangaCardProps {
  panchang: PanchangData;
  birth?: BirthDetails;
  kundali?: KundaliData | null;
}

export const PanchangaCard: React.FC<PanchangaCardProps> = ({ panchang, birth, kundali }) => {
  const { language } = useLanguage();

  const janma = useMemo(() => {
    if (!birth) return null;
    return calculateJanmaPanchang(birth, panchang, kundali, language);
  }, [birth, panchang, kundali, language]);

  return (
    <div className="bg-white rounded-3xl border border-amber-200/90 shadow-lg p-5 sm:p-7 flex flex-col gap-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-100 pb-4">
        <div>
          <h3 className="font-black text-slate-900 text-lg sm:text-xl flex items-center gap-2">
            <span>📜</span>
            <span>
              {birth
                ? (language === "en" ? "Janma Panchanga & Avakahada Chakra" : "जन्मपञ्चाङ्ग, खगोलीय स्थिति तथा अवकहडा चक्र")
                : (language === "en" ? "Daily Vedic Panchanga" : "दैनिक वैदिक पञ्चाङ्ग")}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {janma ? (
              <span>
                {janma.birthDateTime.birthPlace} • {janma.birthDateTime.bsDate} ({janma.birthDateTime.gregDate}) • इष्टकाल: <strong className="text-amber-800">{janma.birthDateTime.ishtakalaGhati} घटी</strong>
              </span>
            ) : (
              <span>मिति: {panchang.date_str} • {panchang.vara.name_ne}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-full font-bold border border-amber-200 shadow-2xs">
            {janma ? "जातक पञ्चाङ्ग (Birth Chart)" : "Basistha Ganita Engine"}
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          IF BIRTH DETAILS ARE AVAILABLE: RENDER ALL 8 DETAILED CATEGORIES
      ════════════════════════════════════════════════════════════════ */}
      {janma && (
        <div className="flex flex-col gap-6">
          {/* 1. जन्म मिति तथा समय विवरण & 2. भौगोलिक तथा समय समयान्तर विवरण */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category 1: जन्म मिति तथा समय विवरण */}
            <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 mb-3 pb-2 border-b border-amber-200/60">
                <span className="text-base">📅</span>
                <h4>१. जन्म मिति तथा समय विवरण</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-amber-100/80">
                  <span className="text-[11px] text-slate-500 block">वि.सं. (Bikram Sambat):</span>
                  <strong className="text-slate-900 font-bold">{janma.birthDateTime.bsDate}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-100/80">
                  <span className="text-[11px] text-slate-500 block">ई.सं. (Gregorian AD):</span>
                  <strong className="text-slate-900 font-bold">{janma.birthDateTime.gregDate}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-100/80">
                  <span className="text-[11px] text-slate-500 block">जन्म समय (Birth Time):</span>
                  <strong className="text-slate-900 font-bold">{janma.birthDateTime.birthTimeStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                  <span className="text-[11px] text-amber-900 font-semibold block">इष्टकाल (Ishtakala):</span>
                  <strong className="text-amber-950 font-bold">{janma.birthDateTime.ishtakalaStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-100/80">
                  <span className="text-[11px] text-slate-500 block">जन्म स्थान (Birth Place):</span>
                  <strong className="text-slate-900 font-bold">{janma.birthDateTime.birthPlace}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-100/80">
                  <span className="text-[11px] text-slate-500 block">देश तथा मानक समय:</span>
                  <strong className="text-slate-900 font-bold">{janma.birthDateTime.country} ({janma.birthDateTime.standardTimeName})</strong>
                </div>
              </div>
            </div>

            {/* Category 2: भौगोलिक तथा समय समयान्तर विवरण */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-white to-blue-50/20 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 mb-3 pb-2 border-b border-blue-200/60">
                <span className="text-base">🌐</span>
                <h4>२. भौगोलिक तथा समय समयान्तर विवरण</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">अक्षांश (Latitude):</span>
                  <strong className="text-slate-900 font-bold">{janma.geoTime.latitudeStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">देशान्तर (Longitude):</span>
                  <strong className="text-slate-900 font-bold">{janma.geoTime.longitudeStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">नियमित मानक रेखांश:</span>
                  <strong className="text-slate-900 font-bold">{janma.geoTime.standardMeridianStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200">
                  <span className="text-[11px] text-blue-900 font-semibold block">स्थानीय समय संस्कार (LMT Corr):</span>
                  <strong className="text-blue-950 font-bold">{janma.geoTime.lmtCorrectionStr}</strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{janma.geoTime.lmtCorrectionDesc}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">स्थानीय समय (Local Mean Time):</span>
                  <strong className="text-slate-900 font-bold">{janma.geoTime.lmtTimeStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">ग्रिनविच समय (UTC/GMT):</span>
                  <strong className="text-slate-900 font-bold">{janma.geoTime.utcTimeStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">ग्रीष्म समय संस्कार (DST):</span>
                  <strong className="text-slate-700">{janma.geoTime.dstCorrectionStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[11px] text-slate-500 block">युद्ध समय संस्कार (War Time):</span>
                  <strong className="text-slate-700">{janma.geoTime.warTimeCorrectionStr}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. पञ्चाङ्ग तथा खगोलीय विवरण & 8. नेपाल संवत् विवरण */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category 3: पञ्चाङ्ग तथा खगोलीय विवरण */}
            <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/40 via-white to-purple-50/20 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 mb-3 pb-2 border-b border-purple-200/60">
                <span className="text-base">🪐</span>
                <h4>३. पञ्चाङ्ग तथा खगोलीय संवत् विवरण</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                  <span className="text-[11px] text-slate-500 block">शक संवत् (Shaka Sambat):</span>
                  <strong className="text-slate-900 font-bold">{janma.panchangAstro.shakSambatStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                  <span className="text-[11px] text-slate-500 block">चान्द्रमास तथा पक्ष:</span>
                  <strong className="text-slate-900 font-bold">{janma.panchangAstro.chandraMasaStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                  <span className="text-[11px] text-slate-500 block">सौरमास (Solar Month):</span>
                  <strong className="text-slate-900 font-bold">{janma.panchangAstro.suryaMasaStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                  <span className="text-[11px] text-slate-500 block">ऋतु तथा अयन:</span>
                  <strong className="text-slate-900 font-bold">{janma.panchangAstro.rituStr} • {janma.panchangAstro.ayanaStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100 col-span-1 sm:col-span-2">
                  <span className="text-[11px] text-slate-500 block">सृष्टिगतवर्ष (Srishti-gata Years):</span>
                  <strong className="text-purple-950 font-bold">{janma.panchangAstro.srishtiGataVarshaStr}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-100 col-span-1 sm:col-span-2">
                  <span className="text-[11px] text-slate-500 block">अहर्गण (Kaliyuga Ahargana):</span>
                  <strong className="text-purple-950 font-bold">{janma.panchangAstro.aharganaStr}</strong>
                </div>
              </div>
            </div>

            {/* Category 8: नेपाल संवत् विवरण & 6. सूर्योदय सूर्यास्त संक्षिप्त */}
            <div className="flex flex-col gap-4">
              {/* Nepal Sambat Box */}
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900 mb-3 pb-2 border-b border-emerald-200/60">
                  <span className="text-base">🌙</span>
                  <h4>८. नेपाल संवत् विवरण (Nepal Sambat)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">नेपाल संवत् वर्ष:</span>
                    <strong className="text-emerald-950 font-bold text-sm">{janma.nepalSambat.yearStr}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">महिना तथा पक्ष:</span>
                    <strong className="text-emerald-950 font-bold text-sm">{janma.nepalSambat.monthName}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 col-span-1 sm:col-span-2">
                    <span className="text-[11px] text-emerald-800 block">पूर्ण नेपाल संवत् उल्लेख:</span>
                    <strong className="text-emerald-950 font-bold">{janma.nepalSambat.fullStr}</strong>
                  </div>
                </div>
              </div>

              {/* Category 6 preview / solar timings */}
              <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/40 via-white to-orange-50/20 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900 mb-3 pb-2 border-b border-orange-200/60">
                  <span className="text-base">☀️</span>
                  <h4>६. सूर्योदय, सूर्यास्त तथा खगोलीय स्थिति</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-500 block">सूर्योदय:</span>
                    <strong className="text-orange-950 font-bold">{janma.solarAstro.sunriseTimeStr}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-500 block">सूर्यास्त:</span>
                    <strong className="text-orange-950 font-bold">{janma.solarAstro.sunsetTimeStr}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-500 block">दिनमान:</span>
                    <strong className="text-orange-950 font-bold">{janma.solarAstro.dinmaanGhatiStr}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-500 block">चर संस्कार:</span>
                    <strong className="text-orange-950 font-bold">{janma.solarAstro.charaStr}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-500 block">सूर्य क्रान्ति:</span>
                    <strong className="text-slate-800 font-bold">{janma.solarAstro.krantiStr}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-500 block">बेलान्तर (Et):</span>
                    <strong className="text-slate-800 font-bold">{janma.solarAstro.belantaraStr}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-orange-100 col-span-2">
                    <span className="text-[10px] text-slate-500 block">लाहिडी अयनांश:</span>
                    <strong className="text-slate-800 font-bold">{janma.solarAstro.ayanamshaStr}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. पञ्चाङ्ग (सूर्योदयकालीन तथा जन्मकालीन) विवरण (Full 5 Angas Breakdown) */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/60 via-amber-50/20 to-orange-50/40 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2 border-b border-amber-200">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <span className="text-base">🪔</span>
                <h4>४. पञ्चाङ्ग (सूर्योदयकालीन तथा जन्मकालीन) विवरण</h4>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                अहोरात्रमान: {janma.sunriseAndBirthPanchang.ahoratraGhati} • बार: {janma.sunriseAndBirthPanchang.varaName}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {/* Tithi */}
              <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">१. तिथि (Tithi)</span>
                  <h5 className="font-bold text-sm text-slate-900 mt-1">{janma.sunriseAndBirthPanchang.sunriseTithi}</h5>
                  <div className="text-[11px] text-amber-900 font-bold mt-1">
                    {janma.sunriseAndBirthPanchang.sunriseTithiGhati}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ({janma.sunriseAndBirthPanchang.sunriseTithiEndTime})
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-600 font-semibold block">जन्मकालीन भोग:</span>
                  <strong className="text-amber-800 text-[11px]">{janma.sunriseAndBirthPanchang.birthTithiProgress}</strong>
                </div>
              </div>

              {/* Vara */}
              <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">२. बार (Vara)</span>
                  <h5 className="font-bold text-sm text-slate-900 mt-1">{janma.sunriseAndBirthPanchang.varaName}</h5>
                  <div className="text-[11px] text-emerald-800 font-bold mt-1">
                    अहोरात्र मान ६० घटी
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    वारेश: बृहस्पति / सूर्य
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-600 font-semibold block">जन्मकालीन स्थिति:</span>
                  <strong className="text-emerald-700 text-[11px]">पूर्ण सक्रिय</strong>
                </div>
              </div>

              {/* Nakshatra */}
              <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">३. नक्षत्र (Nakshatra)</span>
                  <h5 className="font-bold text-sm text-slate-900 mt-1">{janma.sunriseAndBirthPanchang.sunriseNakshatra}</h5>
                  <div className="text-[11px] text-amber-900 font-bold mt-1">
                    {janma.sunriseAndBirthPanchang.sunriseNakshatraGhati}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ({janma.sunriseAndBirthPanchang.sunriseNakshatraEndTime})
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-600 font-semibold block">जन्मकालीन भोग:</span>
                  <strong className="text-amber-800 text-[11px]">{janma.sunriseAndBirthPanchang.birthNakshatraProgress}</strong>
                </div>
              </div>

              {/* Yoga */}
              <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">४. योग (Yoga)</span>
                  <h5 className="font-bold text-sm text-slate-900 mt-1">{janma.sunriseAndBirthPanchang.sunriseYoga}</h5>
                  <div className="text-[11px] text-amber-900 font-bold mt-1">
                    {janma.sunriseAndBirthPanchang.sunriseYogaGhati}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ({janma.sunriseAndBirthPanchang.sunriseYogaEndTime})
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-600 font-semibold block">जन्मकालीन भोग:</span>
                  <strong className="text-amber-800 text-[11px]">{janma.sunriseAndBirthPanchang.birthYogaProgress}</strong>
                </div>
              </div>

              {/* Karana */}
              <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">५. करण (Karana)</span>
                  <h5 className="font-bold text-sm text-slate-900 mt-1">{janma.sunriseAndBirthPanchang.sunriseKarana}</h5>
                  <div className="text-[11px] text-amber-900 font-bold mt-1">
                    {janma.sunriseAndBirthPanchang.sunriseKaranaGhati}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ({janma.sunriseAndBirthPanchang.sunriseKaranaEndTime})
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-600 font-semibold block">जन्मकालीन भोग:</span>
                  <strong className="text-amber-800 text-[11px]">{janma.sunriseAndBirthPanchang.birthKaranaProgress}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 5. नक्षत्र भोग तथा दशा विवरण */}
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900 mb-3 pb-2 border-b border-indigo-200/60">
              <span className="text-base">⏳</span>
              <h4>५. नक्षत्र भोग तथा दशा विवरण</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                <span className="text-[11px] text-slate-500 block">नक्षत्र मान / भोग:</span>
                <strong className="text-indigo-950 font-bold">{janma.nakshatraDasha.nakshatraBhogaStr}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                <span className="text-[11px] text-slate-500 block">भयात (Bhayata):</span>
                <strong className="text-indigo-950 font-bold">{janma.nakshatraDasha.bhayataStr}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-indigo-100">
                <span className="text-[11px] text-slate-500 block">नक्षत्र चरण (Pada):</span>
                <strong className="text-indigo-950 font-bold">{janma.nakshatraDasha.nakshatraPadaStr}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200">
                <span className="text-[11px] text-indigo-900 font-semibold block">भोग्य विंशोत्तरी दशा:</span>
                <strong className="text-indigo-950 font-bold">{janma.nakshatraDasha.vimshottariDashaBalanceStr}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200">
                <span className="text-[11px] text-indigo-900 font-semibold block">भोग्य योगिनी दशा:</span>
                <strong className="text-indigo-950 font-bold">{janma.nakshatraDasha.yoginiDashaBalanceStr}</strong>
              </div>
            </div>
          </div>

          {/* 7. अवकहडा चक्र विवरण (Avakahada Chakra - 16 Parameters Grid) */}
          <div className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50/60 via-white to-amber-100/40 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔯</span>
                <div>
                  <h4 className="font-black text-base text-slate-900">
                    ७. अवकहडा चक्र विवरण (Avakahada Chakra)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    पाराशर तथा मुहूर्त चिन्तामणि पद्धति अनुसार जातकको सम्पूर्ण गुण, वर्ण, योनि, नाडी र नामाक्षर
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shadow-xs">
                <span>नामाक्षर:</span>
                <span className="text-sm font-black underline">{janma.avakahada.namakshara}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs text-center">
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">राशि</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.rashi}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">राशि स्वामी</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.rashiLord}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">नक्षत्र</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.nakshatra}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">नक्षत्र स्वामी</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.nakshatraLord}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 shadow-2xs">
                <span className="text-[10px] text-amber-800 font-semibold block">नामाक्षर</span>
                <strong className="text-amber-950 font-black text-sm block mt-0.5">{janma.avakahada.namakshara}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">वर्ण</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.varna}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">वश्य</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.vashya}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">योनि</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.yoni}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 shadow-2xs">
                <span className="text-[10px] text-red-700 font-semibold block">वैर योनि</span>
                <strong className="text-red-950 font-bold block mt-0.5 truncate">{janma.avakahada.vairaYoni}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">गण</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.gana}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">वर्ग</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.varga}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">आसन</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.asana}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">नाडी</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.nadi}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">युंजा</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.yunja}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">हंसक (तत्त्व)</span>
                <strong className="text-slate-900 font-bold block mt-0.5 truncate">{janma.avakahada.hansaka}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-2xs">
                <span className="text-[10px] text-emerald-800 font-semibold block">पाया</span>
                <strong className="text-emerald-950 font-bold block mt-0.5 truncate">{janma.avakahada.paya}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MUHURTA & CHOGHADIYA SECTION
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-emerald-100 text-emerald-800 rounded-xl">✨</span>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">अभिजित् मुहूर्त (Abhijit Muhurta):</span>
            <p className="text-sm font-black text-emerald-800">
              {panchang.abhijit_muhurta?.start} - {panchang.abhijit_muhurta?.end}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-red-100 text-red-800 rounded-xl">⚠️</span>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">राहुकाल (Rahukaal - त्याज्य समय):</span>
            <p className="text-sm font-black text-red-700">
              {panchang.rahukaal?.start} - {panchang.rahukaal?.end}
            </p>
          </div>
        </div>
      </div>

      {/* Choghadiya Day Section */}
      {panchang.choghadiya_day && panchang.choghadiya_day.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
            <span>☀️</span> दिवा चौघडिया / बारवेला (Day Choghadiya Muhurtas)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
            {panchang.choghadiya_day.map((c) => {
              const isGood = c.name === "Amrit" || c.name === "Shubh" || c.name === "Labh";
              return (
                <div
                  key={c.order}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isGood
                      ? "bg-emerald-50 border-emerald-200/90 text-emerald-950 font-bold"
                      : "bg-red-50/70 border-red-200/90 text-red-950"
                  }`}
                >
                  <p className="font-bold text-[11px]">{c.name_ne}</p>
                  <p className="text-[10px] font-mono mt-0.5 opacity-80">{c.start} - {c.end}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
