"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale, Translations } from "@/lib/translations";

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (path: string, fallback?: string) => string;
  strings: Translations;
  formatNumber: (num: number | string) => string;
}

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toDevanagariDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => DEVANAGARI_DIGITS[parseInt(d, 10)]);
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ne",
  setLanguage: () => {},
  t: (path: string) => path,
  strings: translations.ne,
  formatNumber: (num) => String(num),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Locale>("ne");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("basistha_lang") as Locale;
      if (saved && (saved === "ne" || saved === "en" || saved === "sa")) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // Fallback silently if localStorage is restricted
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("basistha_lang", lang);
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: any = translations[language];
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return fallback || path;
      }
    }
    return typeof current === "string" ? current : fallback || path;
  };

  const formatNumber = (num: number | string): string => {
    if (language === "en") {
      return String(num);
    }
    return toDevanagariDigits(num);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        strings: translations[language],
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
