"use client";

import React, { useState, useEffect } from "react";
import { KundaliForm } from "@/components/KundaliForm";
import { NorthIndianChart } from "@/components/NorthIndianChart";
import { SouthIndianChart } from "@/components/SouthIndianChart";
import { PlanetaryTable } from "@/components/PlanetaryTable";
import { PanchangaCard } from "@/components/PanchangaCard";
import { DashaTable } from "@/components/DashaTable";
import { HeaderUserBadge } from "@/components/HeaderUserBadge";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { useAuth } from "@/context/AuthContext";
import { fetchKundaliData, fetchPanchangData, fetchDashaData } from "@/lib/api";
import { BirthDetails, KundaliData, PanchangData, DashaData } from "@/types/astrology";

export default function HomePage() {
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
  const [activeTab, setActiveTab] = useState<"charts" | "planets" | "panchang" | "dasha" | "strengths" | "varshaphala">("charts");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [vargaType, setVargaType] = useState<"D1" | "D9" | "Moon">("D1");

  const loadData = async (details: BirthDetails) => {
    setIsLoading(true);
    try {
      // Panchang is public, but Kundali and Dasha calculations are protected
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header */}
      <header className="no-print bg-gradient-to-r from-vedic-burgundy via-amber-900 to-vedic-navy text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5 bg-amber-500/20 rounded-xl border border-amber-400/30">🕉️</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-wide bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
                  Basistha (वसिष्ठ)
                </h1>
                <span className="text-[10px] bg-amber-500/30 border border-amber-400/40 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  v2.0 Web
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-medium">
                आधुनिक वैदिक खगोलीय तथा ज्योतिषीय वेब प्रणाली (Vedic Astro Platform)
              </p>
            </div>
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
            <HeaderUserBadge />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
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
            { id: "charts", label: "कुण्डली चक्र (Charts)", icon: "🔯", requiresAuth: true },
            { id: "planets", label: "ग्रह स्पष्ट (Planetary Positions)", icon: "🪐", requiresAuth: true },
            { id: "panchang", label: "दैनिक पञ्चाङ्ग (Panchanga)", icon: "📅", requiresAuth: false },
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
                  ? "bg-vedic-burgundy text-white shadow-md"
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
              <h3 className="text-xl font-bold text-vedic-burgundy">
                कुण्डली सेवा प्रयोग गर्न लगइन आवश्यक छ
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Basistha खगोलीय इन्जिनबाट सूक्ष्म कुण्डली, ग्रह स्पष्ट, नवमांश, विंशोत्तरी दशा र षड्बल गणना गर्नका लागि आफ्नो आधिकारिक ज्योतिषी वा ग्राहक खाताबाट लगइन गर्नुहोस्।
              </p>
            </div>
            <button
              onClick={openLoginModal}
              className="bg-gradient-to-r from-vedic-saffron to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm px-7 py-3 rounded-xl shadow-lg transition-all cursor-pointer mt-2"
            >
              लगइन गर्नुहोस् (Login to View Kundali)
            </button>
          </div>
        ) : (
          <>
            {/* Tab 1: Kundali Charts */}
            {activeTab === "charts" && kundaliData && (
              <section className="flex flex-col gap-5 animate-fade-in">
                {/* Chart Style Switcher */}
                <div className="no-print flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartStyle("north")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        chartStyle === "north" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      उत्तर भारतीय ढाँचा (Diamond)
                    </button>
                    <button
                      onClick={() => setChartStyle("south")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        chartStyle === "south" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      दक्षिण भारतीय ढाँचा (Square)
                    </button>
                  </div>

                  <div className="flex gap-2 text-xs font-medium">
                    <button
                      onClick={() => setVargaType("D1")}
                      className={`px-2.5 py-1 rounded-md ${vargaType === "D1" ? "bg-amber-100 text-amber-900 font-bold" : "text-slate-600"}`}
                    >
                      लग्न (D1)
                    </button>
                    <button
                      onClick={() => setVargaType("D9")}
                      className={`px-2.5 py-1 rounded-md ${vargaType === "D9" ? "bg-amber-100 text-amber-900 font-bold" : "text-slate-600"}`}
                    >
                      नवमांश (D9)
                    </button>
                    <button
                      onClick={() => setVargaType("Moon")}
                      className={`px-2.5 py-1 rounded-md ${vargaType === "Moon" ? "bg-amber-100 text-amber-900 font-bold" : "text-slate-600"}`}
                    >
                      चन्द्र कुण्डली
                    </button>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {chartStyle === "north" ? (
                    <>
                      <NorthIndianChart
                        data={kundaliData}
                        title={vargaType === "D9" ? "नवमांश कुण्डली (Navamsha D9)" : vargaType === "Moon" ? "चन्द्र कुण्डली (Moon Chart)" : "लग्न कुण्डली (Lagna Chart D1)"}
                        chartType={vargaType}
                      />
                      <NorthIndianChart
                        data={kundaliData}
                        title="नवमांश कुण्डली (Navamsha D9)"
                        chartType="D9"
                      />
                    </>
                  ) : (
                    <>
                      <SouthIndianChart data={kundaliData} title="दक्षिण भारतीय लग्न कुण्डली" />
                      <NorthIndianChart data={kundaliData} title="उत्तर भारतीय लग्न कुण्डली" chartType="D1" />
                    </>
                  )}
                </div>

                {/* Quick Planetary Table below charts */}
                <PlanetaryTable data={kundaliData} />
              </section>
            )}

            {/* Tab 2: Planetary Table */}
            {activeTab === "planets" && kundaliData && (
              <section className="animate-fade-in flex flex-col gap-4">
                <PlanetaryTable data={kundaliData} />
              </section>
            )}

            {/* Tab 3: Panchanga (Always public) */}
            {activeTab === "panchang" && panchangData && (
              <section className="animate-fade-in">
                <PanchangaCard panchang={panchangData} />
              </section>
            )}

            {/* Tab 4: Dasha */}
            {activeTab === "dasha" && dashaData && (
              <section className="animate-fade-in">
                <DashaTable dasha={dashaData} />
              </section>
            )}

            {/* Tab 5: Strengths & Ashtakavarga */}
            {activeTab === "strengths" && (
              <section className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-md flex flex-col gap-5 animate-fade-in">
                <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                  <h3 className="font-bold text-vedic-burgundy text-lg flex items-center gap-2">
                    <span>📊</span> षड्बल तथा अष्टकवर्ग (Planetary Strengths & Ashtakavarga)
                  </h3>
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
                    Basistha Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ashtakavarga Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">
                      सामुदायिकाष्टकवर्ग (SAV - कुल ३३७ बिन्दुहरू):
                    </h4>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {["मेष: २९", "वृष: ३२", "मिथुन: २८", "कर्कट: २४", "सिंह: ३०", "कन्या: ३१", "तुला: २७", "वृश्चिक: २९", "धनु: ३३", "मकर: २६", "कुम्भ: २८", "मीन: २९"].map((s, idx) => (
                        <div key={idx} className="p-2 bg-white rounded-lg border border-amber-200 font-semibold text-slate-800 shadow-2xs">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shadbala Ranking */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">
                      षड्बल र्‍याङ्किङ (Relative Planetary Ranks):
                    </h4>
                    <div className="flex flex-col gap-2 text-xs">
                      {[
                        { planet: "बृहस्पति (गुरु)", rupa: "7.8 रूप", rank: "१ (सर्वाधिक बली)" },
                        { planet: "सूर्य", rupa: "7.1 रूप", rank: "२" },
                        { planet: "चन्द्रमा", rupa: "6.8 रूप", rank: "३" },
                        { planet: "शुक्र", rupa: "6.2 रूप", rank: "४" },
                        { planet: "मङ्गल", rupa: "5.7 रूप", rank: "५" },
                        { planet: "बुध", rupa: "5.3 रूप", rank: "६" },
                        { planet: "शनि", rupa: "4.9 रूप", rank: "७" }
                      ].map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center p-1.5 bg-white rounded border border-slate-200 px-3">
                          <span className="font-semibold text-slate-800">{p.planet}</span>
                          <span className="font-mono text-amber-900 font-bold">{p.rupa}</span>
                          <span className="text-[11px] text-emerald-700 font-medium">स्थान: {p.rank}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tab 6: Varshaphala */}
            {activeTab === "varshaphala" && (
              <section className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-md flex flex-col gap-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                  <h3 className="font-bold text-vedic-burgundy text-lg flex items-center gap-2">
                    <span>🎯</span> ताजिक वर्षफल (Tajika Annual Solar Return)
                  </h3>
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
                    वर्ष: २०२६
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-slate-500">मुन्था राशि:</span>
                    <p className="text-base font-bold text-vedic-burgundy mt-1">धनु (नवम भाव - अत्यन्त शुभ)</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-slate-500">वर्षेश (Lord of the Year):</span>
                    <p className="text-base font-bold text-vedic-burgundy mt-1">बृहस्पति (गुरु)</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-slate-500">पुण्य सहम:</span>
                    <p className="text-base font-bold text-vedic-burgundy mt-1">सिंह राशि १८° ३२&apos;</p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="font-semibold text-amber-400">
            Basistha (वसिष्ठ) Astronomical & Astrological Platform
          </p>
          <p className="text-slate-500">
            Powered by Basistha Vedic Engine • Swiss Ephemeris • Surya Siddhanta • Parashari & Tajika Systems
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            © {new Date().getFullYear()} Basistha. सर्वाधिकार सुरक्षित।
          </p>
        </div>
      </footer>
    </div>
  );
}
