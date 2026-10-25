export type Locale = "ne" | "en" | "sa";

export interface Translations {
  nav: {
    home: string;
    about: string;
    panchangam: string;
    horoscope: string;
    rashifal: string;
    resources: string;
    contact: string;
    explore: string;
    switchLang: string;
  };
  header: {
    title: string;
    subtitle: string;
  };
  hero: {
    welcome: string;
    brand: string;
    subtitle: string;
    viewPanchang: string;
    kundaliService: string;
  };
  panchang: {
    title: string;
    standard: string;
    today: string;
    month: string;
    year: string;
    gate: string;
    day: string;
    bs: string;
    shak: string;
    nepalSambat: string;
    paksha: string;
    shukla: string;
    krishna: string;
    tithi: string;
    until: string;
    next: string;
    ayana: string;
    uttarayana: string;
    dakshinayana: string;
    ritu: string;
    samvatsar: string;
    sunrise: string;
    sunset: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    chandra: string;
    surya: string;
    guru: string;
    liveClock: string;
    liveTime: string;
    ishtakal: string;
    ghati: string;
    pala: string;
    vipala: string;
    regularDay: string;
  };
  features: {
    badge: string;
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card1Btn: string;
    card2Title: string;
    card2Desc: string;
    card2Btn: string;
    card3Title: string;
    card3Desc: string;
    card3Btn: string;
    card4Title: string;
    card4Desc: string;
    card4Btn: string;
  };
  cta: {
    title: string;
    subtitle: string;
    btn: string;
  };
  footer: {
    rights: string;
    powered: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    birthForm: string;
    tabCharts: string;
    tabPlanets: string;
    tabPanchang: string;
    tabDasha: string;
    tabStrengths: string;
    tabVarshaphala: string;
    styleNorth: string;
    styleSouth: string;
    printReport: string;
  };
  about: {
    title: string;
    desc: string;
  };
  months: string[];
  weekdaysShort: { short: string; full: string }[];
  weekdaysFull: string[];
  rashis: string[];
}

export const translations: Record<Locale, Translations> = {
  ne: {
    nav: {
      home: "गृहपृष्ठ",
      about: "हाम्रा बारेमा",
      panchangam: "पञ्चाङ्ग",
      horoscope: "कुण्डली",
      rashifal: "राशिफल",
      resources: "स्रोतहरू",
      contact: "सम्पर्क",
      explore: "अन्वेषण गर्नुहोस्",
      switchLang: "भाषा परिवर्तन"
    },
    header: {
      title: "BASISTHA",
      subtitle: "वैदिक ज्योतिष तथा पञ्चाङ्ग"
    },
    hero: {
      welcome: "स्वागत छ",
      brand: "वसिष्ठ ज्योतिष",
      subtitle: "ताराहरूको ज्ञान उजागर गर्नुहोस् र आफ्नो जीवनलाई ब्रह्माण्डीय ऊर्जासँग मिलाउनुहोस्।",
      viewPanchang: "📅 पञ्चाङ्ग हेर्नुहोस्",
      kundaliService: "कुण्डली सेवा"
    },
    panchang: {
      title: "दैनिक पञ्चाङ्ग तथा प्रत्यक्ष घडी",
      standard: "शुद्ध सूर्यसिद्धान्त अयनांश मानक",
      today: "आज",
      month: "महिना",
      year: "वर्ष",
      gate: "गते",
      day: "दिन",
      bs: "वि.सं.",
      shak: "शाके",
      nepalSambat: "ने.सं.",
      paksha: "पक्ष",
      shukla: "शुक्ल पक्ष:",
      krishna: "कृष्ण पक्ष:",
      tithi: "तिथि",
      until: "सम्म",
      next: "उप्रान्त",
      ayana: "अयन",
      uttarayana: "उत्तरायणं",
      dakshinayana: "दक्षिणायनं",
      ritu: "ऋतु",
      samvatsar: "संवत्सरः",
      sunrise: "सूर्योदय",
      sunset: "सूर्यास्त",
      nakshatra: "नक्षत्र",
      yoga: "योग",
      karana: "करण",
      chandra: "चन्द्र",
      surya: "सूर्य",
      guru: "गुरु",
      liveClock: "प्रत्यक्ष समय",
      liveTime: "नेपाल मानक समय (NST)",
      ishtakal: "इष्टकाल",
      ghati: "घटी",
      pala: "पला",
      vipala: "विपला",
      regularDay: "सामान्य दिन (दैनिक नित्यकर्म)"
    },
    features: {
      badge: "आधुनिक खगोल तथा वैदिक सिद्धान्त",
      title: "Precision Astrology for the Modern World",
      subtitle: "NASA JPL Swiss Ephemeris को उच्च परिशुद्ध गणितीय इन्जिन र पराशर, जैमिनी तथा ताजिक परम्पराको अद्वितीय समन्वय।",
      card1Title: "दैनिक पञ्चाङ्ग तथा मुहूर्त",
      card1Desc: "तिथि, वार, नक्षत्र, योग, करण, सूर्योदय/सूर्यास्त, चौघडिया, होरा तथा राहुकालको सटीक समय गणना।",
      card1Btn: "पञ्चाङ्ग हेर्नुहोस्",
      card2Title: "लग्न तथा १६ वर्ग कुण्डली",
      card2Desc: "D1 (लग्न), D9 (नवांश) देखि D60 (षष्ट्यंश) सम्म अन्तरक्रियात्मक उत्तर तथा दक्षिण भारतीय चक्र।",
      card2Btn: "कुण्डली बनाउनुहोस्",
      card3Title: "विंशोत्तरी तथा योगिनी दशा",
      card3Desc: "महादशा, अन्तर्दशा, प्रत्यन्तर्दशा, सूक्ष्म तथा प्राण दशाको पूर्ण समय तालिका र विश्लेषण।",
      card3Btn: "दशा हेर्नुहोस्",
      card4Title: "३-पृष्ठ मुद्रण-योग्य PDF",
      card4Desc: "एक क्लिकमै ग्राहक वा आफन्तका लागि उच्च गुणस्तरीय ३ पृष्ठको पूर्ण जन्मपत्रिका PDF डाउनलोड गर्नुहोस्।",
      card4Btn: "डाउनलोड गर्नुहोस्"
    },
    cta: {
      title: "आफ्नो ब्रह्माण्डीय यात्रा प्रारम्भ गर्नुहोस्",
      subtitle: "आफ्नो वा परिवारको जन्म विवरण प्रविष्ट गर्नुहोस् र उच्च शुद्धताका साथ कुण्डली, फलादेश तथा पञ्चाङ्ग अध्ययन गर्नुहोस्।",
      btn: "पञ्चाङ्ग तथा कुण्डली खोल्नुहोस्"
    },
    footer: {
      rights: "सर्वाधिकार सुरक्षित।",
      powered: "वसिष्ठ खगोलीय इन्जिनद्वारा सञ्चालित"
    },
    dashboard: {
      title: "वैदिक पञ्चाङ्ग तथा जन्मकुण्डली ड्यासबोर्ड",
      subtitle: "Swiss Ephemeris उच्च-परिशुद्ध खगोलीय इन्जिन • १६ वर्ग कुण्डली • विंशोत्तरी दशा",
      birthForm: "जन्म विवरण फारम",
      tabCharts: "कुण्डली चक्र",
      tabPlanets: "ग्रह स्थिति",
      tabPanchang: "पञ्चाङ्ग विवरण",
      tabDasha: "दशा तालिका",
      tabStrengths: "षड्बल",
      tabVarshaphala: "ताजिक वर्षफल",
      styleNorth: "उत्तर भारतीय",
      styleSouth: "दक्षिण भारतीय",
      printReport: "कुण्डली मुद्रण (Print)"
    },
    about: {
      title: "वसिष्ठ ज्योतिषका बारेमा",
      desc: "हाम्रा बारेमा विस्तृत जानकारी तथा वैदिक ज्योतिष सम्पदा चाँडै पूर्ण रूपमा उपलब्ध हुनेछ।"
    },
    months: [
      "वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
      "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
    ],
    weekdaysShort: [
      { short: "आ", full: "आइतवार" },
      { short: "सो", full: "सोमवार" },
      { short: "मं", full: "मङ्गलबार" },
      { short: "बु", full: "बुधवार" },
      { short: "बि", full: "बिहीवार" },
      { short: "शु", full: "शुक्रवार" },
      { short: "श", full: "शनिवार" }
    ],
    weekdaysFull: [
      "रविवार", "सोमवार", "मङ्गलबार", "बुधवार", "बिहीवार", "शुक्रवार", "शनिवार"
    ],
    rashis: [
      "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
      "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
    ]
  },

  en: {
    nav: {
      home: "Home",
      about: "About Us",
      panchangam: "Panchangam",
      horoscope: "Kundali",
      rashifal: "Horoscope",
      resources: "Resources",
      contact: "Contact",
      explore: "Explore Now",
      switchLang: "Language"
    },
    header: {
      title: "BASISTHA",
      subtitle: "Vedic Astrology & Panchangam"
    },
    hero: {
      welcome: "Welcome to",
      brand: "Basistha Astrology",
      subtitle: "Discover the wisdom of the stars, and align your life with cosmic energy.",
      viewPanchang: "📅 View Panchanga",
      kundaliService: "Kundali Services"
    },
    panchang: {
      title: "Daily Vedic Panchang & Live Clock",
      standard: "Pure Surya Siddhanta Standard",
      today: "Today",
      month: "Month",
      year: "Year",
      gate: "Day",
      day: "Day",
      bs: "BS",
      shak: "Shaka",
      nepalSambat: "NS",
      paksha: "Paksha",
      shukla: "Shukla Paksha",
      krishna: "Krishna Paksha",
      tithi: "Tithi",
      until: "until",
      next: "Next:",
      ayana: "Ayana",
      uttarayana: "Uttarayana",
      dakshinayana: "Dakshinayana",
      ritu: "Season",
      samvatsar: "Samvatsara",
      sunrise: "Sunrise",
      sunset: "Sunset",
      nakshatra: "Nakshatra",
      yoga: "Yoga",
      karana: "Karana",
      chandra: "Moon Sign",
      surya: "Sun Sign",
      guru: "Jupiter Sign",
      liveClock: "Live Clock",
      liveTime: "Nepal Standard Time (NST)",
      ishtakal: "Ishtakala",
      ghati: "Ghati",
      pala: "Pala",
      vipala: "Vipala",
      regularDay: "Regular Day (Daily Rituals)"
    },
    features: {
      badge: "Modern Astronomy & Vedic Principles",
      title: "Precision Astrology for the Modern World",
      subtitle: "State-of-the-art NASA JPL Swiss Ephemeris astronomical calculations unified with Parashara, Jaimini, and Tajika astrological traditions.",
      card1Title: "Daily Panchang & Muhurta",
      card1Desc: "High-precision timings for Tithi, Vara, Nakshatra, Yoga, Karana, Sunrise/Sunset, Chaughadiya, and Rahu Kala.",
      card1Btn: "View Panchang",
      card2Title: "Ascendant & 16 Varga Charts",
      card2Desc: "Interactive North and South Indian style charts covering D1 (Rashi), D9 (Navamsha) up to D60 (Shashtiamsha).",
      card2Btn: "Generate Kundali",
      card3Title: "Vimshottari & Yogini Dasha",
      card3Desc: "Comprehensive timeline and analytics for Mahadasha, Antardasha, Pratyantardasha, Sukshma, and Prana Dasha.",
      card3Btn: "View Dasha",
      card4Title: "3-Page Printable PDF",
      card4Desc: "Instant one-click generation of comprehensive, high-resolution 3-page Kundali PDF reports.",
      card4Btn: "Download PDF"
    },
    cta: {
      title: "Begin Your Cosmic Journey",
      subtitle: "Enter your birth details to explore precision Vedic Kundali, predictive timelines, and daily astronomical Panchangam.",
      btn: "Open Panchang & Kundali"
    },
    footer: {
      rights: "All rights reserved.",
      powered: "Powered by Basistha Astronomical Engine"
    },
    dashboard: {
      title: "Vedic Panchang & Birth Chart Dashboard",
      subtitle: "Swiss Ephemeris Astronomical Engine • 16 Varga Charts • Vimshottari Dasha",
      birthForm: "Birth Details Form",
      tabCharts: "Kundali Charts",
      tabPlanets: "Planetary Positions",
      tabPanchang: "Panchanga Details",
      tabDasha: "Dasha Periods",
      tabStrengths: "Shadbala",
      tabVarshaphala: "Tajika Varshaphala",
      styleNorth: "North Indian",
      styleSouth: "South Indian",
      printReport: "Print Kundali Report"
    },
    about: {
      title: "About Basistha Astrology",
      desc: "Comprehensive insights into the Basistha Vedic heritage, algorithms, and research will be available shortly."
    },
    months: [
      "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
      "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
    ],
    weekdaysShort: [
      { short: "Su", full: "Sunday" },
      { short: "Mo", full: "Monday" },
      { short: "Tu", full: "Tuesday" },
      { short: "We", full: "Wednesday" },
      { short: "Th", full: "Thursday" },
      { short: "Fr", full: "Friday" },
      { short: "Sa", full: "Saturday" }
    ],
    weekdaysFull: [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    rashis: [
      "Aries (Mesha)", "Taurus (Vrisha)", "Gemini (Mithuna)", "Cancer (Karka)",
      "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrischika)",
      "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
    ]
  },

  sa: {
    nav: {
      home: "गृहम्",
      about: "अस्मद्विषये",
      panchangam: "पञ्चाङ्गम्",
      horoscope: "जन्मकुण्डली",
      rashifal: "राशिशुभफलम्",
      resources: "साधनानि",
      contact: "सम्पर्कः",
      explore: "अन्वेषणं कुरुत",
      switchLang: "भाषापरिवर्तनम्"
    },
    header: {
      title: "वसिष्ठः",
      subtitle: "वैदिकज्योतिषं पञ्चाङ्गञ्च"
    },
    hero: {
      welcome: "स्वागतम्",
      brand: "वसिष्ठज्योतिषम्",
      subtitle: "नक्षत्राणां गहनं ज्ञानम् उद्घाटयन्तु, स्वजीवनं च वैश्विकऊर्जया समन्वेतु।",
      viewPanchang: "📅 पञ्चाङ्गं पश्यतु",
      kundaliService: "कुण्डलीसेवा"
    },
    panchang: {
      title: "दैनिकं पञ्चाङ्गं प्रत्यक्षघटी च",
      standard: "शुद्धसूर्यसिद्धान्त-अयनांश-मानकम्",
      today: "अद्य",
      month: "मासः",
      year: "वर्षम्",
      gate: "दिनाङ्कः",
      day: "दिनम्",
      bs: "वै.सं.",
      shak: "शाके",
      nepalSambat: "ने.सं.",
      paksha: "पक्षः",
      shukla: "शुक्लपक्षः",
      krishna: "कृष्णपक्षः",
      tithi: "तिथिः",
      until: "यावत्",
      next: "तदनन्तरम्:",
      ayana: "अयनम्",
      uttarayana: "उत्तरायणम्",
      dakshinayana: "दक्षिणायनम्",
      ritu: "ऋतुः",
      samvatsar: "नामसंवत्सरः",
      sunrise: "सूर्योदयः",
      sunset: "सूर्यास्तः",
      nakshatra: "नक्षत्रम्",
      yoga: "योगः",
      karana: "करणम्",
      chandra: "चन्द्रराशिः",
      surya: "सूर्यराशिः",
      guru: "गुरुराशिः",
      liveClock: "प्रत्यक्षसमयः",
      liveTime: "नेपालमानकसमयः (NST)",
      ishtakal: "इष्टकालः",
      ghati: "घट्यः",
      pala: "पलाः",
      vipala: "विपलाः",
      regularDay: "सामान्यदिनम् (दैनिकनित्यकर्म)"
    },
    features: {
      badge: "आधुनिकखगोलशास्त्रं वैदिकसिद्धान्तश्च",
      title: "जगते परिशुद्धवैदिकज्योतिषम्",
      subtitle: "नासा JPL स्विस इफेमेरिस खगोलीययन्त्रस्य महर्षि-पराशर-जैमिनि-ताजिकपरम्पराणाञ्च अद्वितीयः समन्वयः।",
      card1Title: "दैनिकपञ्चाङ्गं मुहूर्ताश्च",
      card1Desc: "तिथि-वार-नक्षत्र-योग-करण-सूर्योदयास्त-चौघडिया-होरा-राहुकालस्य सूक्ष्मतम-समयगणना।",
      card1Btn: "पञ्चाङ्गं पश्यतु",
      card2Title: "लग्नं षोडशवर्गकुण्डल्यश्च",
      card2Desc: "D1 (लग्नम्), D9 (नवांशः) आरभ्य D60 (षष्ट्यंशः) पर्यन्तम् अन्तर्क्रियात्मकं उत्तर-दक्षिण-भारतीयचक्रम्।",
      card2Btn: "कुण्डलीं रचयतु",
      card3Title: "विंशोत्तरी योगिनी दशा च",
      card3Desc: "महादशा, अन्तर्दशा, प्रत्यन्तर्दशा, सूक्ष्म-प्राणदशायाश्च कालक्रमः गहनं विश्लेषणञ्च।",
      card3Btn: "दशां पश्यतु",
      card4Title: "त्रि-पृष्ठीयं मुद्रणयोग्यं PDF",
      card4Desc: "एकेन क्लिक्-मात्रेण उच्चगुणवत्तायुक्तं त्रि-पृष्ठीयं सम्पूर्णं जन्मपत्रिका-PDF डाउनलोड् कुर्वन्तु।",
      card4Btn: "डाउनलोड् कुर्वन्तु"
    },
    cta: {
      title: "स्वस्य ब्रह्माण्डीययात्राम् आरभत",
      subtitle: "स्वस्य परिवारस्य वा जन्मविवरणं प्रविश्य परिशुद्धकुण्डल्याः, कालचक्रस्य, पञ्चाङ्गस्य च अध्ययनं कुर्वन्तु।",
      btn: "पञ्चाङ्गं कुण्डलीञ्च उद्घाटयतु"
    },
    footer: {
      rights: "सर्वाधिकारः सुरक्षितः।",
      powered: "वसिष्ठ-खगोलीय-यन्त्रेण सञ्चालितम्"
    },
    dashboard: {
      title: "वैदिकपञ्चाङ्गं जन्मकुण्डली-फलकम्",
      subtitle: "स्विस इफेमेरिस उच्चपरिशुद्धयन्त्रम् • षोडशवर्गकुण्डली • विंशोत्तरीदशा",
      birthForm: "जन्मविवरणपत्रम्",
      tabCharts: "कुण्डलीचक्राणि",
      tabPlanets: "ग्रहस्थितयः",
      tabPanchang: "पञ्चाङ्गविवरणम्",
      tabDasha: "दशातालिका",
      tabStrengths: "षड्बलम्",
      tabVarshaphala: "ताजिकवर्षफलम्",
      styleNorth: "उत्तरभारतीयम्",
      styleSouth: "दक्षिणभारतीयम्",
      printReport: "कुण्डलीमुद्रणम् (Print)"
    },
    about: {
      title: "वसिष्ठज्योतिषविषये",
      desc: "अस्मद्विषये वैदिकज्योतिषपरम्पराविषये च विस्तृतविवरणं शीघ्रमेव पूर्णरूपेण उपलप्स्यते।"
    },
    months: [
      "वैशाखः", "ज्येष्ठः", "आषाढः", "श्रावणः", "भाद्रपदः", "आश्विनः",
      "कार्तिकः", "मार्गशीर्षः", "पौषः", "माघः", "फाल्गुनः", "चैत्रः"
    ],
    weekdaysShort: [
      { short: "रवि", full: "रविवासरः" },
      { short: "सोम", full: "सोमवासरः" },
      { short: "भौम", full: "भौमवासरः" },
      { short: "बुध", full: "बुधवासरः" },
      { short: "गुरु", full: "गुरुवासरः" },
      { short: "शुक्र", full: "शुक्रवासरः" },
      { short: "शनि", full: "शनिवासरः" }
    ],
    weekdaysFull: [
      "रविवासरः", "सोमवासरः", "भौमवासरः", "बुधवासरः", "गुरुवासरः", "शुक्रवासरः", "शनिवासरः"
    ],
    rashis: [
      "मेषः", "वृषभः", "मिथुनम्", "कर्कटः", "सिंहः", "कन्या",
      "तुला", "वृश्चिकः", "धनुः", "मकरः", "कुम्भः", "मीनः"
    ]
  }
};
