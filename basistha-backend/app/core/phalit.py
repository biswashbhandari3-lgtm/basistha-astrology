"""
Basistha Astrological Engine
Classical Phalit (Predictive Astrology & Classical Slokas) Engine
Powered by Mansagari, Brihat Parashara Hora Shastra, and Chamatkar Chintamani (29 Classical Authors)
"""
import os
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional

SQLITE_PATH = Path(__file__).resolve().parent.parent / "data" / "phalit_unicode.db"

# Graha ID mapping according to Phalit database:
# 1: Sun, 2: Moon, 3: Mars, 4: Rahu, 5: Jupiter, 6: Saturn, 7: Mercury, 8: Ketu, 9: Venus
GRAHA_NAME_TO_ID = {
    "SUN": 1, "MOON": 2, "MARS": 3, "RAHU": 4, "JUPITER": 5,
    "SATURN": 6, "MERCURY": 7, "KETU": 8, "VENUS": 9
}

GRAHA_ID_TO_NAME_NE = {
    1: "सूर्य", 2: "चन्द्र", 3: "मङ्गल", 4: "राहु", 5: "बृहस्पति (गुरु)",
    6: "शनि", 7: "बुध", 8: "केतु", 9: "शुक्र"
}

# Sign ownership (Rashi Lord): 1-Aries to 12-Pisces
# Returns lord planet name in uppercase
RASHI_LORD_MAP = {
    1: "MARS", 2: "VENUS", 3: "MERCURY", 4: "MOON",
    5: "SUN", 6: "MERCURY", 7: "VENUS", 8: "MARS",
    9: "JUPITER", 10: "SATURN", 11: "SATURN", 12: "JUPITER"
}

BHAVA_NAMES_NE = {
    1: "प्रथम भाव (तनु / लग्न)",
    2: "द्वितीय भाव (धन / कुटुम्ब)",
    3: "तृतीय भाव (सहज / पराक्रम)",
    4: "चतुर्थ भाव (सुख / बन्धु / मातृ)",
    5: "पञ्चम भाव (पुत्र / विद्या / बुद्धि)",
    6: "षष्ठ भाव (रिपु / रोग / शत्रु)",
    7: "सप्तम भाव (कलत्र / जाया / साझेदारी)",
    8: "अष्टम भाव (आयु / रन्ध्र / मृत्यु)",
    9: "नवम भाव (धर्म / भाग्य)",
    10: "दशम भाव (कर्म / राज्य / पिता)",
    11: "एकादश भाव (आय / लाभ)",
    12: "द्वादश भाव (व्यय / मोक्ष)"
}

def get_db_cursor():
    """Returns a connection and cursor to the local Unicode Phalit database."""
    if not SQLITE_PATH.exists():
        return None, None
    conn = sqlite3.connect(str(SQLITE_PATH))
    conn.row_factory = sqlite3.Row
    return conn, conn.cursor()

def get_bhavastha_graha_sloka(bhav: int, planet_name: str) -> Optional[Dict[str, Any]]:
    """Fetches Mansagari and Chamatkar Chintamani slokas for a planet in a specific bhava."""
    gid = GRAHA_NAME_TO_ID.get(planet_name.upper())
    if not gid or not (1 <= bhav <= 12):
        return None
    
    conn, cur = get_db_cursor()
    if not conn:
        return None
    try:
        # 1. Mansagari
        cur.execute("SELECT slock FROM mansagari_bhavastha WHERE bhav=? AND graha=?", (bhav, gid))
        row_m = cur.fetchone()
        mansagari_sloka = row_m["slock"].strip() if row_m and row_m["slock"] else ""
        
        # 2. Chamatkar Chintamani slokas across authors
        cur.execute("""
            SELECT cc.author_id, a.name_ne, a.name_eng, cc.slock
            FROM chamatkar_chintamani cc
            LEFT JOIN authors a ON a.id = cc.author_id
            WHERE cc.bhav=? AND cc.graha=?
            ORDER BY cc.author_id
            LIMIT 5
        """, (bhav, gid))
        authors_slokas = []
        for r in cur.fetchall():
            if r["slock"] and r["slock"].strip():
                authors_slokas.append({
                    "author_id": r["author_id"],
                    "author_name_ne": r["name_ne"] or f"ऋषि/ग्रन्थकार {r['author_id']}",
                    "sloka": r["slock"].strip()
                })
                
        return {
            "bhava": bhav,
            "bhava_name_ne": BHAVA_NAMES_NE.get(bhav, f"{bhav} भाव"),
            "planet": planet_name.capitalize(),
            "planet_ne": GRAHA_ID_TO_NAME_NE.get(gid, planet_name),
            "mansagari_sloka": mansagari_sloka,
            "classical_interpretations": authors_slokas
        }
    finally:
        conn.close()

def get_bhavesh_sloka(bhavesh_num: int, in_bhav: int) -> Optional[Dict[str, Any]]:
    """Fetches Parashara Bhabesh sloka for bhavesh sitting in in_bhav."""
    if not (1 <= bhavesh_num <= 12 and 1 <= in_bhav <= 12):
        return None
    
    conn, cur = get_db_cursor()
    if not conn:
        return None
    try:
        cur.execute("SELECT slock FROM parashar_bhavesh WHERE bhavesh=? AND bhav=?", (bhavesh_num, in_bhav))
        row = cur.fetchone()
        sloka = row["slock"].strip() if row and row["slock"] else ""
        return {
            "bhavesh": bhavesh_num,
            "bhavesh_name_ne": f"{bhavesh_num} भावको स्वामी (भावेश)",
            "in_bhava": in_bhav,
            "in_bhava_name_ne": BHAVA_NAMES_NE.get(in_bhav, f"{in_bhav} भाव"),
            "parashar_sloka": sloka
        }
    finally:
        conn.close()

def get_dasha_phala_slokas(mahadasha_name: str, antardasha_name: Optional[str] = None) -> Dict[str, Any]:
    """Fetches Parashari Mahadasha and Antardasha slokas."""
    mid = GRAHA_NAME_TO_ID.get(mahadasha_name.upper())
    aid = GRAHA_NAME_TO_ID.get(antardasha_name.upper()) if antardasha_name else None
    
    conn, cur = get_db_cursor()
    if not conn:
        return {}
    try:
        result = {
            "mahadasha": mahadasha_name.capitalize(),
            "mahadasha_ne": GRAHA_ID_TO_NAME_NE.get(mid, mahadasha_name) if mid else mahadasha_name,
            "mahadasha_sloka": "",
            "antardasha": antardasha_name.capitalize() if antardasha_name else None,
            "antardasha_ne": GRAHA_ID_TO_NAME_NE.get(aid, antardasha_name) if aid else None,
            "antardasha_sloka": ""
        }
        
        if mid:
            cur.execute("SELECT slock FROM parashar_mahadasha WHERE mdasha=?", (mid,))
            row_m = cur.fetchone()
            if row_m and row_m["slock"]:
                result["mahadasha_sloka"] = row_m["slock"].strip()
                
            if aid:
                cur.execute("SELECT slock FROM parashar_antardasha WHERE mdasha=? AND adasha=?", (mid, aid))
                row_a = cur.fetchone()
                if row_a and row_a["slock"]:
                    result["antardasha_sloka"] = row_a["slock"].strip()
                    
        return result
    finally:
        conn.close()

def compute_kundali_phalit(
    lagna_rashi: int,
    planet_rashis: Dict[str, int],
    current_mahadasha: Optional[str] = None,
    current_antardasha: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes complete classical Phalit interpretation for a Janmakundali:
    1. Bhava Analysis (1 to 12): Sign, Lord, Lord placement, Planets present & Slokas.
    2. Mahadasha & Antardasha Phala Slokas.
    """
    bhava_results = []
    
    # 1. Determine which planet sits in which house
    planets_in_bhava = {b: [] for b in range(1, 13)}
    planet_house_map = {}
    
    for p_name, p_rashi in planet_rashis.items():
        # House = (PlanetRashi - LagnaRashi) % 12 + 1
        h = (p_rashi - lagna_rashi) % 12 + 1
        planet_house_map[p_name.upper()] = h
        planets_in_bhava[h].append(p_name.upper())
        
    # 2. For each house 1 to 12
    for b in range(1, 13):
        # Sign on this house: 1 to 12
        rashi_num = (lagna_rashi + b - 2) % 12 + 1
        lord_planet = RASHI_LORD_MAP.get(rashi_num, "MARS")
        lord_house = planet_house_map.get(lord_planet, 1)
        
        # Parashar Bhavesh sloka
        bhavesh_data = get_bhavesh_sloka(b, lord_house)
        
        # Planets sitting in this house
        occupants = []
        for p in planets_in_bhava[b]:
            p_sloka = get_bhavastha_graha_sloka(b, p)
            if p_sloka:
                occupants.append(p_sloka)
                
        bhava_results.append({
            "bhava": b,
            "bhava_name_ne": BHAVA_NAMES_NE[b],
            "rashi_number": rashi_num,
            "lord_planet": lord_planet.capitalize(),
            "lord_planet_ne": GRAHA_ID_TO_NAME_NE.get(GRAHA_NAME_TO_ID.get(lord_planet, 1)),
            "lord_placed_in_bhava": lord_house,
            "bhavesh_interpretation": bhavesh_data,
            "planets_present": occupants
        })
        
    # 3. Dasha Slokas
    dasha_data = {}
    if current_mahadasha:
        dasha_data = get_dasha_phala_slokas(current_mahadasha, current_antardasha)
        
    return {
        "engine_name": "Basistha Classical Phalit Engine",
        "lagna_rashi": lagna_rashi,
        "bhava_analysis": bhava_results,
        "dasha_interpretation": dasha_data
    }
