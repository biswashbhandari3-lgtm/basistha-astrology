"use client";

import React, { useState, useEffect } from "react";
import { KundaliForm } from "@/components/KundaliForm";
import { FaladeshView } from "@/components/FaladeshView";
import { NorthIndianChart } from "@/components/NorthIndianChart";
import { RoyalGlassNavbar } from "@/components/RoyalGlassNavbar";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { useAuth } from "@/context/AuthContext";
import { fetchKundaliData, fetchPhalitData, fetchDashaData, fetchPanchangData } from "@/lib/api";
import { BirthDetails, KundaliData, PhalitData, DashaData, PanchangData } from "@/types/astrology";

export default function FaladeshPage() {
  const { isAuthenticated, openLoginModal } = useAuth();

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    year: 2026,
    month: 10,
    day: 27,
    hour: 12,
    minute: 0,
    second: 0,
    latitude: 27.7172,
    longitude: 85.3240,
    timezone_offset: 5.75,
    ayanamsha: "LAHIRI",
    house_system: "P",
    city_name: "काठमाडौँ (Kathmandu)"
  });

  const [kundaliData, setKundaliData] = useState<KundaliData | null>(null);
  const [phalitData, setPhalitData] = useState<PhalitData | null>(null);
  const [dashaData, setDashaData] = useState<DashaData | null>(null);
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showChartToggle, setShowChartToggle] = useState<boolean>(true);

  const loadAllData = async (details: BirthDetails) => {
    setIsLoading(true);
    try {
      const [kRes, pRes, dRes, panRes] = await Promise.all([
        fetchKundaliData(details),
        fetchPhalitData(details),
        fetchDashaData(details),
        fetchPanchangData(details)
      ]);
      setKundaliData(kRes);
      setPhalitData(pRes);
      setDashaData(dRes);
      setPanchangData(panRes);
    } catch (err) {
      console.error("Error loading Faladesh data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(birthDetails);
  }, []);

  const handleFormSubmit = (details: BirthDetails) => {
    setBirthDetails(details);
    loadAllData(details);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pt-24 sm:pt-28">
      {/* Navigation */}
      <RoyalGlassNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 pb-16 flex flex-col gap-6">
        {/* Page Header */}
        <div className="no-print bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-2 bg-amber-100 rounded-2xl">🔮</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  ज्योतिषीय फलादेश (Vedic Horoscope Predictions)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  जातकको जन्म विवरण अनुसार १२ भाव, भावेश, ग्रह स्थिति र वर्तमान दशा फलित
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChartToggle(!showChartToggle)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span>{showChartToggle ? "चार्ट लुकाउनुहोस्" : "कुण्डली चक्र हेर्नुहोस्"}</span>
              <span>{showChartToggle ? "▲" : "▼"}</span>
            </button>

            {kundaliData && panchangData && dashaData && (
              <PdfDownloadButton
                kundali={kundaliData}
                panchang={panchangData}
                dasha={dashaData}
                birth={birthDetails}
                personName={birthDetails.name || "जातक"}
                fatherName={birthDetails.father_name || ""}
                motherName={birthDetails.mother_name || ""}
                dateBs={birthDetails.bs_year ? `${birthDetails.bs_year}/${String(birthDetails.bs_month).padStart(2, "0")}/${String(birthDetails.bs_day).padStart(2, "0")}` : ""}
              />
            )}
          </div>
        </div>

        {/* Form Section */}
        <section className="no-print">
          <KundaliForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </section>

        {/* Collapsible Chart Preview Section */}
        {showChartToggle && kundaliData && (
          <section className="no-print bg-white rounded-3xl border border-amber-200/80 p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
              <div className="max-w-[380px] w-full">
                <NorthIndianChart data={kundaliData} title="लग्न कुण्डली (D1 Chart)" />
              </div>
              <div className="flex flex-col gap-3 text-xs max-w-md">
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                  <span className="font-bold text-amber-900 block text-sm mb-1">
                    🎯 कुण्डली सारांश:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>लग्न: <strong>{kundaliData.lagna.rashi_name_ne} ({kundaliData.lagna.degree}°{kundaliData.lagna.minute}&apos;)</strong></li>
                    <li>नक्षत्र: <strong>{kundaliData.lagna.nakshatra_name_ne} (चरण {kundaliData.lagna.nakshatra_pada})</strong></li>
                    <li>अयनांश: <strong>{kundaliData.ayanamsha_name} ({kundaliData.ayanamsha_value}°)</strong></li>
                    <li>वर्तमान दशा: <strong>{dashaData?.balance_of_dasha.first_lord_ne || "उपलब्ध"} महादशा</strong></li>
                  </ul>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  तलको फलादेश खण्डमा यस कुण्डलीका प्रत्येक भावका स्वामी (भावेष), भावमा अवस्थित ग्रहहरू तथा २९ महर्षिहरूका तुलनात्मक शास्त्रीय श्लोकहरू प्रस्तुत गरिएका छन्।
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Main Faladesh Display Section */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center gap-3">
            <span className="text-4xl animate-spin">🔯</span>
            <h3 className="font-bold text-slate-800 text-base">फलादेश तथा शास्त्रीय श्लोकहरू विश्लेषण हुँदैछ...</h3>
            <p className="text-xs text-slate-500">बृहत्पाराशर होराशास्त्रम् तथा मानसागरी डाटाबेसबाट श्लोकहरू संकलन गरिँदैछ</p>
          </div>
        ) : phalitData ? (
          <section>
            <FaladeshView
              phalit={phalitData}
              birth={birthDetails}
              kundali={kundaliData}
              dasha={dashaData}
            />
          </section>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm text-slate-500 text-xs">
            जातक विवरण फारममा भरेर &apos;कुण्डली गणना गर्नुहोस्&apos; बटन थिच्नुहोस्।
          </div>
        )}
      </main>
    </div>
  );
}
