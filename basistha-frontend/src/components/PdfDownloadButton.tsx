/**
 * Basistha – PDF Download Button
 * Dynamically loads @react-pdf/renderer on the client only.
 */
"use client";

import React, { useState } from "react";
import { KundaliData, PanchangData, DashaData, BirthDetails } from "@/types/astrology";

interface Props {
  kundali: KundaliData | null;
  panchang: PanchangData | null;
  dasha: DashaData | null;
  birth: BirthDetails;
  personName?: string;
}

export const PdfDownloadButton: React.FC<Props> = ({
  kundali,
  panchang,
  dasha,
  birth,
  personName = "जातक",
}) => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [BlobLink, setBlobLink] = useState<React.ComponentType<any> | null>(null);
  const [DocComponent, setDocComponent] = useState<React.ReactNode>(null);

  const handlePrepare = async () => {
    if (!kundali) {
      alert("कुण्डली डेटा उपलब्ध छैन। कृपया पहिले कुण्डली गणना गर्नुहोस्।");
      return;
    }
    setLoading(true);
    try {
      // Dynamically import to avoid SSR issues
      const [pdfLib, { KundaliPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./KundaliPdfReport"),
      ]);

      const { PDFDownloadLink } = pdfLib;
      const fileName = `${personName.replace(/\s+/g, "_")}_Kundali_${birth.year}-${String(birth.month).padStart(2, "0")}-${String(birth.day).padStart(2, "0")}.pdf`;

      const doc = (
        <KundaliPdfDocument
          kundali={kundali}
          panchang={panchang}
          dasha={dasha}
          birth={birth}
          personName={personName}
        />
      );

      setBlobLink(() => PDFDownloadLink);
      setDocComponent(doc);
      setReady(true);
    } catch (err) {
      console.error("PDF preparation error:", err);
      alert("PDF तयार गर्न समस्या भयो। पुनः प्रयास गर्नुहोस्।");
    } finally {
      setLoading(false);
    }
  };

  const fileName = `${personName.replace(/\s+/g, "_")}_Kundali_${birth.year}-${String(birth.month).padStart(2, "0")}-${String(birth.day).padStart(2, "0")}.pdf`;

  if (!ready || !BlobLink || !DocComponent) {
    return (
      <button
        onClick={handlePrepare}
        disabled={loading || !kundali}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer
          ${!kundali
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : loading
              ? "bg-amber-400 text-white animate-pulse"
              : "bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white"
          }`}
      >
        {loading ? (
          <>
            <span className="animate-spin text-lg">⚙️</span>
            PDF तयार हुँदैछ…
          </>
        ) : (
          <>
            <span>📄</span>
            कुण्डली PDF डाउनलोड
          </>
        )}
      </button>
    );
  }

  return (
    <BlobLink document={DocComponent} fileName={fileName}>
      {({ loading: pdfLoading }: { loading: boolean }) => (
        <button
          disabled={pdfLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer
            ${pdfLoading
              ? "bg-amber-400 text-white animate-pulse"
              : "bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white"
            }`}
        >
          {pdfLoading ? (
            <>
              <span className="animate-spin">⚙️</span>
              PDF बनाउँदैछ…
            </>
          ) : (
            <>
              <span>⬇️</span>
              PDF डाउनलोड गर्नुहोस्
            </>
          )}
        </button>
      )}
    </BlobLink>
  );
};
