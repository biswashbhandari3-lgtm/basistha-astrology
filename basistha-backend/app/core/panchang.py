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
    """
    Calculate official Kathmandu (Nepal Standard Time, UTC+5:45) Sunrise and Sunset times
    using NOAA Solar Calculation with Equation of Time (Et) and Meridian Longitude correction.
    """
    d = datetime(year, month, day)
    day_of_year = d.timetuple().tm_yday
    
    # Fractional year in radians
    gamma = 2 * math.pi / 365.0 * (day_of_year - 1)
    
    # Equation of Time in minutes (NOAA Solar Algorithm)
    eqtime = 229.18 * (
        0.000075 +
        0.001868 * math.cos(gamma) -
        0.032077 * math.sin(gamma) -
        0.014615 * math.cos(2 * gamma) -
        0.040849 * math.sin(2 * gamma)
    )
    
    # Solar Declination in radians (NOAA)
    decl = (
        0.006918 -
        0.399912 * math.cos(gamma) +
        0.070257 * math.sin(gamma) -
        0.006758 * math.cos(2 * gamma) +
        0.000907 * math.sin(2 * gamma) -
        0.002697 * math.cos(3 * gamma) +
        0.00148 * math.sin(3 * gamma)
    )
    
    lat_rad = math.radians(lat)
    zenith_rad = math.radians(90.833) # 90° 50' accounting for standard refraction and solar disk
    
    cos_ha = (math.cos(zenith_rad) - math.sin(lat_rad) * math.sin(decl)) / (math.cos(lat_rad) * math.cos(decl))
    cos_ha = max(-1.0, min(1.0, cos_ha))
    ha_deg = math.degrees(math.acos(cos_ha))
    
    # Solar time calculation in minutes from midnight local time
    # Longitude offset relative to standard meridian (15° * tz_offset)
    sunrise_min = 720.0 - 4.0 * (lon - 15.0 * tz_offset) - ha_deg * 4.0 - eqtime
    sunset_min = 720.0 - 4.0 * (lon - 15.0 * tz_offset) + ha_deg * 4.0 - eqtime
    
    rise_dt = d + timedelta(minutes=sunrise_min)
    set_dt = d + timedelta(minutes=sunset_min)
    return rise_dt, set_dt

def get_panchang(year: int, month: int, day: int, lat: float, lon: float, tz_offset: float = 5.75, hour: int = 12, minute: int = 0, second: int = 0) -> Dict[str, Any]:
    """Compute complete 5 elements of Panchang + Muhurtas + Detailed Astronomical Parameters."""
    jd = get_julian_day(year, month, day, 6, 0, 0.0, tz_offset)
    ayan_val = get_ayanamsha_value(jd, "LAHIRI")
    
    sun_lon, _ = calc_planet_position(jd, PLANET_IDS["SUN"], ayan_val)
    moon_lon, _ = calc_planet_position(jd, PLANET_IDS["MOON"], ayan_val)
    
    # Sunrise & Sunset
    rise_dt, set_dt = calc_approx_sun_times(year, month, day, lat, lon, tz_offset)
    day_duration = (set_dt - rise_dt).total_seconds() / 3600.0
    night_duration = 24.0 - day_duration
    day_ghati = (day_duration / 24.0) * 60.0
    dinmaan_ghati = int(day_ghati)
    dinmaan_pala = int((day_ghati - dinmaan_ghati) * 60)

    # Astronomical planetary positions and speeds at Sunrise for exact Ghati-Pala calculation
    jd_rise = get_julian_day(year, month, day, rise_dt.hour, rise_dt.minute, rise_dt.second, tz_offset)
    ayan_rise = get_ayanamsha_value(jd_rise, "LAHIRI")
    sun_lon_rise, sun_speed_rise = calc_planet_position(jd_rise, PLANET_IDS["SUN"], ayan_rise)
    moon_lon_rise, moon_speed_rise = calc_planet_position(jd_rise, PLANET_IDS["MOON"], ayan_rise)

    # 1. Tithi: (Moon - Sun) / 12
    diff_rise = (moon_lon_rise - sun_lon_rise) % 360.0
    tithi_num = int(diff_rise / 12.0) + 1
    tithi_bhukta = diff_rise % 12.0
    tithi_bhogya = 12.0 - tithi_bhukta
    rel_speed = max(0.1, moon_speed_rise - sun_speed_rise)
    tithi_rem_hrs = (tithi_bhogya / rel_speed) * 24.0
    tithi_ghati_total = (tithi_rem_hrs / 24.0) * 60.0
    t_ghati = int(tithi_ghati_total)
    t_pala = int((tithi_ghati_total - t_ghati) * 60)
    t_end_dt = rise_dt + timedelta(hours=tithi_rem_hrs)
    
    # 2. Nakshatra: Moon / (13° 20')
    nak_span = 360.0 / 27.0
    nak_num = int(moon_lon_rise / nak_span)
    nak_bhukta = moon_lon_rise % nak_span
    nak_bhogya = nak_span - nak_bhukta
    moon_spd = max(0.1, moon_speed_rise)
    nak_rem_hrs = (nak_bhogya / moon_spd) * 24.0
    nak_ghati_total = (nak_rem_hrs / 24.0) * 60.0
    n_ghati = int(nak_ghati_total)
    n_pala = int((nak_ghati_total - n_ghati) * 60)
    n_end_dt = rise_dt + timedelta(hours=nak_rem_hrs)
    
    # 3. Yoga: (Sun + Moon) / (13° 20')
    sum_deg_rise = (sun_lon_rise + moon_lon_rise) % 360.0
    yoga_num = int(sum_deg_rise / nak_span)
    yoga_bhukta = sum_deg_rise % nak_span
    yoga_bhogya = nak_span - yoga_bhukta
    sum_spd = max(0.1, sun_speed_rise + moon_speed_rise)
    yoga_rem_hrs = (yoga_bhogya / sum_spd) * 24.0
    yoga_ghati_total = (yoga_rem_hrs / 24.0) * 60.0
    y_ghati = int(yoga_ghati_total)
    y_pala = int((yoga_ghati_total - y_ghati) * 60)
    y_end_dt = rise_dt + timedelta(hours=yoga_rem_hrs)
    
    # 4. Karana: (Moon - Sun) / 6
    karana_idx = int(diff_rise / 6.0)
    if karana_idx == 0:
        karana_num = 10 # Kimstughna
    elif karana_idx >= 57:
        fixed_map = {57: 7, 58: 8, 59: 9}
        karana_num = fixed_map.get(karana_idx, 7)
    else:
        karana_num = (karana_idx - 1) % 7
    karana_bhukta = diff_rise % 6.0
    karana_bhogya = 6.0 - karana_bhukta
    karana_rem_hrs = (karana_bhogya / rel_speed) * 24.0
    karana_ghati_total = (karana_rem_hrs / 24.0) * 60.0
    k_ghati = int(karana_ghati_total)
    k_pala = int((karana_ghati_total - k_ghati) * 60)
    k_end_dt = rise_dt + timedelta(hours=karana_rem_hrs)
    
    # 5. Vara
    d = datetime(year, month, day)
    weekday = (d.weekday() + 1) % 7 # 0 = Sunday
    
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
        
    # 1. Ishtakala calculation (from sunrise to given time)
    birth_dt = d + timedelta(hours=hour, minutes=minute, seconds=second)
    elapsed_sec = (birth_dt - rise_dt).total_seconds()
    if elapsed_sec < 0:
        elapsed_sec += 86400.0
    ishtakala_ghati_total = (elapsed_sec / 86400.0) * 60.0
    ishta_g = int(ishtakala_ghati_total)
    ishta_p = int((ishtakala_ghati_total - ishta_g) * 60)
    ishta_v = int((((ishtakala_ghati_total - ishta_g) * 60) - ishta_p) * 60)
    ishtakala_dict = {
        "ghati": ishta_g,
        "pala": ishta_p,
        "vipala": ishta_v,
        "str": f"{ishta_g} घटी {ishta_p:02d} पला {ishta_v:02d} विपला",
        "ghati_val": f"{ishta_g:02d}:{ishta_p:02d}:{ishta_v:02d}"
    }

    # 2. Geographical & Time Corrections
    std_meridian = 15.0 * tz_offset
    lmt_diff_mins = 4.0 * (lon - std_meridian)
    abs_lmt = abs(lmt_diff_mins)
    lmt_m = int(abs_lmt)
    lmt_s = int((abs_lmt - lmt_m) * 60)
    lmt_sign = "+" if lmt_diff_mins >= 0 else "-"
    lmt_dt = birth_dt + timedelta(minutes=lmt_diff_mins)
    utc_dt = birth_dt - timedelta(hours=tz_offset)
    geo_time_dict = {
        "latitude": f"{int(lat)}° {int((lat % 1) * 60)}' {int((((lat % 1) * 60) % 1) * 60)}\" N",
        "longitude": f"{int(lon)}° {int((lon % 1) * 60)}' {int((((lon % 1) * 60) % 1) * 60)}\" E",
        "standard_meridian": f"{int(std_meridian)}° {int((std_meridian % 1) * 60)}' 00\" E",
        "lmt_correction": f"{lmt_sign}{lmt_m:02d}:{lmt_s:02d}",
        "dst_correction": "00:00:00",
        "war_time_correction": "00:00:00",
        "lmt_time": lmt_dt.strftime("%H:%M:%S"),
        "utc_time": utc_dt.strftime("%H:%M:%S UTC")
    }

    # 3. Panchang & Astronomical Eras
    shaka_year = year - 78
    srishti_gata = 1955885127 + (year - 2026)
    ahargana = int(jd - 588465.5)
    panchang_astro_dict = {
        "shak_sambat": f"शाके {shaka_year}",
        "srishti_gata_varsha": f"{srishti_gata:,} वर्ष",
        "ahargana": f"{ahargana:,} दिन"
    }

    # 4. Nakshatra Dasha & Bhayata
    bhayata_total = (nak_bhukta / nak_span) * 60.0
    bh_g = int(bhayata_total)
    bh_p = int((bhayata_total - bh_g) * 60)
    nak_pada = min(4, max(1, int((nak_bhukta / nak_span) * 4) + 1))
    nakshatra_dasha_dict = {
        "nakshatra_bhoga": "60 घटी 00 पला (800 कला)",
        "bhayata": f"{bh_g} घटी {bh_p:02d} पला",
        "nakshatra_pada": nak_pada
    }

    return {
        "engine_name": "Basistha Astronomical Engine",
        "date_str": d.strftime("%Y-%m-%d"),
        "sunrise": rise_dt.strftime("%H:%M:%S"),
        "sunset": set_dt.strftime("%H:%M:%S"),
        "day_length_ghati": f"{dinmaan_ghati} घटी {dinmaan_pala:02d} पला",
        "dinmaan_ghati": f"{dinmaan_ghati:02d}:{dinmaan_pala:02d}",
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
            "progress_percentage": round((tithi_bhukta / 12.0) * 100.0, 2),
            "ghati": f"{t_ghati} घटी {t_pala:02d} पला",
            "ghati_val": f"{t_ghati:02d}:{t_pala:02d}",
            "end_time": t_end_dt.strftime("%H:%M")
        },
        "nakshatra": {
            "name": NAKSHATRA_NAMES[nak_num],
            "name_ne": NAKSHATRA_NAMES_NE[nak_num],
            "number": nak_num + 1,
            "progress_percentage": round((nak_bhukta / nak_span) * 100.0, 2),
            "ghati": f"{n_ghati} घटी {n_pala:02d} पला",
            "ghati_val": f"{n_ghati:02d}:{n_pala:02d}",
            "end_time": n_end_dt.strftime("%H:%M")
        },
        "yoga": {
            "name": YOGA_NAMES[yoga_num],
            "name_ne": YOGA_NAMES_NE[yoga_num],
            "number": yoga_num + 1,
            "progress_percentage": round((yoga_bhukta / nak_span) * 100.0, 2),
            "ghati": f"{y_ghati} घटी {y_pala:02d} पला",
            "ghati_val": f"{y_ghati:02d}:{y_pala:02d}",
            "end_time": y_end_dt.strftime("%H:%M")
        },
        "karana": {
            "name": KARANA_NAMES[karana_num],
            "name_ne": KARANA_NAMES_NE[karana_num],
            "number": karana_num + 1,
            "progress_percentage": round((karana_bhukta / 6.0) * 100.0, 2),
            "ghati": f"{k_ghati} घटी {k_pala:02d} पला",
            "ghati_val": f"{k_ghati:02d}:{k_pala:02d}",
            "end_time": k_end_dt.strftime("%H:%M")
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
        "choghadiya_night": [],
        "ishtakala": ishtakala_dict,
        "geo_time": geo_time_dict,
        "panchang_astro": panchang_astro_dict,
        "nakshatra_dasha": nakshatra_dasha_dict
    }
