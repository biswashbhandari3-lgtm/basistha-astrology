"use client";

import React, { useState } from "react";
import { PhalitData, BirthDetails, KundaliData, DashaData, BhavaInterpretation } from "@/types/astrology";

interface FaladeshViewProps {
  phalit: PhalitData;
  birth: BirthDetails;
  kundali?: KundaliData | null;
  dasha?: DashaData | null;
}

const BHAVA_ICONS: Record<number, string> = {
  1: "👤", 2: "💰", 3: "⚔️", 4: "🏡", 5: "🧠", 6: "🛡️",
  7: "💍", 8: "⏳", 9: "🕉️", 10: "👑", 11: "📈", 12: "🕊️"
};

const BHAVA_THEMES: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1:  { bg: "bg-amber-50/70",   border: "border-amber-300",   text: "text-amber-900",   badge: "bg-amber-100 text-amber-900" },
  2:  { bg: "bg-emerald-50/70", border: "border-emerald-300", text: "text-emerald-900", badge: "bg-emerald-100 text-emerald-900" },
  3:  { bg: "bg-orange-50/70",  border: "border-orange-300",  text: "text-orange-900",  badge: "bg-orange-100 text-orange-900" },
  4:  { bg: "bg-blue-50/70",    border: "border-blue-300",    text: "text-blue-900",    badge: "bg-blue-100 text-blue-900" },
  5:  { bg: "bg-purple-50/70",  border: "border-purple-300",  text: "text-purple-900",  badge: "bg-purple-100 text-purple-900" },
  6:  { bg: "bg-rose-50/70",    border: "border-rose-300",    text: "text-rose-900",    badge: "bg-rose-100 text-rose-900" },
  7:  { bg: "bg-pink-50/70",    border: "border-pink-300",    text: "text-pink-900",    badge: "bg-pink-100 text-pink-900" },
  8:  { bg: "bg-slate-50/80",   border: "border-slate-300",   text: "text-slate-900",   badge: "bg-slate-200 text-slate-800" },
  9:  { bg: "bg-yellow-50/70",  border: "border-yellow-300",  text: "text-yellow-900",  badge: "bg-yellow-100 text-yellow-900" },
  10: { bg: "bg-indigo-50/70",  border: "border-indigo-300",  text: "text-indigo-900",  badge: "bg-indigo-100 text-indigo-900" },
  11: { bg: "bg-teal-50/70",    border: "border-teal-300",    text: "text-teal-900",    badge: "bg-teal-100 text-teal-900" },
  12: { bg: "bg-cyan-50/70",    border: "border-cyan-300",    text: "text-cyan-900",    badge: "bg-cyan-100 text-cyan-900" }
};

export const FaladeshView: React.FC<FaladeshViewProps> = ({ phalit, birth, kundali, dasha }) => {
  const [filterType, setFilterType] = useState<"ALL" | "KENDRA" | "TRIKONA" | "UPACHAYA" | "TRIK">("ALL");
  const [expandedBhava, setExpandedBhava] = useState<number | null>(1);
  const [showAllAuthorsForBhava, setShowAllAuthorsForBhava] = useState<number | null>(null);

  // Filter houses based on selection
  const filteredBhavas = phalit.bhava_analysis.filter(b => {
    if (filterType === "ALL") return true;
    if (filterType === "KENDRA") return [1, 4, 7, 10].includes(b.bhava);
    if (filterType === "TRIKONA") return [1, 5, 9].includes(b.bhava);
    if (filterType === "UPACHAYA") return [3, 6, 10, 11].includes(b.bhava);
    if (filterType === "TRIK") return [6, 8, 12].includes(b.bhava);
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* ─── 1. Header Banner: जातक परिचय तथा फलादेश पृष्ठभूमि ─── */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-500/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3">
              <span>🔮</span>
              <span>प्रामाणिक वैदिक फलादेश (Classical Predictive Astrology)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-100 flex items-center gap-3">
              <span>श्री {birth.name || "जातक"} को विस्तृत फलादेश</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-2xl leading-relaxed">
              बृहत्पाराशर होराशास्त्रम्, मानसागरी, र चमत्कार चिन्तामणि (२९ शास्त्रीय ग्रन्थकारहरू) का प्रामाणिक श्लोकहरूमा आधारित जन्मकालीन भाव, भावेष तथा दशाको वैज्ञानिक फलित विचार।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs text-amber-100 min-w-[220px]">
            <div>
              <span className="text-stone-400 block text-[10px]">जन्म लग्न:</span>
              <strong className="text-amber-300 text-sm">{kundali?.lagna.rashi_name_ne || "धनु"} लग्न ({kundali?.lagna.degree}°{kundali?.lagna.minute}&apos;)</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">जन्म नक्षत्र:</span>
              <strong className="text-white text-sm">{kundali?.lagna.nakshatra_name_ne || "पूर्वाषाढा"} (पाद {kundali?.lagna.nakshatra_pada || 1})</strong>
            </div>
            {birth.city_name && (
              <div>
                <span className="text-stone-400 block text-[10px]">जन्म स्थान:</span>
                <span className="text-stone-200">{birth.city_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 2. वर्तमान दशा फल (Active Dasha Phala Card) ─── */}
      {phalit.dasha_interpretation && (
        <div className="bg-white rounded-3xl border border-amber-300 shadow-md p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-xl">⏳</span>
              <span>वर्तमान दशा फलित (Active Dasha Phala)</span>
            </h3>
            <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
              {dasha?.dasha_system || "विंशोत्तरी महादशा"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mahadasha Card */}
            {phalit.dasha_interpretation.mahadasha_sloka && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  महादशा: {phalit.dasha_interpretation.mahadasha_ne}
                </span>
                <p className="text-xs text-slate-800 italic font-serif leading-relaxed whitespace-pre-line bg-white/70 p-3 rounded-xl border border-amber-100">
                  {phalit.dasha_interpretation.mahadasha_sloka}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  महर्षि पराशर अनुसार यस महादशा कालमा सम्बन्धित ग्रहको कारकत्व, राशीश र कुण्डलीको स्थिति अनुसार शुभ-अशुभ फल सक्रिय रहनेछ।
                </p>
              </div>
            )}

            {/* Antardasha Card */}
            {phalit.dasha_interpretation.antardasha_sloka ? (
              <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                  अन्तर्दशा: {phalit.dasha_interpretation.antardasha_ne}
                </span>
                <p className="text-xs text-slate-800 italic font-serif leading-relaxed whitespace-pre-line bg-white/70 p-3 rounded-xl border border-orange-100">
                  {phalit.dasha_interpretation.antardasha_sloka}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  अन्तर्दशाको प्रभावले दैनिक जीवनका कार्य, मानसिक सुख, व्यवसाय तथा पारिवारिक वातावरणमा तत्काल प्रभाव देखा पर्नेछ।
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center text-xs text-slate-500">
                वर्तमान अन्तर्दशाको फलित सम्बन्धित ग्रहको प्रकृति अनुसार फलदायी रहनेछ।
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3. १२ भाव वर्गीकरण फिल्टर (House Filter Buttons) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pl-2">
          <span>🏛️</span> भाव समूह छनोट:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "सबै १२ भाव (All 12)" },
            { id: "KENDRA", label: "केन्द्र भाव (१, ४, ७, १०)" },
            { id: "TRIKONA", label: "त्रिकोण भाव (१, ५, ९)" },
            { id: "UPACHAYA", label: "उपचय भाव (३, ६, १०, ११)" },
            { id: "TRIK", label: "त्रिक भाव (६, ८, १२)" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === f.id
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 4. १२ भावको विस्तृत फलादेश कार्डहरूको सूची (12 Bhava Cards) ─── */}
      <div className="flex flex-col gap-4">
        {filteredBhavas.map(b => {
          const theme = BHAVA_THEMES[b.bhava] || BHAVA_THEMES[1];
          const isExpanded = expandedBhava === b.bhava;
          const icon = BHAVA_ICONS[b.bhava] || "✨";
          const hasOccupants = b.planets_present && b.planets_present.length > 0;
          const showAuthors = showAllAuthorsForBhava === b.bhava;

          return (
            <div
              key={b.bhava}
              className={`bg-white rounded-3xl border-2 transition-all shadow-sm ${
                isExpanded ? `${theme.border} shadow-md` : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Bhava Card Header */}
              <div
                onClick={() => setExpandedBhava(isExpanded ? null : b.bhava)}
                className={`p-4 sm:p-5 flex justify-between items-center cursor-pointer rounded-3xl transition-colors ${
                  isExpanded ? theme.bg : "hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xl">
                    {icon}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                      <span>{b.bhava_name_ne}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${theme.badge}`}>
                        राशीश: {b.lord_planet_ne}
                      </span>
                      <span className="text-slate-500 font-medium">
                        (भावेश स्थिति: <strong>{b.lord_placed_in_bhava} भाव</strong>)
                      </span>
                      {hasOccupants ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[11px]">
                          उपस्थित ग्रह: {b.planets_present.map(p => p.planet_ne).join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          (ग्रह उपस्थिति छैन)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                    {isExpanded ? "बन्द गर्नुहोस्" : "विस्तृत हेर्नुहोस्"}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-2xs">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Bhava Expanded Content */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 flex flex-col gap-5">
                  {/* (A) महर्षि पराशर भावेश फल (Parashar Bhavesh Phala) */}
                  {b.bhavesh_interpretation && b.bhavesh_interpretation.parashar_sloka && (
                    <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>📜</span>
                          <span>महर्षि पराशर भावेश फल (बृहत्पाराशर होराशास्त्रम्)</span>
                        </h4>
                        <span className="text-[11px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                          {b.bhava} भावको स्वामी → {b.lord_placed_in_bhava} भावमा
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 italic font-serif leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-xl border border-amber-200/60">
                        {b.bhavesh_interpretation.parashar_sloka}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        यस भावको स्वामी ग्रह {b.lord_planet_ne} कुण्डलीको {b.lord_placed_in_bhava} भावमा शुभ वा अनुकूल स्थितिमा बस्दा सोही अनुसार भाग्य, आयु र ऐश्वर्यको अभिवृद्धि हुन्छ।
                      </p>
                    </div>
                  )}

                  {/* (B) भावमा उपस्थित ग्रहहरूको फल (Mansagari & Chamatkar Chintamani) */}
                  {hasOccupants ? (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🪐</span>
                        <span>यस भावमा रहेका ग्रहहरूको शास्त्रीय फल</span>
                      </h4>

                      <div className="flex flex-col gap-3.5">
                        {b.planets_present.map(p => (
                          <div
                            key={p.planet}
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5"
                          >
                            <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
                              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-vedic-saffron" />
                                {p.planet_ne} ({p.planet}) को फल
                              </span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                                मानसागरी तथा चमत्कार चिन्तामणि
                              </span>
                            </div>

                            {/* Mansagari Sloka */}
                            {p.mansagari_sloka && (
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold text-indigo-800 block mb-1">
                                  📖 मानसागरी ग्रन्थ:
                                </span>
                                <p className="text-xs text-slate-800 italic font-serif leading-relaxed whitespace-pre-line">
                                  {p.mansagari_sloka}
                                </p>
                              </div>
                            )}

                            {/* Chamatkar Chintamani Slokas from Classical Authors */}
                            {p.classical_interpretations && p.classical_interpretations.length > 0 && (
                              <div className="flex flex-col gap-2 mt-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-bold text-slate-700">
                                    🏛️ २९ ऋषि तथा ग्रन्थकारहरूका तुलनात्मक मत:
                                  </span>
                                  {p.classical_interpretations.length > 1 && (
                                    <button
                                      onClick={() => setShowAllAuthorsForBhava(showAuthors ? null : b.bhava)}
                                      className="text-[11px] text-amber-700 font-bold hover:underline cursor-pointer"
                                    >
                                      {showAuthors ? "थोरै हेर्नुहोस् ▲" : `सबै (${p.classical_interpretations.length}) ऋषि मत हेर्नुहोस् ▼`}
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                  {(showAuthors ? p.classical_interpretations : p.classical_interpretations.slice(0, 2)).map(auth => (
                                    <div
                                      key={auth.author_id}
                                      className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 text-xs"
                                    >
                                      <span className="font-bold text-amber-900 block text-[11px] mb-0.5">
                                        • {auth.author_name_ne}:
                                      </span>
                                      <p className="text-slate-800 font-serif italic text-xs leading-relaxed">
                                        {auth.sloka}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600">
                      यस भावमा कुनै पनि प्रत्यक्ष ग्रह अवस्थित छैन। तसर्थ, यस भावको मुख्य फल भावका स्वामी <strong>{b.lord_planet_ne}</strong> को स्थिति र यस भावमा पर्ने अन्य ग्रहहरूको पूर्ण दृष्टिको आधारमा प्राप्त हुनेछ।
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── 5. ज्योतिषीय परामर्श तथा शुभ उपायहरू (Remedies & Guidelines) ─── */}
      <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-amber-100 pb-3">
          <span>🌿</span>
          <span>सामान्य ज्योतिषीय सुझाव तथा शुभ उपायहरू (Vedic Guidance)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex flex-col gap-1.5">
            <strong className="text-amber-900 text-sm flex items-center gap-1.5">
              <span>💎</span> लग्नेश र शुभ रत्न
            </strong>
            <p className="text-slate-700 leading-relaxed">
              कुण्डलीको रक्षा र स्वास्थ्य प्रवर्द्धनका लागि लग्नेश ग्रहलाई बलवान् बनाउनु सर्वोपरि मानिन्छ। अनुभवी ज्योतिषाचार्यको परामर्शमा सम्बन्धित रत्न धारण गर्न सकिन्छ।
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-col gap-1.5">
            <strong className="text-emerald-900 text-sm flex items-center gap-1.5">
              <span>🕉️</span> मन्त्र जप तथा उपासना
            </strong>
            <p className="text-slate-700 leading-relaxed">
              वर्तमान विंशोत्तरी दशाका स्वामी ग्रहको बीज मन्त्र तथा आफ्ना इष्टदेवको नियमित जप/ध्यान गर्नाले प्रतिकूल फल शान्त भई जीवनमा शान्ति मिल्दछ।
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 flex flex-col gap-1.5">
            <strong className="text-blue-900 text-sm flex items-center gap-1.5">
              <span>🤝</span> दान तथा धर्म कर्म
            </strong>
            <p className="text-slate-700 leading-relaxed">
              छैटौँ, आठौँ वा बाह्रौँ भावमा रहेका कमजोर ग्रहहरूको नकारात्मक ऊर्जा न्यून गर्न सम्बन्धित ग्रहका खाद्य वस्तु, वस्त्र वा पशुपक्षीलाई आहारा दिनु उत्तम हुन्छ।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
