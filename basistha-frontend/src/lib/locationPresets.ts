export interface CityPreset {
  name: string;
  name_en: string;
  lat: number;
  lon: number;
  tz: number;
}

export interface CountryPreset {
  key: string;
  name: string;
  name_en: string;
  defaultTz: number;
  cities: CityPreset[];
}

export const COUNTRIES_DATA: CountryPreset[] = [
  {
    key: "NP",
    name: "नेपाल (Nepal)",
    name_en: "Nepal",
    defaultTz: 5.75,
    cities: [
      { name: "काठमाडौँ (Kathmandu)", name_en: "Kathmandu", lat: 27.7172, lon: 85.3240, tz: 5.75 },
      { name: "ललितपुर (Lalitpur / Patan)", name_en: "Lalitpur", lat: 27.6710, lon: 85.3206, tz: 5.75 },
      { name: "भक्तपुर (Bhaktapur)", name_en: "Bhaktapur", lat: 27.6710, lon: 85.4298, tz: 5.75 },
      { name: "कास्की / पोखरा (Kaski / Pokhara)", name_en: "Pokhara", lat: 28.2096, lon: 83.9856, tz: 5.75 },
      { name: "चितवन / भरतपुर (Chitwan / Bharatpur)", name_en: "Bharatpur", lat: 27.6833, lon: 84.4333, tz: 5.75 },
      { name: "रूपन्देही / बुटवल / भैरहवा (Rupandehi / Butwal)", name_en: "Butwal", lat: 27.7006, lon: 83.4484, tz: 5.75 },
      { name: "मोरङ / विराटनगर (Morang / Biratnagar)", name_en: "Biratnagar", lat: 26.4525, lon: 87.2718, tz: 5.75 },
      { name: "सुनसरी / धरान / इटहरी (Sunsari / Dharan)", name_en: "Dharan", lat: 26.8124, lon: 87.2834, tz: 5.75 },
      { name: "झापा / विर्तामोड / भद्रपुर (Jhapa / Birtamod)", name_en: "Birtamod", lat: 26.6333, lon: 88.0000, tz: 5.75 },
      { name: "पर्सा / वीरगञ्ज (Parsa / Birgunj)", name_en: "Birgunj", lat: 27.0128, lon: 84.8774, tz: 5.75 },
      { name: "बाँके / नेपालगञ्ज (Banke / Nepalgunj)", name_en: "Nepalgunj", lat: 28.0500, lon: 81.6167, tz: 5.75 },
      { name: "कैलाली / धनगढी (Kailali / Dhangadhi)", name_en: "Dhangadhi", lat: 28.6944, lon: 80.5978, tz: 5.75 },
      { name: "धनुषा / जनकपुर (Dhanusha / Janakpur)", name_en: "Janakpur", lat: 26.7288, lon: 85.9244, tz: 5.75 },
      { name: "मकवानपुर / हेटौँडा (Makwanpur / Hetauda)", name_en: "Hetauda", lat: 27.4289, lon: 85.0322, tz: 5.75 },
      { name: "सुर्खेत / वीरेन्द्रनगर (Surkhet / Birendranagar)", name_en: "Birendranagar", lat: 28.6019, lon: 81.6339, tz: 5.75 },
      { name: "दाङ / घोराही / तुलसीपुर (Dang / Ghorahi)", name_en: "Ghorahi", lat: 28.0500, lon: 82.5000, tz: 5.75 },
      { name: "पाल्पा / तानसेन (Palpa / Tansen)", name_en: "Tansen", lat: 27.8667, lon: 83.5500, tz: 5.75 },
      { name: "स्याङ्जा (Syangja)", name_en: "Syangja", lat: 28.1000, lon: 83.8667, tz: 5.75 },
      { name: "तनहुँ / दमौली (Tanahun / Damauli)", name_en: "Damauli", lat: 27.9667, lon: 84.2833, tz: 5.75 },
      { name: "गोरखा (Gorkha)", name_en: "Gorkha", lat: 28.0000, lon: 84.6333, tz: 5.75 },
      { name: "लमजुङ / बेसीसहर (Lamjung / Besisahar)", name_en: "Besisahar", lat: 28.2333, lon: 84.3833, tz: 5.75 },
      { name: "धादिङ (Dhading)", name_en: "Dhading", lat: 27.8667, lon: 84.9000, tz: 5.75 },
      { name: "नुवाकोट / विदुर (Nuwakot / Bidur)", name_en: "Bidur", lat: 27.9167, lon: 85.1667, tz: 5.75 },
      { name: "काभ्रेपलाञ्चोक / धुलिखेल (Kavre / Dhulikhel)", name_en: "Dhulikhel", lat: 27.6167, lon: 85.5500, tz: 5.75 },
      { name: "सिन्धुपाल्चोक / चौतारा (Sindhupalchok / Chautara)", name_en: "Chautara", lat: 27.7833, lon: 85.7167, tz: 5.75 },
      { name: "दोलखा / चरिकोट (Dolkha / Charikot)", name_en: "Charikot", lat: 27.6667, lon: 86.0333, tz: 5.75 },
      { name: "रामेछाप / मन्थली (Ramechhap / Manthali)", name_en: "Manthali", lat: 27.3833, lon: 86.0667, tz: 5.75 },
      { name: "सिन्धुली / सिन्धुलीमाढी (Sindhuli / Kamalamai)", name_en: "Kamalamai", lat: 27.2500, lon: 85.9667, tz: 5.75 },
      { name: "रसुवा / धुन्चे (Rasuwa / Dhunche)", name_en: "Dhunche", lat: 28.1167, lon: 85.3000, tz: 5.75 },
      { name: "इलाम (Ilam)", name_en: "Ilam", lat: 26.9089, lon: 87.9264, tz: 5.75 },
      { name: "पाँचथर / फिदिम (Panchthar / Phidim)", name_en: "Phidim", lat: 27.1500, lon: 87.7667, tz: 5.75 },
      { name: "ताप्लेजुङ / फुङलिङ (Taplejung)", name_en: "Taplejung", lat: 27.3500, lon: 87.6667, tz: 5.75 },
      { name: "सङ्खुवासभा / खाँदबारी (Sankhuwasabha)", name_en: "Khandbari", lat: 27.3667, lon: 87.2000, tz: 5.75 },
      { name: "भोजपुर (Bhojpur)", name_en: "Bhojpur", lat: 27.1667, lon: 87.0500, tz: 5.75 },
      { name: "धनकुटा (Dhankuta)", name_en: "Dhankuta", lat: 26.9833, lon: 87.3333, tz: 5.75 },
      { name: "तेह्रथुम / म्याङलुङ (Tehrathum)", name_en: "Myanglung", lat: 27.1167, lon: 87.4333, tz: 5.75 },
      { name: "ओखलढुङ्गा (Okhaldhunga)", name_en: "Okhaldhunga", lat: 27.3167, lon: 86.5000, tz: 5.75 },
      { name: "खोटाङ / दिक्तेल (Khotang / Diktel)", name_en: "Diktel", lat: 27.2000, lon: 86.7833, tz: 5.75 },
      { name: "सोलुखुम्बु / सल्लेरी (Solukhumbu / Salleri)", name_en: "Salleri", lat: 27.5000, lon: 86.5833, tz: 5.75 },
      { name: "उदयपुर / गाईघाट (Udayapur / Gaighat)", name_en: "Gaighat", lat: 26.7900, lon: 86.7000, tz: 5.75 },
      { name: "सप्तरी / राजविराज (Saptari / Rajbiraj)", name_en: "Rajbiraj", lat: 26.5400, lon: 86.7500, tz: 5.75 },
      { name: "सिराहा / लहान (Siraha / Lahan)", name_en: "Siraha", lat: 26.6500, lon: 86.2000, tz: 5.75 },
      { name: "महोत्तरी / जलेश्वर (Mahottari / Jaleshwar)", name_en: "Jaleshwar", lat: 26.6500, lon: 85.8000, tz: 5.75 },
      { name: "सर्लाही / मलङ्गवा (Sarlahi / Malangwa)", name_en: "Malangwa", lat: 26.8500, lon: 85.5500, tz: 5.75 },
      { name: "रौतहट / गौर (Rautahat / Gaur)", name_en: "Gaur", lat: 26.7667, lon: 85.2667, tz: 5.75 },
      { name: "बारा / कलैया (Bara / Kalaiya)", name_en: "Kalaiya", lat: 27.0333, lon: 85.0000, tz: 5.75 },
      { name: "म्याग्दी / बेनी (Myagdi / Beni)", name_en: "Beni", lat: 28.3500, lon: 83.5667, tz: 5.75 },
      { name: "पर्वत / कुश्मा (Parbat / Kushma)", name_en: "Kushma", lat: 28.2167, lon: 83.6833, tz: 5.75 },
      { name: "बागलुङ (Baglung)", name_en: "Baglung", lat: 28.2667, lon: 83.6000, tz: 5.75 },
      { name: "मनाङ / चामे (Manang / Chame)", name_en: "Chame", lat: 28.5500, lon: 84.2333, tz: 5.75 },
      { name: "मुस्ताङ / जोमसोम (Mustang / Jomsom)", name_en: "Jomsom", lat: 28.7833, lon: 83.7333, tz: 5.75 },
      { name: "गुल्मी / तम्घास (Gulmi / Tamghas)", name_en: "Tamghas", lat: 28.0667, lon: 83.2500, tz: 5.75 },
      { name: "अर्घाखाँची / सन्धिखर्क (Arghakhanchi)", name_en: "Sandhikharka", lat: 27.9833, lon: 83.1333, tz: 5.75 },
      { name: "कपिलवस्तु / तौलिहवा (Kapilvastu)", name_en: "Taulihawa", lat: 27.5500, lon: 83.0500, tz: 5.75 },
      { name: "नवलपरासी पूर्व / कावासोती (Nawalpur)", name_en: "Kawasoti", lat: 27.6500, lon: 84.1167, tz: 5.75 },
      { name: "नवलपरासी पश्चिम / परासी (Parasi)", name_en: "Parasi", lat: 27.5333, lon: 83.6667, tz: 5.75 },
      { name: "रोल्पा / लिवाङ (Rolpa / Liwang)", name_en: "Liwang", lat: 28.3000, lon: 82.6333, tz: 5.75 },
      { name: "प्युठान / खलङ्गा (Pyuthan)", name_en: "Pyuthan", lat: 28.1000, lon: 82.8833, tz: 5.75 },
      { name: "रुकुम पूर्व / रुकुमकोट (Rukum East)", name_en: "Rukumkot", lat: 28.6000, lon: 82.6333, tz: 5.75 },
      { name: "रुकुम पश्चिम / मुसीकोट (Rukum West)", name_en: "Musikot", lat: 28.6333, lon: 82.4833, tz: 5.75 },
      { name: "सल्यान / खलङ्गा (Salyan)", name_en: "Salyan", lat: 28.3667, lon: 82.1667, tz: 5.75 },
      { name: "जाजरकोट / खलङ्गा (Jajarkot)", name_en: "Jajarkot", lat: 28.7000, lon: 82.2000, tz: 5.75 },
      { name: "दैलेख / नारायण (Dailekh)", name_en: "Dailekh", lat: 28.8333, lon: 81.7167, tz: 5.75 },
      { name: "डोल्पा / दुनै (Dolpa / Dunai)", name_en: "Dunai", lat: 28.9333, lon: 82.9000, tz: 5.75 },
      { name: "जुम्ला / खलङ्गा (Jumla)", name_en: "Jumla", lat: 29.2833, lon: 82.1833, tz: 5.75 },
      { name: "कालिकोट / मान्म (Kalikot / Manma)", name_en: "Manma", lat: 29.1333, lon: 81.6167, tz: 5.75 },
      { name: "मुगु / गमगढी (Mugu / Gamgadhi)", name_en: "Gamgadhi", lat: 29.5500, lon: 82.1667, tz: 5.75 },
      { name: "हुम्ला / सिमिकोट (Humla / Simikot)", name_en: "Simikot", lat: 29.9667, lon: 81.8333, tz: 5.75 },
      { name: "बझाङ / चैनपुर (Bajhang)", name_en: "Chainpur", lat: 29.5667, lon: 81.2000, tz: 5.75 },
      { name: "बाजुरा / मार्तडी (Bajura)", name_en: "Martadi", lat: 29.4500, lon: 81.5000, tz: 5.75 },
      { name: "अछाम / मङ्गलसेन (Achham)", name_en: "Mangalsen", lat: 29.1333, lon: 81.2667, tz: 5.75 },
      { name: "डोटी / सिलगढी (Doti / Silgadhi)", name_en: "Silgadhi", lat: 29.2667, lon: 80.9833, tz: 5.75 },
      { name: "बर्दिया / गुलरिया (Bardiya / Gulariya)", name_en: "Gulariya", lat: 28.2333, lon: 81.3333, tz: 5.75 },
      { name: "डडेल्धुरा (Dadeldhura)", name_en: "Dadeldhura", lat: 29.3000, lon: 80.5833, tz: 5.75 },
      { name: "बैतडी / दशरथचन्द (Baitadi)", name_en: "Baitadi", lat: 29.5333, lon: 80.4167, tz: 5.75 },
      { name: "दार्चुला / खलङ्गा (Darchula)", name_en: "Darchula", lat: 29.8500, lon: 80.5333, tz: 5.75 },
      { name: "कञ्चनपुर / महेन्द्रनगर (Kanchanpur)", name_en: "Mahendranagar", lat: 28.9667, lon: 80.1833, tz: 5.75 }
    ]
  },
  {
    key: "IN",
    name: "भारत (India)",
    name_en: "India",
    defaultTz: 5.5,
    cities: [
      { name: "नयाँ दिल्ली (New Delhi)", name_en: "New Delhi", lat: 28.6139, lon: 77.2090, tz: 5.5 },
      { name: "मुम्बई (Mumbai)", name_en: "Mumbai", lat: 19.0760, lon: 72.8777, tz: 5.5 },
      { name: "वाराणसी / काशी (Varanasi / Kashi)", name_en: "Varanasi", lat: 25.3176, lon: 82.9739, tz: 5.5 },
      { name: "कोलकाता (Kolkata)", name_en: "Kolkata", lat: 22.5726, lon: 88.3639, tz: 5.5 },
      { name: "बेङ्गलोर (Bengaluru)", name_en: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: 5.5 },
      { name: "चेन्नई (Chennai)", name_en: "Chennai", lat: 13.0827, lon: 80.2707, tz: 5.5 },
      { name: "हैदराबाद (Hyderabad)", name_en: "Hyderabad", lat: 17.3850, lon: 78.4867, tz: 5.5 },
      { name: "जयपुर (Jaipur)", name_en: "Jaipur", lat: 26.9124, lon: 75.7873, tz: 5.5 },
      { name: "हरिद्वार (Haridwar)", name_en: "Haridwar", lat: 29.9457, lon: 78.1642, tz: 5.5 },
      { name: "अयोध्या (Ayodhya)", name_en: "Ayodhya", lat: 26.7922, lon: 82.1998, tz: 5.5 },
      { name: "पटना (Patna)", name_en: "Patna", lat: 25.5941, lon: 85.1376, tz: 5.5 },
      { name: "लखनऊ (Lucknow)", name_en: "Lucknow", lat: 26.8467, lon: 80.9462, tz: 5.5 }
    ]
  },
  {
    key: "US",
    name: "संयुक्त राज्य अमेरिका (USA)",
    name_en: "United States",
    defaultTz: -5.0,
    cities: [
      { name: "न्यूयोर्क (New York)", name_en: "New York", lat: 40.7128, lon: -74.0060, tz: -5.0 },
      { name: "वासिङ्टन डिसी (Washington DC)", name_en: "Washington DC", lat: 38.9072, lon: -77.0369, tz: -5.0 },
      { name: "लस एन्जलस (Los Angeles)", name_en: "Los Angeles", lat: 34.0522, lon: -118.2437, tz: -8.0 },
      { name: "सिकागो (Chicago)", name_en: "Chicago", lat: 41.8781, lon: -87.6298, tz: -6.0 },
      { name: "ह्युस्टन / टेक्सास (Houston, TX)", name_en: "Houston", lat: 29.7604, lon: -95.3698, tz: -6.0 },
      { name: "सान फ्रान्सिस्को (San Francisco)", name_en: "San Francisco", lat: 37.7749, lon: -122.4194, tz: -8.0 },
      { name: "डालस (Dallas, TX)", name_en: "Dallas", lat: 32.7767, lon: -96.7970, tz: -6.0 },
      { name: "सिएटल (Seattle, WA)", name_en: "Seattle", lat: 47.6062, lon: -122.3321, tz: -8.0 }
    ]
  },
  {
    key: "GB",
    name: "संयुक्त अधिराज्य / युके (United Kingdom)",
    name_en: "United Kingdom",
    defaultTz: 0.0,
    cities: [
      { name: "लण्डन (London)", name_en: "London", lat: 51.5074, lon: -0.1278, tz: 0.0 },
      { name: "म्यानचेस्टर (Manchester)", name_en: "Manchester", lat: 53.4808, lon: -2.2426, tz: 0.0 },
      { name: "बर्मिङ्घम (Birmingham)", name_en: "Birmingham", lat: 52.4862, lon: -1.8904, tz: 0.0 },
      { name: "एडिनबरा (Edinburgh)", name_en: "Edinburgh", lat: 55.9533, lon: -3.1883, tz: 0.0 }
    ]
  },
  {
    key: "AU",
    name: "अष्ट्रेलिया (Australia)",
    name_en: "Australia",
    defaultTz: 10.0,
    cities: [
      { name: "सिड्नी (Sydney)", name_en: "Sydney", lat: -33.8688, lon: 151.2093, tz: 10.0 },
      { name: "मेलबर्न (Melbourne)", name_en: "Melbourne", lat: -37.8136, lon: 144.9631, tz: 10.0 },
      { name: "ब्रिस्बेन (Brisbane)", name_en: "Brisbane", lat: -27.4698, lon: 153.0251, tz: 10.0 },
      { name: "पर्थ (Perth)", name_en: "Perth", lat: -31.9505, lon: 115.8605, tz: 8.0 },
      { name: "क्यानबेरा (Canberra)", name_en: "Canberra", lat: -35.2809, lon: 149.1300, tz: 10.0 },
      { name: "एडिलेड (Adelaide)", name_en: "Adelaide", lat: -34.9285, lon: 138.6007, tz: 9.5 }
    ]
  },
  {
    key: "CA",
    name: "क्यानडा (Canada)",
    name_en: "Canada",
    defaultTz: -5.0,
    cities: [
      { name: "टोरन्टो (Toronto)", name_en: "Toronto", lat: 43.6532, lon: -79.3832, tz: -5.0 },
      { name: "भ्यानकुभर (Vancouver)", name_en: "Vancouver", lat: 49.2827, lon: -123.1207, tz: -8.0 },
      { name: "ओटावा (Ottawa)", name_en: "Ottawa", lat: 45.4215, lon: -75.6972, tz: -5.0 },
      { name: "क्याल्गरी (Calgary)", name_en: "Calgary", lat: 51.0447, lon: -114.0719, tz: -7.0 },
      { name: "मन्ट्रियल (Montreal)", name_en: "Montreal", lat: 45.5017, lon: -73.5673, tz: -5.0 }
    ]
  },
  {
    key: "AE",
    name: "संयुक्त अरब इमिरेट्स (UAE / Dubai)",
    name_en: "United Arab Emirates",
    defaultTz: 4.0,
    cities: [
      { name: "दुबई (Dubai)", name_en: "Dubai", lat: 25.2048, lon: 55.2708, tz: 4.0 },
      { name: "अबुधाबी (Abu Dhabi)", name_en: "Abu Dhabi", lat: 24.4539, lon: 54.3773, tz: 4.0 },
      { name: "शारजाह (Sharjah)", name_en: "Sharjah", lat: 25.3463, lon: 55.4209, tz: 4.0 }
    ]
  },
  {
    key: "QA",
    name: "कतार (Qatar)",
    name_en: "Qatar",
    defaultTz: 3.0,
    cities: [
      { name: "दोहा (Doha)", name_en: "Doha", lat: 25.2854, lon: 51.5310, tz: 3.0 }
    ]
  },
  {
    key: "SA",
    name: "साउदी अरेबिया (Saudi Arabia)",
    name_en: "Saudi Arabia",
    defaultTz: 3.0,
    cities: [
      { name: "रियाध (Riyadh)", name_en: "Riyadh", lat: 24.7136, lon: 46.6753, tz: 3.0 },
      { name: "जेद्दाह (Jeddah)", name_en: "Jeddah", lat: 21.4858, lon: 39.1925, tz: 3.0 },
      { name: "दम्माम (Dammam)", name_en: "Dammam", lat: 26.4207, lon: 50.0888, tz: 3.0 }
    ]
  },
  {
    key: "KW",
    name: "कुवेत (Kuwait)",
    name_en: "Kuwait",
    defaultTz: 3.0,
    cities: [
      { name: "कुवेत सिटी (Kuwait City)", name_en: "Kuwait City", lat: 29.3759, lon: 47.9774, tz: 3.0 }
    ]
  },
  {
    key: "JP",
    name: "जापान (Japan)",
    name_en: "Japan",
    defaultTz: 9.0,
    cities: [
      { name: "टोकियो (Tokyo)", name_en: "Tokyo", lat: 35.6762, lon: 139.6503, tz: 9.0 },
      { name: "ओसाका (Osaka)", name_en: "Osaka", lat: 34.6937, lon: 135.5023, tz: 9.0 }
    ]
  },
  {
    key: "KR",
    name: "दक्षिण कोरिया (South Korea)",
    name_en: "South Korea",
    defaultTz: 9.0,
    cities: [
      { name: "सोल (Seoul)", name_en: "Seoul", lat: 37.5665, lon: 126.9780, tz: 9.0 }
    ]
  },
  {
    key: "SG",
    name: "सिङ्गापुर (Singapore)",
    name_en: "Singapore",
    defaultTz: 8.0,
    cities: [
      { name: "सिङ्गापुर (Singapore)", name_en: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8.0 }
    ]
  },
  {
    key: "MY",
    name: "मलेसिया (Malaysia)",
    name_en: "Malaysia",
    defaultTz: 8.0,
    cities: [
      { name: "क्वालालम्पुर (Kuala Lumpur)", name_en: "Kuala Lumpur", lat: 3.1390, lon: 101.6869, tz: 8.0 }
    ]
  },
  {
    key: "TH",
    name: "थाइल्याण्ड (Thailand)",
    name_en: "Thailand",
    defaultTz: 7.0,
    cities: [
      { name: "बैङ्कक (Bangkok)", name_en: "Bangkok", lat: 13.7563, lon: 100.5018, tz: 7.0 }
    ]
  },
  {
    key: "DE",
    name: "जर्मनी (Germany)",
    name_en: "Germany",
    defaultTz: 1.0,
    cities: [
      { name: "बर्लिन (Berlin)", name_en: "Berlin", lat: 52.5200, lon: 13.4050, tz: 1.0 },
      { name: "म्युनिख (Munich)", name_en: "Munich", lat: 48.1351, lon: 11.5820, tz: 1.0 },
      { name: "फ्राङ्कफर्ट (Frankfurt)", name_en: "Frankfurt", lat: 50.1109, lon: 8.6821, tz: 1.0 }
    ]
  },
  {
    key: "FR",
    name: "फ्रान्स (France)",
    name_en: "France",
    defaultTz: 1.0,
    cities: [
      { name: "पेरिस (Paris)", name_en: "Paris", lat: 48.8566, lon: 2.3522, tz: 1.0 }
    ]
  },
  {
    key: "CN",
    name: "चीन (China)",
    name_en: "China",
    defaultTz: 8.0,
    cities: [
      { name: "बेइजिङ (Beijing)", name_en: "Beijing", lat: 39.9042, lon: 116.4074, tz: 8.0 },
      { name: "साङ्घाई (Shanghai)", name_en: "Shanghai", lat: 31.2304, lon: 121.4737, tz: 8.0 }
    ]
  },
  {
    key: "BT",
    name: "भुटान (Bhutan)",
    name_en: "Bhutan",
    defaultTz: 6.0,
    cities: [
      { name: "थिम्पु (Thimphu)", name_en: "Thimphu", lat: 27.4728, lon: 89.6393, tz: 6.0 }
    ]
  },
  {
    key: "BD",
    name: "बङ्गलादेश (Bangladesh)",
    name_en: "Bangladesh",
    defaultTz: 6.0,
    cities: [
      { name: "ढाका (Dhaka)", name_en: "Dhaka", lat: 23.8103, lon: 90.4125, tz: 6.0 }
    ]
  }
];

export const AYANAMSHA_PRESETS = [
  { key: "LAHIRI", name: "लाहिडी (Lahiri / Chitra Paksha) - आधिकारिक मानक", desc: "नेपाल तथा भारतको आधिकारिक मानक (चित्रा नक्षत्र १८०°)" },
  { key: "KP", name: "कृष्णमूर्ति (KP Ayanamsha)", desc: "के.पी. ज्योतिष पद्धति अनुसार" },
  { key: "RAMAN", name: "रमण (B.V. Raman Ayanamsha)", desc: "डा. बी.भी. रामन परम्परा" },
  { key: "SURYASIDDHANTA", name: "सूर्य सिद्धान्त (Surya Siddhanta)", desc: "सूर्य सिद्धान्त परम्परागत गणित" },
  { key: "PUSHYA", name: "पुष्यपक्ष (Pushya Paksha Ayanamsha)", desc: "पुष्य नक्षत्र केन्द्रित गणना" },
  { key: "FAGAN", name: "फागन-ब्र्याडली (Fagan-Bradley)", desc: "पाश्चात्य निरयण ज्योतिष" },
  { key: "SAYANA", name: "सायन (Sayana / Zero Ayanamsha)", desc: "सायन पद्धति (Tropical 0° Ayanamsha)" }
];
