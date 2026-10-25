"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderUserBadge } from "./HeaderUserBadge";

export function RoyalGlassNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"ne" | "en">("en");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: language === "en" ? "Home" : "गृहपृष्ठ", href: "/" },
    { label: language === "en" ? "About" : "हाम्रा बारेमा", href: "/about" },
    { label: language === "en" ? "Panchangam" : "पञ्चाङ्ग", href: "/panchangam" },
    { label: language === "en" ? "Horoscope" : "कुण्डली", href: "/panchangam#charts" },
    { label: language === "en" ? "Rashifal" : "राशिफल", href: "/panchangam#planets" },
    { label: language === "en" ? "Resources" : "स्रोतहरू", href: "/panchangam#dasha" },
    { label: language === "en" ? "Contact" : "सम्पर्क", href: "/about#contact" },
  ];

  return (
    <>
      <header
        className={`fixed z-50 transition-all duration-300 ease-out left-3 right-3 sm:left-6 sm:right-6 lg:left-12 lg:right-12 ${
          isScrolled
            ? "top-2.5 py-2 px-5 bg-white/95 text-slate-900 shadow-xl shadow-slate-900/10 border border-slate-200/80 rounded-full backdrop-blur-xl"
            : "top-3.5 py-3 px-6 bg-white/[0.08] text-white shadow-2xl shadow-black/20 border border-white/20 rounded-full backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl"
          >
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all shadow-md ${
                isScrolled
                  ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20"
                  : "bg-white/15 border border-white/30 text-amber-300 shadow-black/20 group-hover:bg-white/20"
              }`}
            >
              🕉️
            </span>
            <div className="flex flex-col">
              <span
                className={`font-black tracking-wider text-base sm:text-lg uppercase transition-colors ${
                  isScrolled
                    ? "text-slate-900 group-hover:text-amber-600"
                    : "text-amber-100 group-hover:text-amber-300"
                }`}
                style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
              >
                BASISTHA
              </span>
              <span
                className={`text-[10px] font-medium tracking-tight -mt-0.5 ${
                  isScrolled ? "text-amber-700" : "text-amber-300/80"
                }`}
              >
                Vedic Astrology & Panchangam
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href.split("#")[0]);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative text-xs xl:text-sm font-semibold tracking-wide transition-all py-1 ${
                    isScrolled
                      ? isActive
                        ? "text-blue-700 font-bold"
                        : "text-slate-700 hover:text-blue-600"
                      : isActive
                      ? "text-amber-300 font-bold drop-shadow"
                      : "text-white/85 hover:text-white"
                  }`}
                >
                  {link.label}
                  {/* Active underline indicator */}
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                        isScrolled ? "bg-blue-600" : "bg-amber-400"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "ne" : "en")}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                isScrolled
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300/60"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
              title="भाषा परिवर्तन गर्नुहोस् / Switch Language"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
              </svg>
              <span>{language === "en" ? "English" : "नेपाली"}</span>
              <span className="text-[10px] opacity-70">▾</span>
            </button>

            {/* Quick Link to Panchangam/Explore */}
            <Link
              href="/panchangam"
              className={`hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md transform hover:-translate-y-0.5 ${
                isScrolled
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
                  : "bg-white text-slate-900 hover:bg-amber-50 shadow-black/20"
              }`}
            >
              <span>{language === "en" ? "Explore Now" : "अन्वेषण गर्नुहोस्"}</span>
              <span className="ml-1 text-[11px]">→</span>
            </Link>

            {/* User Login/Account Status */}
            <HeaderUserBadge />

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-all border ${
                isScrolled
                  ? "bg-slate-100 text-slate-900 border-slate-200"
                  : "bg-white/10 text-white border-white/20"
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Glass Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-3 top-20 z-40 lg:hidden p-5 rounded-3xl bg-white/95 backdrop-blur-2xl text-slate-900 shadow-2xl border border-slate-200/80 animate-in fade-in slide-in-from-top-4 duration-200 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-2xl text-sm font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setLanguage(language === "en" ? "ne" : "en")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              🌐 {language === "en" ? "Switch to नेपाली" : "Switch to English"}
            </button>
            <Link
              href="/panchangam"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
            >
              Explore Now →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
