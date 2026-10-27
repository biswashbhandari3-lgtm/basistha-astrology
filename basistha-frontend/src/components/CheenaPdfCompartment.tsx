/**
 * Basistha – Traditional Multi-Page Cheena (Janmapatrika) PDF Actions Compartment
 * Provides:
 * 1. 👁️ चिना PDF भ्यु (View PDF) - Full 6-page interactive browser preview modal
 * 2. 🖨️ चिना PDF प्रिन्ट (Print PDF) - Direct browser printing of high-resolution PDF
 * 3. ⬇️ डाउनलोड (Download PDF) - Direct download option
 * Rendered immediately after entering/submitting native details (जातक विवरण).
 */
"use client";

import React, { useState, useEffect } from "react";
import { BirthDetails, KundaliData, PanchangData, DashaData } from "@/types/astrology";
import { fetchCheenaPdfBlob, downloadCheenaPdf } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  birth: BirthDetails;
  kundali?: KundaliData | null;
  panchang?: PanchangData | null;
  dasha?: DashaData | null;
  personName?: string;
  fatherName?: string;
  motherName?: string;
  dateBs?: string;
}

export const CheenaPdfCompartment: React.FC<Props> = ({
  birth,
  kundali,
  panchang,
  dasha,
  personName = "जातक",
  fatherName = "",
  motherName = "",
  dateBs = "",
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isLoadingPrint, setIsLoadingPrint] = useState(false);
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Modal State for PDF Viewer
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Cleanup object URL when component unmounts or blob URL changes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const getOptions = () => ({
    name: personName || (language === "en" ? "Native" : "जातक"),
    father_name: fatherName,
    mother_name: motherName,
    date_bs: dateBs,
    place: birth.city_name || (language === "en" ? "Kathmandu" : "काठमाडौँ"),
    astrologer_name: user?.name || (language === "en" ? "Vedic Astrologer" : "ज्योतिषाचार्य"),
    language: language || "ne",
  });

  // 1. View PDF Handler (चिना PDF भ्यु / हेर्नुहोस्)
  const handleViewPdf = async () => {
    setIsLoadingView(true);
    setStatusMsg(language === "en" ? "Loading Cheena PDF..." : "चिना PDF तयार हुँदैछ…");

    try {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      const blob = await fetchCheenaPdfBlob(birth, getOptions());
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setIsViewerOpen(true);
      setStatusMsg(null);
    } catch (err: any) {
      console.error("Cheena PDF View Error:", err);
      alert(language === "en" ? `Failed to load PDF: ${err?.message || "Server error"}` : `चिना PDF लोड गर्दा समस्या भयो: ${err?.message || "सर्भरमा समस्या छ।"}`);
      setStatusMsg(null);
    } finally {
      setIsLoadingView(false);
    }
  };

  // 2. Print PDF Handler (चिना PDF प्रिन्ट)
  const handlePrintPdf = async () => {
    setIsLoadingPrint(true);
    setStatusMsg(language === "en" ? "Preparing PDF for Print..." : "प्रिन्टको लागि चिना तयार हुँदैछ…");

    try {
      const blob = await fetchCheenaPdfBlob(birth, getOptions());
      const url = URL.createObjectURL(blob);

      // Create an invisible iframe to trigger direct printing
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {
            // Fallback for browsers that block iframe printing
            window.open(url, "_blank");
          }
          // Cleanup iframe after printing
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            URL.revokeObjectURL(url);
          }, 60000);
        }, 300);
      };

      setStatusMsg(language === "en" ? "Sent to Printer!" : "प्रिन्ट आदेश पठाइयो!");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error("Cheena PDF Print Error:", err);
      alert(language === "en" ? `Print failed: ${err?.message || "Server error"}` : `प्रिन्ट गर्दा त्रुटि भयो: ${err?.message || "सर्भर त्रुटि"}`);
      setStatusMsg(null);
    } finally {
      setIsLoadingPrint(false);
    }
  };

  // 3. Download PDF Handler (चिना डाउनलोड)
  const handleDownloadPdf = async () => {
    setIsLoadingDownload(true);
    setStatusMsg(language === "en" ? "Downloading PDF..." : "चिना डाउनलोड हुँदैछ…");

    try {
      await downloadCheenaPdf(birth, getOptions());
      setStatusMsg(language === "en" ? "Downloaded!" : "डाउनलोड सम्पन्न भयो!");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error("Cheena PDF Download Error:", err);
      alert(language === "en" ? `Download failed: ${err?.message || "Server error"}` : `डाउनलोड असफल: ${err?.message || "सर्भर त्रुटि"}`);
      setStatusMsg(null);
    } finally {
      setIsLoadingDownload(false);
    }
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  const displayName = personName || (language === "en" ? "Native" : "जातक");
  const displayBs = dateBs || (birth.bs_year ? `${birth.bs_year}/${String(birth.bs_month).padStart(2, "0")}/${String(birth.bs_day).padStart(2, "0")}` : "");
  const displayAd = `${birth.year}-${String(birth.month).padStart(2, "0")}-${String(birth.day).padStart(2, "0")}`;
  const displayTime = `${String(birth.hour).padStart(2, "0")}:${String(birth.minute).padStart(2, "0")}`;
  const displayCity = birth.city_name || (language === "en" ? "Kathmandu" : "काठमाडौँ");

  return (
    <div className="no-print w-full bg-gradient-to-br from-[#2D0A0A] via-[#1A0C0C] to-[#0F172A] border-2 border-amber-600/50 rounded-3xl p-5 md:p-6 shadow-2xl text-white relative overflow-hidden">
      {/* Decorative Traditional Watermark Accent */}
      <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl pointer-events-none select-none font-serif">
        ॐ
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Info: Native Summary */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>📜</span> {language === "en" ? "Vedic Cheena Services" : "॥ पारम्परिक नेपाली जन्मपत्रिका (चिना) सेवा ॥"}
            </span>
            <span className="text-xs bg-red-900/40 text-red-200 border border-red-700/40 px-2.5 py-0.5 rounded-full font-semibold">
              ६ पृष्ठको पूर्ण पुस्तिका (6 Pages)
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-amber-100 flex items-center gap-2">
            <span>👤</span>
            <span>{displayName}</span>
            {fatherName && (
              <span className="text-xs font-normal text-amber-200/80">
                ({language === "en" ? "Father: " : "पिता: "}{fatherName})
              </span>
            )}
          </h2>

          <div className="text-xs text-amber-200/90 flex flex-wrap items-center gap-x-3 gap-y-1">
            {displayBs && <span>📅 वि.सं. {displayBs}</span>}
            <span>• 📆 ई.सं. {displayAd}</span>
            <span>• ⏰ समय: {displayTime}</span>
            <span>• 📍 स्थान: {displayCity}</span>
            {user?.name && (
              <span className="text-amber-300 font-semibold">
                • ✍️ ज्योतिषी: {user.name}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed max-w-2xl pt-1">
            {language === "en"
              ? "✓ Complete 6-page horoscope with Shodashavarga (16 divisional charts), Vimshottari, Tribhagi & Yogini Dashas, Panchadha Maitri, and in-depth classical predictions."
              : "✓ षोडशवर्ग (१६ वटै वर्ग कुण्डलीहरू), विंशोत्तरी, त्रिभागी (८० वर्ष) र योगिनी (३६ वर्ष) महादशान्तर्दशा, पञ्चधा ग्रहमैत्री चक्र र ६ विधाका विस्तृत शास्त्रीय फलादेश समावेश भएको पूर्ण डिजिटल चिना।"}
          </p>
        </div>

        {/* Right Actions: Two Main Buttons (View & Print) + Download */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Button 1: 👁️ चिना PDF भ्यु (View PDF) */}
          <button
            onClick={handleViewPdf}
            disabled={isLoadingView || isLoadingPrint || isLoadingDownload}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-900/40 border border-amber-400/40 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title={language === "en" ? "View full 6-page Cheena PDF directly in browser" : "६ पृष्ठको सम्पूर्ण चिना PDF ब्राउजरमै हेर्नुहोस्"}
          >
            {isLoadingView ? (
              <>
                <span className="animate-spin text-base">⚙️</span>
                <span>{language === "en" ? "Loading..." : "चिना खुल्दैछ…"}</span>
              </>
            ) : (
              <>
                <span className="text-lg">👁️</span>
                <span>{language === "en" ? "View Cheena PDF" : "चिना PDF भ्यु (हेर्नुहोस्)"}</span>
              </>
            )}
          </button>

          {/* Button 2: 🖨️ चिना PDF प्रिन्ट (Print PDF) */}
          <button
            onClick={handlePrintPdf}
            disabled={isLoadingView || isLoadingPrint || isLoadingDownload}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-950/40 border border-red-500/40 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title={language === "en" ? "Print Cheena PDF directly" : "चिना PDF सिधै प्रिन्ट गर्नुहोस्"}
          >
            {isLoadingPrint ? (
              <>
                <span className="animate-spin text-base">⚙️</span>
                <span>{language === "en" ? "Preparing..." : "तयार हुँदैछ…"}</span>
              </>
            ) : (
              <>
                <span className="text-lg">🖨️</span>
                <span>{language === "en" ? "Print Cheena PDF" : "चिना PDF प्रिन्ट"}</span>
              </>
            )}
          </button>

          {/* Optional Direct Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isLoadingView || isLoadingPrint || isLoadingDownload}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-600/30 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title={language === "en" ? "Download PDF file" : "चिना PDF फाइल डाउनलोड गर्नुहोस्"}
          >
            {isLoadingDownload ? (
              <span className="animate-spin">⚙️</span>
            ) : (
              <span>⬇️</span>
            )}
            <span className="hidden sm:inline">{language === "en" ? "Download" : "डाउनलोड"}</span>
          </button>
        </div>
      </div>

      {/* Temporary Status Toast Message */}
      {statusMsg && (
        <div className="mt-3 text-xs text-amber-300 flex items-center gap-2 animate-pulse">
          <span>✨</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Interactive Cheena PDF Viewer Modal */}
      {isViewerOpen && pdfBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header Bar */}
            <div className="bg-gradient-to-r from-red-950 via-amber-950 to-slate-900 border-b border-amber-600/40 px-5 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-amber-100 flex items-center gap-2">
                    <span>जन्मपत्रिका (चिना) PDF</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-normal">
                      {displayName}
                    </span>
                  </h3>
                  <p className="text-[11px] text-amber-200/70">
                    ६ पृष्ठको पूर्ण पारम्परिक कुण्डली एवं फलादेश (Pages 1 to 6)
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="bg-red-800 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-red-500/40 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  title="प्रिन्ट गर्नुहोस्"
                >
                  <span>🖨️</span>
                  <span className="hidden sm:inline">प्रिन्ट</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-amber-400/40 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  title="डाउनलोड गर्नुहोस्"
                >
                  <span>⬇️</span>
                  <span className="hidden sm:inline">डाउनलोड</span>
                </button>
                <button
                  onClick={closeViewer}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-all"
                  title="बन्द गर्नुहोस्"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: High Definition Embedded PDF Viewer */}
            <div className="flex-1 bg-slate-950 p-1 relative">
              <iframe
                src={pdfBlobUrl}
                title="Cheena PDF Viewer"
                className="w-full h-full rounded-2xl border border-slate-800 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
