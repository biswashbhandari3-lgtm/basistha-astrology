"""
Basistha Astronomical Engine
Panchanga & Muhurta Calculation Module
"""
import math
from datetime import datetime, time, timedelta
from typing import Dict, Any, List, Tuple
from app.core.swisseph_wrapper import (
    get_julian_day, get_ayanamsha_value, calc_planet_position,
    NAKSHATRA_NAMES, NAKSHATRA_NAMES_NE, PLANET_IDS
)

TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
]

TITHI_NAMES_NE = [
    "शुक्ल प्रतिपदा", "शुक्ल द्वितीया", "शुक्ल तृतीया", "शुक्ल चतुर्थी", "शुक्ल पञ्चमी",
    "शुक्ल षष्ठी", "शुक्ल सप्तमी", "शुक्ल अष्टमी", "शुक्ल नवमी", "शुक्ल दशमी",
    "शुक्ल एकादशी", "शुक्ल द्वादशी", "शुक्ल त्रयोदशी", "शुक्ल चतुर्दशी", "पूर्णिमा",
    "कृष्ण प्रतिपदा", "कृष्ण द्वितीया", "कृष्ण तृतीया", "कृष्ण चतुर्थी", "कृष्ण पञ्चमी",
    "कृष्ण षष्ठी", "कृष्ण सप्तमी", "कृष्ण अष्टमी", "कृष्ण नवमी", "कृष्ण दशमी",
    "कृष्ण एकादशी", "कृष्ण द्वादशी", "कृष्ण त्रयोदशी", "कृष्ण चतुर्दशी", "औँसी"
]

YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
    "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
]

YOGA_NAMES_NE = [
    "विष्कम्भ", "प्रीति", "आयुष्मान्", "सौभाग्य", "शोभन", "अतिगण्ड",
    "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव",
    "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान्",
    "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल",
    "ब्रह्म", "इन्द्र", "वैधृति"
]

KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
]

KARANA_NAMES_NE = [
    "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)",
    "शकुनि", "चतुष्पद", "नाग", "किंस्तुघ्न"
]

VARA_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
VARA_NAMES_NE = ["आइतबार (रविवार)", "सोमबार", "मङ्गलबार", "बुधबार", "बिहीबार (गुरुवार)", "शुक्रबार", "शनिबार"]

CHOGHADIYA_ORDER_DAY = {
    0: ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"], # Sunday
    1: ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"], # Monday
    2: ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],   # Tuesday
    3: ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"], # Wednesday
    4: ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"], # Thursday
    5: ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"],  # Friday
    6: ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"]   # Saturday
}

CHOGHADIYA_NAMES_NE = {
    "Shubh": "शुभ (उत्तम)", "Labh": "लाभ (उन्नति)", "Amrit": "अमृत (सर्वोत्तम)",
    "Char": "चर (सामान्य)", "Rog": "रोग (हानि)", "Kaal": "काल (अशुभ)", "Udveg": "उद्वेग (चिन्ता)"
}

RAHUKAAL_INTERVALS = {
    0: (8, 9.5),   # Sunday: 16:30 - 18:00 (approx 8th part)
    1: (1.5, 3),   # Monday: 07:30 - 09:00 (2nd part)
    2: (7, 8.5),   # Tuesday: 15:00 - 16:30 (7th part)
    3: (4.5, 6),   # Wednesday: 12:00 - 13:30 (5th part)
    4: (6, 7.5),   # Thursday: 13:30 - 15:00 (6th part)
    5: (3, 4.5),   # Friday: 10:30 - 12:00 (4th part)
    6: (3, 4.5)    # Saturday: 09:00 - 10:30 (3rd part)
}

def calc_approx_sun_times(year: int, month: int, day: int, lat: float, lon: float, tz_offset: float) -> Tuple[datetime, datetime]:
    """Calculate local Sunrise and Sunset times."""
    # Approximate solar noon and equation of time
    d = datetime(year, month, day)
    day_of_year = d.timetuple().tm_yday
    # Solar declination
    decl = 23.45 * math.sin(math.radians((360.0 / 365.0) * (day_of_year - 81)))
    decl_rad = math.radians(decl)
    lat_rad = math.radians(lat)
    
    # Hour angle for zenith 90°50' (accounting for refraction and semi-diameter)
    cos_h = (math.cos(math.radians(90.833)) - math.sin(lat_rad) * math.sin(decl_rad)) / (math.cos(lat_rad) * math.cos(decl_rad))
    cos_h = max(-1.0, min(1.0, cos_h))
    h_hours = math.degrees(math.acos(cos_h)) / 15.0
    
    solar_noon_utc = 12.0 - (lon / 15.0)
    rise_utc = solar_noon_utc - h_hours
    set_utc = solar_noon_utc + h_hours
    
    rise_local = rise_utc + tz_offset
    set_local = set_utc + tz_offset
    
    rise_dt = d + timedelta(hours=rise_local)
    set_dt = d + timedelta(hours=set_local)
    return rise_dt, set_dt

def get_panchang(year: int, month: int, day: int, lat: float, lon: float, tz_offset: float = 5.75) -> Dict[str, Any]:
    """Compute complete 5 elements of Panchang + Muhurtas."""
    jd = get_julian_day(year, month, day, 6, 0, 0.0, tz_offset)
    ayan_val = get_ayanamsha_value(jd, "LAHIRI")
    
    sun_lon, _ = calc_planet_position(jd, PLANET_IDS["SUN"], ayan_val)
    moon_lon, _ = calc_planet_position(jd, PLANET_IDS["MOON"], ayan_val)
    
    # 1. Tithi: (Moon - Sun) / 12
    diff = (moon_lon - sun_lon) % 360.0
    tithi_num = int(diff / 12.0) + 1
    tithi_rem = (diff % 12.0) / 12.0
    
    # 2. Nakshatra: Moon / (13° 20')
    nak_num = int(moon_lon / (360.0 / 27.0))
    nak_rem = (moon_lon % (360.0 / 27.0)) / (360.0 / 27.0)
    
    # 3. Yoga: (Sun + Moon) / (13° 20')
    sum_deg = (sun_lon + moon_lon) % 360.0
    yoga_num = int(sum_deg / (360.0 / 27.0))
    yoga_rem = (sum_deg % (360.0 / 27.0)) / (360.0 / 27.0)
    
    # 4. Karana: (Moon - Sun) / 6
    karana_idx = int(diff / 6.0)
    if karana_idx == 0:
        karana_num = 10 # Kimstughna
    elif karana_idx >= 57:
        fixed_map = {57: 7, 58: 8, 59: 9}
        karana_num = fixed_map.get(karana_idx, 7)
    else:
        karana_num = (karana_idx - 1) % 7
    karana_rem = (diff % 6.0) / 6.0
    
    # 5. Vara
    d = datetime(year, month, day)
    weekday = (d.weekday() + 1) % 7 # 0 = Sunday
    
    # Sunrise & Sunset
    rise_dt, set_dt = calc_approx_sun_times(year, month, day, lat, lon, tz_offset)
    day_duration = (set_dt - rise_dt).total_seconds() / 3600.0
    night_duration = 24.0 - day_duration
    day_ghati = (day_duration / 24.0) * 60.0
    
    # Abhijit Muhurta (8th muhurta of day = around midday)
    midday = rise_dt + timedelta(hours=day_duration / 2.0)
    abhijit_start = midday - timedelta(minutes=24)
    abhijit_end = midday + timedelta(minutes=24)
    
    # Choghadiya calculation
    part_day = day_duration / 8.0
    chog_day_list = []
    order = CHOGHADIYA_ORDER_DAY[weekday]
    for i, name in enumerate(order):
        start_t = rise_dt + timedelta(hours=i * part_day)
        end_t = rise_dt + timedelta(hours=(i + 1) * part_day)
        chog_day_list.append({
            "order": i + 1,
            "name": name,
            "name_ne": CHOGHADIYA_NAMES_NE.get(name, name),
            "start": start_t.strftime("%H:%M"),
            "end": end_t.strftime("%H:%M")
        })
        
    return {
        "engine_name": "Basistha Astronomical Engine",
        "date_str": d.strftime("%Y-%m-%d"),
        "sunrise": rise_dt.strftime("%H:%M:%S"),
        "sunset": set_dt.strftime("%H:%M:%S"),
        "day_length_ghati": f"{int(day_ghati)} घटी {int((day_ghati % 1.0) * 60)} पला",
        "day_length_hours": f"{int(day_duration)}h {int((day_duration % 1.0) * 60)}m",
        "night_length_hours": f"{int(night_duration)}h {int((night_duration % 1.0) * 60)}m",
        "vara": {
            "name": VARA_NAMES[weekday],
            "name_ne": VARA_NAMES_NE[weekday],
            "number": weekday + 1,
            "progress_percentage": 100.0
        },
        "tithi": {
            "name": TITHI_NAMES[tithi_num - 1],
            "name_ne": TITHI_NAMES_NE[tithi_num - 1],
            "number": tithi_num,
            "progress_percentage": round(tithi_rem * 100.0, 2)
        },
        "nakshatra": {
            "name": NAKSHATRA_NAMES[nak_num],
            "name_ne": NAKSHATRA_NAMES_NE[nak_num],
            "number": nak_num + 1,
            "progress_percentage": round(nak_rem * 100.0, 2)
        },
        "yoga": {
            "name": YOGA_NAMES[yoga_num],
            "name_ne": YOGA_NAMES_NE[yoga_num],
            "number": yoga_num + 1,
            "progress_percentage": round(yoga_rem * 100.0, 2)
        },
        "karana": {
            "name": KARANA_NAMES[karana_num],
            "name_ne": KARANA_NAMES_NE[karana_num],
            "number": karana_num + 1,
            "progress_percentage": round(karana_rem * 100.0, 2)
        },
        "abhijit_muhurta": {
            "start": abhijit_start.strftime("%H:%M"),
            "end": abhijit_end.strftime("%H:%M")
        },
        "rahukaal": {
            "start": (rise_dt + timedelta(hours=part_day * (weekday * 1.0) % 8)).strftime("%H:%M"),
            "end": (rise_dt + timedelta(hours=part_day * ((weekday * 1.0) % 8 + 1.5))).strftime("%H:%M")
        },
        "choghadiya_day": chog_day_list,
        "choghadiya_night": []
    }
