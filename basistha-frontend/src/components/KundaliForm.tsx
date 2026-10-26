"use client";

import React, { useState, useEffect } from "react";
import { BirthDetails } from "@/types/astrology";
import { COUNTRIES_DATA, CountryPreset, CityPreset } from "@/lib/locationPresets";
import {
  NEPALI_MONTHS_NAMES,
  THAR_GOTRA_MAP,
  lookupGotraByThar,
  bsToGregorianDate,
  gregorianToBSDate,
  formatCoords,
  formatTime12Hour,
  parseTime12Hour
} from "@/lib/nepaliCalendarHelper";

interface KundaliFormProps {
  onSubmit: (details: BirthDetails) => void;
  isLoading?: boolean;
}

interface SavedKundali {
  id: string;
  name: string;
  thar: string;
  gender: string;
  father_name: string;
  mother_name: string;
  gotra: string;
  bs_year: number;
  bs_month: number;
  bs_day: number;
  ad_date_str: string;
  time_str: string;
  hour: number;
  minute: number;
  second: number;
  country_key: string;
  city_name: string;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  ayanamsha: string;
  saved_at: string;
}

// Initial demo saved profiles if storage is empty
const INITIAL_DEMO_KUNDALIS: SavedKundali[] = [
  {
    id: "demo-1",
    name: "श्री जातक",
    thar: "घिमिरे",
    gender: "पुरुष",
    father_name: "रामप्रसाद घिमिरे",
    mother_name: "सीतादेवी घिमिरे",
    gotra: "कश्यप",
    bs_year: 2083,
    bs_month: 7,
    bs_day: 9,
    ad_date_str: "10/26/2026",
    time_str: "01:00:52 PM",
    hour: 13,
    minute: 0,
    second: 52,
    country_key: "NP",
    city_name: "काठमाडौँ (Kathmandu)",
    latitude: 27.7172,
    longitude: 85.3240,
    timezone_offset: 5.75,
    ayanamsha: "SURYASIDDHANTA",
    saved_at: "2026-10-26"
  },
  {
    id: "demo-2",
    name: "आयुष शर्मा",
    thar: "शर्मा",
    gender: "पुरुष",
    father_name: "हरिप्रसाद शर्मा",
    mother_name: "लक्ष्मी शर्मा",
    gotra: "भारद्वाज",
    bs_year: 2055,
    bs_month: 3,
    bs_day: 15,
    ad_date_str: "06/29/1998",
    time_str: "06:45:00 AM",
    hour: 6,
    minute: 45,
    second: 0,
    country_key: "NP",
    city_name: "पोखरा (Pokhara)",
    latitude: 28.2096,
    longitude: 83.9856,
    timezone_offset: 5.75,
    ayanamsha: "LAHIRI",
    saved_at: "2026-10-24"
  },
  {
    id: "demo-3",
    name: "अदिती पोखरेल",
    thar: "पोखरेल",
    gender: "महिला",
    father_name: "माधव पोखरेल",
    mother_name: "सरस्वती पोखरेल",
    gotra: "आत्रेय",
    bs_year: 2062,
    bs_month: 8,
    bs_day: 22,
    ad_date_str: "12/07/2005",
    time_str: "09:15:30 PM",
    hour: 21,
    minute: 15,
    second: 30,
    country_key: "NP",
    city_name: "चितवन (Chitwan)",
    latitude: 27.6833,
    longitude: 84.4333,
    timezone_offset: 5.75,
    ayanamsha: "SURYASIDDHANTA",
    saved_at: "2026-10-22"
  }
];

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function toDeva(n: number | string): string {
  return String(n).replace(/\d/g, d => DEVANAGARI_DIGITS[parseInt(d, 10)]);
}

// Generate Bikram Sambat Years list (2000 BS to 2100 BS)
const BS_YEARS = Array.from({ length: 101 }, (_, i) => 2000 + i);

// Calculation Systems / Ayanamsha Options
const CALCULATION_SYSTEMS = [
  { key: "SURYASIDDHANTA", label: "शुद्ध सूर्यसिद्धान्त (मूल पारम्परिक)", color: "bg-amber-500", dot: "🟠" },
  { key: "LAHIRI", label: "चित्रपक्ष / लाहिड़ी (आधिकारिक मानक)", color: "bg-blue-500", dot: "🔵" },
  { key: "KP", label: "के.पी. ज्योतिष (KP System)", color: "bg-emerald-500", dot: "🟢" },
  { key: "RAMAN", label: "बि.भी. रमण (B.V. Raman)", color: "bg-purple-500", dot: "🟣" },
  { key: "PUSHYA", label: "पुष्यपक्ष (Pushya Paksha)", color: "bg-yellow-500", dot: "🟡" },
  { key: "FAGAN", label: "फागन-ब्र्याडली (Fagan-Bradley)", color: "bg-amber-800", dot: "🟤" },
  { key: "SAYANA", label: "सायन पद्धति (Sayana / 0° Tropical)", color: "bg-slate-400", dot: "⚪" }
];

export const KundaliForm: React.FC<KundaliFormProps> = ({ onSubmit, isLoading }) => {
  // 1. Personal Details
  const [jatakName, setJatakName] = useState<string>("श्री जातक");
  const [jatakThar, setJatakThar] = useState<string>("");
  const [gender, setGender] = useState<string>("पुरुष");
  const [fatherName, setFatherName] = useState<string>("");
  const [motherName, setMotherName] = useState<string>("");
  const [gotra, setGotra] = useState<string>("काश्यप");

  // 2. Date: Bikram Sambat & Gregorian
  const [bsYear, setBsYear] = useState<number>(2083);
  const [bsMonth, setBsMonth] = useState<number>(7); // 7 = कार्तिक
  const [bsDay, setBsDay] = useState<number>(9);      // 9 गते
  const [adDateStr, setAdDateStr] = useState<string>("10/26/2026");

  // 3. Time Details
  const [timeStr, setTimeStr] = useState<string>("01:00:52 PM");
  const [hour, setHour] = useState<number>(13);
  const [minute, setMinute] = useState<number>(0);
  const [second, setSecond] = useState<number>(52);

  // 4. Country & Location
  const [selectedCountryKey, setSelectedCountryKey] = useState<string>("NP");
  const [selectedCityName, setSelectedCityName] = useState<string>("काठमाडौँ (Kathmandu)");
  const [latitude, setLatitude] = useState<number>(27.7172);
  const [longitude, setLongitude] = useState<number>(85.3240);
  const [timezoneOffset, setTimezoneOffset] = useState<number>(5.75);

  // 5. System / Ayanamsha
  const [selectedSystem, setSelectedSystem] = useState<string>("SURYASIDDHANTA");

  // 6. Saved Kundalis state & modal
  const [savedKundalis, setSavedKundalis] = useState<SavedKundali[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Load saved kundalis from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("basistha_saved_kundalis");
      if (stored) {
        setSavedKundalis(JSON.parse(stored));
      } else {
        setSavedKundalis(INITIAL_DEMO_KUNDALIS);
        localStorage.setItem("basistha_saved_kundalis", JSON.stringify(INITIAL_DEMO_KUNDALIS));
      }
    } catch {
      setSavedKundalis(INITIAL_DEMO_KUNDALIS);
    }
  }, []);

  // Synchronize BS Date to AD Date automatically
  const handleBsDateChange = (y: number, m: number, d: number) => {
    setBsYear(y);
    setBsMonth(m);
    setBsDay(d);
    try {
      const gDate = bsToGregorianDate(y, m, d);
      const mm = String(gDate.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(gDate.getUTCDate()).padStart(2, "0");
      const yyyy = gDate.getUTCFullYear();
      setAdDateStr(`${mm}/${dd}/${yyyy}`);
    } catch (err) {
      console.warn("Date conversion error", err);
    }
  };

  // Synchronize AD Date to BS Date automatically
  const handleAdDateChange = (val: string) => {
    setAdDateStr(val);
    // Parse MM/DD/YYYY or YYYY-MM-DD
    let parts = val.includes("/") ? val.split("/") : val.split("-");
    let y = 2026, m = 10, d = 26;

    if (val.includes("/")) {
      m = parseInt(parts[0], 10);
      d = parseInt(parts[1], 10);
      y = parseInt(parts[2], 10);
    } else if (val.includes("-")) {
      y = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
      d = parseInt(parts[2], 10);
    }

    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      try {
        const gregDate = new Date(Date.UTC(y, m - 1, d));
        const bs = gregorianToBSDate(gregDate);
        setBsYear(bs.yearBS);
        setBsMonth(bs.monthBS);
        setBsDay(bs.dayBS);
      } catch (err) {
        console.warn("BS Date conversion error", err);
      }
    }
  };

  // Auto-lookup Gotra when Thar (Surname) is typed
  const handleTharChange = (val: string) => {
    setJatakThar(val);
    const autoGotra = lookupGotraByThar(val);
    if (autoGotra) {
      setGotra(autoGotra);
    }
  };

  // Time change handler
  const handleTimeChange = (val: string) => {
    setTimeStr(val);
    const parsed = parseTime12Hour(val);
    if (parsed) {
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setSecond(parsed.second);
    }
  };

  // Country change handler
  const currentCountry = COUNTRIES_DATA.find(c => c.key === selectedCountryKey) || COUNTRIES_DATA[0];

  const handleCountryChange = (cKey: string) => {
    setSelectedCountryKey(cKey);
    const cData = COUNTRIES_DATA.find(c => c.key === cKey);
    if (cData && cData.cities.length > 0) {
      const firstCity = cData.cities[0];
      setSelectedCityName(firstCity.name);
      setLatitude(firstCity.lat);
      setLongitude(firstCity.lon);
      setTimezoneOffset(firstCity.tz);
    }
  };

  // City change handler
  const handleCityChange = (cName: string) => {
    setSelectedCityName(cName);
    const found = currentCountry.cities.find(c => c.name === cName);
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lon);
      setTimezoneOffset(found.tz);
    }
  };

  // Refresh / Reset form to default
  const handleRefresh = () => {
    setJatakName("श्री जातक");
    setJatakThar("");
    setGender("पुरुष");
    setFatherName("");
    setMotherName("");
    setGotra("काश्यप");
    handleBsDateChange(2083, 7, 9);
    setTimeStr("01:00:52 PM");
    setHour(13);
    setMinute(0);
    setSecond(52);
    setSelectedCountryKey("NP");
    setSelectedCityName("काठमाडौँ (Kathmandu)");
    setLatitude(27.7172);
    setLongitude(85.3240);
    setTimezoneOffset(5.75);
    setSelectedSystem("SURYASIDDHANTA");

    setShowToast("फारम प्रारम्भिक अवस्थामा रिफ्रेस भयो!");
    setTimeout(() => setShowToast(null), 3000);
  };

  // Save Kundali profile
  const handleSaveKundali = () => {
    const newProfile: SavedKundali = {
      id: "kundali-" + Date.now(),
      name: jatakName || "श्री जातक",
      thar: jatakThar,
      gender,
      father_name: fatherName,
      mother_name: motherName,
      gotra: gotra || "काश्यप",
      bs_year: bsYear,
      bs_month: bsMonth,
      bs_day: bsDay,
      ad_date_str: adDateStr,
      time_str: timeStr,
      hour,
      minute,
      second,
      country_key: selectedCountryKey,
      city_name: selectedCityName,
      latitude,
      longitude,
      timezone_offset: timezoneOffset,
      ayanamsha: selectedSystem,
      saved_at: new Date().toISOString().split("T")[0]
    };

    const updated = [newProfile, ...savedKundalis];
    setSavedKundalis(updated);
    try {
      localStorage.setItem("basistha_saved_kundalis", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage save failed", e);
    }

    setShowToast(`'${newProfile.name}' को कुण्डली सफलतापूर्वक सुरक्षित भयो!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Load a saved profile into form
  const handleLoadProfile = (p: SavedKundali) => {
    setJatakName(p.name);
    setJatakThar(p.thar || "");
    setGender(p.gender || "पुरुष");
    setFatherName(p.father_name || "");
    setMotherName(p.mother_name || "");
    setGotra(p.gotra || "काश्यप");

    setBsYear(p.bs_year);
    setBsMonth(p.bs_month);
    setBsDay(p.bs_day);
    setAdDateStr(p.ad_date_str);

    setTimeStr(p.time_str);
    setHour(p.hour);
    setMinute(p.minute);
    setSecond(p.second);

    setSelectedCountryKey(p.country_key || "NP");
    setSelectedCityName(p.city_name);
    setLatitude(p.latitude);
    setLongitude(p.longitude);
    setTimezoneOffset(p.timezone_offset);
    setSelectedSystem(p.ayanamsha || "SURYASIDDHANTA");

    setIsSavedModalOpen(false);
    setShowToast(`'${p.name}' को विवरण लोड गरियो!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Delete a saved profile
  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedKundalis.filter(k => k.id !== id);
    setSavedKundalis(filtered);
    try {
      localStorage.setItem("basistha_saved_kundalis", JSON.stringify(filtered));
    } catch {}
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse AD date to get year, month, day for engine
    let adY = 2026, adM = 10, adD = 26;
    if (adDateStr.includes("/")) {
      const parts = adDateStr.split("/");
      adM = parseInt(parts[0], 10) || 10;
      adD = parseInt(parts[1], 10) || 26;
      adY = parseInt(parts[2], 10) || 2026;
    } else if (adDateStr.includes("-")) {
      const parts = adDateStr.split("-");
      adY = parseInt(parts[0], 10) || 2026;
      adM = parseInt(parts[1], 10) || 10;
      adD = parseInt(parts[2], 10) || 26;
    }

    const payload: BirthDetails = {
      year: adY,
      month: adM,
      day: adD,
      hour,
      minute,
      second,
      latitude,
      longitude,
      timezone_offset: timezoneOffset,
      ayanamsha: selectedSystem,
      house_system: "P",
      city_name: selectedCityName,
      name: jatakName,
      thar: jatakThar,
      gender,
      father_name: fatherName,
      mother_name: motherName,
      gotra,
      bs_year: bsYear,
      bs_month: bsMonth,
      bs_day: bsDay
    };

    onSubmit(payload);
  };

  const activeSystemObj = CALCULATION_SYSTEMS.find(s => s.key === selectedSystem) || CALCULATION_SYSTEMS[0];

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden mb-8">
      {/* Subtle Vedic Astrological Chart Mandala Background Watermark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle at center, #8b5cf6 0%, transparent 70%)`
        }}
      >
        <svg
          viewBox="0 0 600 600"
          className="w-[120%] h-[120%] max-w-none text-slate-900"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <circle cx="300" cy="300" r="280" />
          <circle cx="300" cy="300" r="230" />
          <circle cx="300" cy="300" r="170" />
          <circle cx="300" cy="300" r="90" />
          <polygon points="300,20 542,160 542,440 300,580 58,440 58,160" />
          <polygon points="300,70 499,185 499,415 300,530 101,415 101,185" />
          <line x1="20" y1="300" x2="580" y2="300" />
          <line x1="300" y1="20" x2="300" y2="580" />
          <line x1="102" y1="102" x2="498" y2="498" />
          <line x1="102" y1="498" x2="498" y2="102" />
        </svg>
      </div>

      {/* Floating Notification Toast */}
      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-bounce">
          <span>✨</span> {showToast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative z-10 p-6 md:p-8">
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-slate-200/90 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            जन्म विवरण
          </h2>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            title="फारम पुनः रिफ्रेस गर्नुहोस्"
          >
            <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>रिफ्रेस</span>
          </button>
        </div>

        {/* Row 1: Name, Thar (with gotra note), Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Column 1: जातकको नाम */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              जातकको नाम:
            </label>
            <input
              type="text"
              placeholder="श्री जातक"
              value={jatakName}
              onChange={e => setJatakName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Column 2: जातकको थर (थर राख्दा गोत्र स्वतः आउँछ) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                जातकको थर:
              </label>
              <span className="text-[11px] font-semibold text-amber-700">
                (थर राख्दा गोत्र स्वतः आउँछ)
              </span>
            </div>
            <input
              type="text"
              placeholder="जस्तै: शर्मा, घिमिरे, पोखरेल, अधिकारी..."
              value={jatakThar}
              onChange={e => handleTharChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Column 3: लिङ्ग */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              लिङ्ग:
            </label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="पुरुष">पुरुष</option>
              <option value="महिला">महिला</option>
              <option value="अन्य">अन्य</option>
            </select>
          </div>
        </div>

        {/* Row 2: बाबुको नाम, आमाको नाम, गोत्र */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Column 1: बाबुको नाम */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              बाबुको नाम:
            </label>
            <input
              type="text"
              placeholder="बाबुको नाम"
              value={fatherName}
              onChange={e => setFatherName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Column 2: आमाको नाम */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              आमाको नाम:
            </label>
            <input
              type="text"
              placeholder="आमाको नाम"
              value={motherName}
              onChange={e => setMotherName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Column 3: गोत्र */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              गोत्र:
            </label>
            <input
              type="text"
              placeholder="काश्यप"
              value={gotra}
              onChange={e => setGotra(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Row 3: जन्म मिति (विक्रम संवत्) [२ खण्ड] र ईस्वी संवत् (स्वतः रूपान्तरण) [१ खण्ड] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Columns 1 & 2: जन्म मिति (विक्रम संवत्): ३ वटा ड्रपडाउन (वर्ष, महिना, गते) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              जन्म मिति (विक्रम संवत्):
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Year Dropdown */}
              <select
                value={bsYear}
                onChange={e => handleBsDateChange(parseInt(e.target.value, 10), bsMonth, bsDay)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm cursor-pointer"
              >
                {BS_YEARS.map(y => (
                  <option key={y} value={y}>
                    {toDeva(y)} वि.सं.
                  </option>
                ))}
              </select>

              {/* Month Dropdown */}
              <select
                value={bsMonth}
                onChange={e => handleBsDateChange(bsYear, parseInt(e.target.value, 10), bsDay)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm cursor-pointer"
              >
                {NEPALI_MONTHS_NAMES.map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {mName}
                  </option>
                ))}
              </select>

              {/* Day Dropdown */}
              <select
                value={bsDay}
                onChange={e => handleBsDateChange(bsYear, bsMonth, parseInt(e.target.value, 10))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm cursor-pointer"
              >
                {Array.from({ length: 32 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>
                    {toDeva(d)} गते
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 3: ईस्वी संवत् (स्वतः रूपान्तरण) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ईस्वी संवत् (स्वतः रूपान्तरण):
            </label>
            <div className="relative">
              <input
                type="text"
                value={adDateStr}
                onChange={e => handleAdDateChange(e.target.value)}
                placeholder="MM/DD/YYYY (10/26/2026)"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 pr-10 text-sm font-mono text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: जन्म समय (घण्टा:मिनेट:सेकेन्ड), जन्म देश (Country), जन्म शहर / स्थान (City) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Column 1: जन्म समय */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              जन्म समय (घण्टा:मिनेट:सेकेन्ड):
            </label>
            <div className="relative">
              <input
                type="text"
                value={timeStr}
                onChange={e => handleTimeChange(e.target.value)}
                placeholder="01:00:52 PM"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 pr-10 text-sm font-mono text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </div>

          {/* Column 2: जन्म देश (Country) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              जन्म देश (Country):
            </label>
            <select
              value={selectedCountryKey}
              onChange={e => handleCountryChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              {COUNTRIES_DATA.map(c => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Column 3: जन्म शहर / स्थान (City) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              जन्म शहर / स्थान (City):
            </label>
            <select
              value={selectedCityName}
              onChange={e => handleCityChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              {currentCountry.cities.map(ct => (
                <option key={ct.name} value={ct.name}>
                  {ct.name} - {formatCoords(ct.lat, ct.lon)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: स्थानीय अक्षांश, स्थानीय देशान्तर */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Column 1: स्थानीय अक्षांश */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              स्थानीय अक्षांश:
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={e => setLatitude(parseFloat(e.target.value) || 0.0)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
              required
            />
          </div>

          {/* Column 2: स्थानीय देशान्तर */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              स्थानीय देशान्तर:
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={e => setLongitude(parseFloat(e.target.value) || 0.0)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Bottom Action Bar: [सुरक्षित कुण्डलीहरू] [कुण्डली सुरक्षित गर्नुहोस्] --- [पद्धति: शुद्ध सूर्यसिद्धान्त (मूल पारम्परिक) | सक्रिय] --- [✨ कुण्डली निर्माण गर्नुहोस्] */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
          {/* Left Buttons: सुरक्षित कुण्डलीहरू & कुण्डली सुरक्षित गर्नुहोस् */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSavedModalOpen(true)}
              className="bg-[#b6914c] hover:bg-[#a27e3b] text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>📁</span>
              <span>सुरक्षित कुण्डलीहरू ({savedKundalis.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSaveKundali}
              className="bg-[#15803d] hover:bg-[#166534] text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>💾</span>
              <span>कुण्डली सुरक्षित गर्नुहोस्</span>
            </button>
          </div>

          {/* Middle/Right: पद्धति (Ayanamsha/System Selector Badge) */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 pl-3">
            <span className="text-xs font-bold text-slate-600">पद्धति:</span>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 gap-2 shadow-xs">
              <span className="text-xs">{activeSystemObj.dot}</span>
              <select
                value={selectedSystem}
                onChange={e => setSelectedSystem(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
              >
                {CALCULATION_SYSTEMS.map(sys => (
                  <option key={sys.key} value={sys.key}>
                    {sys.label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] font-bold bg-[#c25e00] text-white px-2 py-0.5 rounded-md shadow-xs">
                सक्रिय
              </span>
            </div>
          </div>

          {/* Right Button: कुण्डली निर्माण गर्नुहोस् */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm md:text-base px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>निर्माण हुँदैछ...</span>
              </>
            ) : (
              <>
                <span className="text-amber-400 text-lg">✨</span>
                <span>कुण्डली निर्माण गर्नुहोस्</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Saved Kundalis Modal */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>📁</span> सुरक्षित कुण्डलीहरूको सूची ({savedKundalis.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsSavedModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {savedKundalis.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  कुनै पनि सुरक्षित कुण्डली फेला परेन।
                </div>
              ) : (
                savedKundalis.map(k => (
                  <div
                    key={k.id}
                    onClick={() => handleLoadProfile(k)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>👤 {k.name}</span>
                        {k.gotra && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            गोत्र: {k.gotra}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                        <span>📅 {toDeva(k.bs_year)}/{toDeva(k.bs_month)}/{toDeva(k.bs_day)} वि.सं.</span>
                        <span>• ⏰ {k.time_str}</span>
                        <span>• 📍 {k.city_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        छान्नुहोस् ➔
                      </span>
                      <button
                        type="button"
                        onClick={e => handleDeleteProfile(k.id, e)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                        title="हटाउनुहोस्"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSavedModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
