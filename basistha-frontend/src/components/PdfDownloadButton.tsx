/**
 * Basistha – Traditional Nepali Cheena (Janmapatrika) PDF Download
 * Powered by high-precision ReportLab astronomical generation engine.
 */
"use client";

import React, { useState } from "react";
import { KundaliData, PanchangData, DashaData, BirthDetails } from "@/types/astrology";
import { downloadCheenaPdf } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  kundali: KundaliData | null;
  panchang: PanchangData | null;
  dasha: DashaData | null;
  birth: BirthDetails;
  personName?: string;
  fatherName?: string;
  motherName?: string;
  dateBs?: string;
}

export const PdfDownloadButton: React.FC<Props> = ({
  kundali,
  panchang,
  dasha,
  birth,
  personName = "जातक",
  fatherName = "",
  motherName = "",
  dateBs = "",
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!kundali && !birth) {
      alert("कृपया पहिले जन्म विवरण प्रविष्ट गर्नुहोस्।");
      return;
    }

    setDownloading(true);
    setStatusMsg(language === "en" ? "Generating Cheena..." : "चिना तयार हुँदैछ…");

    try {
      await downloadCheenaPdf(birth, {
        name: personName || (language === "en" ? "Native" : "जातक"),
        father_name: fatherName,
        mother_name: motherName,
        date_bs: dateBs,
        place: birth.city_name || (language === "en" ? "Kathmandu" : "काठमाडौँ"),
        astrologer_name: user?.name || (language === "en" ? "Vedic Astrologer" : "ज्योतिषाचार्य"),
        language: language || "ne",
      });
      setStatusMsg(language === "en" ? "Download Complete!" : "डाउनलोड सम्पन्न भयो!");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error("Cheena PDF Download Error:", err);
      alert(language === "en" ? `Error downloading PDF: ${err?.message || "Server unreachable"}` : `चिना PDF डाउनलोड गर्दा त्रुटि भयो: ${err?.message || "सर्भरसँग सम्पर्क हुन सकेन।"}`);
      setStatusMsg(null);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      title={language === "en" ? "Download Traditional Vedic Cheena (Janmapatrika) PDF" : "परम्परागत नेपाली जन्मपत्रिका (चिना) PDF डाउनलोड गर्नुहोस्"}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer select-none active:scale-95
        ${
          downloading
            ? "bg-amber-500 text-white animate-pulse cursor-wait"
            : "bg-gradient-to-r from-red-800 via-amber-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white border border-amber-500/40 hover:shadow-amber-900/30 hover:shadow-lg"
        }`}
    >
      {downloading ? (
        <>
          <span className="animate-spin text-base">⚙️</span>
          <span>{statusMsg || (language === "en" ? "Preparing PDF..." : "चिना PDF तयार हुँदैछ…")}</span>
        </>
      ) : (
        <>
          <span className="text-base">📜</span>
          <span>{language === "en" ? "Download Cheena PDF" : "चिना PDF डाउनलोड"}</span>
        </>
      )}
    </button>
  );
};
