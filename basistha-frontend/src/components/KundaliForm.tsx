"use client";

import React, { useState } from "react";
import { BirthDetails } from "@/types/astrology";

interface KundaliFormProps {
  onSubmit: (details: BirthDetails) => void;
  isLoading?: boolean;
}

const CITY_PRESETS = [
  { name: "काठमाडौँ (Kathmandu)", lat: 27.7172, lon: 85.3240, tz: 5.75 },
  { name: "पोखरा (Pokhara)", lat: 28.2096, lon: 83.9856, tz: 5.75 },
  { name: "ललितपुर (Lalitpur)", lat: 27.6710, lon: 85.3206, tz: 5.75 },
  { name: "भक्तपुर (Bhaktapur)", lat: 27.6710, lon: 85.4298, tz: 5.75 },
  { name: "विराटनगर (Biratnagar)", lat: 26.4525, lon: 87.2718, tz: 5.75 },
  { name: "वीरगञ्ज (Birgunj)", lat: 27.0128, lon: 84.8774, tz: 5.75 },
  { name: "धरान (Dharan)", lat: 26.8124, lon: 87.2834, tz: 5.75 },
  { name: "बुटवल (Butwal)", lat: 27.7006, lon: 83.4484, tz: 5.75 },
  { name: "नेपालगञ्ज (Nepalgunj)", lat: 28.0500, lon: 81.6167, tz: 5.75 },
  { name: "चितवन (Chitwan / Bharatpur)", lat: 27.6833, lon: 84.4333, tz: 5.75 },
  { name: "धनगढी (Dhangadhi)", lat: 28.6944, lon: 80.5978, tz: 5.75 },
  { name: "जनकपुर (Janakpur)", lat: 26.7288, lon: 85.9244, tz: 5.75 },
  { name: "नयाँ दिल्ली (New Delhi)", lat: 28.6139, lon: 77.2090, tz: 5.50 },
  { name: "लण्डन (London, UK)", lat: 51.5074, lon: -0.1278, tz: 0.00 },
  { name: "न्यूयोर्क (New York, USA)", lat: 40.7128, lon: -74.0060, tz: -5.00 },
];

export const KundaliForm: React.FC<KundaliFormProps> = ({ onSubmit, isLoading }) => {
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

  const handleCityChange = (cityName: string) => {
    const found = CITY_PRESETS.find(c => c.name === cityName);
    if (found) {
      setFormData(prev => ({
        ...prev,
        city_name: found.name,
        latitude: found.lat,
        longitude: found.lon,
        timezone_offset: found.tz
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-5">
        <h2 className="text-xl font-bold text-vedic-burgundy flex items-center gap-2">
          <span className="text-2xl">🕉️</span> जन्म विवरण इनपुट फारम (Birth Details)
        </h2>
        <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-semibold">
          Basistha System
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date of Birth */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-700 mb-1">
            जन्म मिति (Year - Month - Day)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="वर्ष"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
              required
            />
            <input
              type="number"
              placeholder="महिना"
              min="1"
              max="12"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
              value={formData.month}
              onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) || 1 })}
              required
            />
            <input
              type="number"
              placeholder="गते/दिन"
              min="1"
              max="31"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
              value={formData.day}
              onChange={e => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
        </div>

        {/* Time of Birth */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-700 mb-1">
            जन्म समय (Hour : Minute : Second)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="घण्टा (०-२३)"
              min="0"
              max="23"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
              value={formData.hour}
              onChange={e => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
              required
            />
            <input
              type="number"
              placeholder="मिनेट (०-५९)"
              min="0"
              max="59"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
              value={formData.minute}
              onChange={e => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
              required
            />
            <input
              type="number"
              placeholder="सेकेन्ड"
              min="0"
              max="59"
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
              value={formData.second}
              onChange={e => setFormData({ ...formData, second: parseFloat(e.target.value) || 0.0 })}
            />
          </div>
        </div>

        {/* City Preset */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-700 mb-1">
            जन्म स्थान (स्थान छान्नुहोस्)
          </label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-vedic-saffron focus:outline-none font-medium"
            value={formData.city_name}
            onChange={e => handleCityChange(e.target.value)}
          >
            {CITY_PRESETS.map(c => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Latitude */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-700 mb-1">
            अक्षांश (Latitude °N)
          </label>
          <input
            type="number"
            step="0.0001"
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
            value={formData.latitude}
            onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0.0 })}
            required
          />
        </div>

        {/* Longitude */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-700 mb-1">
            देशान्तर (Longitude °E)
          </label>
          <input
            type="number"
            step="0.0001"
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-vedic-saffron focus:outline-none"
            value={formData.longitude}
            onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0.0 })}
            required
          />
        </div>

        {/* Ayanamsha */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-700 mb-1">
            अयनांश पद्धति (Ayanamsha System)
          </label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-vedic-saffron focus:outline-none font-medium"
            value={formData.ayanamsha}
            onChange={e => setFormData({ ...formData, ayanamsha: e.target.value })}
          >
            <option value="LAHIRI">लाहिडी (Lahiri / Chitrapaksha) - मानक</option>
            <option value="RAMAN">रमण (B.V. Raman)</option>
            <option value="KP">कृष्णमूर्ति (KP Ayanamsha)</option>
            <option value="SAYANA">सायन (Sayana / Western Zero)</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-vedic-saffron to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 px-7 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              गणना हुँदैछ...
            </>
          ) : (
            <>
              <span>✨</span> कुण्डली गणना गर्नुहोस् (Calculate Kundali)
            </>
          )}
        </button>
      </div>
    </form>
  );
};
