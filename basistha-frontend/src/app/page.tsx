"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RoyalGlassNavbar } from "@/components/RoyalGlassNavbar";
import { NepaliPanchangCalendar } from "@/components/NepaliPanchangCalendar";

// Dynamically load Three.js Canvas to guarantee client-only SSR compatibility
const SolarHeroCanvas = dynamic(
  () => import("@/components/SolarHeroCanvas").then((mod) => mod.SolarHeroCanvas),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fd] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 1. Royal Blue Glassmorphic Floating Navbar */}
      <RoyalGlassNavbar />

      {/* 2. Full-Bleed Solar System Hero Canvas (Matching Photo) */}
      <main className="flex-1">
        <section className="relative">
          <SolarHeroCanvas />
        </section>

        {/* 2.5 Live Daily Nepali Panchang & Devanagari Clock Dashboard */}
        <section id="daily-panchang" className="scroll-mt-20">
          <NepaliPanchangCalendar />
        </section>

        {/* 3. Features & Vedic Capabilities Showcase (Inspired by Demo Cards in Header Style) */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              आधुनिक खगोल तथा वैदिक सिद्धान्त
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
            >
              Precision Astrology for the Modern World
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              NASA JPL Swiss Ephemeris को उच्च परिशुद्ध गणितीय इन्जिन र पराशर, जैमिनी तथा ताजिक परम्पराको अद्वितीय समन्वय।
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
                  दैनिक पञ्चाङ्ग तथा मुहूर्त
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  तिथि, वार, नक्षत्र, योग, करण, सूर्योदय/सूर्यास्त, चौघडिया, होरा तथा राहुकालको सटीक समय गणना।
                </p>
              </div>
              <Link
                href="/panchangam"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>पञ्चाङ्ग हेर्नुहोस्</span>
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
                  लग्न तथा १६ वर्ग कुण्डली
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  D1 (लग्न), D9 (नवांश) देखि D60 (षष्ट्यंश) सम्म अन्तरक्रियात्मक उत्तर तथा दक्षिण भारतीय चक्र।
                </p>
              </div>
              <Link
                href="/panchangam#charts"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>कुण्डली बनाउनुहोस्</span>
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
                  विंशोत्तरी तथा योगिनी दशा
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  महादशा, अन्तर्दशा, प्रत्यन्तर्दशा, सूक्ष्म तथा प्राण दशाको पूर्ण समय तालिका र विश्लेषण।
                </p>
              </div>
              <Link
                href="/panchangam#dasha"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>दशा हेर्नुहोस्</span>
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
                  ३-पृष्ठ मुद्रण-योग्य PDF
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  एक क्लिकमै ग्राहक वा आफन्तका लागि उच्च गुणस्तरीय ३ पृष्ठको पूर्ण जन्मपत्रिका PDF डाउनलोड गर्नुहोस्।
                </p>
              </div>
              <Link
                href="/panchangam"
                className="mt-6 inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700"
              >
                <span>डाउनलोड गर्नुहोस्</span>
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
                Begin Your Cosmic Journey
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-8">
                आफ्नो वा परिवारको जन्म विवरण प्रविष्ट गर्नुहोस् र उच्च शुद्धताका साथ कुण्डली, फलादेश तथा पञ्चाङ्ग अध्ययन गर्नुहोस्।
              </p>
              <Link
                href="/panchangam"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 text-slate-950 hover:from-amber-200 hover:to-orange-300 shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>पञ्चाङ्ग तथा कुण्डली खोल्नुहोस्</span>
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
                BASISTHA
              </div>
              <div className="text-[11px] text-amber-400/80">
                Vedic Astrology & Panchangam Platform
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-center">
            © {new Date().getFullYear()} Basistha Vedic Astrology. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/panchangam" className="hover:text-white transition-colors">Panchangam</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
