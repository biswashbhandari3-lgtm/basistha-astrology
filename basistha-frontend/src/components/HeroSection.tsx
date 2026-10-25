"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import with ssr: false ensures Three.js only loads in browser
const CosmicHeroBackground = dynamic(
  () => import("./CosmicHeroBackground").then((mod) => mod.CosmicHeroBackground),
  { ssr: false }
);

interface HeroSectionProps {
  onScrollToForm: () => void;
  onOpenPanchang: () => void;
}

export function HeroSection({ onScrollToForm, onOpenPanchang }: HeroSectionProps) {
  const [show3d, setShow3d] = useState(true);

  return (
    <section className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 my-2 no-print bg-slate-950 min-h-[460px] md:min-h-[520px] flex items-center justify-center">
      {/* 1. Three.js 3D Celestial Universe Canvas */}
      {show3d && <CosmicHeroBackground interactive={true} />}

      {/* 2. Atmospheric Nebula Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none z-10" />

      {/* 3. Hero Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 py-10 md:py-14 text-center flex flex-col items-center">
        {/* Vedic Sacred Mantra Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs md:text-sm font-semibold tracking-wide backdrop-blur-md mb-5 shadow-inner">
          <span className="text-amber-400">🕉️</span>
          <span>ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
          <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
            वसिष्ठ वैदिक ज्योतिष
          </span>
          <span className="text-amber-400 text-2xl sm:text-3xl md:text-4xl font-normal ml-3 align-middle">
            २.०
          </span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-7 drop-shadow">
          NASA JPL Swiss Ephemeris खगोलीय इन्जिन, १६ वर्ग कुण्डली (D1-D60), पाराशरी तथा जैमिनी सिद्धान्त,
          विंशोत्तरी/योगिनी दशा र ३-पृष्ठको उच्चस्तरीय मुद्रण-योग्य जन्मकुण्डली ।
        </p>

        {/* Feature Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-4xl mb-8">
          <div className="bg-slate-900/75 border border-amber-500/20 backdrop-blur-md p-3 rounded-2xl flex items-center justify-center gap-2.5 text-left">
            <span className="text-2xl">🪐</span>
            <div>
              <div className="text-[11px] text-amber-300 font-bold">NASA Ephemeris</div>
              <div className="text-[10px] text-slate-300">०.००१ सेकेन्ड शुद्धता</div>
            </div>
          </div>

          <div className="bg-slate-900/75 border border-amber-500/20 backdrop-blur-md p-3 rounded-2xl flex items-center justify-center gap-2.5 text-left">
            <span className="text-2xl">🔯</span>
            <div>
              <div className="text-[11px] text-amber-300 font-bold">षोडशवर्ग कुण्डली</div>
              <div className="text-[10px] text-slate-300">D1 देखि D60 सम्म</div>
            </div>
          </div>

          <div className="bg-slate-900/75 border border-amber-500/20 backdrop-blur-md p-3 rounded-2xl flex items-center justify-center gap-2.5 text-left">
            <span className="text-2xl">⏳</span>
            <div>
              <div className="text-[11px] text-amber-300 font-bold">४ दशा प्रणाली</div>
              <div className="text-[10px] text-slate-300">विंशोत्तरी, योगिनी आदि</div>
            </div>
          </div>

          <div className="bg-slate-900/75 border border-amber-500/20 backdrop-blur-md p-3 rounded-2xl flex items-center justify-center gap-2.5 text-left">
            <span className="text-2xl">🖨️</span>
            <div>
              <div className="text-[11px] text-amber-300 font-bold">३-पृष्ठ PDF पत्रिका</div>
              <div className="text-[10px] text-slate-300">१-क्लिक मुद्रण तयार</div>
            </div>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onScrollToForm}
            className="group relative px-6 py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 hover:from-amber-200 hover:to-orange-300 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <span>📜</span>
            <span>कुण्डली गणना सुरु गर्नुहोस्</span>
            <span className="text-xs group-hover:translate-x-1 transition-transform">↓</span>
          </button>

          <button
            onClick={onOpenPanchang}
            className="px-5 py-3 rounded-xl font-bold text-sm text-amber-100 bg-slate-800/80 hover:bg-slate-700/80 border border-amber-400/30 backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📅</span>
            <span>दैनिक पञ्चाङ्ग हेर्नुहोस्</span>
          </button>
        </div>

        {/* 3D Performance Toggle Control */}
        <div className="mt-7 flex items-center gap-2 text-[11px] text-slate-400">
          <span>🌌 3D नक्षत्र ब्रह्माण्ड:</span>
          <button
            onClick={() => setShow3d(!show3d)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-amber-300 border border-amber-500/20 cursor-pointer transition-colors"
          >
            {show3d ? "सक्रिय (Active)" : "निष्क्रिय (Disabled)"}
          </button>
        </div>
      </div>
    </section>
  );
}
