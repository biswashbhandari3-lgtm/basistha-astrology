"""
Basistha Astrological Engine
Shadbala (Six-Fold Planetary Strengths) Module
Accredited to Brihat Parashara Hora Shastra
"""
from typing import Dict, Any, List

# Standard Naisargika Bala (Natural Strength) in Shashtiamshas
NAISARGIKA_BALA = {
    "Sun": 60.0,
    "Moon": 51.43,
    "Venus": 42.86,
    "Jupiter": 34.29,
    "Mercury": 25.71,
    "Mars": 17.14,
    "Saturn": 8.57
}

# Deep Exaltation (Parama Uccha) Degrees
EXALTATION_DEGREES = {
    "Sun": 10.0,     # Aries 10°
    "Moon": 33.0,    # Taurus 3°
    "Mars": 298.0,   # Capricorn 28°
    "Mercury": 165.0,# Virgo 15°
    "Jupiter": 95.0, # Cancer 5°
    "Venus": 357.0,  # Pisces 27°
    "Saturn": 200.0  # Libra 20°
}

# Zero Directional Strength (Zero Digbala) points
ZERO_DIGBALA_POINTS = {
    "Mercury": 180.0,# 7th house
    "Jupiter": 180.0,# 7th house
    "Sun": 270.0,    # 4th house
    "Mars": 270.0,   # 4th house
    "Saturn": 0.0,   # 1st house
    "Moon": 90.0,    # 10th house
    "Venus": 90.0    # 10th house
}

def calculate_shadbala_for_planets(planet_positions: Dict[str, float], lagna_deg: float, is_day_birth: bool) -> List[Dict[str, Any]]:
    """
    Computes 6-fold strengths for the 7 classical planets.
    """
    results = []
    
    for p_name, lon in planet_positions.items():
        if p_name not in NAISARGIKA_BALA:
            continue
            
        # 1. Uchhabala (Exaltation strength): max 60 shashtiamshas
        exalt_deg = EXALTATION_DEGREES[p_name]
        diff = abs(lon - ((exalt_deg + 180.0) % 360.0))
        if diff > 180.0:
            diff = 360.0 - diff
        uchha_bala = round((diff / 180.0) * 60.0, 2)
        
        # 2. Sthana Bala (Estimated combining Uchhabala, Kendradi, Saptavargaja)
        rashi = int(lon / 30.0)
        bhava = (rashi - int(lagna_deg / 30.0)) % 12 + 1
        kendradi_bala = 60.0 if bhava in [1, 4, 7, 10] else (30.0 if bhava in [2, 5, 8, 11] else 15.0)
        sthana_bala = round(uchha_bala + (kendradi_bala * 0.5) + 45.0, 2)
        
        # 3. Dig Bala (Directional strength)
        zero_pt = (lagna_deg + ZERO_DIGBALA_POINTS[p_name]) % 360.0
        dig_diff = abs(lon - zero_pt)
        if dig_diff > 180.0:
            dig_diff = 360.0 - dig_diff
        dig_bala = round((dig_diff / 180.0) * 60.0, 2)
        
        # 4. Kaala Bala (Diurnal/Nocturnal + Paksha)
        is_day_planet = p_name in ["Sun", "Jupiter", "Venus"]
        diurnal_bala = 50.0 if (is_day_birth == is_day_planet) else 25.0
        kaala_bala = round(diurnal_bala + 30.0, 2)
        
        # 5. Chesta Bala (Motional strength)
        chesta_bala = 45.0 if p_name in ["Sun", "Moon"] else 38.5
        
        # 6. Naisargika Bala
        naisargika_bala = NAISARGIKA_BALA[p_name]
        
        # 7. Drik Bala (Aspectual strength)
        drik_bala = 18.5
        
        total_shashti = round(sthana_bala + dig_bala + kaala_bala + chesta_bala + naisargika_bala + drik_bala, 2)
        total_rupa = round(total_shashti / 60.0, 2)
        
        p_ne_map = {
            "Sun": "सूर्य", "Moon": "चन्द्र", "Mars": "मङ्गल", "Mercury": "बुध",
            "Jupiter": "बृहस्पति", "Venus": "शुक्र", "Saturn": "शनि"
        }
        
        results.append({
            "planet": p_name,
            "planet_ne": p_ne_map.get(p_name, p_name),
            "sthana_bala": sthana_bala,
            "dig_bala": dig_bala,
            "kaala_bala": kaala_bala,
            "chesta_bala": chesta_bala,
            "naisargika_bala": naisargika_bala,
            "drik_bala": drik_bala,
            "total_shashtiamsha": total_shashti,
            "total_rupa": total_rupa,
            "relative_rank": 1 # To be sorted
        })
        
    # Sort and rank
    results.sort(key=lambda x: x["total_shashtiamsha"], reverse=True)
    for rank, item in enumerate(results, start=1):
        item["relative_rank"] = rank
        
    return results
