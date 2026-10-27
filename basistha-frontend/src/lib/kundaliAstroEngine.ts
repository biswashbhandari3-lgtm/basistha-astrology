/**
 * Basistha High-Precision Vedic Astrological Calculation Engine
 * Implements Keplerian planetary mechanics, lunar perturbations, sidereal time,
 * dynamic Ayanamshas, Lagna (Ascendant), Bhavas, D9 Navamsha, and Vimshottari Dasha.
 */

import { BirthDetails, KundaliData, PlanetaryPosition, LagnaDetails, BhavaCusp, DashaData, DashaPeriod, PhalitData, BhavaInterpretation } from "@/types/astrology";

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

function norm360(deg: number): number {
  let v = deg % 360.0;
  if (v < 0) v += 360.0;
  return v;
}

export const RASHI_NAMES_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const RASHI_NAMES_NE = [
  "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

export const NAKSHATRA_NAMES_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const NAKSHATRA_NAMES_NE = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा",
  "पुनर्वसु", "पुष्य", "अश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी",
  "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा",
  "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती"
];

// Vimshottari Dasha Lords sequence and years
export const DASHA_LORDS = [
  { name: "Ketu", name_ne: "केतु", years: 7 },
  { name: "Venus", name_ne: "शुक्र", years: 20 },
  { name: "Sun", name_ne: "सूर्य", years: 6 },
  { name: "Moon", name_ne: "चन्द्र", years: 10 },
  { name: "Mars", name_ne: "मङ्गल", years: 7 },
  { name: "Rahu", name_ne: "राहु", years: 18 },
  { name: "Jupiter", name_ne: "बृहस्पति", years: 16 },
  { name: "Saturn", name_ne: "शनि", years: 19 },
  { name: "Mercury", name_ne: "बुध", years: 17 }
];

export function computeJulianDay(details: BirthDetails): { jd: number; T: number } {
  const { year, month, day, hour, minute, second = 0, timezone_offset } = details;
  const utHours = hour + minute / 60.0 + second / 3600.0 - timezone_offset;
  let d = day + utHours / 24.0;
  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  const T = (jd - 2451545.0) / 36525.0;

  return { jd, T };
}

export function computeAyanamsha(ayanamshaKey: string, T: number): { name: string; value: number } {
  const key = (ayanamshaKey || "LAHIRI").toUpperCase();
  let val = 0;
  let name = "लाहिडी (Lahiri)";

  switch (key) {
    case "RAMAN":
      val = 22.4605 + 1.3970 * T;
      name = "रमण (B.V. Raman)";
      break;
    case "KP":
      val = 23.8208 + 1.3963 * T;
      name = "कृष्णमूर्ति (KP Ayanamsha)";
      break;
    case "SURYASIDDHANTA":
      val = 20.8986 + 1.3855 * T;
      name = "सूर्य सिद्धान्त (Surya Siddhanta)";
      break;
    case "PUSHYA":
      val = 22.7230 + 1.3942 * T;
      name = "पुष्यपक्ष (Pushya Paksha)";
      break;
    case "FAGAN":
      val = 24.7300 + 1.3970 * T;
      name = "फागन-ब्र्याडली (Fagan-Bradley)";
      break;
    case "SAYANA":
      val = 0.0;
      name = "सायन (Sayana / 0° Tropical)";
      break;
    case "LAHIRI":
    default:
      val = 23.85709 + 1.39694 * T;
      name = "लाहिडी (Lahiri / Chitrapaksha)";
      break;
  }

  return { name, value: Math.round(val * 10000) / 10000 };
}

function solveKepler(M_deg: number, e: number): number {
  const M = norm360(M_deg) * DEG2RAD;
  let E = M;
  for (let i = 0; i < 15; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1.0 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

interface KeplerianPlanet {
  a0: number; aDot: number;
  e0: number; eDot: number;
  I0: number; IDot: number;
  L0: number; LDot: number;
  varpi0: number; varpiDot: number;
  Omega0: number; OmegaDot: number;
}

const PLANETARY_ELEMENTS: Record<string, KeplerianPlanet> = {
  mercury: {
    a0: 0.38709927, aDot: 0.00000037,
    e0: 0.20563593, eDot: 0.00002527,
    I0: 7.00497902, IDot: -0.00594749,
    L0: 252.25032350, LDot: 149472.67411175,
    varpi0: 77.45779628, varpiDot: 1.55647763,
    Omega0: 48.33076593, OmegaDot: -0.12534081
  },
  venus: {
    a0: 0.72333566, aDot: 0.00000390,
    e0: 0.00677672, eDot: -0.00004938,
    I0: 3.39467605, IDot: -0.00078890,
    L0: 181.97909950, LDot: 58517.81538729,
    varpi0: 131.60246718, varpiDot: 1.40222880,
    Omega0: 76.67984255, OmegaDot: -0.27769418
  },
  earth: {
    a0: 1.00000261, aDot: 0.00000562,
    e0: 0.01671123, eDot: -0.00004392,
    I0: -0.00001531, IDot: -0.01294668,
    L0: 100.46457166, LDot: 35999.37244981,
    varpi0: 102.93768193, varpiDot: 1.19877400,
    Omega0: 0.0, OmegaDot: 0.0
  },
  mars: {
    a0: 1.52371034, aDot: 0.00001847,
    e0: 0.09339410, eDot: 0.00007882,
    I0: 1.84969142, IDot: -0.00813131,
    L0: -4.55343205, LDot: 19140.30268499,
    varpi0: -23.94362959, varpiDot: 1.84104494,
    Omega0: 49.55953891, OmegaDot: -0.29257343
  },
  jupiter: {
    a0: 5.20288700, aDot: -0.00011607,
    e0: 0.04838624, eDot: -0.00013253,
    I0: 1.30439695, IDot: -0.00183714,
    L0: 34.39644051, LDot: 3034.74612898,
    varpi0: 14.72847983, varpiDot: 1.61996889,
    Omega0: 100.47390909, OmegaDot: 0.20469106
  },
  saturn: {
    a0: 9.53667594, aDot: -0.00125060,
    e0: 0.05386179, eDot: -0.00050991,
    I0: 2.48599187, IDot: 0.00193609,
    L0: 49.95424423, LDot: 1222.49362201,
    varpi0: 92.59887831, varpiDot: -0.41897216,
    Omega0: 113.66242448, OmegaDot: -0.28867794
  }
};

function getHeliocentricPos(planetKey: string, T: number): { x: number; y: number; z: number } {
  const el = PLANETARY_ELEMENTS[planetKey];
  const a = el.a0 + el.aDot * T;
  const e = el.e0 + el.eDot * T;
  const I = (el.I0 + el.IDot * T) * DEG2RAD;
  const L = el.L0 + el.LDot * T;
  const varpi = el.varpi0 + el.varpiDot * T;
  const Omega = (el.Omega0 + el.OmegaDot * T) * DEG2RAD;
  const omega = (varpi - (el.Omega0 + el.OmegaDot * T)) * DEG2RAD;

  const M = norm360(L - varpi);
  const E = solveKepler(M, e);

  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1.0 - e * e) * Math.sin(E);

  const x = (Math.cos(omega) * Math.cos(Omega) - Math.sin(omega) * Math.sin(Omega) * Math.cos(I)) * xPrime +
            (-Math.sin(omega) * Math.cos(Omega) - Math.cos(omega) * Math.sin(Omega) * Math.cos(I)) * yPrime;
  const y = (Math.cos(omega) * Math.sin(Omega) + Math.sin(omega) * Math.cos(Omega) * Math.cos(I)) * xPrime +
            (-Math.sin(omega) * Math.sin(Omega) + Math.cos(omega) * Math.cos(Omega) * Math.cos(I)) * yPrime;
  const z = (Math.sin(omega) * Math.sin(I)) * xPrime + (Math.cos(omega) * Math.sin(I)) * yPrime;

  return { x, y, z };
}

function getGeocentricLongitude(planetKey: string, T: number): number {
  const p = getHeliocentricPos(planetKey, T);
  const earth = getHeliocentricPos("earth", T);

  const X = p.x - earth.x;
  const Y = p.y - earth.y;
  let lon = Math.atan2(Y, X) * RAD2DEG;
  return norm360(lon);
}

function getTropicalSun(T: number): { lon: number; speed: number } {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const radM = M * DEG2RAD;

  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(radM) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * radM) +
            0.000289 * Math.sin(3 * radM);

  const lon = norm360(L0 + C);
  const speed = 0.9856 + 0.034 * Math.cos(radM);
  return { lon, speed };
}

function getTropicalMoon(T: number): { lon: number; speed: number } {
  const L_prime = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const D = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = norm360(357.5291092 + 35999.0502909 * T);
  const M_prime = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
  const F = norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T);

  const radD = D * DEG2RAD;
  const radM = M * DEG2RAD;
  const radMp = M_prime * DEG2RAD;
  const radF = F * DEG2RAD;

  const corr =
    6.288774 * Math.sin(radMp) +
    1.274027 * Math.sin(2 * radD - radMp) +
    0.658314 * Math.sin(2 * radD) +
    0.213618 * Math.sin(2 * radMp) -
    0.185116 * Math.sin(radM) -
    0.114332 * Math.sin(2 * radF) +
    0.058793 * Math.sin(2 * radD - 2 * radMp) +
    0.057066 * Math.sin(2 * radD - radM - radMp) +
    0.053322 * Math.sin(2 * radD + radMp) +
    0.045758 * Math.sin(2 * radD - radM) -
    0.040923 * Math.sin(radM - radMp) -
    0.034720 * Math.sin(radD) -
    0.030383 * Math.sin(radM + radMp) +
    0.015327 * Math.sin(2 * radD - 2 * radF);

  const lon = norm360(L_prime + corr);
  const speed = 13.17639 + 1.43 * Math.cos(radMp);
  return { lon, speed };
}

function getTropicalRahu(T: number): number {
  return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
}

function computeLagna(jd: number, T: number, lat: number, lon: number, ayanamshaVal: number): LagnaDetails {
  // Greenwich Mean Sidereal Time (GMST) in degrees
  const gmst = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0);
  // Local Sidereal Time / RAMC
  const ramc = norm360(gmst + lon);

  // Obliquity of ecliptic
  const eps = (23.4392911 - 0.0130042 * T) * DEG2RAD;
  const phi = lat * DEG2RAD;
  const ramcRad = ramc * DEG2RAD;

  // Tropical Ascendant
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
  const ascTrop = norm360(Math.atan2(y, x) * RAD2DEG);

  // Sidereal (Nirayana) Ascendant
  const ascSid = norm360(ascTrop - ayanamshaVal);

  const rashiId = Math.floor(ascSid / 30.0) + 1;
  const rashiDeg = ascSid % 30.0;
  const degree = Math.floor(rashiDeg);
  const minFull = (rashiDeg - degree) * 60.0;
  const minute = Math.floor(minFull);
  const second = Math.round((minFull - minute) * 60.0 * 10) / 10;

  const nakIndex = Math.floor(ascSid / (360.0 / 27.0));
  const nakTraversed = ascSid % (360.0 / 27.0);
  const nakPada = Math.floor(nakTraversed / (360.0 / 108.0)) + 1;

  return {
    longitude: Math.round(ascSid * 10000) / 10000,
    degree,
    minute,
    second,
    rashi_id: rashiId,
    rashi_name: RASHI_NAMES_EN[rashiId - 1],
    rashi_name_ne: RASHI_NAMES_NE[rashiId - 1],
    nakshatra_name: NAKSHATRA_NAMES_EN[nakIndex],
    nakshatra_name_ne: NAKSHATRA_NAMES_NE[nakIndex],
    nakshatra_pada: Math.min(Math.max(nakPada, 1), 4)
  };
}

export function computeKundali(details: BirthDetails): KundaliData {
  const { jd, T } = computeJulianDay(details);
  const { name: ayanamshaName, value: ayanamshaVal } = computeAyanamsha(details.ayanamsha, T);

  // 1. Lagna
  const lagna = computeLagna(jd, T, details.latitude, details.longitude, ayanamshaVal);

  // 2. Sun & Moon
  const sunTrop = getTropicalSun(T);
  const moonTrop = getTropicalMoon(T);

  const sunSid = norm360(sunTrop.lon - ayanamshaVal);
  const moonSid = norm360(moonTrop.lon - ayanamshaVal);

  // 3. Planets
  const dt = 0.05 / 36525.0; // 0.05 days
  const planetKeys = [
    { key: "mercury", id: 2, name: "Mercury", name_ne: "बुध", combustLimit: 14.0 },
    { key: "venus", id: 3, name: "Venus", name_ne: "शुक्र", combustLimit: 10.0 },
    { key: "mars", id: 4, name: "Mars", name_ne: "मङ्गल", combustLimit: 17.0 },
    { key: "jupiter", id: 5, name: "Jupiter", name_ne: "बृहस्पति", combustLimit: 11.0 },
    { key: "saturn", id: 6, name: "Saturn", name_ne: "शनि", combustLimit: 15.0 }
  ];

  const planets: PlanetaryPosition[] = [];

  // Add Sun
  {
    const rashiId = Math.floor(sunSid / 30.0) + 1;
    const rashiDeg = sunSid % 30.0;
    const deg = Math.floor(rashiDeg);
    const minFull = (rashiDeg - deg) * 60.0;
    const min = Math.floor(minFull);
    const sec = Math.round((minFull - min) * 60.0 * 10) / 10;
    const nakIdx = Math.floor(sunSid / (360.0 / 27.0));
    const pada = Math.floor((sunSid % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

    planets.push({
      planet_id: 0,
      name: "Sun",
      name_ne: "सूर्य",
      longitude: Math.round(sunSid * 10000) / 10000,
      degree: deg,
      minute: min,
      second: sec,
      rashi_id: rashiId,
      rashi_name: RASHI_NAMES_EN[rashiId - 1],
      rashi_name_ne: RASHI_NAMES_NE[rashiId - 1],
      nakshatra_id: nakIdx + 1,
      nakshatra_name: NAKSHATRA_NAMES_EN[nakIdx],
      nakshatra_name_ne: NAKSHATRA_NAMES_NE[nakIdx],
      nakshatra_pada: Math.min(Math.max(pada, 1), 4),
      speed: Math.round(sunTrop.speed * 1000) / 1000,
      is_retrograde: false,
      is_combust: false
    });
  }

  // Add Moon
  {
    const rashiId = Math.floor(moonSid / 30.0) + 1;
    const rashiDeg = moonSid % 30.0;
    const deg = Math.floor(rashiDeg);
    const minFull = (rashiDeg - deg) * 60.0;
    const min = Math.floor(minFull);
    const sec = Math.round((minFull - min) * 60.0 * 10) / 10;
    const nakIdx = Math.floor(moonSid / (360.0 / 27.0));
    const pada = Math.floor((moonSid % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

    let distSun = Math.abs(norm360(moonSid - sunSid));
    if (distSun > 180) distSun = 360 - distSun;

    planets.push({
      planet_id: 1,
      name: "Moon",
      name_ne: "चन्द्र",
      longitude: Math.round(moonSid * 10000) / 10000,
      degree: deg,
      minute: min,
      second: sec,
      rashi_id: rashiId,
      rashi_name: RASHI_NAMES_EN[rashiId - 1],
      rashi_name_ne: RASHI_NAMES_NE[rashiId - 1],
      nakshatra_id: nakIdx + 1,
      nakshatra_name: NAKSHATRA_NAMES_EN[nakIdx],
      nakshatra_name_ne: NAKSHATRA_NAMES_NE[nakIdx],
      nakshatra_pada: Math.min(Math.max(pada, 1), 4),
      speed: Math.round(moonTrop.speed * 1000) / 1000,
      is_retrograde: false,
      is_combust: distSun < 12.0
    });
  }

  // Add Mars, Mercury, Jupiter, Venus, Saturn
  for (const p of planetKeys) {
    const l1 = getGeocentricLongitude(p.key, T - dt);
    const l2 = getGeocentricLongitude(p.key, T + dt);
    let diff = l2 - l1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const speed = diff / 0.1; // deg per day
    const isRetro = speed < 0;

    const lonTrop = getGeocentricLongitude(p.key, T);
    const lonSid = norm360(lonTrop - ayanamshaVal);

    let distSun = Math.abs(norm360(lonSid - sunSid));
    if (distSun > 180) distSun = 360 - distSun;
    const isCombust = distSun < p.combustLimit;

    const rashiId = Math.floor(lonSid / 30.0) + 1;
    const rashiDeg = lonSid % 30.0;
    const deg = Math.floor(rashiDeg);
    const minFull = (rashiDeg - deg) * 60.0;
    const min = Math.floor(minFull);
    const sec = Math.round((minFull - min) * 60.0 * 10) / 10;
    const nakIdx = Math.floor(lonSid / (360.0 / 27.0));
    const pada = Math.floor((lonSid % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

    planets.push({
      planet_id: p.id,
      name: p.name,
      name_ne: p.name_ne,
      longitude: Math.round(lonSid * 10000) / 10000,
      degree: deg,
      minute: min,
      second: sec,
      rashi_id: rashiId,
      rashi_name: RASHI_NAMES_EN[rashiId - 1],
      rashi_name_ne: RASHI_NAMES_NE[rashiId - 1],
      nakshatra_id: nakIdx + 1,
      nakshatra_name: NAKSHATRA_NAMES_EN[nakIdx],
      nakshatra_name_ne: NAKSHATRA_NAMES_NE[nakIdx],
      nakshatra_pada: Math.min(Math.max(pada, 1), 4),
      speed: Math.round(speed * 1000) / 1000,
      is_retrograde: isRetro,
      is_combust: isCombust
    });
  }

  // Add Rahu & Ketu
  const rahuTrop = getTropicalRahu(T);
  const rahuSid = norm360(rahuTrop - ayanamshaVal);
  const ketuSid = norm360(rahuSid + 180.0);

  // Rahu
  {
    const rashiId = Math.floor(rahuSid / 30.0) + 1;
    const rashiDeg = rahuSid % 30.0;
    const deg = Math.floor(rashiDeg);
    const minFull = (rashiDeg - deg) * 60.0;
    const min = Math.floor(minFull);
    const sec = Math.round((minFull - min) * 60.0 * 10) / 10;
    const nakIdx = Math.floor(rahuSid / (360.0 / 27.0));
    const pada = Math.floor((rahuSid % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

    planets.push({
      planet_id: 10,
      name: "Rahu",
      name_ne: "राहु",
      longitude: Math.round(rahuSid * 10000) / 10000,
      degree: deg,
      minute: min,
      second: sec,
      rashi_id: rashiId,
      rashi_name: RASHI_NAMES_EN[rashiId - 1],
      rashi_name_ne: RASHI_NAMES_NE[rashiId - 1],
      nakshatra_id: nakIdx + 1,
      nakshatra_name: NAKSHATRA_NAMES_EN[nakIdx],
      nakshatra_name_ne: NAKSHATRA_NAMES_NE[nakIdx],
      nakshatra_pada: Math.min(Math.max(pada, 1), 4),
      speed: -0.053,
      is_retrograde: true,
      is_combust: false
    });
  }

  // Ketu
  {
    const rashiId = Math.floor(ketuSid / 30.0) + 1;
    const rashiDeg = ketuSid % 30.0;
    const deg = Math.floor(rashiDeg);
    const minFull = (rashiDeg - deg) * 60.0;
    const min = Math.floor(minFull);
    const sec = Math.round((minFull - min) * 60.0 * 10) / 10;
    const nakIdx = Math.floor(ketuSid / (360.0 / 27.0));
    const pada = Math.floor((ketuSid % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

    planets.push({
      planet_id: 11,
      name: "Ketu",
      name_ne: "केतु",
      longitude: Math.round(ketuSid * 10000) / 10000,
      degree: deg,
      minute: min,
      second: sec,
      rashi_id: rashiId,
      rashi_name: RASHI_NAMES_EN[rashiId - 1],
      rashi_name_ne: RASHI_NAMES_NE[rashiId - 1],
      nakshatra_id: nakIdx + 1,
      nakshatra_name: NAKSHATRA_NAMES_EN[nakIdx],
      nakshatra_name_ne: NAKSHATRA_NAMES_NE[nakIdx],
      nakshatra_pada: Math.min(Math.max(pada, 1), 4),
      speed: -0.053,
      is_retrograde: true,
      is_combust: false
    });
  }

  // 4. Bhavas (Equal House based on Lagna Cusp)
  const bhavas: BhavaCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const madhya = norm360(lagna.longitude + i * 30.0);
    const start = norm360(madhya - 15.0);
    const end = norm360(madhya + 15.0);
    const rId = Math.floor(madhya / 30.0) + 1;
    bhavas.push({
      bhava: i + 1,
      start_degree: Math.round(start * 100) / 100,
      madhya_degree: Math.round(madhya * 100) / 100,
      end_degree: Math.round(end * 100) / 100,
      rashi_id: rId,
      rashi_name_ne: RASHI_NAMES_NE[rId - 1]
    });
  }

  // 5. Divisional Charts (D9 Navamsha)
  const computeD9 = (lon: number): number => {
    // Navamsha Pada: total 108 padas in 360 deg, each 3°20' (3.333333°)
    const totalPadas = Math.floor(lon / (360.0 / 108.0));
    return (totalPadas % 12) + 1; // 1 to 12
  };

  const divisional_charts: Record<string, Record<string, number>> = {
    Lagna: { D9_Navamsha: computeD9(lagna.longitude) }
  };
  planets.forEach(p => {
    divisional_charts[p.name] = { D9_Navamsha: computeD9(p.longitude) };
  });

  return {
    engine_name: "Basistha Astronomical Engine (High-Precision Analytical)",
    julian_day: Math.round(jd * 1000) / 1000,
    ayanamsha_name: ayanamshaName,
    ayanamsha_value: ayanamshaVal,
    lagna,
    planets,
    bhavas,
    divisional_charts
  };
}

export function computeVimshottariDasha(moonLongitude: number, birthDate: Date): DashaData {
  // Nakshatra span: 13°20' = 13.333333°
  const nakSpan = 360.0 / 27.0;
  const nakIndex = Math.floor(moonLongitude / nakSpan);
  const traversedInNak = moonLongitude % nakSpan;
  const fractionRemaining = (nakSpan - traversedInNak) / nakSpan;

  // First lord determined by nakshatra (mod 9)
  const lordIndex = nakIndex % 9;
  const firstLord = DASHA_LORDS[lordIndex];
  const balanceYears = firstLord.years * fractionRemaining;

  const y = Math.floor(balanceYears);
  const m = Math.floor((balanceYears - y) * 12);
  const d = Math.floor(((balanceYears - y) * 12 - m) * 30);

  const dashaTree: DashaPeriod[] = [];
  let curDate = new Date(birthDate.getTime());

  // 1st Dasha (Balance)
  const endFirst = new Date(curDate.getTime() + balanceYears * 365.25 * 24 * 3600 * 1000);
  dashaTree.push({
    planet: firstLord.name,
    planet_ne: firstLord.name_ne,
    start_date: curDate.toISOString().split("T")[0],
    end_date: endFirst.toISOString().split("T")[0],
    duration_years: Math.round(balanceYears * 100) / 100
  });
  curDate = endFirst;

  // Next 8 Dashas
  for (let i = 1; i < 9; i++) {
    const nextLord = DASHA_LORDS[(lordIndex + i) % 9];
    const endDate = new Date(curDate.getTime() + nextLord.years * 365.25 * 24 * 3600 * 1000);
    dashaTree.push({
      planet: nextLord.name,
      planet_ne: nextLord.name_ne,
      start_date: curDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      duration_years: nextLord.years
    });
    curDate = endDate;
  }

  return {
    engine_name: "Basistha High-Precision Vimshottari Engine",
    dasha_system: "विंशोत्तरी महादशा (Vimshottari Dasha - 120 Years)",
    balance_of_dasha: {
      first_lord: firstLord.name,
      first_lord_ne: firstLord.name_ne,
      balance_years: Math.round(balanceYears * 100) / 100,
      balance_text: `${y} वर्ष ${m} महिना ${d} दिन`
    },
    dasha_tree: dashaTree
  };
}

const RASHI_LORD_NAMES_EN: Record<number, string> = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
  5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
  9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

const RASHI_LORD_NAMES_NE: Record<number, string> = {
  1: "मङ्गल", 2: "शुक्र", 3: "बुध", 4: "चन्द्र",
  5: "सूर्य", 6: "बुध", 7: "शुक्र", 8: "मङ्गल",
  9: "बृहस्पति (गुरु)", 10: "शनि", 11: "शनि", 12: "बृहस्पति (गुरु)"
};

const BHAVA_NAMES_NE_LIST: Record<number, string> = {
  1: "प्रथम भाव (तनु / लग्न - देह, रूप, स्वभाव र स्वास्थ्य)",
  2: "द्वितीय भाव (धन / कुटुम्ब - सम्पत्ति, वाणी र परिवार)",
  3: "तृतीय भाव (सहज / पराक्रम - भ्रातृ, हिम्मत र पुरुषार्थ)",
  4: "चतुर्थ भाव (सुख / बन्धु - माता, गृह, भूमि र वाहन)",
  5: "पञ्चम भाव (पुत्र / बुद्धि - सन्तान, विद्या, मन्त्र र विवेक)",
  6: "षष्ठ भाव (रिपु / रोग - शत्रु, ऋण, रोग र प्रतिस्पर्धा)",
  7: "सप्तम भाव (कलत्र / जाया - जीवनसाथी, विवाह र साझेदारी)",
  8: "अष्टम भाव (आयु / रन्ध्र - दीर्घायु, गुप्त ज्ञान र संकट)",
  9: "नवम भाव (धर्म / भाग्य - पिता, गुरु, तीर्थ र भाग्योदय)",
  10: "दशम भाव (कर्म / राज्य - पेसा, प्रतिष्ठा, नेतृत्व र अधिकार)",
  11: "एकादश भाव (आय / लाभ - उन्नति, समृद्धि र अभीष्ट सिद्धि)",
  12: "द्वादश भाव (व्यय / मोक्ष - दान, वैदेशिक यात्रा र मुक्ति)"
};

export function generateClientPhalitFallback(details: BirthDetails): PhalitData {
  const kundali = computeKundali(details);
  const lagnaRashi = kundali.lagna.rashi_id;

  const planetsInHouse: Record<number, PlanetaryPosition[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    7: [], 8: [], 9: [], 10: [], 11: [], 12: []
  };

  const planetHouseMap: Record<string, number> = {};

  kundali.planets.forEach(p => {
    const h = ((p.rashi_id - lagnaRashi + 12) % 12) + 1;
    planetsInHouse[h].push(p);
    planetHouseMap[p.name] = h;
  });

  const bhavaAnalysis: BhavaInterpretation[] = [];

  for (let b = 1; b <= 12; b++) {
    const rashiNum = ((lagnaRashi - 1 + (b - 1)) % 12) + 1;
    const lordName = RASHI_LORD_NAMES_EN[rashiNum];
    const lordNameNe = RASHI_LORD_NAMES_NE[rashiNum];
    const lordHouse = planetHouseMap[lordName] || 1;

    const occupants = planetsInHouse[b].map(p => ({
      bhava: b,
      bhava_name_ne: BHAVA_NAMES_NE_LIST[b],
      planet: p.name,
      planet_ne: p.name_ne,
      mansagari_sloka: `${p.name_ne} ग्रह ${b} भावमा अवस्थित रहँदा स्वभाव, कर्म तथा जीवनशैलीमा विशिष्ट शास्त्रीय फल प्रभाव रहनेछ।`,
      classical_interpretations: [
        {
          author_id: 1,
          author_name_ne: "महर्षि पराशर (बृहत्पाराशर होराशास्त्रम्)",
          sloka: `${p.name_ne} ${b} भावमा रहँदा जातकलाई सम्बन्धित भावको कारकत्व र राशिको बल अनुसार शुभ-अशुभ फल प्राप्त हुन्छ।`
        }
      ]
    }));

    bhavaAnalysis.push({
      bhava: b,
      bhava_name_ne: BHAVA_NAMES_NE_LIST[b],
      rashi_number: rashiNum,
      lord_planet: lordName,
      lord_planet_ne: lordNameNe,
      lord_placed_in_bhava: lordHouse,
      bhavesh_interpretation: {
        bhavesh: b,
        bhavesh_name_ne: `${b} भावको अधिपति (${lordNameNe})`,
        in_bhava: lordHouse,
        in_bhava_name_ne: `${lordHouse} भाव`,
        parashar_sloka: `महर्षि पराशर अनुसार ${b} भावका स्वामी ${lordNameNe} कुण्डलीको ${lordHouse} भावमा अवस्थित रहँदा सोही अनुसार जीवनमा सुख, ऐश्वर्य तथा कर्मफल प्राप्ति हुनेछ।`
      },
      planets_present: occupants
    });
  }

  return {
    engine_name: "Basistha High-Precision Phalit Engine",
    lagna_rashi: lagnaRashi,
    bhava_analysis: bhavaAnalysis,
    dasha_interpretation: {
      mahadasha: "विंशोत्तरी दशा",
      mahadasha_ne: "विंशोत्तरी दशा",
      mahadasha_sloka: "दशाफल अनुसार जातकको वर्तमान जीवनमा सम्बन्धित ग्रहको प्रकृति, राशीश र भावस्थितिको प्रभाव रहनेछ।"
    }
  };
}
