"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RoyalGlassNavbar } from "@/components/RoyalGlassNavbar";
import { NepaliPanchangCalendar } from "@/components/NepaliPanchangCalendar";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically load Three.js Canvas to guarantee client-only SSR compatibility
const SolarHeroCanvas = dynamic(
  () => import("@/components/SolarHeroCanvas").then((mod) => mod.SolarHeroCanvas),
  { ssr: false }
);

export default function HomePage() {
  const { strings } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fd] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 1. Royal Blue Glassmorphic Floating Navbar */}
      <RoyalGlassNavbar />

      {/* 2. Full-Bleed Solar System Hero Canvas (Matching Photo) */}
      <main className="flex-1">
        <section className="relative w-full overflow-hidden bg-slate-950">
          <SolarHeroCanvas />
        </section>

        {/* 2.5 Live Daily Nepali Panchang & Devanagari Clock Dashboard */}
        <section id="daily-panchang" className="scroll-mt-20">
          <NepaliPanchangCalendar />
        </section>

        {/* 3. Features & Vedic Capabilities Showcase */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {strings.features.badge}
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
            >
              {strings.features.title}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {strings.features.subtitle}
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black mb-5 group-hover:scale-110 transition-transform">
                  📅
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {strings.features.card1Title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {strings.features.card1Desc}
                </p>
              </div>
              <Link
                href="/panchangam"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>{strings.features.card1Btn}</span>
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black mb-5 group-hover:scale-110 transition-transform">
                  🔯
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {strings.features.card2Title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {strings.features.card2Desc}
                </p>
              </div>
              <Link
                href="/panchangam#charts"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>{strings.features.card2Btn}</span>
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-black mb-5 group-hover:scale-110 transition-transform">
                  ⏳
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {strings.features.card3Title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {strings.features.card3Desc}
                </p>
              </div>
              <Link
                href="/panchangam#dasha"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>{strings.features.card3Btn}</span>
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-black mb-5 group-hover:scale-110 transition-transform">
                  🖨️
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {strings.features.card4Title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {strings.features.card4Desc}
                </p>
              </div>
              <Link
                href="/panchangam"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>{strings.features.card4Btn}</span>
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Bottom Cosmic Call-To-Action Banner */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-10 sm:p-14 text-center shadow-2xl border border-blue-500/20">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-3xl mb-3 block">🕉️</span>
              <h3
                className="text-2xl sm:text-3xl font-black tracking-tight mb-3"
                style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
              >
                {strings.cta.title}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-8">
                {strings.cta.subtitle}
              </p>
              <Link
                href="/panchangam"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 text-slate-950 hover:from-amber-200 hover:to-orange-300 shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>{strings.cta.btn}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕉️</span>
            <div>
              <div className="text-white font-bold text-sm tracking-wider uppercase font-serif">
                {strings.header.title}
              </div>
              <div className="text-[11px] text-amber-400/80">
                {strings.header.subtitle}
              </div>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-400">
              © {new Date().getFullYear()} {strings.header.title}. {strings.footer.rights}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {strings.footer.powered}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
