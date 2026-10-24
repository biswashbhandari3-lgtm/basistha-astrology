"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export const HeaderUserBadge: React.FC = () => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={openLoginModal}
        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <span>🔐</span> लगइन / दर्ता (Login)
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-400/30 px-3 py-1.5 rounded-xl">
      <div className="w-7 h-7 rounded-full bg-vedic-saffron text-white flex items-center justify-center font-bold text-xs shadow-xs">
        {user.name.substring(0, 1)}
      </div>

      <div className="text-left hidden sm:block">
        <p className="text-xs font-bold text-amber-200 leading-tight">{user.name}</p>
        <p className="text-[10px] text-amber-300/80 leading-tight">{user.role_ne}</p>
      </div>

      <button
        onClick={logout}
        title="लगआउट गर्नुहोस्"
        className="text-[11px] bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-400/30 px-2 py-1 rounded-lg transition-colors cursor-pointer"
      >
        लगआउट
      </button>
    </div>
  );
};
