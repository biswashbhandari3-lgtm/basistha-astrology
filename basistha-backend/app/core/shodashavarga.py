"""
Basistha Astrological Engine
Shodashavarga (16 Divisional Charts) Module
"""
import math
from typing import Dict, Any

def get_rashi(longitude: float) -> int:
    """Returns 0-based Rashi index (0=Aries, 11=Pisces)."""
    return int((longitude % 360.0) / 30.0)

def calc_navamsha(longitude: float) -> int:
    """D9 Navamsha sign calculation (1 Navamsha = 3° 20')."""
    total_navamshas = int((longitude % 360.0) / (30.0 / 9.0))
    # Starts from Aries for Fire signs, Capricorn for Earth, Libra for Air, Cancer for Water
    return total_navamshas % 12

def calc_hora(longitude: float) -> int:
    """D2 Hora: Sun (Leo=4) or Moon (Cancer=3)."""
    rashi = get_rashi(longitude)
    deg_in_rashi = longitude % 30.0
    is_odd = (rashi % 2 == 0) # Aries=0 is odd sign
    if is_odd:
        return 4 if deg_in_rashi < 15.0 else 3 # 1st half Sun, 2nd half Moon
    else:
        return 3 if deg_in_rashi < 15.0 else 4 # 1st half Moon, 2nd half Sun

def calc_drekkana(longitude: float) -> int:
    """D3 Drekkana (1 Drekkana = 10°). 1st: self, 2nd: 5th from it, 3rd: 9th from it."""
    rashi = get_rashi(longitude)
    part = int((longitude % 30.0) / 10.0)
    if part == 0:
        return rashi
    elif part == 1:
        return (rashi + 4) % 12
    else:
        return (rashi + 8) % 12

def calc_chaturthamsha(longitude: float) -> int:
    """D4 Chaturthamsha (7° 30'). 1st: self, 2nd: 4th, 3rd: 7th, 4th: 10th."""
    rashi = get_rashi(longitude)
    part = int((longitude % 30.0) / 7.5)
    return (rashi + (part * 3)) % 12

def calc_saptamamsha(longitude: float) -> int:
    """D7 Saptamamsha (4° 17' 8.5''). Odd signs count from self, even signs from 7th."""
    rashi = get_rashi(longitude)
    part = int((longitude % 30.0) / (30.0 / 7.0))
    is_odd = (rashi % 2 == 0)
    start = rashi if is_odd else (rashi + 6) % 12
    return (start + part) % 12

def calc_dashamamsha(longitude: float) -> int:
    """D10 Dashamamsha (3°). Odd signs count from self, even from 9th."""
    rashi = get_rashi(longitude)
    part = int((longitude % 30.0) / 3.0)
    is_odd = (rashi % 2 == 0)
    start = rashi if is_odd else (rashi + 8) % 12
    return (start + part) % 12

def calc_dwadasamsha(longitude: float) -> int:
    """D12 Dwadasamsha (2° 30'). Counts from self for all signs."""
    rashi = get_rashi(longitude)
    part = int((longitude % 30.0) / 2.5)
    return (rashi + part) % 12

def calc_shodashamsha(longitude: float) -> int:
    """D16 Shodashamsha (1° 52' 30''). Movable: Aries, Fixed: Leo, Dual: Sagittarius."""
    rashi = get_rashi(longitude)
    part = int((longitude % 30.0) / (30.0 / 16.0))
    modality = rashi % 3 # 0: movable, 1: fixed, 2: dual
    start = 0 if modality == 0 else (4 if modality == 1 else 8)
    return (start + part) % 12

def calc_trimshamsha(longitude: float) -> int:
    """D30 Trimshamsha: Odd: Mars 5°, Saturn 5°, Jupiter 8°, Mercury 7°, Venus 5°."""
    rashi = get_rashi(longitude)
    deg = longitude % 30.0
    is_odd = (rashi % 2 == 0)
    if is_odd:
        if deg < 5.0: return 0 # Aries (Mars)
        elif deg < 10.0: return 10 # Aquarius (Saturn)
        elif deg < 18.0: return 8 # Sagittarius (Jupiter)
        elif deg < 25.0: return 2 # Gemini (Mercury)
        else: return 1 # Taurus (Venus)
    else:
        if deg < 5.0: return 1 # Taurus (Venus)
        elif deg < 12.0: return 2 # Gemini (Mercury)
        elif deg < 20.0: return 8 # Sagittarius (Jupiter)
        elif deg < 25.0: return 10 # Aquarius (Saturn)
        else: return 0 # Aries (Mars)

def calc_shastiamsha(longitude: float) -> int:
    """D60 Shashtiamsha (30' = 0.5°). Counts from self."""
    rashi = get_rashi(longitude)
    part = int((longitude % 30.0) / 0.5)
    return (rashi + part) % 12

def get_all_vargas_for_longitude(longitude: float) -> Dict[str, int]:
    """Computes all major divisional charts for a given longitude."""
    return {
        "D1_Rashi": get_rashi(longitude) + 1,
        "D2_Hora": calc_hora(longitude) + 1,
        "D3_Drekkana": calc_drekkana(longitude) + 1,
        "D4_Chaturthamsha": calc_chaturthamsha(longitude) + 1,
        "D7_Saptamamsha": calc_saptamamsha(longitude) + 1,
        "D9_Navamsha": calc_navamsha(longitude) + 1,
        "D10_Dashamamsha": calc_dashamamsha(longitude) + 1,
        "D12_Dwadasamsha": calc_dwadasamsha(longitude) + 1,
        "D16_Shodashamsha": calc_shodashamsha(longitude) + 1,
        "D30_Trimshamsha": calc_trimshamsha(longitude) + 1,
        "D60_Shastiamsha": calc_shastiamsha(longitude) + 1
    }
