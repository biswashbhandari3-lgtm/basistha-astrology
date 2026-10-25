"use client";

import React from "react";
import { RoyalGlassNavbar } from "@/components/RoyalGlassNavbar";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { strings } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pt-28">
      {/* Royal Blue Glassmorphic Navbar */}
      <RoyalGlassNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md max-w-2xl w-full">
          <span className="text-4xl mb-4 block">🕉️</span>
          <h1
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3"
            style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
          >
            {strings.about.title}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {strings.about.desc}
          </p>
          <div className="w-16 h-0.5 bg-amber-400 mx-auto rounded-full" />
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} {strings.header.title}. {strings.footer.rights}</p>
          <p className="text-[11px] text-slate-500">
            {strings.footer.powered}
          </p>
        </div>
      </footer>
    </div>
  );
}
