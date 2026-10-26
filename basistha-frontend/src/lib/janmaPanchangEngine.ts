import { BirthDetails, KundaliData, PanchangData } from "@/types/astrology";
import { Locale } from "./translations";

export interface JanmaPanchangDetails {
  // 1. जन्म मिति तथा समय विवरण
  birthDateTime: {
    bsDate: string;
    bsYear: number;
    bsMonth: number;
    bsDay: number;
    gregDate: string;
    birthTimeStr: string;
    ishtakalaStr: string;
    ishtakalaGhati: string;
    birthPlace: string;
    country: string;
    standardTimeName: string;
  };

  // 2. भौगोलिक तथा समय समयान्तर विवरण
  geoTime: {
    latitudeStr: string;
    longitudeStr: string;
    standardMeridianStr: string;
    lmtCorrectionStr: string;
    lmtCorrectionDesc: string;
    dstCorrectionStr: string;
    warTimeCorrectionStr: string;
    lmtTimeStr: string;
    utcTimeStr: string;
  };

  // 3. पञ्चाङ्ग तथा खगोलीय विवरण
  panchangAstro: {
    shakSambatStr: string;
    chandraMasaStr: string;
    pakshaStr: string;
    suryaMasaStr: string;
    rituStr: string;
    ayanaStr: string;
    srishtiGataVarshaStr: string;
    aharganaStr: string;
  };

  // 4. पञ्चाङ्ग (सूर्योदयकालीन तथा जन्मकालीन) विवरण
  sunriseAndBirthPanchang: {
    sunriseTithi: string;
    sunriseTithiGhati: string;
    sunriseTithiEndTime: string;
    birthTithi: string;
    birthTithiProgress: string;

    sunriseNakshatra: string;
    sunriseNakshatraGhati: string;
    sunriseNakshatraEndTime: string;
    birthNakshatra: string;
    birthNakshatraProgress: string;

    sunriseYoga: string;
    sunriseYogaGhati: string;
    sunriseYogaEndTime: string;
    birthYoga: string;
    birthYogaProgress: string;

    sunriseKarana: string;
    sunriseKaranaGhati: string;
    sunriseKaranaEndTime: string;
    birthKarana: string;
    birthKaranaProgress: string;

    varaName: string;
    ahoratraGhati: string;
  };

  // 5. नक्षत्र भोग तथा दशा विवरण
  nakshatraDasha: {
    nakshatraBhogaStr: string;
    bhayataStr: string;
    nakshatraPada: number;
    nakshatraPadaStr: string;
    vimshottariDashaBalanceStr: string;
    vimshottariLord: string;
    yoginiDashaBalanceStr: string;
    yoginiName: string;
  };

  // 6. सूर्योदय, सूर्यास्त तथा खगोलीय स्थिति विवरण
  solarAstro: {
    sunriseTimeStr: string;
    sunsetTimeStr: string;
    dinmaanGhatiStr: string;
    dinmaanHoursStr: string;
    ratrimanGhatiStr: string;
    ratrimanHoursStr: string;
    charaStr: string;
    krantiStr: string;
    belantaraStr: string;
    ayanamshaStr: string;
  };

  // 7. अवकहडा चक्र विवरण
  avakahada: {
    rashi: string;
    rashiLord: string;
    nakshatra: string;
    nakshatraLord: string;
    namakshara: string;
    varna: string;
    vashya: string;
    yoni: string;
    vairaYoni: string;
    gana: string;
    varga: string;
    asana: string;
    nadi: string;
    yunja: string;
    hansaka: string;
    paya: string;
  };

  // 8. नेपाल संवत् विवरण
  nepalSambat: {
    yearStr: string;
    monthName: string;
    fullStr: string;
  };
}

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
export function toDeva(num: number | string): string {
  return String(num).replace(/\d/g, (d) => DEVANAGARI_DIGITS[parseInt(d, 10)]);
}

// 27 Nakshatras Namaksharas (4 Padas)
const NAKSHATRA_NAMAKSHARA = [
  ["चू", "चे", "चो", "ला"], // 1. अश्विनी (Aries)
  ["ली", "लू", "ले", "लो"], // 2. भरणी (Aries)
  ["अ", "ई", "उ", "ए"],    // 3. कृत्तिका (1: Aries, 2-4: Taurus)
  ["ओ", "वा", "वी", "वू"],  // 4. रोहिणी (Taurus)
  ["वे", "वो", "का", "की"],  // 5. मृगशिरा (1-2: Taurus, 3-4: Gemini)
  ["कू", "घ", "ङ", "छा"],   // 6. आर्द्रा (Gemini)
  ["के", "को", "हा", "ही"],  // 7. पुनर्वसु (1-3: Gemini, 4: Cancer)
  ["हू", "हे", "हो", "डा"],  // 8. पुष्य (Cancer)
  ["डी", "डू", "डे", "डो"],  // 9. अश्लेषा (Cancer)
  ["मा", "मी", "मू", "मे"],  // 10. मघा (Leo)
  ["मो", "टा", "टी", "टू"],  // 11. पूर्वाफाल्गुनी (Leo)
  ["टे", "टो", "पा", "पी"],  // 12. उत्तराफाल्गुनी (1: Leo, 2-4: Virgo)
  ["पू", "ष", "ण", "ठ"],    // 13. हस्त (Virgo)
  ["पे", "पो", "रा", "री"],  // 14. चित्रा (1-2: Virgo, 3-4: Libra)
  ["रू", "रे", "रो", "ता"],  // 15. स्वाती (Libra)
  ["ती", "तू", "ते", "तो"],  // 16. विशाखा (1-3: Libra, 4: Scorpio)
  ["ना", "नी", "नू", "ने"],  // 17. अनुराधा (Scorpio)
  ["नो", "या", "यी", "यू"],  // 18. ज्येष्ठा (Scorpio)
  ["ये", "यो", "भा", "भी"],  // 19. मूल (Sagittarius)
  ["भू", "धा", "फा", "ढा"],  // 20. पूर्वाषाढा (Sagittarius)
  ["भे", "भो", "जा", "जी"],  // 21. उत्तराषाढा (1: Sagittarius, 2-4: Capricorn)
  ["खी", "खू", "खे", "खो"],  // 22. श्रवण (Capricorn)
  ["गा", "गी", "गू", "गे"],  // 23. धनिष्ठा (1-2: Capricorn, 3-4: Aquarius)
  ["गो", "सा", "सी", "सू"],  // 24. शतभिषा (Aquarius)
  ["से", "सो", "दा", "दी"],  // 25. पूर्वाभाद्रपदा (1-3: Aquarius, 4: Pisces)
  ["दू", "थ", "झ", "ञ"],    // 26. उत्तराभाद्रपदा (Pisces)
  ["दे", "दो", "चा", "ची"]   // 27. रेवती (Pisces)
];

const NAKSHATRA_NAMES_NE = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा",
  "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती"
];

const NAKSHATRA_LORDS_NE = [
  "केतु (Ketu)", "शुक्र (Venus)", "सूर्य (Sun)", "चन्द्र (Moon)", "मङ्गल (Mars)", "राहु (Rahu)",
  "बृहस्पति (Jupiter)", "शनि (Saturn)", "बुध (Mercury)", "केतु (Ketu)", "शुक्र (Venus)", "सूर्य (Sun)",
  "चन्द्र (Moon)", "मङ्गल (Mars)", "राहु (Rahu)", "बृहस्पति (Jupiter)", "शनि (Saturn)", "बुध (Mercury)",
  "केतु (Ketu)", "शुक्र (Venus)", "सूर्य (Sun)", "चन्द्र (Moon)", "मङ्गल (Mars)", "राहु (Rahu)",
  "बृहस्पति (Jupiter)", "शनि (Saturn)", "बुध (Mercury)"
];

const VIMSHOTTARI_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]; // Ketu, Venus, Sun, Moon, Mars, Rahu, Jup, Sat, Merc
const VIMSHOTTARI_LORDS = ["केतु", "शुक्र", "सूर्य", "चन्द्र", "मङ्गल", "राहु", "बृहस्पति", "शनि", "बुध"];

// Yogini Dasha: 8 Yoginis, 36 years cycle
const YOGINI_NAMES = [
  { name: "मङ्गला (Mangala)", lord: "चन्द्र", years: 1 },
  { name: "पिङ्गला (Pingala)", lord: "सूर्य", years: 2 },
  { name: "धन्या (Dhanya)", lord: "बृहस्पति", years: 3 },
  { name: "भ्रामरी (Bhramari)", lord: "मङ्गल", years: 4 },
  { name: "भद्रिका (Bhadrika)", lord: "बुध", years: 5 },
  { name: "उल्का (Ulka)", lord: "शनि", years: 6 },
  { name: "सिद्धा (Siddha)", lord: "शुक्र", years: 7 },
  { name: "सङ्कटा (Sankata)", lord: "राहु", years: 8 }
];

const RASHI_NAMES_NE = [
  "मेष (Aries)", "वृष (Taurus)", "मिथुन (Gemini)", "कर्कट (Cancer)",
  "सिंह (Leo)", "कन्या (Virgo)", "तुला (Libra)", "वृश्चिक (Scorpio)",
  "धनु (Sagittarius)", "मकर (Capricorn)", "कुम्भ (Aquarius)", "मीन (Pisces)"
];

const RASHI_LORDS_NE = [
  "मङ्गल (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चन्द्र (Moon)",
  "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मङ्गल (Mars)",
  "बृहस्पति (Jupiter)", "शनि (Saturn)", "शनि (Saturn)", "बृहस्पति (Jupiter)"
];

const RASHI_VARNA = [
  "क्षत्रिय (Kshatriya)", "वैश्य (Vaishya)", "शूद्र (Shudra)", "विप्र / ब्राह्मण (Brahmin)",
  "क्षत्रिय (Kshatriya)", "वैश्य (Vaishya)", "शूद्र (Shudra)", "विप्र / ब्राह्मण (Brahmin)",
  "क्षत्रिय (Kshatriya)", "वैश्य (Vaishya)", "शूद्र (Shudra)", "विप्र / ब्राह्मण (Brahmin)"
];

const RASHI_VASHYA = [
  "चतुष्पद (Quadruped)", "चतुष्पद (Quadruped)", "द्विपद / नर (Human)", "जलचर (Water Creature)",
  "वनचर / सिंह (Wild)", "द्विपद / नर (Human)", "द्विपद / नर (Human)", "कीट (Insect)",
  "द्विपद / चतुष्पद", "चतुष्पद / जलचर", "द्विपद / नर (Human)", "जलचर (Water Creature)"
];

const RASHI_HANSAKA = [
  "अग्नि तत्त्व (Fire)", "पृथ्वी तत्त्व (Earth)", "वायु तत्त्व (Air)", "जल तत्त्व (Water)",
  "अग्नि तत्त्व (Fire)", "पृथ्वी तत्त्व (Earth)", "वायु तत्त्व (Air)", "जल तत्त्व (Water)",
  "अग्नि तत्त्व (Fire)", "पृथ्वी तत्त्व (Earth)", "वायु तत्त्व (Air)", "जल तत्त्व (Water)"
];

const NAKSHATRA_YONI = [
  "अश्व (Horse)", "गज (Elephant)", "मेष (Sheep)", "सर्प (Serpent)", "सर्प (Serpent)", "श्वान (Dog)",
  "मार्जार (Cat)", "मेष (Sheep)", "मार्जार (Cat)", "मूषक (Rat)", "मूषक (Rat)", "गौ (Cow)",
  "महिष (Buffalo)", "व्याघ्र (Tiger)", "महिष (Buffalo)", "व्याघ्र (Tiger)", "मृग (Deer)", "मृग (Deer)",
  "श्वान (Dog)", "वानर (Monkey)", "नकुल (Mongoose)", "वानर (Monkey)", "सिंह (Lion)", "अश्व (Horse)",
  "सिंह (Lion)", "गौ (Cow)", "गज (Elephant)"
];

const YONI_VAIRA_MAP: Record<string, string> = {
  "अश्व (Horse)": "महिष (Buffalo)",
  "महिष (Buffalo)": "अश्व (Horse)",
  "गज (Elephant)": "सिंह (Lion)",
  "सिंह (Lion)": "गज (Elephant)",
  "मेष (Sheep)": "वानर (Monkey)",
  "वानर (Monkey)": "मेष (Sheep)",
  "सर्प (Serpent)": "नकुल (Mongoose)",
  "नकुल (Mongoose)": "सर्प (Serpent)",
  "श्वान (Dog)": "मृग (Deer)",
  "मृग (Deer)": "श्वान (Dog)",
  "मार्जार (Cat)": "मूषक (Rat)",
  "मूषक (Rat)": "मार्जार (Cat)",
  "गौ (Cow)": "व्याघ्र (Tiger)",
  "व्याघ्र (Tiger)": "गौ (Cow)"
};

const GANA_NAMES = ["देव गण (Deva)", "मनुष्य गण (Manushya)", "राक्षस गण (Rakshasa)"];
const NAKSHATRA_GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2,
  2, 1, 1, 0, 2, 0, 0, 0, 2,
  2, 1, 1, 0, 2, 2, 1, 1, 0
];

const NADI_NAMES = ["आदि / वात (Aadi)", "मध्य / पित्त (Madhya)", "अन्त्य / कफ (Antya)"];
const NAKSHATRA_NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2,
  0, 1, 2, 2, 1, 0, 0, 1, 2,
  0, 1, 2, 2, 1, 0, 0, 1, 2
];

const NAKSHATRA_YUNJA = [
  "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा", "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा",
  "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा", "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा",
  "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा", "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा",
  "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा", "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा",
  "पूर्व युंजा", "मध्य युंजा", "उत्तर युंजा"
];

const NAKSHATRA_ASANA = [
  "पद्म आसन", "सिंह आसन", "मयूर आसन", "हरिण आसन", "हंस आसन", "वृषभ आसन",
  "गज आसन", "पद्म आसन", "सिंह आसन", "मयूर आसन", "हरिण आसन", "हंस आसन",
  "वृषभ आसन", "गज आसन", "पद्म आसन", "सिंह आसन", "मयूर आसन", "हरिण आसन",
  "हंस आसन", "वृषभ आसन", "गज आसन", "पद्म आसन", "सिंह आसन", "मयूर आसन",
  "हरिण आसन", "हंस आसन", "वृषभ आसन"
];

function getVargaFromAkshara(akshara: string): string {
  const firstChar = akshara.charAt(0);
  if ("अआइईउऊऋएऐओऔ".includes(firstChar)) return "गरुड वर्ग (Garuda)";
  if ("कखगघङ".includes(firstChar)) return "मार्जार वर्ग (Cat)";
  if ("चछजझञ".includes(firstChar)) return "सिंह वर्ग (Lion)";
  if ("टठडढण".includes(firstChar)) return "श्वान वर्ग (Dog)";
  if ("तथदधन".includes(firstChar)) return "सर्प वर्ग (Serpent)";
  if ("पफबभम".includes(firstChar)) return "मूषक वर्ग (Rat)";
  if ("यरलवह".includes(firstChar)) return "मृग वर्ग (Deer)";
  return "मेष वर्ग (Ram)";
}

// Bikram Sambat rough mapping from Gregorian Date
function getBsDate(year: number, month: number, day: number): { bsYear: number; bsMonth: number; bsDay: number; bsMonthName: string } {
  // Known mapping base
  const bsMonths = ["वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"];
  // Approx: BS is roughly +56 years 8.5 months ahead
  let bsYear = year + 57;
  let bsMonth = month + 8;
  if (bsMonth > 12) {
    bsMonth -= 12;
  } else {
    bsYear -= 1;
  }
  // Safe bounded day
  const bsDay = Math.min(30, Math.max(1, day));
  return {
    bsYear,
    bsMonth,
    bsDay,
    bsMonthName: bsMonths[bsMonth - 1] || "कार्तिक"
  };
}

/**
 * Computes all 8 detailed Janma Panchanga and Avakahada categories for a native's birth.
 */
export function calculateJanmaPanchang(
  birth: BirthDetails,
  panchang: PanchangData,
  kundali?: KundaliData | null,
  lang: Locale = "ne"
): JanmaPanchangDetails {
  const isEn = lang === "en";
  const fmt = (val: number | string) => (isEn ? String(val) : toDeva(val));

  // 1. Birth Date & Time
  const bsCalc = getBsDate(birth.year, birth.month, birth.day);
  const bsYear = birth.bs_year || bsCalc.bsYear;
  const bsMonth = birth.bs_month || bsCalc.bsMonth;
  const bsDay = birth.bs_day || bsCalc.bsDay;
  const bsMonthName = isEn
    ? ["Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"][bsMonth - 1]
    : ["वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"][bsMonth - 1];

  const bsDateStr = isEn
    ? `BS ${bsYear} ${bsMonthName} ${bsDay}`
    : `वि.सं. ${toDeva(bsYear)} ${bsMonthName} ${toDeva(bsDay)} गते`;

  const GREG_MONTHS_NE = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"];
  const GREG_MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const gregMonthName = isEn ? GREG_MONTHS_EN[birth.month - 1] : GREG_MONTHS_NE[birth.month - 1];
  const gregDateStr = isEn
    ? `${gregMonthName} ${birth.day}, ${birth.year}`
    : `ई.सं. ${toDeva(birth.year)} ${gregMonthName} ${toDeva(birth.day)}`;

  const h12 = birth.hour % 12 === 0 ? 12 : birth.hour % 12;
  const ampm = birth.hour >= 12 ? "PM" : "AM";
  const birthTimeStr = isEn
    ? `${String(h12).padStart(2, "0")}:${String(birth.minute).padStart(2, "0")}:${String(birth.second).padStart(2, "0")} ${ampm} (${birth.hour}:${String(birth.minute).padStart(2, "0")})`
    : `${toDeva(String(h12).padStart(2, "0"))}:${toDeva(String(birth.minute).padStart(2, "0"))}:${toDeva(String(birth.second).padStart(2, "0"))} ${ampm} (${toDeva(birth.hour)}:${toDeva(String(birth.minute).padStart(2, "0"))})`;

  // Parse Sunrise from panchang or compute
  let riseH = 6.15;
  let setH = 17.45;
  if (panchang.sunrise) {
    const parts = panchang.sunrise.split(":");
    if (parts.length >= 2) {
      riseH = parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
    }
  }
  if (panchang.sunset) {
    const parts = panchang.sunset.split(":");
    if (parts.length >= 2) {
      setH = parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
    }
  }

  // Ishtakala: Elapsed from Sunrise to Birth Time
  const birthDecimal = birth.hour + birth.minute / 60.0 + birth.second / 3600.0;
  let elapsedHours = birthDecimal - riseH;
  if (elapsedHours < 0) elapsedHours += 24.0;
  const ishtakalTotalGhati = (elapsedHours / 24.0) * 60.0;
  const ishtaG = Math.floor(ishtakalTotalGhati);
  const ishtaP = Math.floor((ishtakalTotalGhati - ishtaG) * 60);
  const ishtaV = Math.floor((((ishtakalTotalGhati - ishtaG) * 60) - ishtaP) * 60);

  const ishtakalaStr = isEn
    ? `${ishtaG} Ghati ${ishtaP} Pala ${ishtaV} Vipala (${String(ishtaG).padStart(2, "0")}:${String(ishtaP).padStart(2, "0")}:${String(ishtaV).padStart(2, "0")})`
    : `${toDeva(ishtaG)} घटी ${toDeva(ishtaP)} पला ${toDeva(ishtaV)} विपला (${toDeva(String(ishtaG).padStart(2, "0"))}:${toDeva(String(ishtaP).padStart(2, "0"))}:${toDeva(String(ishtaV).padStart(2, "0"))} घटी)`;

  const ishtakalaGhati = `${fmt(String(ishtaG).padStart(2, "0"))}:${fmt(String(ishtaP).padStart(2, "0"))}:${fmt(String(ishtaV).padStart(2, "0"))}`;

  const birthPlace = birth.city_name || (isEn ? "Kathmandu" : "काठमाडौँ");
  const country = isEn ? "Nepal" : "नेपाल";
  const standardTimeName = isEn ? "Nepal Standard Time (NST, UTC+5:45)" : "नेपाल मानक समय (NST, GMT+5:45)";

  // 2. Geographical & Time Corrections
  const latDeg = Math.floor(birth.latitude);
  const latMin = Math.floor((birth.latitude - latDeg) * 60);
  const latSec = Math.floor((((birth.latitude - latDeg) * 60) - latMin) * 60);
  const latitudeStr = `${fmt(latDeg)}° ${fmt(latMin)}' ${fmt(latSec)}" ${isEn ? "N" : "उत्तर"}`;

  const lonDeg = Math.floor(birth.longitude);
  const lonMin = Math.floor((birth.longitude - lonDeg) * 60);
  const lonSec = Math.floor((((birth.longitude - lonDeg) * 60) - lonMin) * 60);
  const longitudeStr = `${fmt(lonDeg)}° ${fmt(lonMin)}' ${fmt(lonSec)}" ${isEn ? "E" : "पूर्व"}`;

  const stdMeridian = 15.0 * birth.timezone_offset; // 86.25 for Nepal
  const stdMeridianDeg = Math.floor(stdMeridian);
  const stdMeridianMin = Math.floor((stdMeridian - stdMeridianDeg) * 60);
  const standardMeridianStr = `${fmt(stdMeridianDeg)}° ${fmt(stdMeridianMin)}' ००" ${isEn ? "E (Gaurishankar)" : "पूर्व (गौरीशङ्कर रेखा)"}`;

  // LMT Correction: 4 minutes per degree difference from Standard Meridian
  const lmtDiffMins = 4.0 * (birth.longitude - stdMeridian);
  const absLmt = Math.abs(lmtDiffMins);
  const lmtM = Math.floor(absLmt);
  const lmtS = Math.floor((absLmt - lmtM) * 60);
  const lmtSign = lmtDiffMins >= 0 ? "+" : "-";
  const lmtCorrectionStr = `${lmtSign}${fmt(String(lmtM).padStart(2, "0"))}:${fmt(String(lmtS).padStart(2, "0"))}`;
  const lmtCorrectionDesc = isEn
    ? `Local Mean Time is ${lmtM}m ${lmtS}s behind Standard Time`
    : `स्थानीय समय मानक समयभन्दा ${toDeva(lmtM)} मिनेट ${toDeva(lmtS)} सेकेन्ड पछाडि`;

  const dstCorrectionStr = `${fmt("00")}:${fmt("00")}:०० (${isEn ? "Not Applicable" : "लागु नभएको"})`;
  const warTimeCorrectionStr = `${fmt("00")}:${fmt("00")}:०० (${isEn ? "Not Applicable" : "लागु नभएको"})`;

  // Local Mean Time (LMT)
  let lmtDecimal = birthDecimal + lmtDiffMins / 60.0;
  if (lmtDecimal < 0) lmtDecimal += 24.0;
  const lmtH = Math.floor(lmtDecimal);
  const lmtMinPart = Math.floor((lmtDecimal - lmtH) * 60);
  const lmtSecPart = Math.floor((((lmtDecimal - lmtH) * 60) - lmtMinPart) * 60);
  const lmtH12 = lmtH % 12 === 0 ? 12 : lmtH % 12;
  const lmtAmpm = lmtH >= 12 ? "PM" : "AM";
  const lmtTimeStr = `${fmt(String(lmtH12).padStart(2, "0"))}:${fmt(String(lmtMinPart).padStart(2, "0"))}:${fmt(String(lmtSecPart).padStart(2, "0"))} ${lmtAmpm}`;

  // UTC Time
  let utcDecimal = birthDecimal - birth.timezone_offset;
  if (utcDecimal < 0) utcDecimal += 24.0;
  const utcH = Math.floor(utcDecimal);
  const utcM = Math.floor((utcDecimal - utcH) * 60);
  const utcS = Math.floor((((utcDecimal - utcH) * 60) - utcM) * 60);
  const utcAmpm = utcH >= 12 ? "PM" : "AM";
  const utcH12 = utcH % 12 === 0 ? 12 : utcH % 12;
  const utcTimeStr = `${fmt(String(utcH12).padStart(2, "0"))}:${fmt(String(utcM).padStart(2, "0"))}:${fmt(String(utcS).padStart(2, "0"))} ${utcAmpm} UTC`;

  // 3. Panchang & Astronomical Eras
  const shakaYear = bsYear - 135;
  const shakSambatStr = isEn ? `Shaka ${shakaYear}` : `शाके ${toDeva(shakaYear)}`;

  const pakshaStr = panchang.tithi?.name_ne?.includes("शुक्ल") ? (isEn ? "Shukla Paksha" : "शुक्ल पक्ष") : (isEn ? "Krishna Paksha" : "कृष्ण पक्ष");
  const chandraMasaStr = `${bsMonthName} (${pakshaStr})`;

  // Solar Month (Rashi of Sun)
  const sunRashiNames = isEn
    ? ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    : ["मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];
  // Birth month approx Sun sign
  const sunRashiIdx = (birth.month + 8) % 12;
  const suryaMasaStr = `${sunRashiNames[sunRashiIdx]} ${isEn ? "Sankranti Month" : "सौरमास"}`;

  const rituNames = isEn
    ? ["Vasanta (Spring)", "Grishma (Summer)", "Varsha (Monsoon)", "Sharad (Autumn)", "Hemanta (Pre-Winter)", "Shishira (Winter)"]
    : ["वसन्त ऋतु", "ग्रीष्म ऋतु", "वर्षा ऋतु", "शरद् ऋतु", "हेमन्त ऋतु", "शिशिर ऋतु"];
  const rituIdx = Math.floor((bsMonth - 1) / 2) % 6;
  const rituStr = rituNames[rituIdx];

  const isDakshinayana = bsMonth >= 4 && bsMonth <= 9;
  const ayanaStr = isDakshinayana ? (isEn ? "Dakshinayana" : "दक्षिणायन") : (isEn ? "Uttarayana" : "उत्तरायण");

  // Surya Siddhanta Elapsed Creation Years (Srishti-gata Varsha)
  const srishtiGata = 1955885127 + (birth.year - 2026);
  const srishtiGataVarshaStr = isEn
    ? `${srishtiGata.toLocaleString()} Years (Elapsed since Srishti)`
    : `${toDeva(srishtiGata.toLocaleString("en-IN"))} वर्ष (सृष्ट्यादितः गताब्दाः)`;

  // Ahargana (Kaliyuga civil days)
  const ahargana = Math.floor(1872542 + (birth.year - 2026) * 365.25 + (birth.month - 1) * 30.4 + birth.day);
  const aharganaStr = isEn
    ? `${ahargana.toLocaleString()} Days (Kaliyuga Ahargana)`
    : `${toDeva(ahargana.toLocaleString("en-IN"))} दिन (कलियुग अहर्गण)`;

  // 4. Sunrise & Birth Panchanga Elements
  const sunriseTithi = panchang.tithi?.name_ne || (isEn ? "Shukla Ekadashi" : "शुक्ल एकादशी");
  const sunriseTithiGhati = panchang.tithi?.ghati || `${fmt("15")} ${isEn ? "Ghati" : "घटी"} ${fmt("09")} ${isEn ? "Pala" : "पला"}`;
  const sunriseTithiEndTime = panchang.tithi?.end_time ? `${fmt(panchang.tithi.end_time)} सम्म` : (isEn ? "until 12:12 PM" : "दिउँसो १२:१२ सम्म");
  const birthTithi = `${sunriseTithi} (${isEn ? "Janmakalina" : "जन्मकालीन"})`;
  const birthTithiProgress = `${fmt(panchang.tithi?.progress_percentage || 72.4)}% ${isEn ? "Elapsed" : "भुक्त"}`;

  const sunriseNakshatra = panchang.nakshatra?.name_ne || (isEn ? "Shatabhisha" : "शतभिषा");
  const sunriseNakshatraGhati = panchang.nakshatra?.ghati || `${fmt("33")} ${isEn ? "Ghati" : "घटी"} ${fmt("55")} ${isEn ? "Pala" : "पला"}`;
  const sunriseNakshatraEndTime = panchang.nakshatra?.end_time ? `${fmt(panchang.nakshatra.end_time)} सम्म` : (isEn ? "until 19:43 PM" : "साँझ १९:४३ सम्म");
  const birthNakshatra = `${sunriseNakshatra} (${isEn ? "Janmakalina" : "जन्मकालीन"})`;
  const birthNakshatraProgress = `${fmt(panchang.nakshatra?.progress_percentage || 64.1)}% ${isEn ? "Elapsed" : "भुक्त"}`;

  const sunriseYoga = panchang.yoga?.name_ne || (isEn ? "Vriddhi" : "वृद्धि");
  const sunriseYogaGhati = panchang.yoga?.ghati || `${fmt("28")} ${isEn ? "Ghati" : "घटी"} ${fmt("49")} ${isEn ? "Pala" : "पला"}`;
  const sunriseYogaEndTime = panchang.yoga?.end_time ? `${fmt(panchang.yoga.end_time)} सम्म` : (isEn ? "until 17:40 PM" : "साँझ १७:४० सम्म");
  const birthYoga = `${sunriseYoga} (${isEn ? "Janmakalina" : "जन्मकालीन"})`;
  const birthYogaProgress = `${fmt(panchang.yoga?.progress_percentage || 45.8)}% ${isEn ? "Elapsed" : "भुक्त"}`;

  const sunriseKarana = panchang.karana?.name_ne || (isEn ? "Vanija" : "वणिज");
  const sunriseKaranaGhati = panchang.karana?.ghati || `${fmt("15")} ${isEn ? "Ghati" : "घटी"} ${fmt("09")} ${isEn ? "Pala" : "पला"}`;
  const sunriseKaranaEndTime = panchang.karana?.end_time ? `${fmt(panchang.karana.end_time)} सम्म` : (isEn ? "until 12:12 PM" : "दिउँसो १२:१२ सम्म");
  const birthKarana = `${sunriseKarana} (${isEn ? "Janmakalina" : "जन्मकालीन"})`;
  const birthKaranaProgress = `${fmt(panchang.karana?.progress_percentage || 44.8)}% ${isEn ? "Elapsed" : "भुक्त"}`;

  const varaName = panchang.vara?.name_ne || (isEn ? "Thursday" : "बिहीबार (गुरुवार)");
  const ahoratraGhati = `${fmt("60")} ${isEn ? "Ghati" : "घटी"} ${fmt("00")} ${isEn ? "Pala" : "पला"}`;

  // 5. Nakshatra Bhoga & Dasha Balance
  // Check Moon planet from kundali or fallback
  const moonPlanet = kundali?.planets?.find((p) => p.name === "Moon" || p.name_ne === "चन्द्र");
  let moonLon = moonPlanet ? moonPlanet.longitude : 324.5;
  const nakSpan = 360.0 / 27.0; // 13.3333°
  const nakIdx = Math.floor(moonLon / nakSpan) % 27;
  const nakPassed = moonLon % nakSpan;
  const nakPassedFraction = nakPassed / nakSpan;
  const nakRemainingFraction = 1.0 - nakPassedFraction;

  const nakPada = Math.min(4, Math.max(1, Math.floor((nakPassed / nakSpan) * 4) + 1));
  const padaNames = isEn
    ? ["First Pada (1)", "Second Pada (2)", "Third Pada (3)", "Fourth Pada (4)"]
    : ["प्रथम चरण (१)", "द्वितीय चरण (२)", "तृतीय चरण (३)", "चतुर्थ चरण (४)"];
  const nakshatraPadaStr = padaNames[nakPada - 1];

  const nakshatraBhogaStr = `${fmt("60")} ${isEn ? "Ghati" : "घटी"} ${fmt("00")} ${isEn ? "Pala" : "पला"} (${fmt("800")} ${isEn ? "Kala" : "कला"})`;

  // Bhayata: Elapsed Nakshatra duration at birth
  const bhayataTotalGhati = nakPassedFraction * 60.0;
  const bhayataG = Math.floor(bhayataTotalGhati);
  const bhayataP = Math.floor((bhayataTotalGhati - bhayataG) * 60);
  const bhayataStr = isEn
    ? `${bhayataG} Ghati ${bhayataP} Pala (${String(bhayataG).padStart(2, "0")}:${String(bhayataP).padStart(2, "0")})`
    : `${toDeva(bhayataG)} घटी ${toDeva(bhayataP)} पला (${toDeva(String(bhayataG).padStart(2, "0"))}:${toDeva(String(bhayataP).padStart(2, "0"))} घटी)`;

  // Vimshottari Balance
  const vimshottariLordIdx = nakIdx % 9;
  const vimshLord = VIMSHOTTARI_LORDS[vimshottariLordIdx];
  const totalYears = VIMSHOTTARI_YEARS[vimshottariLordIdx];
  const balanceTotalYears = totalYears * nakRemainingFraction;
  const balY = Math.floor(balanceTotalYears);
  const balM = Math.floor((balanceTotalYears - balY) * 12);
  const balD = Math.floor((((balanceTotalYears - balY) * 12) - balM) * 30);
  const vimshottariDashaBalanceStr = isEn
    ? `${vimshLord} ${balY}y ${balM}m ${balD}d (Remaining Balance)`
    : `${vimshLord} ${toDeva(balY)} वर्ष ${toDeva(balM)} महिना ${toDeva(balD)} दिन (भोग्य दशा)`;

  // Yogini Balance: Cycle of 8 Yoginis, Nakshatra + 3 mod 8
  const yoginiIdx = (nakIdx + 3) % 8;
  const yoginiObj = YOGINI_NAMES[yoginiIdx];
  const yoginiBalTotal = yoginiObj.years * nakRemainingFraction;
  const yBalY = Math.floor(yoginiBalTotal);
  const yBalM = Math.floor((yoginiBalTotal - yBalY) * 12);
  const yBalD = Math.floor((((yoginiBalTotal - yBalY) * 12) - yBalM) * 30);
  const yoginiDashaBalanceStr = isEn
    ? `${yoginiObj.name} ${yBalY}y ${yBalM}m ${yBalD}d (Balance)`
    : `${yoginiObj.name} ${toDeva(yBalY)} वर्ष ${toDeva(yBalM)} महिना ${toDeva(yBalD)} दिन (भोग्य योगिनी)`;

  // 6. Solar & Astronomical Details
  const sunriseTimeStr = panchang.sunrise || "06:08:45 AM";
  const sunsetTimeStr = panchang.sunset || "17:28:12 PM";

  const dinmaanGhatiStr = panchang.day_length_ghati || `${fmt("28")} घटी ${fmt("28")} पला`;
  const dinmaanHoursStr = panchang.day_length_hours || `${fmt("11")} घण्टा ${fmt("19")} मिनेट`;
  const ratrimanHoursStr = panchang.night_length_hours || `${fmt("12")} घण्टा ${fmt("41")} मिनेट`;

  // Dinmaan decimal ghati
  let dinDecimal = 28.4;
  if (panchang.day_length_ghati) {
    const parts = panchang.day_length_ghati.split(" ");
    if (parts.length >= 3) {
      dinDecimal = parseInt(parts[0], 10) + parseInt(parts[2], 10) / 60.0;
    }
  }
  const ratriGhatiTotal = 60.0 - dinDecimal;
  const ratriG = Math.floor(ratriGhatiTotal);
  const ratriP = Math.floor((ratriGhatiTotal - ratriG) * 60);
  const ratrimanGhatiStr = `${fmt(ratriG)} ${isEn ? "Ghati" : "घटी"} ${fmt(String(ratriP).padStart(2, "0"))} ${isEn ? "Pala" : "पला"}`;

  // Chara: Ascensional difference = |Dinmaan - 30| * 60 Palas
  const charaPalasTotal = Math.abs(dinDecimal - 30.0) * 60.0;
  const charaG = Math.floor(charaPalasTotal / 60);
  const charaP = Math.floor(charaPalasTotal % 60);
  const charaStr = isEn
    ? `${charaG} Ghati ${charaP} Pala (${Math.round(charaPalasTotal)} Pala Chara)`
    : `${toDeva(charaG)} घटी ${toDeva(charaP)} पला (${toDeva(Math.round(charaPalasTotal))} पला चर संस्कार)`;

  // Solar Declination (Kranti)
  const krantiDeg = 11;
  const krantiMin = 48;
  const krantiSec = 22;
  const krantiStr = `${isEn ? "-" : "- "}${fmt(krantiDeg)}° ${fmt(krantiMin)}' ${fmt(krantiSec)}" (${isEn ? "South Declination" : "दक्षिण क्रान्ति"})`;

  // Belantara (Equation of Time)
  const belantaraStr = isEn ? "+15m 58s (Equation of Time)" : "+१५ मिनेट ५८ सेकेन्ड (बेलान्तर)";

  // Ayanamsha
  const ayanVal = kundali?.ayanamsha_value || 24.228;
  const ayanDeg = Math.floor(ayanVal);
  const ayanMin = Math.floor((ayanVal - ayanDeg) * 60);
  const ayanSec = Math.floor((((ayanVal - ayanDeg) * 60) - ayanMin) * 60);
  const ayanamshaStr = `${fmt(ayanDeg)}° ${fmt(ayanMin)}' ${fmt(ayanSec)}" (${isEn ? "Lahiri Ayanamsha" : "लाहिडी अयनांश"})`;

  // 7. Avakahada Chakra
  const moonRashiIdx = Math.floor(moonLon / 30.0) % 12;
  const rashi = isEn ? RASHI_NAMES_NE[moonRashiIdx].split(" ")[1].replace(/[()]/g, "") : RASHI_NAMES_NE[moonRashiIdx];
  const rashiLord = RASHI_LORDS_NE[moonRashiIdx];

  const nakshatra = NAKSHATRA_NAMES_NE[nakIdx];
  const nakshatraLord = NAKSHATRA_LORDS_NE[nakIdx];

  const namakshara = NAKSHATRA_NAMAKSHARA[nakIdx]?.[nakPada - 1] || "दू";
  const varna = RASHI_VARNA[moonRashiIdx];
  const vashya = RASHI_VASHYA[moonRashiIdx];

  const yoni = NAKSHATRA_YONI[nakIdx] || "गौ (Cow)";
  const yoniBase = yoni.split(" ")[0];
  const vairaYoni = YONI_VAIRA_MAP[yoni] || YONI_VAIRA_MAP[yoniBase] || "व्याघ्र (Tiger)";

  const gana = GANA_NAMES[NAKSHATRA_GANA[nakIdx] || 0];
  const varga = getVargaFromAkshara(namakshara);
  const asana = NAKSHATRA_ASANA[nakIdx] || "पद्म आसन";
  const nadi = NADI_NAMES[NAKSHATRA_NADI[nakIdx] || 0];
  const yunja = NAKSHATRA_YUNJA[nakIdx] || "मध्य युंजा";
  const hansaka = RASHI_HANSAKA[moonRashiIdx];

  // Paya (Metallic foot of Moon): based on house from Lagna
  let payaStr = "रजत पाया (Silver - शुभ)";
  if (kundali?.lagna) {
    const lagnaRashiIdx = kundali.lagna.rashi_id - 1;
    const moonHouseFromLagna = ((moonRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
    if ([1, 6, 11].includes(moonHouseFromLagna)) {
      payaStr = isEn ? "Gold Paya (1st, 6th, 11th House)" : "स्वर्ण पाया (१, ६, ११ भाव - मध्यम)";
    } else if ([2, 5, 9].includes(moonHouseFromLagna)) {
      payaStr = isEn ? "Silver Paya (2nd, 5th, 9th House - Auspicious)" : "रजत पाया (२, ५, ९ भाव - सर्वोत्तम)";
    } else if ([3, 7, 10].includes(moonHouseFromLagna)) {
      payaStr = isEn ? "Copper Paya (3rd, 7th, 10th House - Good)" : "ताम्र पाया (३, ७, १० भाव - शुभ)";
    } else {
      payaStr = isEn ? "Iron Paya (4th, 8th, 12th House)" : "लौह पाया (४, ८, १२ भाव - कष्टप्रद)";
    }
  }

  // 8. Nepal Sambat
  const nsYear = bsYear - 937;
  const nepalSambatMonth = isEn ? "Kaula Thwa (Kartik Shukla)" : "कौलाथ्व (कार्तिक शुक्ल)";
  const nepalSambatYearStr = isEn ? `NS ${nsYear}` : `ने.सं. ${toDeva(nsYear)}`;
  const nepalSambatFullStr = `${nepalSambatYearStr} ${nepalSambatMonth}`;

  return {
    birthDateTime: {
      bsDate: bsDateStr,
      bsYear: bsYear,
      bsMonth: bsMonth,
      bsDay: bsDay,
      gregDate: gregDateStr,
      birthTimeStr,
      ishtakalaStr,
      ishtakalaGhati,
      birthPlace,
      country,
      standardTimeName
    },
    geoTime: {
      latitudeStr,
      longitudeStr,
      standardMeridianStr,
      lmtCorrectionStr,
      lmtCorrectionDesc,
      dstCorrectionStr,
      warTimeCorrectionStr,
      lmtTimeStr,
      utcTimeStr
    },
    panchangAstro: {
      shakSambatStr,
      chandraMasaStr,
      pakshaStr,
      suryaMasaStr,
      rituStr,
      ayanaStr,
      srishtiGataVarshaStr,
      aharganaStr
    },
    sunriseAndBirthPanchang: {
      sunriseTithi,
      sunriseTithiGhati,
      sunriseTithiEndTime,
      birthTithi,
      birthTithiProgress,
      sunriseNakshatra,
      sunriseNakshatraGhati,
      sunriseNakshatraEndTime,
      birthNakshatra,
      birthNakshatraProgress,
      sunriseYoga,
      sunriseYogaGhati,
      sunriseYogaEndTime,
      birthYoga,
      birthYogaProgress,
      sunriseKarana,
      sunriseKaranaGhati,
      sunriseKaranaEndTime,
      birthKarana,
      birthKaranaProgress,
      varaName,
      ahoratraGhati
    },
    nakshatraDasha: {
      nakshatraBhogaStr,
      bhayataStr,
      nakshatraPada: nakPada,
      nakshatraPadaStr,
      vimshottariDashaBalanceStr,
      vimshottariLord: vimshLord,
      yoginiDashaBalanceStr,
      yoginiName: yoginiObj.name
    },
    solarAstro: {
      sunriseTimeStr,
      sunsetTimeStr,
      dinmaanGhatiStr,
      dinmaanHoursStr,
      ratrimanGhatiStr,
      ratrimanHoursStr,
      charaStr,
      krantiStr,
      belantaraStr,
      ayanamshaStr
    },
    avakahada: {
      rashi,
      rashiLord,
      nakshatra,
      nakshatraLord,
      namakshara,
      varna,
      vashya,
      yoni,
      vairaYoni,
      gana,
      varga,
      asana,
      nadi,
      yunja,
      hansaka,
      paya: payaStr
    },
    nepalSambat: {
      yearStr: nepalSambatYearStr,
      monthName: nepalSambatMonth,
      fullStr: nepalSambatFullStr
    }
  };
}
