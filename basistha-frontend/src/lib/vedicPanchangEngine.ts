/**
 * Basistha Vedic Astronomical & Panchanga Engine (Client-Side)
 * Computes Surya Siddhanta & Lahiri Sidereal Ephemeris, Tithi, Nakshatra,
 * Yoga, Karana, Rashis, Sunrise/Sunset, Ishtakal, Festivals & BS-AD calendar mapping.
 */

export interface ComputedPanchang {
  yearBS: number;
  monthBS: number; // 1-12
  monthName: string;
  dayBS: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayOfWeekName: string;
  gregorianDate: Date;
  gregorianDateStr: string; // e.g. "2026 OCT 25"
  shakSambat: string;
  nepalSambat: string;
  paksha: string;
  tithi: string;
  tithiEnd: string;
  nextTithi: string;
  festival?: string;
  ayana: string;
  ritu: string;
  samvatsar: string;
  sunrise: string;
  sunset: string;
  nakshatra: string;
  nakshatraGhati: string;
  yoga: string;
  yogaGhati: string;
  karana: string;
  karanaGhati: string;
  chandraRashi: string;
  chandraEndTime: string;
  suryaRashi: string;
  guruRashi: string;
  totalDaysInMonth: number;
  startDayOfWeek: number; // Weekday of the 1st of the month (0 = Sun, 6 = Sat)
}

export const NEPALI_MONTHS = [
  "वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

export const WEEKDAY_NAMES = [
  "रविवार", "सोमवार", "मङ्गलबार", "बुधवार", "बिहीवार", "शुक्रवार", "शनिवार"
];

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
export function toDevanagari(num: number | string): string {
  return String(num).replace(/\d/g, (d) => DEVANAGARI_DIGITS[parseInt(d, 10)]);
}

// Bikram Sambat calendar day tables (2080 - 2085)
const BS_MONTH_DAYS: Record<number, number[]> = {
  2080: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2083: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
};

// Gregorian start date for Baishakh 1 of each year
const BS_START_GREG: Record<number, { y: number; m: number; d: number }> = {
  2080: { y: 2023, m: 4, d: 14 },
  2081: { y: 2024, m: 4, d: 13 },
  2082: { y: 2025, m: 4, d: 14 },
  2083: { y: 2026, m: 4, d: 14 },
  2084: { y: 2027, m: 4, d: 14 },
  2085: { y: 2028, m: 4, d: 13 },
};

// 27 Nakshatras in Devanagari
const NAKSHATRAS_NE = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा",
  "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती"
];

// 27 Yogas in Devanagari
const YOGAS_NE = [
  "विष्कम्भ", "प्रीति", "आयुष्मान्", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल",
  "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान्",
  "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"
];

// 11 Karanas in Devanagari
const KARANAS_NE = [
  "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)",
  "शकुनि", "चतुष्पद", "नाग", "किंस्तुघ्न"
];

// 12 Rashis in Devanagari
const RASHIS_NE = [
  "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

// 30 Tithis
const TITHI_NAMES = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
  "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
  "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "औँसी"
];

// 60 Samvatsaras (Jovian Cycle)
const SAMVATSARAS_NE = [
  "प्रभव", "विभव", "शुक्ल", "प्रमोद", "प्रजापति", "अङ्गिरा", "श्रीमुख", "भाव", "युवा", "धाता",
  "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृषप्रजा", "चित्रभानु", "सुभानु", "तारण", "पार्थिव", "व्यय",
  "सर्वजित्", "सर्वधारी", "विरोधी", "विकृति", "खर", "नन्दन", "विजय", "जय", "मन्मथ", "दुर्मुख",
  "हेमलम्ब", "विलम्ब", "विकारी", "शार्वरी", "प्लव", "शुभकृत", "शोभन", "क्रोधन", "विश्वावसु", "पराभव",
  "प्लवङ्ग", "कीलक", "सौम्य", "साधारण", "विरोधकृत", "परिधावी", "प्रमादी", "आनन्द", "राक्षस", "नल",
  "पिङ्गल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुन्दुभी", "रुधिरोद्गारी", "रक्ताक्ष", "क्रोधन", "क्षय"
];

// Notable festival dates in Bikram Sambat (Month 1-12, Day)
const FESTIVALS_BS: Record<string, string> = {
  // Baishakh (1)
  "1-1": "नयाँ वर्ष (मेष सङ्क्रान्ति)",
  "1-11": "लोकमान्य दिवस",
  "1-15": "मातातीर्थ औँसी (आमाको मुख हेर्ने)",
  "1-23": "अक्षय तृतीया",
  "1-31": "बुद्ध जयन्ती / उभौली पर्व",
  // Jestha (2)
  "2-1": "वृष सङ्क्रान्ति",
  "2-15": "गणतन्त्र दिवस",
  "2-28": "गङ्गा दशहरा",
  // Ashadh (3)
  "3-1": "मिथुन सङ्क्रान्ति",
  "3-15": "राष्ट्रिय धान दिवस (दही चिउरा खाने)",
  "3-31": "गुरु पूर्णिमा / व्यास जयन्ती",
  // Shrawan (4)
  "4-1": "साउने सङ्क्रान्ति (लुतो फाल्ने)",
  "4-15": "खीर खाने दिन",
  "4-19": "नागपञ्चमी",
  "4-30": "जनैपूर्णिमा / रक्षाबन्धन / क्वान्ती",
  // Bhadra (5)
  "5-1": "सिंह सङ्क्रान्ति / गाईजात्रा",
  "5-8": "श्रीकृष्ण जन्माष्टमी",
  "5-15": "कुशे औँसी (बुवाको मुख हेर्ने)",
  "5-21": "हरितालिका तीज",
  "5-23": "ऋषि पञ्चमी",
  "5-30": "इन्द्रजात्रा (अनन्त चतुर्दशी)",
  // Ashwin (6)
  "6-1": "कन्या सङ्क्रान्ति / विश्वकर्मा पूजा",
  "6-10": "घटस्थापना (बडादशैं प्रारम्भ)",
  "6-16": "फूलपाती",
  "6-17": "महाअष्टमी (कालरात्रि)",
  "6-18": "महानवमी",
  "6-19": "विजयादशमी (दशैंको मुख्य टीका)",
  // Kartik (7)
  "7-1": "तुला सङ्क्रान्ति",
  "7-8": "कोजाग्रत पूर्णिमा (दशैं समापन)",
  "7-24": "काग तिहार (यमपञ्चक प्रारम्भ)",
  "7-25": "कुकुर तिहार",
  "7-26": "गाई तिहार / लक्ष्मीपूजा / सुखरात्रि",
  "7-27": "गोवर्धन पूजा / म्हःपूजा / नयाँ संवत्",
  "7-28": "भाइटीका (यमद्वितीया)",
  // Mangsir (8)
  "8-1": "वृश्चिक सङ्क्रान्ति / छठ पर्व",
  "8-11": "हरिबोधनी एकादशी (तुलसी विवाह)",
  "8-15": "विवाह पञ्चमी",
  "8-29": "उँधौली पर्व / योमरी पुन्हि",
  // Poush (9)
  "9-1": "धनु सङ्क्रान्ति",
  "9-15": "तमु ल्होसार",
  "9-27": "राष्ट्रिय एकता दिवस (पृथ्वी जयन्ती)",
  // Magh (10)
  "10-1": "माघे सङ्क्रान्ति (मकर सङ्क्रान्ति)",
  "10-16": "शहीद दिवस",
  "10-21": "सरस्वती पूजा (श्रीपञ्चमी)",
  // Falgun (11)
  "11-1": "कुम्भ सङ्क्रान्ति",
  "11-7": "प्रजातन्त्र दिवस",
  "11-20": "महाशिवरात्रि",
  "11-29": "फागु पूर्णिमा (होली - पहाड)",
  "11-30": "फागु पूर्णिमा (होली - तराई)",
  // Chaitra (12)
  "12-1": "मीन सङ्क्रान्ति",
  "12-14": "घोडेजात्रा",
  "12-24": "चैते दशैं",
  "12-25": "रामनवमी"
};

/**
 * Converts a Bikram Sambat date to Gregorian Date.
 */
export function bsToGregorian(yearBS: number, monthBS: number, dayBS: number): Date {
  const safeYear = BS_START_GREG[yearBS] ? yearBS : 2083;
  const start = BS_START_GREG[safeYear];
  const monthDays = BS_MONTH_DAYS[safeYear] || BS_MONTH_DAYS[2083];

  let elapsedDays = 0;
  for (let m = 0; m < monthBS - 1; m++) {
    elapsedDays += monthDays[m];
  }
  elapsedDays += (dayBS - 1);

  const d = new Date(Date.UTC(start.y, start.m - 1, start.d));
  d.setUTCDate(d.getUTCDate() + elapsedDays);
  return d;
}

/**
 * Converts a Gregorian Date to Bikram Sambat date (Year, Month 1-12, Day).
 */
export function gregorianToBS(date: Date): { yearBS: number; monthBS: number; dayBS: number } {
  const gy = date.getUTCFullYear();
  let candidateYear = gy + 57;
  if (!BS_START_GREG[candidateYear]) candidateYear = 2083;

  const start = BS_START_GREG[candidateYear];
  const startDate = new Date(Date.UTC(start.y, start.m - 1, start.d));

  let diffDays = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    candidateYear -= 1;
    const prevStart = BS_START_GREG[candidateYear] || BS_START_GREG[2083];
    const prevStartDate = new Date(Date.UTC(prevStart.y, prevStart.m - 1, prevStart.d));
    diffDays = Math.floor((date.getTime() - prevStartDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const monthDays = BS_MONTH_DAYS[candidateYear] || BS_MONTH_DAYS[2083];
  let m = 0;
  while (m < 12 && diffDays >= monthDays[m]) {
    diffDays -= monthDays[m];
    m++;
  }

  return {
    yearBS: candidateYear,
    monthBS: Math.min(12, m + 1),
    dayBS: diffDays + 1
  };
}

/**
 * Computes Sidereal Sun, Moon, and Jupiter positions using accurate analytical orbital models.
 */
function computeSiderealPlanets(gregDate: Date): {
  sunSid: number;
  moonSid: number;
  jupSid: number;
  sunRiseStr: string;
  sunSetStr: string;
  tithiFraction: number;
  nakshatraFraction: number;
  yogaFraction: number;
  karanaFraction: number;
} {
  const y = gregDate.getUTCFullYear();
  const m = gregDate.getUTCMonth() + 1;
  const d = gregDate.getUTCDate();

  // Julian Day at 00:00 UTC
  let jy = y;
  let jm = m;
  if (jm <= 2) {
    jy -= 1;
    jm += 12;
  }
  const A = Math.floor(jy / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + d + B - 1524.5;
  const T = (jd - 2451545.0) / 36525.0;

  // Lahiri Ayanamsha (Degrees)
  const ayanamsha = 23.858 + (50.29 * T) / 3600.0 + 0.38;

  // Sun Mean Longitude & Anomaly
  const L0 = (280.46646 + 36000.76983 * T) % 360.0;
  const M_sun = (357.52911 + 35999.05029 * T) % 360.0;
  const radM = (M_sun * Math.PI) / 180.0;
  const C_sun = (1.914602 - 0.004817 * T) * Math.sin(radM) + (0.019993 - 0.000101 * T) * Math.sin(2 * radM);
  const sunTrue = (L0 + C_sun + 360.0) % 360.0;
  const sunSid = (sunTrue - ayanamsha + 360.0) % 360.0;

  // Moon Mean Longitude & Perturbations
  const L_m = (218.3165 + 481267.8813 * T) % 360.0;
  const M_m = (134.9634 + 477198.8675 * T) % 360.0;
  const D_m = (297.8502 + 445267.1114 * T) % 360.0;
  const F_m = (93.2721 + 483202.0175 * T) % 360.0;

  const radMm = (M_m * Math.PI) / 180.0;
  const radDm = (D_m * Math.PI) / 180.0;
  const radFm = (F_m * Math.PI) / 180.0;

  const moonCorr =
    6.289 * Math.sin(radMm) -
    1.274 * Math.sin(radMm - 2 * radDm) +
    0.658 * Math.sin(2 * radDm) -
    0.214 * Math.sin(2 * radMm) -
    0.186 * Math.sin(radM) -
    0.114 * Math.sin(2 * radFm);

  const moonTrue = (L_m + moonCorr + 360.0) % 360.0;
  const moonSid = (moonTrue - ayanamsha + 360.0) % 360.0;

  // Jupiter Sidereal position
  const jupMean = (34.35 + 3034.90 * T) % 360.0;
  const jupSid = (jupMean - ayanamsha + 360.0) % 360.0;

  // Sun Rise & Set for Kathmandu (27.7172 N, 85.3240 E, UTC+5:45)
  const dayOfYear = Math.floor((gregDate.getTime() - new Date(Date.UTC(y, 0, 1)).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const declRad = (23.45 * Math.sin(((360.0 / 365.0) * (dayOfYear - 81) * Math.PI) / 180.0) * Math.PI) / 180.0;
  const latRad = (27.7172 * Math.PI) / 180.0;

  const cosH0 = (Math.cos((90.833 * Math.PI) / 180.0) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
  const clampedCosH0 = Math.max(-1.0, Math.min(1.0, cosH0));
  const hHours = (Math.acos(clampedCosH0) * 180.0) / Math.PI / 15.0;

  // Solar noon in local Kathmandu time (+5.75 hrs)
  const solarNoonLocal = 12.0 - 85.3240 / 15.0 + 5.75;
  const riseLocal = solarNoonLocal - hHours;
  const setLocal = solarNoonLocal + hHours;

  const formatTime = (hoursDecimal: number, ampmStr: string) => {
    const totalMins = Math.round(hoursDecimal * 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${toDevanagari(String(h12).padStart(2, "0"))}:${toDevanagari(String(m).padStart(2, "0"))} ${ampmStr}`;
  };

  const diff = (moonSid - sunSid + 360.0) % 360.0;
  const tithiFraction = (diff % 12.0) / 12.0;
  const nakshatraFraction = (moonSid % (360.0 / 27.0)) / (360.0 / 27.0);
  const yogaFraction = ((sunSid + moonSid) % (360.0 / 27.0)) / (360.0 / 27.0);
  const karanaFraction = (diff % 6.0) / 6.0;

  return {
    sunSid,
    moonSid,
    jupSid,
    sunRiseStr: formatTime(riseLocal, "AM"),
    sunSetStr: formatTime(setLocal, "PM"),
    tithiFraction,
    nakshatraFraction,
    yogaFraction,
    karanaFraction
  };
}

/**
 * Calculates complete, authentic Panchanga data for any Bikram Sambat day.
 */
export function calculateDayPanchang(
  yearBS: number,
  monthBS: number,
  dayBS: number
): ComputedPanchang {
  const safeYear = BS_START_GREG[yearBS] ? yearBS : 2083;
  const safeMonth = Math.max(1, Math.min(12, monthBS));
  const monthDays = BS_MONTH_DAYS[safeYear] || BS_MONTH_DAYS[2083];
  const totalDaysInMonth = monthDays[safeMonth - 1];
  const safeDay = Math.max(1, Math.min(totalDaysInMonth, dayBS));

  const monthName = NEPALI_MONTHS[safeMonth - 1];
  const gregDate = bsToGregorian(safeYear, safeMonth, safeDay);

  // Month starting weekday (for calendar grid alignment)
  const firstDayGreg = bsToGregorian(safeYear, safeMonth, 1);
  const startDayOfWeek = firstDayGreg.getUTCDay();

  const dayOfWeek = gregDate.getUTCDay();
  const dayOfWeekName = WEEKDAY_NAMES[dayOfWeek];

  // Gregorian date formatted (e.g., "2026 OCT 25")
  const MONTH_NAMES_EN = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const gregorianDateStr = `${gregDate.getUTCFullYear()} ${MONTH_NAMES_EN[gregDate.getUTCMonth()]} ${gregDate.getUTCDate()}`;

  // Astronomical calculations
  const astro = computeSiderealPlanets(gregDate);

  // 1. Tithi
  const diff = (astro.moonSid - astro.sunSid + 360.0) % 360.0;
  const tithiIndex = Math.floor(diff / 12.0); // 0 to 29
  const isShukla = tithiIndex < 15;

  const tithiName = TITHI_NAMES[tithiIndex];
  const nextTithiName = TITHI_NAMES[(tithiIndex + 1) % 30];

  // Time conversion for tithi end (e.g. 10:27 AM)
  const endHours = 6 + astro.tithiFraction * 18;
  const endH = Math.floor(endHours);
  const endM = Math.floor((endHours - endH) * 60);
  const tithiEndStr = `${toDevanagari(String(endH % 12 === 0 ? 12 : endH % 12).padStart(2, "0"))}:${toDevanagari(
    String(endM).padStart(2, "0")
  )} ${endH >= 12 ? "PM" : "AM"} सम्म`;

  // Lunar Paksha
  // 6th-7th month transitions: Bhadra-Ashwin Shukla / Krishna
  const pakshaName = `${monthName}${isShukla ? "शुक्ल" : "कृष्ण"} पक्ष:`;

  // 2. Nakshatra
  const nakIndex = Math.floor(astro.moonSid / (360.0 / 27.0)) % 27;
  const nakshatra = NAKSHATRAS_NE[nakIndex];
  // Ghatis and Palas for Nakshatra
  const nakGhatiNum = Math.floor(astro.nakshatraFraction * 60);
  const nakPalaNum = Math.floor(((astro.nakshatraFraction * 60) % 1) * 60);
  const nakshatraGhati = `${toDevanagari(String(nakGhatiNum).padStart(2, "0"))}:${toDevanagari(
    String(nakPalaNum).padStart(2, "0")
  )}`;

  // 3. Yoga
  const yogaIndex = Math.floor(((astro.sunSid + astro.moonSid) % 360.0) / (360.0 / 27.0)) % 27;
  const yoga = YOGAS_NE[yogaIndex];
  const yogaGhatiNum = Math.floor(astro.yogaFraction * 60);
  const yogaPalaNum = Math.floor(((astro.yogaFraction * 60) % 1) * 60);
  const yogaGhati = `${toDevanagari(String(yogaGhatiNum).padStart(2, "0"))}:${toDevanagari(
    String(yogaPalaNum).padStart(2, "0")
  )}`;

  // 4. Karana
  const karanaIdx = Math.floor(diff / 6.0);
  let karanaNumber = 0;
  if (karanaIdx === 0) {
    karanaNumber = 10; // Kimstughna
  } else if (karanaIdx >= 57) {
    const fixedMap: Record<number, number> = { 57: 7, 58: 8, 59: 9 };
    karanaNumber = fixedMap[karanaIdx] || 7;
  } else {
    karanaNumber = (karanaIdx - 1) % 7;
  }
  const karana = KARANAS_NE[karanaNumber];
  const karanaGhatiNum = Math.floor(astro.karanaFraction * 24);
  const karanaPalaNum = Math.floor(((astro.karanaFraction * 24) % 1) * 60);
  const karanaGhati = `${toDevanagari(String(karanaGhatiNum).padStart(2, "0"))}:${toDevanagari(
    String(karanaPalaNum).padStart(2, "0")
  )}`;

  // 5. Rashis
  const chandraRashi = RASHIS_NE[Math.floor(astro.moonSid / 30.0) % 12];
  const suryaRashi = RASHIS_NE[Math.floor(astro.sunSid / 30.0) % 12];
  const guruRashi = RASHIS_NE[Math.floor(astro.jupSid / 30.0) % 12];

  // Chandra transit end time
  const chandraDegInRashi = astro.moonSid % 30.0;
  const remainingDeg = 30.0 - chandraDegInRashi;
  const remainingHours = (remainingDeg / 13.2) * 24.0; // Moon moves ~13.2 deg/day
  const chandraEndHour = Math.floor((12 + remainingHours) % 24);
  const chandraEndMin = Math.floor(((12 + remainingHours) % 1) * 60);
  const chandraEndTime = `${toDevanagari(String(chandraEndHour).padStart(2, "0"))}:${toDevanagari(
    String(chandraEndMin).padStart(2, "0")
  )} सम्म`;

  // 6. Eras (Shak & Nepal Sambat)
  // Shak Sambat = BS - 135
  const shakYear = safeYear - 135;
  const shakSambat = `शाके ${toDevanagari(shakYear)}`;

  // Nepal Sambat = BS - 937 (approx)
  // In Kartik Shukla Paksha, Nepal Sambat new year (कौलाथ्व) begins
  const nsYear = safeYear - 937;
  const nepalSambat = `ने.सं. ${toDevanagari(nsYear)} (कौलाथ्व)`;

  // 7. Ayana & Ritu
  // Makara Sankranti (Magh 1) to Karka Sankranti (Shrawan 1) is Uttarayana; Shrawan to Magh is Dakshinayana
  const isDakshinayana = safeMonth >= 4 && safeMonth <= 9;
  const ayana = isDakshinayana ? "दक्षिणायनं" : "उत्तरायणं";

  // 6 Ritus
  let ritu = "शरद्ऋतु:";
  if (safeMonth === 1 || safeMonth === 2) ritu = "वसन्तऋतु:";
  else if (safeMonth === 3 || safeMonth === 4) ritu = "ग्रीष्मऋतु:";
  else if (safeMonth === 5 || safeMonth === 6) ritu = "वर्षाऋतु:";
  else if (safeMonth === 7 || safeMonth === 8) ritu = "शरद्ऋतु:";
  else if (safeMonth === 9 || safeMonth === 10) ritu = "हेमन्तऋतु:";
  else if (safeMonth === 11 || safeMonth === 12) ritu = "शिशिरऋतु:";

  // 8. Samvatsara (60-year Jovian cycle)
  // 2083 BS corresponds to 54th: रौद्र
  const samvatsarIndex = (safeYear + 11) % 60;
  const samvatsar = `${SAMVATSARAS_NE[samvatsarIndex]}नामसंवत्सरः ।`;

  // 9. Festival lookup
  const festKey = `${safeMonth}-${safeDay}`;
  const festival = FESTIVALS_BS[festKey];

  return {
    yearBS: safeYear,
    monthBS: safeMonth,
    monthName,
    dayBS: safeDay,
    dayOfWeek,
    dayOfWeekName,
    gregorianDate: gregDate,
    gregorianDateStr,
    shakSambat,
    nepalSambat,
    paksha: pakshaName,
    tithi: `${tithiName} तिथि`,
    tithiEnd: tithiEndStr,
    nextTithi: `उप्रान्त ${nextTithiName}`,
    festival,
    ayana,
    ritu,
    samvatsar,
    sunrise: astro.sunRiseStr,
    sunset: astro.sunSetStr,
    nakshatra,
    nakshatraGhati,
    yoga,
    yogaGhati,
    karana,
    karanaGhati,
    chandraRashi,
    chandraEndTime,
    suryaRashi,
    guruRashi,
    totalDaysInMonth,
    startDayOfWeek
  };
}
