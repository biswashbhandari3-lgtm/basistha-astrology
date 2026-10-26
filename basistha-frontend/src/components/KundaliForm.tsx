"use client";

import React, { useState, useEffect } from "react";
import { BirthDetails } from "@/types/astrology";
import { COUNTRIES_DATA, AYANAMSHA_PRESETS, CountryPreset, CityPreset } from "@/lib/locationPresets";

interface KundaliFormProps {
  onSubmit: (details: BirthDetails) => void;
  isLoading?: boolean;
}

export const KundaliForm: React.FC<KundaliFormProps> = ({ onSubmit, isLoading }) => {
  const [selectedCountryKey, setSelectedCountryKey] = useState<string>("NP");

  const [formData, setFormData] = useState<BirthDetails>({
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

  // Keep a synced date string for direct typing (YYYY-MM-DD)
  const [dateStr, setDateStr] = useState<string>("2026-10-22");

  // Sync dateStr when year, month, day change
  useEffect(() => {
    const yStr = String(formData.year).padStart(4, "0");
    const mStr = String(formData.month).padStart(2, "0");
    const dStr = String(formData.day).padStart(2, "0");
    setDateStr(`${yStr}-${mStr}-${dStr}`);
  }, [formData.year, formData.month, formData.day]);

  // Handler for typing full date string
  const handleDateStringChange = (val: string) => {
    setDateStr(val);
    const parts = val.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 1000 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        setFormData(prev => ({ ...prev, year: y, month: m, day: d }));
      }
    }
  };

  const currentCountry = COUNTRIES_DATA.find(c => c.key === selectedCountryKey) || COUNTRIES_DATA[0];

  const handleCountryChange = (countryKey: string) => {
    setSelectedCountryKey(countryKey);
    const cData = COUNTRIES_DATA.find(c => c.key === countryKey);
    if (cData && cData.cities.length > 0) {
      const defaultCity = cData.cities[0];
      setFormData(prev => ({
        ...prev,
        city_name: `${defaultCity.name}, ${cData.name_en}`,
        latitude: defaultCity.lat,
        longitude: defaultCity.lon,
        timezone_offset: defaultCity.tz
      }));
    }
  };

  const handleCityChange = (cityName: string) => {
    const found = currentCountry.cities.find(c => c.name === cityName);
    if (found) {
      setFormData(prev => ({
        ...prev,
        city_name: `${found.name}, ${currentCountry.name_en}`,
        latitude: found.lat,
        longitude: found.lon,
        timezone_offset: found.tz
      }));
    }
  };

  const selectedAyanamshaObj = AYANAMSHA_PRESETS.find(a => a.key === formData.ayanamsha) || AYANAMSHA_PRESETS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-3xl border border-amber-200/90 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between border-b border-amber-200/80 pb-4 mb-6 gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-vedic-burgundy flex items-center gap-2">
            <span className="text-2xl">🕉️</span> जन्म विवरण तथा अयनांश छनोट फारम
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            नेपालका सम्पूर्ण ७७ जिल्लाहरू तथा विश्वका प्रमुख सहरहरू सहितको उच्च परिशुद्ध जन्मकुण्डली गणना
          </p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-full font-bold shadow-sm">
          Basistha Precision Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Date of Birth - Typable full date or Year/Month/Day */}
        <div className="flex flex-col bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/60">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800">
              📅 जन्म मिति (Date of Birth)
            </label>
            <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/70 px-2 py-0.5 rounded">
              ई.सं. (A.D.)
            </span>
          </div>

          {/* Direct Typable Date String Input */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="YYYY-MM-DD (जस्तै: 2026-10-22)"
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              value={dateStr}
              onChange={e => handleDateStringChange(e.target.value)}
              title="मिति सिधै YYYY-MM-DD ढाँचामा टाइप गर्नुहोस्"
            />
          </div>

          {/* Quick-edit Year - Month - Day inputs */}
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">वर्ष (Year)</span>
              <input
                type="number"
                placeholder="वर्ष"
                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">महिना (Month)</span>
              <input
                type="number"
                placeholder="महिना"
                min="1"
                max="12"
                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">दिन/गते (Day)</span>
              <input
                type="number"
                placeholder="दिन"
                min="1"
                max="31"
                className="w-full border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.day}
                onChange={e => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>
        </div>

        {/* Time of Birth */}
        <div className="flex flex-col bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/60">
          <label className="text-xs font-bold text-slate-800 mb-1.5">
            ⏰ जन्म समय (Time: Hour : Min : Sec)
          </label>
          <div className="grid grid-cols-3 gap-1.5 mt-auto">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">घण्टा (०-२३)</span>
              <input
                type="number"
                placeholder="घण्टा"
                min="0"
                max="23"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.hour}
                onChange={e => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">मिनेट (०-५९)</span>
              <input
                type="number"
                placeholder="मिनेट"
                min="0"
                max="59"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.minute}
                onChange={e => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">सेकेन्ड</span>
              <input
                type="number"
                placeholder="सेकेन्ड"
                min="0"
                max="59"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.second}
                onChange={e => setFormData({ ...formData, second: parseFloat(e.target.value) || 0.0 })}
              />
            </div>
          </div>
        </div>

        {/* Ayanamsha Selector with Description */}
        <div className="flex flex-col bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/60">
          <label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span>✨ अयनांश पद्धति (Ayanamsha)</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              गतिशील परिवर्तन
            </span>
          </label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs md:text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-vedic-burgundy cursor-pointer"
            value={formData.ayanamsha}
            onChange={e => setFormData({ ...formData, ayanamsha: e.target.value })}
          >
            {AYANAMSHA_PRESETS.map(a => (
              <option key={a.key} value={a.key}>
                {a.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-amber-900 mt-2 bg-amber-100/60 p-2 rounded-lg leading-tight">
            ℹ️ {selectedAyanamshaObj.desc}
          </p>
        </div>

        {/* Cascading Country Dropdown */}
        <div className="flex flex-col bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
          <label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <span>🌍</span> देश छान्नुहोस् (Country)
          </label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-slate-800 cursor-pointer"
            value={selectedCountryKey}
            onChange={e => handleCountryChange(e.target.value)}
          >
            {COUNTRIES_DATA.map(c => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 mt-1">
            विश्वका २० भन्दा बढी प्रमुख देशहरू उपलब्ध छन्
          </span>
        </div>

        {/* Cascading City / District Dropdown */}
        <div className="flex flex-col bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
          <label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <span>📍</span> स्थान / जिल्ला छान्नुहोस् (Location / District)
          </label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-slate-800 cursor-pointer"
            value={
              currentCountry.cities.find(c => formData.city_name?.startsWith(c.name))?.name ||
              currentCountry.cities[0]?.name
            }
            onChange={e => handleCityChange(e.target.value)}
          >
            {currentCountry.cities.map(c => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 mt-1">
            {selectedCountryKey === "NP"
              ? "नेपालका सम्पूर्ण ७७ वटा जिल्लाहरूको सहि अक्षांश/देशान्तर"
              : `${currentCountry.name_en} का मुख्य सहरहरू`}
          </span>
        </div>

        {/* Fine-Tuned Coordinates & Timezone */}
        <div className="flex flex-col bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
          <label className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <span>🧭</span> अक्षांश, देशान्तर र मानक समय
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">अक्षांश (°N)</span>
              <input
                type="number"
                step="0.0001"
                className="w-full border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.latitude}
                onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0.0 })}
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">देशान्तर (°E)</span>
              <input
                type="number"
                step="0.0001"
                className="w-full border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.longitude}
                onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0.0 })}
                required
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">मानक समय (TZ)</span>
              <input
                type="number"
                step="0.25"
                className="w-full border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                value={formData.timezone_offset}
                onChange={e => setFormData({ ...formData, timezone_offset: parseFloat(e.target.value) || 0.0 })}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-amber-200/60">
        <div className="text-xs text-slate-600 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>
            छानिएको अयनांश: <strong className="text-slate-900">{selectedAyanamshaObj.name}</strong>
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-vedic-saffron to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-orange-200 text-sm md:text-base"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>अयनांश अनुसार गणना हुँदैछ...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>कुण्डली गणना गर्नुहोस् (Calculate Kundali)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
