"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface HeaderUserBadgeProps {
  isDarkHeader?: boolean;
}

export const HeaderUserBadge: React.FC<HeaderUserBadgeProps> = ({ isDarkHeader = false }) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { strings } = useLanguage();

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={openLoginModal}
        type="button"
        className={`font-bold text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
          isDarkHeader
            ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 border border-amber-300/40"
            : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25 border border-amber-600"
        }`}
        title={strings.nav.login}
      >
        <span>🔑</span>
        <span>{strings.nav.login}</span>
      </button>
    );
  }

  // Extract only the first name (e.g. "विश्वास भण्डारी" -> "विश्वास")
  const getFirstName = (fullName?: string): string => {
    if (!fullName) return "";
    const clean = fullName.replace(/\(.*?\)/g, "").trim();
    const parts = clean.split(/\s+/);
    return parts[0] || fullName;
  };

  const firstName = getFirstName(user.name);
  const initialChar = firstName.charAt(0) || "U";

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition-all shrink-0 ${
        isDarkHeader
          ? "bg-slate-900/60 border border-amber-400/30 text-amber-100 shadow-md backdrop-blur-md"
          : "bg-slate-100 hover:bg-slate-200/70 border border-slate-300/80 text-slate-900 shadow-xs"
      }`}
    >
      {/* User Avatar Circle with First Letter */}
      <div
        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
          isDarkHeader
            ? "bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950"
            : "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        }`}
      >
        {initialChar}
      </div>

      {/* First Name Display Only (High contrast across all page themes) */}
      <span
        className={`text-xs font-bold leading-tight truncate max-w-[65px] xs:max-w-[95px] sm:max-w-[130px] ${
          isDarkHeader ? "text-amber-100" : "text-slate-900"
        }`}
        title={user.name}
      >
        {firstName}
      </span>

      {/* Logout Button */}
      <button
        onClick={logout}
        type="button"
        title={strings.nav.logout}
        className={`text-[10px] sm:text-[11px] px-2 py-0.5 sm:py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
          isDarkHeader
            ? "bg-red-500/20 hover:bg-red-500/40 text-red-100 hover:text-white border border-red-400/40 font-medium"
            : "bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 border border-red-200 font-bold"
        }`}
      >
        {strings.nav.logout}
      </button>
    </div>
  );
};
