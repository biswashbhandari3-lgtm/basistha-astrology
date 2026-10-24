"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export const AuthModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, register, quickDemoLogin } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("astrologer");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    const ok = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (!ok) {
      setErrorMsg("इमेल वा पासवर्ड मिलेन। कृपया कम्तिमा ४ अक्षरको पासवर्ड राख्नुहोस्।");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!regName.trim()) {
      setErrorMsg("कृपया आफ्नो पूरा नाम लेख्नुहोस्।");
      return;
    }
    setIsSubmitting(true);
    await register(regName, regEmail, regPassword, regRole);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-vedic-burgundy to-amber-900 p-6 text-white text-center">
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl mx-auto flex items-center justify-center text-2xl border border-amber-400/30 mb-2">
            🕉️
          </div>
          <h3 className="text-xl font-bold tracking-wide text-amber-200">
            Basistha (वसिष्ठ) ज्योतिष मञ्च
          </h3>
          <p className="text-xs text-amber-100/80 mt-1">
            कुण्डली साधन तथा ज्योतिषीय सेवाका लागि लगइन अनिवार्य छ
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => { setTab("login"); setErrorMsg(""); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-all cursor-pointer ${
              tab === "login"
                ? "text-vedic-burgundy border-b-2 border-vedic-saffron bg-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            लगइन गर्नुहोस् (Login)
          </button>
          <button
            onClick={() => { setTab("register"); setErrorMsg(""); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-all cursor-pointer ${
              tab === "register"
                ? "text-vedic-burgundy border-b-2 border-vedic-saffron bg-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            नयाँ खाता खोल्नुहोस् (Register)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              {errorMsg}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  इमेल ठेगाना वा फोन नम्बर
                </label>
                <input
                  type="text"
                  placeholder="name@example.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  गोप्य पासवर्ड (Password)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full bg-gradient-to-r from-vedic-saffron to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "लगइन हुँदैछ..." : "लगइन गर्नुहोस् (Login)"}
              </button>

              {/* Instant 1-Click Demo Button */}
              <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 mb-2">तत्काल परीक्षण गर्नका लागि:</p>
                <button
                  type="button"
                  onClick={quickDemoLogin}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>✨</span> १-क्लिक डेमो ज्योतिषी लगइन (Demo Astrologer)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  तपाईंको पूरा नाम (Full Name)
                </label>
                <input
                  type="text"
                  placeholder="पं. रामप्रसाद शर्मा"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  इमेल ठेगाना (Email)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  पासवर्ड (Password)
                </label>
                <input
                  type="password"
                  placeholder="कम्तिमा ६ अक्षर"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  खाताको प्रकार (Account Type)
                </label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
                  value={regRole}
                  onChange={e => setRegRole(e.target.value)}
                >
                  <option value="astrologer">ज्योतिष विज्ञ / पण्डित (Astrologer)</option>
                  <option value="client">जिज्ञासु / सामान्य प्रयोगकर्ता (Client)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full bg-gradient-to-r from-vedic-saffron to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "दर्ता हुँदैछ..." : "नयाँ खाता दर्ता गर्नुहोस्"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
