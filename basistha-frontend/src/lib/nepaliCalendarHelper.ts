/**
 * Nepali Bikram Sambat (BS) to Gregorian (AD) Date & Time Engine
 * Includes Gotra-Thar mapping, coordinate formatting, and calendar conversion.
 */

export const NEPALI_MONTHS_NAMES = [
  "१. वैशाख", "२. जेठ", "३. असार", "४. साउन", "५. भदौ", "६. असोज",
  "७. कार्तिक", "८. मंसिर", "९. पुस", "१०. माघ", "११. फागुन", "१२. चैत"
];

// Comprehensive Nepali Surname to Gotra Mapping
export const THAR_GOTRA_MAP: Record<string, string> = {
  // कश्यप
  "घिमिरे": "कश्यप",
  "अधिकारी": "कश्यप",
  "भण्डारी": "कश्यप",
  "श्रेष्ठ": "कश्यप",
  "शाह": "कश्यप",
  "शाही": "कश्यप",
  "मल्ल": "कश्यप",
  "सिंह": "कश्यप",
  "रावल": "कश्यप",
  "बोहरा": "कश्यप",
  "बोहोरा": "कश्यप",
  "सिलवाल": "कश्यप",
  "बज्राचार्य": "कश्यप",
  "मानन्धर": "कश्यप",
  "तामाङ": "कश्यप",
  "गुरुङ": "कश्यप",
  "मगर": "कश्यप",
  "राई": "कश्यप",
  "लिम्बु": "कश्यप",
  "कुँवर": "कश्यप",
  "गोतामे": "कश्यप",
  "बोगटी": "कश्यप",
  "मिश्र": "कश्यप",
  "झा": "कश्यप",
  "यादव": "कश्यप",
  "चौधरी": "कश्यप",

  // आत्रेय
  "पोखरेल": "आत्रेय",
  "पौडेल": "आत्रेय",
  "सिग्देल": "आत्रेय",
  "अर्याल": "आत्रेय",
  "दवाडी": "आत्रेय",
  "पानीपोखरेल": "आत्रेय",
  "दुवाडी": "आत्रेय",

  // भारद्वाज
  "सुवेदी": "भारद्वाज",
  "उप्रेती": "भारद्वाज",
  "बास्तोला": "भारद्वाज",
  "पन्त": "भारद्वाज",
  "रेग्मी": "भारद्वाज",
  "ज्ञवाली": "भारद्वाज",
  "पाठक": "भारद्वाज",
  "पराजुली": "भारद्वाज",
  "भुसाल": "भारद्वाज",
  "भट्ट": "भारद्वाज",
  "पन्थी": "भारद्वाज",
  "कँडेल": "भारद्वाज",
  "कडेल": "भारद्वाज",
  "सेढाईं": "भारद्वाज",
  "विष्ट": "भारद्वाज",
  "शर्मा": "भारद्वाज",
  "निरौला": "भारद्वाज",
  "लोहनी": "भारद्वाज",
  "जोशी": "भारद्वाज",
  "बस्नेत": "भारद्वाज",
  "खड्का": "भारद्वाज",
  "पाण्डे": "भारद्वाज",
  "पाण्डेय": "भारद्वाज",

  // कौडिन्य
  "आचार्य": "कौडिन्य",
  "रिजाल": "कौडिन्य",
  "सापकोटा": "कौडिन्य",
  "प्याकुरेल": "कौडिन्य",
  "मरासिनी": "कौडिन्य",
  "गौतम": "कौडिन्य",

  // गर्ग
  "भट्टराई": "गर्ग",
  "लम्साल": "गर्ग",
  "चुँडाल": "गर्ग",
  "गर्तौला": "गर्ग",
  "गजुरेल": "गर्ग",

  // उपमन्यु
  "ढकाल": "उपमन्यु",
  "चापागाईं": "उपमन्यु",
  "वाग्ले": "उपमन्यु",
  "मैनाली": "उपमन्यु",
  "दुलाल": "उपमन्यु",
  "बस्ताकोटी": "उपमन्यु",

  // वत्स
  "दाहाल": "वत्स",
  "बराल": "वत्स",
  "कुइँकेल": "वत्स",
  "रुपाखेती": "वत्स",
  "राणा": "वत्स",

  // मौद्गल्य
  "तिमिल्सिना": "मौद्गल्य",
  "तिम्सिना": "मौद्गल्य",
  "कोइराला": "मौद्गल्य",
  "मुडभरी": "मौद्गल्य",
  "सिमखडा": "मौद्गल्य",

  // घृतकौशिक / कौशिश
  "खनाल": "घृतकौशिक",
  "कुशवाहा": "कौशिश",
  "फुँयाल": "कौशिश",
  "थापा": "कौशिश",
  "कार्की": "कौशिश",

  // पराशर
  "मरहट्टा": "पराशर",
  "कट्टेल": "पराशर",

  // शाण्डिल्य
  "काफ्ले": "शाण्डिल्य",
  "प्रसाईं": "शाण्डिल्य",

  // वशिष्ठ
  "खराल": "वशिष्ठ",
  "सुयल": "वशिष्ठ",
  "भण्डारी (वशिष्ठ)": "वशिष्ठ"
};

export function lookupGotraByThar(thar: string): string {
  if (!thar) return "";
  const cleaned = thar.trim();
  if (THAR_GOTRA_MAP[cleaned]) {
    return THAR_GOTRA_MAP[cleaned];
  }
  // Try partial match
  for (const [key, gotra] of Object.entries(THAR_GOTRA_MAP)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return gotra;
    }
  }
  return "";
}

// Bikram Sambat Calendar tables
const BS_MONTH_DAYS: Record<number, number[]> = {
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2083: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2087: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2088: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2089: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31]
};

const BS_START_GREG: Record<number, { y: number; m: number; d: number }> = {
  2075: { y: 2018, m: 4, d: 14 },
  2076: { y: 2019, m: 4, d: 14 },
  2077: { y: 2020, m: 4, d: 13 },
  2078: { y: 2021, m: 4, d: 14 },
  2079: { y: 2022, m: 4, d: 14 },
  2080: { y: 2023, m: 4, d: 14 },
  2081: { y: 2024, m: 4, d: 13 },
  2082: { y: 2025, m: 4, d: 14 },
  2083: { y: 2026, m: 4, d: 14 },
  2084: { y: 2027, m: 4, d: 14 },
  2085: { y: 2028, m: 4, d: 13 },
  2086: { y: 2029, m: 4, d: 13 },
  2087: { y: 2030, m: 4, d: 14 },
  2088: { y: 2031, m: 4, d: 14 },
  2089: { y: 2032, m: 4, d: 13 },
  2090: { y: 2033, m: 4, d: 13 }
};

const DEFAULT_MONTH_DAYS = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];

export function bsToGregorianDate(yBS: number, mBS: number, dBS: number): Date {
  let start = BS_START_GREG[yBS];
  if (!start) {
    const gregYear = yBS - 57;
    // Leap year adjustment for April 13/14
    const isLeap = (gregYear % 4 === 0 && gregYear % 100 !== 0) || (gregYear % 400 === 0);
    start = { y: gregYear, m: 4, d: isLeap ? 13 : 14 };
  }

  const monthDays = BS_MONTH_DAYS[yBS] || DEFAULT_MONTH_DAYS;
  let elapsedDays = 0;
  for (let m = 0; m < mBS - 1; m++) {
    elapsedDays += monthDays[m] || 30;
  }
  elapsedDays += (dBS - 1);

  const d = new Date(Date.UTC(start.y, start.m - 1, start.d));
  d.setUTCDate(d.getUTCDate() + elapsedDays);
  return d;
}

export function gregorianToBSDate(date: Date): { yearBS: number; monthBS: number; dayBS: number } {
  const gy = date.getUTCFullYear();
  let candidateYear = gy + 57;

  let start = BS_START_GREG[candidateYear];
  if (!start) {
    const isLeap = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
    start = { y: gy, m: 4, d: isLeap ? 13 : 14 };
  }

  let startDate = new Date(Date.UTC(start.y, start.m - 1, start.d));
  let diffDays = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    candidateYear -= 1;
    let prevStart = BS_START_GREG[candidateYear];
    if (!prevStart) {
      const prevGy = gy - 1;
      const isLeap = (prevGy % 4 === 0 && prevGy % 100 !== 0) || (prevGy % 400 === 0);
      prevStart = { y: prevGy, m: 4, d: isLeap ? 13 : 14 };
    }
    startDate = new Date(Date.UTC(prevStart.y, prevStart.m - 1, prevStart.d));
    diffDays = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const monthDays = BS_MONTH_DAYS[candidateYear] || DEFAULT_MONTH_DAYS;
  let m = 0;
  while (m < 12 && diffDays >= (monthDays[m] || 30)) {
    diffDays -= (monthDays[m] || 30);
    m++;
  }

  return {
    yearBS: candidateYear,
    monthBS: Math.min(12, m + 1),
    dayBS: Math.max(1, diffDays + 1)
  };
}

export function formatCoords(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  const latAbs = Math.abs(lat);
  const lonAbs = Math.abs(lon);

  const latDeg = Math.floor(latAbs);
  const latMin = Math.round((latAbs - latDeg) * 60);

  const lonDeg = Math.floor(lonAbs);
  const lonMin = Math.round((lonAbs - lonDeg) * 60);

  return `${latDeg}°${String(latMin).padStart(2, "0")}' ${latDir}, ${lonDeg}°${String(lonMin).padStart(2, "0")}' ${lonDir}`;
}

export function formatTime12Hour(hour: number, minute: number, second: number): string {
  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hStr = String(h).padStart(2, "0");
  const mStr = String(minute).padStart(2, "0");
  const sStr = String(Math.floor(second)).padStart(2, "0");
  return `${hStr}:${mStr}:${sStr} ${ampm}`;
}

export function parseTime12Hour(timeStr: string): { hour: number; minute: number; second: number } | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] ? parseInt(match[3], 10) : 0;
  const ampm = match[4]?.toUpperCase();

  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  if (h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59) {
    return { hour: h, minute: m, second: s };
  }
  return null;
}
