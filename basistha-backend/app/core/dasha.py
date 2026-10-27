"""
Basistha Astrological Engine
Multi-Dasha Calculation Module
Replicating Vimshottari, Yogini, Ashtottari, Tribhagi, and Chara Dasha
"""
from datetime import datetime, timedelta
from typing import Dict, Any, List

# Vimshottari Dasha sequence and planetary period in years
VIMSHOTTARI_LORDS = [
    ("Ketu", "केतु", 7),
    ("Venus", "शुक्र", 20),
    ("Sun", "सूर्य", 6),
    ("Moon", "चन्द्र", 10),
    ("Mars", "मङ्गल", 7),
    ("Rahu", "राहु", 18),
    ("Jupiter", "बृहस्पति", 16),
    ("Saturn", "शनि", 19),
    ("Mercury", "बुध", 17)
]

# Tribhagi Dasha sequence (total 80 years: 2/3 of Vimshottari)
TRIBHAGI_LORDS = [
    ("Ketu", "केतु", 7.0 * (2.0 / 3.0)),       # 4.667 yrs
    ("Venus", "शुक्र", 20.0 * (2.0 / 3.0)),    # 13.333 yrs
    ("Sun", "सूर्य", 6.0 * (2.0 / 3.0)),       # 4.0 yrs
    ("Moon", "चन्द्र", 10.0 * (2.0 / 3.0)),    # 6.667 yrs
    ("Mars", "मङ्गल", 7.0 * (2.0 / 3.0)),      # 4.667 yrs
    ("Rahu", "राहु", 18.0 * (2.0 / 3.0)),      # 12.0 yrs
    ("Jupiter", "बृहस्पति", 16.0 * (2.0 / 3.0)),# 10.667 yrs
    ("Saturn", "शनि", 19.0 * (2.0 / 3.0)),    # 12.667 yrs
    ("Mercury", "बुध", 17.0 * (2.0 / 3.0))     # 11.333 yrs
]

# Yogini Dasha (36 years total)
YOGINI_LORDS = [
    ("Mangala", "मङ्गला (चन्द्र)", 1),
    ("Pingala", "पिङ्गला (सूर्य)", 2),
    ("Dhanya", "धान्या (गुरु)", 3),
    ("Bhramari", "भ्रामरी (भौम)", 4),
    ("Bhadrika", "भद्रिका (बुध)", 5),
    ("Ulka", "उल्का (शनि)", 6),
    ("Siddha", "सिद्धा (शुक्र)", 7),
    ("Sankata", "सङ्कटा (राहु)", 8)
]

def calculate_vimshottari_dasha(moon_longitude: float, birth_date: datetime, max_years: int = 100) -> Dict[str, Any]:
    """
    Computes Vimshottari Mahadasha and Antardasha tree based on exact Moon degree.
    """
    nakshatra_span = 360.0 / 27.0 # 13.333333°
    nak_num = int(moon_longitude / nakshatra_span) # 0 to 26
    deg_in_nak = moon_longitude % nakshatra_span
    
    # 27 nakshatras mapped to 9 rulers (0: Ketu, 1: Venus, ... 8: Mercury)
    lord_idx = nak_num % 9
    first_lord, first_lord_ne, total_period = VIMSHOTTARI_LORDS[lord_idx]
    
    # Fraction remaining (bhogya)
    fraction_remaining = 1.0 - (deg_in_nak / nakshatra_span)
    balance_years = fraction_remaining * total_period
    
    dasha_tree = []
    current_date = birth_date
    
    # First partial dasha
    end_date = current_date + timedelta(days=balance_years * 365.25)
    first_subs = []
    sub_cur = current_date
    for j in range(9):
        s_idx = (lord_idx + j) % 9
        s_name, s_ne, s_years = VIMSHOTTARI_LORDS[s_idx]
        sub_years = (balance_years * s_years) / 120.0
        sub_end = sub_cur + timedelta(days=sub_years * 365.25)
        first_subs.append({
            "sub_planet": s_name,
            "sub_planet_ne": s_ne,
            "start": sub_cur.strftime("%Y-%m-%d"),
            "end": sub_end.strftime("%Y-%m-%d"),
            "duration_months": round(sub_years * 12.0, 1)
        })
        sub_cur = sub_end

    dasha_tree.append({
        "planet": first_lord,
        "planet_ne": first_lord_ne,
        "start_date": current_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "duration_years": round(balance_years, 2),
        "sub_dashas": first_subs
    })
    current_date = end_date
    
    # Subsequent full dashas
    for i in range(1, 9):
        idx = (lord_idx + i) % 9
        p_name, p_ne, p_years = VIMSHOTTARI_LORDS[idx]
        if (current_date - birth_date).days / 365.25 > max_years:
            break
        end_date = current_date + timedelta(days=p_years * 365.25)
        
        # Sub-dashas (Antardasha)
        sub_list = []
        sub_cur = current_date
        for j in range(9):
            s_idx = (idx + j) % 9
            s_name, s_ne, s_years = VIMSHOTTARI_LORDS[s_idx]
            antardasha_years = (p_years * s_years) / 120.0
            sub_end = sub_cur + timedelta(days=antardasha_years * 365.25)
            sub_list.append({
                "sub_planet": s_name,
                "sub_planet_ne": s_ne,
                "start": sub_cur.strftime("%Y-%m-%d"),
                "end": sub_end.strftime("%Y-%m-%d"),
                "duration_months": round(antardasha_years * 12.0, 1)
            })
            sub_cur = sub_end
            
        dasha_tree.append({
            "planet": p_name,
            "planet_ne": p_ne,
            "start_date": current_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "duration_years": float(p_years),
            "sub_dashas": sub_list
        })
        current_date = end_date
        
    return {
        "engine_name": "Basistha Astrological Engine",
        "dasha_system": "Vimshottari (120 Years)",
        "balance_of_dasha": {
            "first_lord": first_lord,
            "first_lord_ne": first_lord_ne,
            "balance_years": round(balance_years, 3),
            "balance_text": f"{int(balance_years)} वर्ष {int((balance_years % 1.0) * 12)} महिना"
        },
        "dasha_tree": dasha_tree
    }

def calculate_yogini_dasha(moon_longitude: float, birth_date: datetime) -> Dict[str, Any]:
    """Computes Yogini Dasha (36 Years) with Mahadasha and Antardasha tree."""
    nak_num = int(moon_longitude / (360.0 / 27.0)) + 1 # 1-27
    deg_in_nak = moon_longitude % (360.0 / 27.0)
    
    # Yogini formula: (Nakshatra + 3) % 8
    yogini_idx = (nak_num + 3) % 8
    y_name, y_ne, y_period = YOGINI_LORDS[yogini_idx]
    
    fraction_remaining = 1.0 - (deg_in_nak / (360.0 / 27.0))
    balance_years = fraction_remaining * y_period
    
    dasha_tree = []
    current_date = birth_date
    end_date = current_date + timedelta(days=balance_years * 365.25)
    
    # Sub-dashas for first partial dasha
    first_subs = []
    sub_cur = current_date
    for j in range(8):
        s_idx = (yogini_idx + j) % 8
        s_name, s_ne, s_period = YOGINI_LORDS[s_idx]
        sub_years = (balance_years * s_period) / 36.0
        sub_end = sub_cur + timedelta(days=sub_years * 365.25)
        first_subs.append({
            "sub_planet": s_name,
            "sub_planet_ne": s_ne,
            "start": sub_cur.strftime("%Y-%m-%d"),
            "end": sub_end.strftime("%Y-%m-%d"),
            "duration_months": round(sub_years * 12.0, 1)
        })
        sub_cur = sub_end

    dasha_tree.append({
        "planet": y_name,
        "planet_ne": y_ne,
        "start_date": current_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "duration_years": round(balance_years, 2),
        "sub_dashas": first_subs
    })
    current_date = end_date
    
    for i in range(1, 8):
        idx = (yogini_idx + i) % 8
        name, ne, period = YOGINI_LORDS[idx]
        end_date = current_date + timedelta(days=period * 365.25)
        
        sub_list = []
        sub_cur = current_date
        for j in range(8):
            s_idx = (idx + j) % 8
            s_name, s_ne, s_period = YOGINI_LORDS[s_idx]
            sub_years = (period * s_period) / 36.0
            sub_end = sub_cur + timedelta(days=sub_years * 365.25)
            sub_list.append({
                "sub_planet": s_name,
                "sub_planet_ne": s_ne,
                "start": sub_cur.strftime("%Y-%m-%d"),
                "end": sub_end.strftime("%Y-%m-%d"),
                "duration_months": round(sub_years * 12.0, 1)
            })
            sub_cur = sub_end

        dasha_tree.append({
            "planet": name,
            "planet_ne": ne,
            "start_date": current_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "duration_years": float(period),
            "sub_dashas": sub_list
        })
        current_date = end_date
        
    return {
        "engine_name": "Basistha Astrological Engine",
        "dasha_system": "Yogini (36 Years)",
        "balance_of_dasha": {
            "first_lord": y_name,
            "first_lord_ne": y_ne,
            "balance_years": round(balance_years, 2),
            "balance_text": f"{int(balance_years)} वर्ष {int((balance_years % 1.0) * 12)} महिना"
        },
        "dasha_tree": dasha_tree
    }

def calculate_tribhagi_dasha(moon_longitude: float, birth_date: datetime, max_years: int = 80) -> Dict[str, Any]:
    """
    Computes Tribhagi Dasha (80 Years) Mahadasha and Antardasha tree.
    In Tribhagi, each Nakshatra of 13° 20' is divided into 3 equal parts (Tribhaga) of 4° 26' 40''.
    Total lifespan is 80 years (2/3 of Vimshottari 120 years).
    """
    nakshatra_span = 360.0 / 27.0 # 13.333333°
    nak_num = int(moon_longitude / nakshatra_span) # 0 to 26
    deg_in_nak = moon_longitude % nakshatra_span
    
    base_lord_idx = nak_num % 9
    tribhaga_span = nakshatra_span / 3.0 # 4.444444° = 4° 26' 40"
    part_idx = int(deg_in_nak / tribhaga_span) # 0, 1, or 2
    part_idx = min(2, max(0, part_idx))
    
    # Lord of current Tribhaga
    lord_idx = (base_lord_idx + part_idx) % 9
    first_lord, first_lord_ne, total_period = TRIBHAGI_LORDS[lord_idx]
    
    deg_in_tribhaga = deg_in_nak % tribhaga_span
    fraction_remaining = 1.0 - (deg_in_tribhaga / tribhaga_span)
    balance_years = fraction_remaining * total_period
    
    dasha_tree = []
    current_date = birth_date
    end_date = current_date + timedelta(days=balance_years * 365.25)
    
    # Antardashas for first partial dasha
    first_subs = []
    sub_cur = current_date
    for j in range(9):
        s_idx = (lord_idx + j) % 9
        s_name, s_ne, s_years = TRIBHAGI_LORDS[s_idx]
        sub_years = (balance_years * s_years) / 80.0
        sub_end = sub_cur + timedelta(days=sub_years * 365.25)
        first_subs.append({
            "sub_planet": s_name,
            "sub_planet_ne": s_ne,
            "start": sub_cur.strftime("%Y-%m-%d"),
            "end": sub_end.strftime("%Y-%m-%d"),
            "duration_months": round(sub_years * 12.0, 1)
        })
        sub_cur = sub_end

    dasha_tree.append({
        "planet": first_lord,
        "planet_ne": first_lord_ne,
        "start_date": current_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "duration_years": round(balance_years, 2),
        "sub_dashas": first_subs
    })
    current_date = end_date
    
    # Subsequent full dashas
    for i in range(1, 9):
        idx = (lord_idx + i) % 9
        p_name, p_ne, p_years = TRIBHAGI_LORDS[idx]
        if (current_date - birth_date).days / 365.25 > max_years:
            break
        end_date = current_date + timedelta(days=p_years * 365.25)
        
        sub_list = []
        sub_cur = current_date
        for j in range(9):
            s_idx = (idx + j) % 9
            s_name, s_ne, s_years = TRIBHAGI_LORDS[s_idx]
            antardasha_years = (p_years * s_years) / 80.0
            sub_end = sub_cur + timedelta(days=antardasha_years * 365.25)
            sub_list.append({
                "sub_planet": s_name,
                "sub_planet_ne": s_ne,
                "start": sub_cur.strftime("%Y-%m-%d"),
                "end": sub_end.strftime("%Y-%m-%d"),
                "duration_months": round(antardasha_years * 12.0, 1)
            })
            sub_cur = sub_end
            
        dasha_tree.append({
            "planet": p_name,
            "planet_ne": p_ne,
            "start_date": current_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "duration_years": round(p_years, 2),
            "sub_dashas": sub_list
        })
        current_date = end_date
        
    return {
        "engine_name": "Basistha Astrological Engine",
        "dasha_system": "Tribhagi (80 Years)",
        "balance_of_dasha": {
            "first_lord": first_lord,
            "first_lord_ne": first_lord_ne,
            "balance_years": round(balance_years, 3),
            "balance_text": f"{int(balance_years)} वर्ष {int((balance_years % 1.0) * 12)} महिना"
        },
        "dasha_tree": dasha_tree
    }
