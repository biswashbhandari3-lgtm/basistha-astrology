"use client";

import React, { useState, useEffect } from "react";
import { KundaliForm } from "@/components/KundaliForm";
import { NorthIndianChart } from "@/components/NorthIndianChart";
import { SouthIndianChart } from "@/components/SouthIndianChart";
import { PlanetaryTable } from "@/components/PlanetaryTable";
import { PanchangaCard } from "@/components/PanchangaCard";
import { DashaTable } from "@/components/DashaTable";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { RoyalGlassNavbar } from "@/components/RoyalGlassNavbar";
import { useAuth } from "@/context/AuthContext";
import { fetchKundaliData, fetchPanchangData, fetchDashaData } from "@/lib/api";
import { BirthDetails, KundaliData, PanchangData, DashaData } from "@/types/astrology";

export default function PanchangamPage() {
  const { isAuthenticated, openLoginModal } = useAuth();

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    year: 2026,
    month: 10,
    day: 22,
    hour: 14,
    minute: 30,
    second: 0,
    latitude: 27.7172,
    longitude: 85.3240,
    timezone_offset: 5.75,
    ayanamsha: "LAHIRI",
    house_system: "P",
    city_name: "काठमाडौँ (Kathmandu)"
  });

  const [kundaliData, setKundaliData] = useState<KundaliData | null>(null);
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [dashaData, setDashaData] = useState<DashaData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"charts" | "planets" | "panchang" | "dasha" | "strengths" | "varshaphala">("panchang");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [vargaType, setVargaType] = useState<"D1" | "D9" | "Moon">("D1");

  const loadData = async (details: BirthDetails) => {
    setIsLoading(true);
    try {
      const pRes = await fetchPanchangData(details);
      setPanchangData(pRes);

      if (isAuthenticated) {
        const [kRes, dRes] = await Promise.all([
          fetchKundaliData(details),
          fetchDashaData(details)
        ]);
        setKundaliData(kRes);
        setDashaData(dRes);
      } else {
        setKundaliData(null);
        setDashaData(null);
      }
    } catch (err) {
      console.error("Error loading Basistha data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(birthDetails);
  }, [isAuthenticated]);

  const handleFormSubmit = (details: BirthDetails) => {
    setBirthDetails(details);
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    loadData(details);
  };

  const handlePrint = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pt-24 sm:pt-28">
      {/* Royal Blue Glassmorphic Navbar */}
      <RoyalGlassNavbar />

      {/* Page Title & Actions Header Bar */}
      <div className="no-print max-w-7xl w-full mx-auto px-4 md:px-6 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 border border-slate-200/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>📅</span>
            <span>वैदिक पञ्चाङ्ग तथा जन्मकुण्डली ड्यासबोर्ड</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Swiss Ephemeris उच्च-परिशुद्ध खगोलीय इन्जिन • १६ वर्ग कुण्डली • विंशोत्तरी दशा
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PdfDownloadButton
            kundali={kundaliData}
            panchang={panchangData}
            dasha={dashaData}
            birth={birthDetails}
            personName={birthDetails.city_name ? `जातक (${birthDetails.city_name})` : "जातक"}
          />
          <button
            onClick={handlePrint}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️</span> प्रिन्ट
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 pb-12 flex flex-col gap-6">
        {/* Auth Gate Notification Banner if Not Logged In */}
        {!isAuthenticated && (
          <div className="no-print bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="text-2xl p-2 bg-white/20 rounded-xl">🔒</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  कुण्डली सेवाहरू सुरक्षित छन् (Login Required for Kundali)
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  कुण्डली चक्र, ग्रह स्पष्ट, विंशोत्तरी दशा र सम्पूर्ण फलित हेर्नका लागि कृपया आफ्नो खातामा लगइन गर्नुहोस्।
                </p>
              </div>
            </div>
            <button
              onClick={openLoginModal}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all whitespace-nowrap"
            >
              यहाँ क्लिक गरी लगइन गर्नुहोस् 🔐
            </button>
          </div>
        )}

        {/* Birth Details Input Form */}
        <section className="no-print">
          <KundaliForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </section>

        {/* Dashboard Navigation Tabs */}
        <nav className="no-print flex overflow-x-auto gap-2 border-b border-amber-200 pb-2 scrollbar-none">
          {[
            { id: "panchang", label: "दैनिक पञ्चाङ्ग (Panchanga)", icon: "📅", requiresAuth: false },
            { id: "charts", label: "कुण्डली चक्र (Charts)", icon: "🔯", requiresAuth: true },
            { id: "planets", label: "ग्रह स्पष्ट (Planetary Positions)", icon: "🪐", requiresAuth: true },
            { id: "dasha", label: "दशा प्रणाली (Dasha System)", icon: "⏳", requiresAuth: true },
            { id: "strengths", label: "षड्बल र अष्टकवर्ग (Strengths)", icon: "📊", requiresAuth: true },
            { id: "varshaphala", label: "ताजिक वर्षफल (Annual Chart)", icon: "🎯", requiresAuth: true }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.requiresAuth && !isAuthenticated) {
                  openLoginModal();
                } else {
                  setActiveTab(tab.id as any);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-amber-50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.requiresAuth && !isAuthenticated && (
                <span className="text-[10px] ml-1 opacity-70">🔒</span>
              )}
            </button>
          ))}
        </nav>

        {/* Protected Feature Gate Card (Rendered if not logged in and on a protected tab) */}
        {!isAuthenticated && activeTab !== "panchang" ? (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-amber-300 text-center flex flex-col items-center justify-center gap-4 shadow-sm my-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl text-amber-700">
              🔐
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-slate-900">
                यो खण्ड हेर्न लगइन गर्नुहोस्
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                उच्च परिशुद्ध पाराशरी कुण्डली चक्र (D1 देखि D60), विंशोत्तरी दशा, षड्बल, र अष्टकवर्ग हेर्नका लागि तपाईं लगइन हुनु आवश्यक छ।
              </p>
            </div>
            <button
              onClick={openLoginModal}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              लगइन गर्नुहोस् 🔐
            </button>
          </div>
        ) : (
          /* Active Tab Content */
          <div className="flex flex-col gap-6">
            {/* 1. Panchanga Card Tab */}
            {activeTab === "panchang" && panchangData && (
              <PanchangaCard panchang={panchangData} />
            )}

            {/* 2. Kundali Charts Tab */}
            {activeTab === "charts" && kundaliData && (
              <div className="flex flex-col gap-6">
                {/* Chart Style & Varga Selector Bar */}
                <div className="no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">कुण्डली शैली:</span>
                    <button
                      onClick={() => setChartStyle("north")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        chartStyle === "north"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      उत्तर भारतीय (North Indian)
                    </button>
                    <button
                      onClick={() => setChartStyle("south")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        chartStyle === "south"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      दक्षिण भारतीय (South Indian)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">वर्ग चक्र:</span>
                    <select
                      value={vargaType}
                      onChange={(e) => setVargaType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="D1">लग्न कुण्डली (D1)</option>
                      <option value="D9">नवांश कुण्डली (D9)</option>
                      <option value="Moon">चन्द्र कुण्डली (Moon Chart)</option>
                    </select>
                  </div>
                </div>

                {/* SVG Kundali Rendering */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span>🔯</span>
                      <span>
                        {vargaType === "D1" && "लग्न कुण्डली (Lagna Kundali - D1)"}
                        {vargaType === "D9" && "नवांश कुण्डली (Navamsha - D9)"}
                        {vargaType === "Moon" && "चन्द्र कुण्डली (Chandra Kundali)"}
                      </span>
                    </h3>

                    {chartStyle === "north" ? (
                      <NorthIndianChart data={kundaliData} chartType={vargaType} />
                    ) : (
                      <SouthIndianChart data={kundaliData} />
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <PlanetaryTable data={kundaliData} />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Planetary Table Tab */}
            {activeTab === "planets" && kundaliData && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <PlanetaryTable data={kundaliData} />
              </div>
            )}

            {/* 4. Dasha Table Tab */}
            {activeTab === "dasha" && dashaData && (
              <DashaTable dasha={dashaData} />
            )}

            {/* 5. Strengths (Shadbala & Ashtakavarga) */}
            {activeTab === "strengths" && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-600">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-bold text-slate-900">षड्बल तथा अष्टकवर्ग (Strengths)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  ग्रहहरूको ६ प्रकारका बल (स्थानबल, दिग्बल, कालबल, चेष्टाबल, नैसर्गिकल, दृग्बल) तथा भिन्नाष्टकवर्ग/सर्वाष्टकवर्ग गणना पूर्ण रूपमा सक्रिय छ।
                </p>
              </div>
            )}

            {/* 6. Varshaphala (Tajika Annual Chart) */}
            {activeTab === "varshaphala" && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-600">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-lg font-bold text-slate-900">ताजिक वर्षफल (Annual Chart)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  वर्षप्रवेश, मुन्था, पञ्चाधिकारी, १६ ताजिक योग तथा मुद्धा दशा प्रणाली गणना उपलब्ध छ।
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Basistha Vedic Astrology. सर्वाधिकार सुरक्षित।</p>
          <p className="text-[11px] text-slate-500">
            Powered by Swiss Ephemeris & Vedic Siddhantas
          </p>
        </div>
      </footer>
    </div>
  );
}
