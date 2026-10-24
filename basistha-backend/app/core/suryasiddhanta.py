"""
Basistha Astronomical Engine
Surya Siddhanta Classical Ganita Engine
Replicating classical Ahargana, Epicycles (Paridhi), and Chatuḥsaṃskāra
"""
import math
from typing import Dict, Any, Tuple

# Surya Siddhanta Revolutions in a Mahayuga (4,320,000 solar years)
MAHAYUGA_CIVIL_DAYS = 1577917828
BHAGANAS = {
    "SUN": 4320000,
    "MOON": 57753336,
    "MARS": 2296832,
    "MERCURY_SIGHRA": 17937060,
    "JUPITER": 364220,
    "VENUS_SIGHRA": 7022376,
    "SATURN": 146568,
    "MOON_APOGEE": 488203,
    "MOON_NODE": 232238 # Rahu (retrograde)
}

# Classical Epicycles (Manda and Sighra Paridhi in degrees out of 360)
# (Odd quadrant manda, Even quadrant manda, Odd sighra, Even sighra)
PARIDHI_TABLE = {
    "SUN":     (14.0, 13.67, 0.0, 0.0),
    "MOON":    (32.0, 31.67, 0.0, 0.0),
    "MARS":    (75.0, 72.0, 235.0, 232.0),
    "MERCURY": (30.0, 28.0, 133.0, 132.0),
    "JUPITER": (33.0, 32.0, 70.0, 72.0),
    "VENUS":   (12.0, 11.0, 262.0, 260.0),
    "SATURN":  (49.0, 48.0, 39.0, 40.0)
}

def calculate_ahargana(kalyabda: int, elapsed_months: int, tithi: int) -> int:
    """
    Computes Ahargana (number of civil days elapsed since start of Kaliyuga).
    Kaliyuga start: 18 February 3102 BCE (-3101-02-18 Julian).
    """
    solar_months = (kalyabda * 12) + elapsed_months
    adhimasas = (solar_months * 1593336) // 51840000
    tithis = (solar_months + adhimasas) * 30 + tithi
    avama_days = (tithis * 25082252) // 1603000080
    ahargana = tithis - avama_days
    return ahargana

def mean_planet_suryasiddhanta(ahargana: int, bhagana: int) -> float:
    """Mean longitude = (Ahargana * Bhagana / Civil Days in Mahayuga) * 360 mod 360."""
    total_revs = (ahargana * bhagana) / MAHAYUGA_CIVIL_DAYS
    mean_deg = (total_revs % 1.0) * 360.0
    return mean_deg

def get_mandaphala(mean_planet: float, apogee: float, odd_p: float, even_p: float) -> Tuple[float, float]:
    """Computes Manda Kendra and Mandaphala correction (Equation of Centre)."""
    kendra = (mean_planet - apogee) % 360.0
    kendra_rad = math.radians(kendra)
    sin_k = abs(math.sin(kendra_rad))
    # True epicycle radius
    p_true = odd_p - (odd_p - even_p) * sin_k
    manda_sin = (p_true * math.sin(kendra_rad)) / 360.0
    mandaphala = math.degrees(math.asin(max(-1.0, min(1.0, manda_sin))))
    return kendra, mandaphala

def get_sighraphala(planet_pos: float, sighrocha: float, odd_s: float, even_s: float) -> Tuple[float, float]:
    """Computes Sighra Kendra and Sighraphala correction."""
    kendra = (sighrocha - planet_pos) % 360.0
    kendra_rad = math.radians(kendra)
    sin_k = abs(math.sin(kendra_rad))
    s_true = odd_s - (odd_s - even_s) * sin_k
    
    r_kendra = math.radians(s_true)
    num = s_true * math.sin(kendra_rad)
    den = 360.0 + s_true * math.cos(kendra_rad)
    sighraphala = math.degrees(math.atan2(num, den))
    return kendra, sighraphala

def true_planet_suryasiddhanta(mean_pos: float, apogee: float, sighrocha: float, planet_name: str) -> float:
    """
    Classical Four-step Planetary Correction (Chatuḥsaṃskāra) for outer/inner planets.
    1. Half sighraphala applied to mean
    2. Half mandaphala applied to corrected mean
    3. Full mandaphala applied to original mean -> Manda Spashta
    4. Full sighraphala applied to Manda Spashta -> Parama Spashta (True Planet)
    """
    if planet_name in ["SUN", "MOON"]:
        paridhi = PARIDHI_TABLE[planet_name]
        _, manda_corr = get_mandaphala(mean_pos, apogee, paridhi[0], paridhi[1])
        return (mean_pos - manda_corr) % 360.0
    
    paridhi = PARIDHI_TABLE.get(planet_name, (30.0, 28.0, 100.0, 98.0))
    # Step 1: 1/2 Sighra
    _, s1 = get_sighraphala(mean_pos, sighrocha, paridhi[2], paridhi[3])
    m1 = (mean_pos + (s1 / 2.0)) % 360.0
    
    # Step 2: 1/2 Manda
    _, m_corr1 = get_mandaphala(m1, apogee, paridhi[0], paridhi[1])
    m2 = (mean_pos - (m_corr1 / 2.0)) % 360.0
    
    # Step 3: Full Manda
    _, m_corr_full = get_mandaphala(m2, apogee, paridhi[0], paridhi[1])
    manda_spashta = (mean_pos - m_corr_full) % 360.0
    
    # Step 4: Full Sighra
    _, s_corr_full = get_sighraphala(manda_spashta, sighrocha, paridhi[2], paridhi[3])
    true_pos = (manda_spashta + s_corr_full) % 360.0
    return true_pos
