"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderUserBadge } from "./HeaderUserBadge";
import { useLanguage } from "@/context/LanguageContext";
import { Locale } from "@/lib/translations";

export function RoyalGlassNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, strings } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languageOptions: { code: Locale; label: string; flag: string }[] = [
    { code: "ne", label: "नेपाली", flag: "🇳🇵" },
    { code: "en", label: "English", flag: "🌐" },
    { code: "sa", label: "संस्कृतम्", flag: "🕉️" },
  ];

  const currentLangObj = languageOptions.find((l) => l.code === language) || languageOptions[0];

  // Removed horoscope, rashifal, resources per user request
  const navLinks = [
    { label: strings.nav.home, href: "/" },
    { label: strings.nav.panchangam, href: "/panchangam" },
    { label: strings.nav.about, href: "/about" },
    { label: strings.nav.contact, href: "/about#contact" },
  ];

  // On non-home pages (e.g. /panchangam, /about) with light background,
  // or on home page when scrolled, use solid, high-contrast light glassmorphism.
  // Only use dark translucent styling when at the very top of the dark solar home hero.
  const isHomePage = pathname === "/";
  const isDarkHeader = isHomePage && !isScrolled;

  return (
    <>
      <header
        className={`fixed z-50 transition-all duration-300 ease-out left-2 right-2 sm:left-4 sm:right-4 md:left-6 md:right-6 lg:left-10 lg:right-10 max-w-[calc(100vw-1rem)] sm:max-w-7xl mx-auto box-border ${
          isDarkHeader
            ? "top-2 sm:top-3.5 py-1.5 sm:py-2.5 px-3 sm:px-5 bg-white/[0.08] text-white shadow-2xl shadow-black/25 border border-white/20 rounded-full backdrop-blur-md"
            : "top-2 sm:top-2.5 py-1.5 sm:py-2 px-3 sm:px-5 bg-white/95 text-slate-900 shadow-xl shadow-slate-900/10 border border-slate-200/90 rounded-full backdrop-blur-xl"
        }`}
      >
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Brand Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl shrink-0 min-w-0"
          >
            <span
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-xl transition-all shadow-md shrink-0 ${
                !isDarkHeader
                  ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20"
                  : "bg-white/15 border border-white/30 text-amber-300 shadow-black/20 group-hover:bg-white/20"
              }`}
            >
              🕉️
            </span>
            <div className="flex flex-col min-w-0">
              <span
                className={`font-black tracking-wider text-xs sm:text-base lg:text-lg uppercase transition-colors truncate max-w-[105px] xs:max-w-[160px] sm:max-w-none ${
                  !isDarkHeader
                    ? "text-slate-900 group-hover:text-amber-600"
                    : "text-amber-100 group-hover:text-amber-300"
                }`}
                style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
              >
                {strings.header.title}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-medium tracking-tight -mt-0.5 truncate max-w-[105px] xs:max-w-[160px] sm:max-w-none hidden xs:block ${
                  !isDarkHeader ? "text-amber-700" : "text-amber-300/80"
                }`}
              >
                {strings.header.subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0">
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
                    !isDarkHeader
                      ? isActive
                        ? "text-amber-600 font-bold"
                        : "text-slate-700 hover:text-amber-600"
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
                        !isDarkHeader ? "bg-amber-600" : "bg-amber-400"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative hidden sm:block" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  !isDarkHeader
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300/70"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/25"
                }`}
                title="भाषा परिवर्तन गर्नुहोस् / Switch Language / भाषापरिवर्तनम्"
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden md:inline">{currentLangObj.label}</span>
                <span
                  className="text-[10px] opacity-70 transition-transform duration-200"
                  style={{ transform: langDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  ▾
                </span>
              </button>

              {/* Language Options Menu */}
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white/95 text-slate-900 shadow-2xl border border-slate-200/80 backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
                    Language / भाषा
                  </div>
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        language === opt.code
                          ? "bg-amber-500/10 text-amber-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                      {language === opt.code && (
                        <span className="text-amber-600 text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Login/Account Status - Only First Name & Clear Contrast */}
            <HeaderUserBadge isDarkHeader={isDarkHeader} />

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-1.5 sm:p-2 rounded-xl transition-all border shrink-0 ${
                !isDarkHeader
                  ? "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
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
        <div className="fixed inset-x-2.5 sm:inset-x-4 top-16 sm:top-20 z-40 lg:hidden p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-2xl text-slate-900 shadow-2xl border border-slate-200/80 animate-in fade-in slide-in-from-top-4 duration-200 flex flex-col gap-2 max-w-lg mx-auto">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              भाषा / Language
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLanguage(opt.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    language === opt.code
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
