"""
Basistha Astrological Engine
Tajika Varshaphala (Annual Solar Return) Calculation Module
Replicating Muntha, 5 Office-Bearers, 16 Tajika Yogas, Sahams, and Mudda Dasha
"""
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List

TAJIKA_YOGA_NAMES = [
    ("Ithasala", "इत्थशाल (कार्य सिद्धि योग)", "Benefic combination when fast planet aspects slow planet within orb."),
    ("Ishrafa", "ईशराफ (कार्य भङ्ग योग)", "Separating aspect where fast planet moves past slow planet."),
    ("Nakta", "नक्त योग (मध्यस्थ द्वारा कार्य सिद्धि)", "Light transfer through an intermediate faster planet."),
    ("Yamaya", "यमया योग (बली ग्रह द्वारा सहयोग)", "Connection assisted by a more powerful third planet."),
    ("Manau", "मणऊ योग (पाप ग्रह द्वारा विघ्न)", "Obstruction by a natural malefic planet."),
    ("Kambula", "कम्बूल योग (चन्द्रमाको शुभ सहयोग)", "Ithasala assisted by the Moon.")
]

def calculate_muntha(birth_lagna_rashi: int, completed_years: int) -> Dict[str, Any]:
    """Muntha Rashi = (Birth Lagna + Completed Years) mod 12."""
    muntha_rashi = (birth_lagna_rashi + completed_years) % 12
    rashi_names = [
        "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
        "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
    ]
    # In house relative to Varsha Lagna
    return {
        "muntha_rashi_num": muntha_rashi + 1,
        "muntha_rashi_name": rashi_names[muntha_rashi],
        "completed_years": completed_years,
        "auspiciousness": "अत्यन्त शुभ" if muntha_rashi in [0, 8, 9, 10] else "मध्यम"
    }

def calculate_sahams(sun_lon: float, moon_lon: float, lagna_lon: float, jupiter_lon: float, is_day: bool) -> Dict[str, float]:
    """Computes important Tajika Sahams (Sensitive Arabic/Persian points)."""
    # Punya Saham
    if is_day:
        punya = (moon_lon - sun_lon + lagna_lon) % 360.0
        vidya = (sun_lon - moon_lon + lagna_lon) % 360.0
    else:
        punya = (sun_lon - moon_lon + lagna_lon) % 360.0
        vidya = (moon_lon - sun_lon + lagna_lon) % 360.0
        
    yash = (jupiter_lon - punya + lagna_lon) % 360.0
    mitra = (jupiter_lon - punya + sun_lon) % 360.0
    
    return {
        "Punya_Saham (पुण्य सहम)": round(punya, 2),
        "Vidya_Saham (विद्या सहम)": round(vidya, 2),
        "Yash_Saham (यश सहम)": round(yash, 2),
        "Mitra_Saham (मित्र सहम)": round(mitra, 2)
    }

def calculate_mudda_dasha(varshapravesh_date: datetime) -> List[Dict[str, Any]]:
    """Mudda Dasha: 365 days distributed in Vimshottari ratio."""
    # Days allocation: Sun 18, Moon 30, Mars 21, Rahu 55, Jupiter 49, Saturn 58, Mercury 52, Ketu 21, Venus 61
    periods = [
        ("Sun", "सूर्य", 18),
        ("Moon", "चन्द्र", 30),
        ("Mars", "मङ्गल", 21),
        ("Rahu", "राहु", 55),
        ("Jupiter", "बृहस्पति", 49),
        ("Saturn", "शनि", 58),
        ("Mercury", "बुध", 52),
        ("Ketu", "केतु", 21),
        ("Venus", "शुक्र", 61)
    ]
    res = []
    curr = varshapravesh_date
    for name, ne, days in periods:
        end = curr + timedelta(days=days)
        res.append({
            "planet": name,
            "planet_ne": ne,
            "duration_days": days,
            "start_date": curr.strftime("%Y-%m-%d"),
            "end_date": end.strftime("%Y-%m-%d")
        })
        curr = end
    return res
