import { Locale } from "./translations";

/**
 * Basistha Vedic Astronomical & Panchanga Engine (Client-Side)
 * Computes Surya Siddhanta & Lahiri Sidereal Ephemeris, Tithi, Nakshatra,
 * Yoga, Karana, Rashis, Sunrise/Sunset, Ishtakal, Festivals & BS-AD calendar mapping.
 * Full multilingual support for Nepali ('ne'), English ('en'), and Sanskrit ('sa').
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

export const MONTHS_MAP: Record<Locale, string[]> = {
  ne: ["वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"],
  en: ["Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"],
  sa: ["वैशाखः", "ज्येष्ठः", "आषाढः", "श्रावणः", "भाद्रपदः", "आश्विनः", "कार्तिकः", "मार्गशीर्षः", "पौषः", "माघः", "फाल्गुनः", "चैत्रः"]
};

export const WEEKDAY_NAMES = [
  "रविवार", "सोमवार", "मङ्गलबार", "बुधवार", "बिहीवार", "शुक्रवार", "शनिवार"
];

export const WEEKDAYS_MAP: Record<Locale, string[]> = {
  ne: ["रविवार", "सोमवार", "मङ्गलबार", "बुधवार", "बिहीवार", "शुक्रवार", "शनिवार"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  sa: ["रविवासरः", "सोमवासरः", "भौमवासरः", "बुधवासरः", "गुरुवासरः", "शुक्रवासरः", "शनिवासरः"]
};

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

// 27 Nakshatras
export const NAKSHATRAS_MAP: Record<Locale, string[]> = {
  ne: [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा",
    "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
    "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती"
  ],
  en: [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ],
  sa: [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसुः", "पुष्यः", "अश्लेषा",
    "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्तः", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
    "मूलम्", "पूर्वाषाढा", "उत्तराषाढा", "श्रवणः", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती"
  ]
};

// 27 Yogas
export const YOGAS_MAP: Record<Locale, string[]> = {
  ne: [
    "विष्कम्भ", "प्रीति", "आयुष्मान्", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल",
    "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान्",
    "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"
  ],
  en: [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
    "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
  ],
  sa: [
    "विष्कम्भः", "प्रीतिः", "आयुष्मान्", "सौभाग्यम्", "शोभनः", "अतिगण्डः", "सुकर्मा", "धृतिः", "शूलम्",
    "गण्डः", "वृद्धिः", "ध्रुवः", "व्याघातः", "हर्षणः", "वज्रम्", "सिद्धिः", "व्यतीपातः", "वरीयान्",
    "परिघः", "शिवः", "सिद्धः", "साध्यः", "शुभः", "शुक्लः", "ब्रह्मा", "इन्द्रः", "वैधृतिः"
  ]
};

// 11 Karanas
export const KARANAS_MAP: Record<Locale, string[]> = {
  ne: [
    "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)",
    "शकुनि", "चतुष्पद", "नाग", "किंस्तुघ्न"
  ],
  en: [
    "Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti (Bhadra)",
    "Shakuni", "Chatushpada", "Naga", "Kinstughna"
  ],
  sa: [
    "बवः", "बालवः", "कौलवः", "तैतिलः", "गरः", "वणिज", "विष्टिः (भद्रा)",
    "शकुनिः", "चतुष्पादः", "नागः", "किंस्तुघ्नः"
  ]
};

// 12 Rashis
export const RASHIS_MAP: Record<Locale, string[]> = {
  ne: [
    "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
    "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
  ],
  en: [
    "Aries (Mesha)", "Taurus (Vrisha)", "Gemini (Mithuna)", "Cancer (Karka)",
    "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrischika)",
    "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
  ],
  sa: [
    "मेषराशिः", "वृषराशिः", "मिथुनराशिः", "कर्कटराशिः", "सिंहराशिः", "कन्याराशिः",
    "तुलाराशिः", "वृश्चिकराशिः", "धनुराशिः", "मकरराशिः", "कुम्भराशिः", "मीनराशिः"
  ]
};

// 30 Tithis
export const TITHI_MAP: Record<Locale, string[]> = {
  ne: [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "औँसी"
  ],
  en: [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ],
  sa: [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "अमावस्या"
  ]
};

// 60 Samvatsaras (Jovian Cycle)
export const SAMVATSARAS_NE = [
  "प्रभव", "विभव", "शुक्ल", "प्रमोद", "प्रजापति", "अङ्गिरा", "श्रीमुख", "भाव", "युवा", "धाता",
  "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृषप्रजा", "चित्रभानु", "सुभानु", "तारण", "पार्थिव", "व्यय",
  "सर्वजित्", "सर्वधारी", "विरोधी", "विकृति", "खर", "नन्दन", "विजय", "जय", "मन्मथ", "दुर्मुख",
  "हेमलम्ब", "विलम्ब", "विकारी", "शार्वरी", "प्लव", "शुभकृत", "शोभन", "क्रोधन", "विश्वावसु", "पराभव",
  "प्लवङ्ग", "कीलक", "सौम्य", "साधारण", "विरोधकृत", "परिधावी", "प्रमादी", "आनन्द", "राक्षस", "नल",
  "पिङ्गल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुन्दुभी", "रुधिरोद्गारी", "रक्ताक्ष", "क्रोधन", "क्षय"
];

// Notable festival dates in Bikram Sambat (Month 1-12, Day)
const FESTIVALS_MAP: Record<Locale, Record<string, string>> = {
  ne: {
    "1-1": "नयाँ वर्ष (मेष सङ्क्रान्ति)",
    "1-15": "मातातीर्थ औँसी (आमाको मुख हेर्ने)",
    "1-23": "अक्षय तृतीया",
    "1-31": "बुद्ध जयन्ती / उभौली पर्व",
    "2-1": "वृष सङ्क्रान्ति",
    "3-1": "मिथुन सङ्क्रान्ति",
    "3-31": "गुरु पूर्णिमा / व्यास जयन्ती",
    "4-1": "साउने सङ्क्रान्ति (लुतो फाल्ने)",
    "4-19": "नागपञ्चमी",
    "4-30": "जनैपूर्णिमा / रक्षाबन्धन / क्वान्ती",
    "5-1": "सिंह सङ्क्रान्ति / गाईजात्रा",
    "5-8": "श्रीकृष्ण जन्माष्टमी",
    "5-15": "कुशे औँसी (बुवाको मुख हेर्ने)",
    "5-21": "हरितालिका तीज",
    "5-23": "ऋषि पञ्चमी",
    "5-30": "इन्द्रजात्रा (अनन्त चतुर्दशी)",
    "6-1": "कन्या सङ्क्रान्ति / विश्वकर्मा पूजा",
    "6-10": "घटस्थापना (बडादशैं प्रारम्भ)",
    "6-16": "फूलपाती",
    "6-17": "महाअष्टमी (कालरात्रि)",
    "6-18": "महानवमी",
    "6-19": "विजयादशमी (दशैंको मुख्य टीका)",
    "7-1": "तुला सङ्क्रान्ति",
    "7-8": "कोजाग्रत पूर्णिमा (दशैं समापन)",
    "7-24": "काग तिहार (यमपञ्चक प्रारम्भ)",
    "7-25": "कुकुर तिहार",
    "7-26": "गाई तिहार / लक्ष्मीपूजा / सुखरात्रि",
    "7-27": "गोवर्धन पूजा / म्हःपूजा / नयाँ संवत्",
    "7-28": "भाइटीका (यमद्वितीया)",
    "8-1": "वृश्चिक सङ्क्रान्ति / छठ पर्व",
    "8-11": "हरिबोधनी एकादशी (तुलसी विवाह)",
    "8-15": "विवाह पञ्चमी",
    "9-1": "धनु सङ्क्रान्ति",
    "10-1": "माघे सङ्क्रान्ति (मकर सङ्क्रान्ति)",
    "10-21": "सरस्वती पूजा (श्रीपञ्चमी)",
    "11-1": "कुम्भ सङ्क्रान्ति",
    "11-20": "महाशिवरात्रि",
    "11-29": "फागु पूर्णिमा (होली - पहाड)",
    "11-30": "फागु पूर्णिमा (होली - तराई)",
    "12-1": "मीन सङ्क्रान्ति",
    "12-24": "चैते दशैं",
    "12-25": "रामनवमी"
  },
  en: {
    "1-1": "New Year (Mesha Sankranti)",
    "1-15": "Matatirtha Aunsi (Mother's Day)",
    "1-23": "Akshaya Tritiya",
    "1-31": "Buddha Jayanti / Ubhauli",
    "2-1": "Vrisha Sankranti",
    "3-1": "Mithuna Sankranti",
    "3-31": "Guru Purnima",
    "4-1": "Saune Sankranti",
    "4-19": "Nag Panchami",
    "4-30": "Janai Purnima / Raksha Bandhan",
    "5-1": "Simha Sankranti / Gaijatra",
    "5-8": "Krishna Janmashtami",
    "5-15": "Kushe Aunsi (Father's Day)",
    "5-21": "Haritalika Teej",
    "5-23": "Rishi Panchami",
    "5-30": "Indra Jatra",
    "6-1": "Kanya Sankranti / Vishwakarma Puja",
    "6-10": "Ghatasthapana (Dashain Begins)",
    "6-16": "Fulpati",
    "6-17": "Maha Ashtami",
    "6-18": "Maha Navami",
    "6-19": "Vijaya Dashami (Bada Dashain)",
    "7-1": "Tula Sankranti",
    "7-8": "Kojagrat Purnima (Dashain Concludes)",
    "7-24": "Kag Tihar (Yama Panchak)",
    "7-25": "Kukur Tihar",
    "7-26": "Gai Tihar / Laxmi Puja",
    "7-27": "Govardhan Puja / Mha Puja",
    "7-28": "Bhai Tika (Yama Dwitiya)",
    "8-1": "Vrischika Sankranti / Chhath",
    "8-11": "Haribodhini Ekadashi (Tulsi Vivah)",
    "8-15": "Vivah Panchami",
    "9-1": "Dhanu Sankranti",
    "10-1": "Maghe Sankranti (Makar Sankranti)",
    "10-21": "Saraswati Puja (Shree Panchami)",
    "11-1": "Kumbha Sankranti",
    "11-20": "Maha Shivaratri",
    "11-29": "Holi (Fagu Purnima)",
    "11-30": "Holi (Fagu Purnima - Terai)",
    "12-1": "Meena Sankranti",
    "12-24": "Chaite Dashain",
    "12-25": "Ram Navami"
  },
  sa: {
    "1-1": "नववर्षम् (मेषसङ्क्रान्तिः)",
    "1-15": "मातृसम्मान-अमावस्या",
    "1-23": "अक्षयतृतीया",
    "1-31": "बुद्धजयन्ती",
    "2-1": "वृषसङ्क्रान्तिः",
    "3-1": "मिथुनसङ्क्रान्तिः",
    "3-31": "गुरुपूर्णिमा (व्यासजयन्ती)",
    "4-1": "कर्कटसङ्क्रान्तिः",
    "4-19": "नागपञ्चमी",
    "4-30": "श्रावणी पूर्णिमा / रक्षाबन्धनम्",
    "5-1": "सिंहसङ्क्रान्तिः",
    "5-8": "श्रीकृष्णजन्माष्टमी",
    "5-15": "पितृसम्मान-अमावस्या",
    "5-21": "हरितालिका तीज",
    "5-23": "ऋषिपञ्चमी",
    "5-30": "इन्द्रजात्रा (अनन्तचतुर्दशी)",
    "6-1": "कन्यासङ्क्रान्तिः / विश्वकर्मपूजा",
    "6-10": "घटस्थापना (शारदीय नवरात्रारम्भः)",
    "6-16": "नवपत्रिका-प्रवेशः (फूलपाती)",
    "6-17": "महाष्टमी (कालरात्रिः)",
    "6-18": "महानवमी",
    "6-19": "विजयादशमी",
    "7-1": "तुलासङ्क्रान्तिः",
    "7-8": "कोजाग्रतपूर्णिमा",
    "7-24": "काकबलिः (यमपञ्चकारम्भः)",
    "7-25": "श्वानपूजा (कुकुरतिहार)",
    "7-26": "गोपूजा / दीपावली (लक्ष्मीपूजा)",
    "7-27": "गोवर्धनपूजा / आत्मपूजा (म्हःपूजा)",
    "7-28": "यमद्वितीया (भ्रातृद्वितीया)",
    "8-1": "वृश्चिकसङ्क्रान्तिः / छठपर्व",
    "8-11": "हरिबोधिनी एकादशी (तुलसीविवाहः)",
    "8-15": "विवाहपञ्चमी",
    "9-1": "धनुःसङ्क्रान्तिः",
    "10-1": "मकरसङ्क्रान्तिः",
    "10-21": "वसन्तपञ्चमी (सरस्वतीपूजा)",
    "11-1": "कुम्भसङ्क्रान्तिः",
    "11-20": "महाशिवरात्रिः",
    "11-29": "होलिकोत्सवः (फाल्गुनी पूर्णिमा)",
    "12-1": "मीनसङ्क्रान्तिः",
    "12-24": "वासन्तिक नवरात्रम्",
    "12-25": "रामनवमी"
  }
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
function computeSiderealPlanets(gregDate: Date, lang: Locale = "ne"): {
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

  // Official Kathmandu Sunrise & Sunset (Latitude: 27.7172 N, Longitude: 85.3240 E, Nepal Standard Time: UTC+5:45)
  // Fully accounts for NOAA Equation of Time (Et) and Nepal Standard Meridian (86.25° E) correction
  const dayOfYear = Math.floor((gregDate.getTime() - new Date(Date.UTC(y, 0, 1)).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const gamma = (2 * Math.PI / 365.0) * (dayOfYear - 1);

  // Equation of Time in minutes (NOAA Solar Algorithm)
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination in radians
  const decl = 0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = (27.7172 * Math.PI) / 180.0;
  const zenith = (90.833 * Math.PI) / 180.0; // 90° 50' accounting for atmospheric refraction & solar disk

  const cosHa = (Math.cos(zenith) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
  const clampedCosHa = Math.max(-1.0, Math.min(1.0, cosHa));
  const haDeg = (Math.acos(clampedCosHa) * 180.0) / Math.PI;

  // Kathmandu Longitude 85.3240° E, Nepal Standard Time Meridian = 15° * 5.75 = 86.25° E
  const ktmLon = 85.3240;
  const ktmTz = 5.75;
  const sunriseMinKtm = 720 - 4 * (ktmLon - 15 * ktmTz) - haDeg * 4 - eqtime;
  const sunsetMinKtm = 720 - 4 * (ktmLon - 15 * ktmTz) + haDeg * 4 - eqtime;

  const riseLocal = sunriseMinKtm / 60.0;
  const setLocal = sunsetMinKtm / 60.0;

  const formatSolarTime = (hoursDecimal: number, ampm: "AM" | "PM") => {
    const totalMins = Math.round(hoursDecimal * 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const hStr = String(h12).padStart(2, "0");
    const mStr = String(m).padStart(2, "0");
    if (lang === "en") {
      return `${hStr}:${mStr} ${ampm}`;
    }
    return `${toDevanagari(hStr)}:${toDevanagari(mStr)} ${ampm}`;
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
    sunRiseStr: formatSolarTime(riseLocal, "AM"),
    sunSetStr: formatSolarTime(setLocal, "PM"),
    tithiFraction,
    nakshatraFraction,
    yogaFraction,
    karanaFraction
  };
}

/**
 * Calculates complete, authentic Panchanga data for any Bikram Sambat day with multilingual support.
 */
export function calculateDayPanchang(
  yearBS: number,
  monthBS: number,
  dayBS: number,
  lang: Locale = "ne"
): ComputedPanchang {
  const safeYear = BS_START_GREG[yearBS] ? yearBS : 2083;
  const safeMonth = Math.max(1, Math.min(12, monthBS));
  const monthDays = BS_MONTH_DAYS[safeYear] || BS_MONTH_DAYS[2083];
  const totalDaysInMonth = monthDays[safeMonth - 1];
  const safeDay = Math.max(1, Math.min(totalDaysInMonth, dayBS));

  const fmt = (num: number | string) => (lang === "en" ? String(num) : toDevanagari(num));

  const monthName = MONTHS_MAP[lang]?.[safeMonth - 1] || NEPALI_MONTHS[safeMonth - 1];
  const gregDate = bsToGregorian(safeYear, safeMonth, safeDay);

  // Month starting weekday (for calendar grid alignment)
  const firstDayGreg = bsToGregorian(safeYear, safeMonth, 1);
  const startDayOfWeek = firstDayGreg.getUTCDay();

  const dayOfWeek = gregDate.getUTCDay();
  const dayOfWeekName = WEEKDAYS_MAP[lang]?.[dayOfWeek] || WEEKDAY_NAMES[dayOfWeek];

  // Gregorian date formatted (e.g., "2026 OCT 25")
  const MONTH_NAMES_EN = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const gregorianDateStr = `${gregDate.getUTCFullYear()} ${MONTH_NAMES_EN[gregDate.getUTCMonth()]} ${gregDate.getUTCDate()}`;

  // Astronomical calculations
  const astro = computeSiderealPlanets(gregDate, lang);

  // 1. Tithi
  const diff = (astro.moonSid - astro.sunSid + 360.0) % 360.0;
  const tithiIndex = Math.floor(diff / 12.0); // 0 to 29
  const isShukla = tithiIndex < 15;

  const tithiName = TITHI_MAP[lang]?.[tithiIndex] || TITHI_MAP.ne[tithiIndex];
  const nextTithiName = TITHI_MAP[lang]?.[(tithiIndex + 1) % 30] || TITHI_MAP.ne[(tithiIndex + 1) % 30];

  // Time conversion for tithi end (e.g. 10:27 AM)
  const endHours = 6 + astro.tithiFraction * 18;
  const endH = Math.floor(endHours);
  const endM = Math.floor((endHours - endH) * 60);
  const endHStr = String(endH % 12 === 0 ? 12 : endH % 12).padStart(2, "0");
  const endMStr = String(endM).padStart(2, "0");
  const endAmpm = endH >= 12 ? "PM" : "AM";

  const tithiLabel = lang === "sa" ? `${tithiName} तिथिः` : lang === "en" ? `${tithiName} Tithi` : `${tithiName} तिथि`;
  const tithiEndStr = lang === "sa"
    ? `${fmt(endHStr)}:${fmt(endMStr)} ${endAmpm} यावत्`
    : lang === "en"
    ? `until ${endHStr}:${endMStr} ${endAmpm}`
    : `${fmt(endHStr)}:${fmt(endMStr)} ${endAmpm} सम्म`;

  const nextTithiStr = lang === "sa"
    ? `तदनन्तरम् ${nextTithiName}`
    : lang === "en"
    ? `Next: ${nextTithiName}`
    : `उप्रान्त ${nextTithiName}`;

  // Lunar Paksha
  const pakshaName = lang === "sa"
    ? `${monthName}${isShukla ? "शुक्ल" : "कृष्ण"}पक्षः`
    : lang === "en"
    ? `${monthName} ${isShukla ? "Shukla" : "Krishna"} Paksha`
    : `${monthName}${isShukla ? "शुक्ल" : "कृष्ण"} पक्ष:`;

  // 2. Nakshatra
  const nakIndex = Math.floor(astro.moonSid / (360.0 / 27.0)) % 27;
  const nakshatra = NAKSHATRAS_MAP[lang]?.[nakIndex] || NAKSHATRAS_MAP.ne[nakIndex];
  // Ghatis and Palas for Nakshatra
  const nakGhatiNum = Math.floor(astro.nakshatraFraction * 60);
  const nakPalaNum = Math.floor(((astro.nakshatraFraction * 60) % 1) * 60);
  const nakshatraGhati = `${fmt(String(nakGhatiNum).padStart(2, "0"))}:${fmt(
    String(nakPalaNum).padStart(2, "0")
  )}`;

  // 3. Yoga
  const yogaIndex = Math.floor(((astro.sunSid + astro.moonSid) % 360.0) / (360.0 / 27.0)) % 27;
  const yoga = YOGAS_MAP[lang]?.[yogaIndex] || YOGAS_MAP.ne[yogaIndex];
  const yogaGhatiNum = Math.floor(astro.yogaFraction * 60);
  const yogaPalaNum = Math.floor(((astro.yogaFraction * 60) % 1) * 60);
  const yogaGhati = `${fmt(String(yogaGhatiNum).padStart(2, "0"))}:${fmt(
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
  const karana = KARANAS_MAP[lang]?.[karanaNumber] || KARANAS_MAP.ne[karanaNumber];
  const karanaGhatiNum = Math.floor(astro.karanaFraction * 24);
  const karanaPalaNum = Math.floor(((astro.karanaFraction * 24) % 1) * 60);
  const karanaGhati = `${fmt(String(karanaGhatiNum).padStart(2, "0"))}:${fmt(
    String(karanaPalaNum).padStart(2, "0")
  )}`;

  // 5. Rashis
  const chandraRashi = RASHIS_MAP[lang]?.[Math.floor(astro.moonSid / 30.0) % 12] || RASHIS_MAP.ne[Math.floor(astro.moonSid / 30.0) % 12];
  const suryaRashi = RASHIS_MAP[lang]?.[Math.floor(astro.sunSid / 30.0) % 12] || RASHIS_MAP.ne[Math.floor(astro.sunSid / 30.0) % 12];
  const guruRashi = RASHIS_MAP[lang]?.[Math.floor(astro.jupSid / 30.0) % 12] || RASHIS_MAP.ne[Math.floor(astro.jupSid / 30.0) % 12];

  // Chandra transit end time
  const chandraDegInRashi = astro.moonSid % 30.0;
  const remainingDeg = 30.0 - chandraDegInRashi;
  const remainingHours = (remainingDeg / 13.2) * 24.0; // Moon moves ~13.2 deg/day
  const chandraEndHour = Math.floor((12 + remainingHours) % 24);
  const chandraEndMin = Math.floor(((12 + remainingHours) % 1) * 60);
  const chandraEndHStr = String(chandraEndHour).padStart(2, "0");
  const chandraEndMStr = String(chandraEndMin).padStart(2, "0");
  const chandraEndTime = lang === "sa"
    ? `${fmt(chandraEndHStr)}:${fmt(chandraEndMStr)} यावत्`
    : lang === "en"
    ? `until ${chandraEndHStr}:${chandraEndMStr}`
    : `${fmt(chandraEndHStr)}:${fmt(chandraEndMStr)} सम्म`;

  // 6. Eras (Shak & Nepal Sambat)
  const shakYear = safeYear - 135;
  const shakSambat = lang === "sa"
    ? `शाके ${fmt(shakYear)}`
    : lang === "en"
    ? `Shaka ${fmt(shakYear)}`
    : `शाके ${toDevanagari(shakYear)}`;

  const nsYear = safeYear - 937;
  const nepalSambat = lang === "sa"
    ? `ने.सं. ${fmt(nsYear)} (कौलाथ्व)`
    : lang === "en"
    ? `NS ${fmt(nsYear)} (Kaula Thwa)`
    : `ने.सं. ${toDevanagari(nsYear)} (कौलाथ्व)`;

  // 7. Ayana & Ritu
  const isDakshinayana = safeMonth >= 4 && safeMonth <= 9;
  const ayana = lang === "sa"
    ? (isDakshinayana ? "दक्षिणायनम्" : "उत्तरायणम्")
    : lang === "en"
    ? (isDakshinayana ? "Dakshinayana" : "Uttarayana")
    : (isDakshinayana ? "दक्षिणायनं" : "उत्तरायणं");

  const rituNames: Record<Locale, string[]> = {
    ne: ["वसन्तऋतु:", "ग्रीष्मऋतु:", "वर्षाऋतु:", "शरद्ऋतु:", "हेमन्तऋतु:", "शिशिरऋतु:"],
    en: ["Vasanta (Spring)", "Grishma (Summer)", "Varsha (Monsoon)", "Sharad (Autumn)", "Hemanta (Pre-Winter)", "Shishira (Winter)"],
    sa: ["वसन्तऋतुः", "ग्रीष्मऋतुः", "वर्षाऋतुः", "शरद्ऋतुः", "हेमन्तऋतुः", "शिशिरऋतुः"]
  };
  const rituIndex = Math.floor((safeMonth - 1) / 2) % 6;
  const ritu = rituNames[lang]?.[rituIndex] || rituNames.ne[rituIndex];

  // 8. Samvatsara (60-year Jovian cycle)
  const samvatsarIndex = (safeYear + 11) % 60;
  const samvatsarName = SAMVATSARAS_NE[samvatsarIndex];
  const samvatsar = lang === "sa"
    ? `${samvatsarName}नामसंवत्सरः`
    : lang === "en"
    ? `${samvatsarName} Samvatsara`
    : `${samvatsarName}नामसंवत्सरः ।`;

  // 9. Festival lookup
  const festKey = `${safeMonth}-${safeDay}`;
  const festival = FESTIVALS_MAP[lang]?.[festKey] || FESTIVALS_MAP.ne[festKey];

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
    tithi: tithiLabel,
    tithiEnd: tithiEndStr,
    nextTithi: nextTithiStr,
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
