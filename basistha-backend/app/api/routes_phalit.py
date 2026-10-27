"""
Basistha Astrological Engine
Phalit (Predictive Astrology & Classical Interpretations) API Endpoints
"""
from typing import Optional, Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.models.schemas import BirthDetailsRequest
from app.core.swisseph_wrapper import (
    get_julian_day, get_ayanamsha_value, calc_planet_position,
    calc_lagna_and_houses, PLANET_IDS
)
from app.core.dasha import calculate_vimshottari_dasha
from app.core.phalit import compute_kundali_phalit, get_bhavastha_graha_sloka, get_bhavesh_sloka, get_dasha_phala_slokas
from datetime import datetime

router = APIRouter(prefix="/phalit", tags=["Phalit & Classical Slokas"])

class PhalitRequest(BaseModel):
    birth_details: BirthDetailsRequest
    current_mahadasha: Optional[str] = None
    current_antardasha: Optional[str] = None

class BhaveshItem(BaseModel):
    bhavesh: int
    bhavesh_name_ne: str
    in_bhava: int
    in_bhava_name_ne: str
    parashar_sloka: str

class PlanetOccupant(BaseModel):
    bhava: int
    bhava_name_ne: str
    planet: str
    planet_ne: str
    mansagari_sloka: str
    classical_interpretations: List[Dict[str, Any]]

class BhavaInterpretation(BaseModel):
    bhava: int
    bhava_name_ne: str
    rashi_number: int
    lord_planet: str
    lord_planet_ne: str
    lord_placed_in_bhava: int
    bhavesh_interpretation: Optional[BhaveshItem] = None
    planets_present: List[PlanetOccupant] = []

class PhalitResponse(BaseModel):
    engine_name: str = "Basistha Classical Phalit Engine"
    lagna_rashi: int
    bhava_analysis: List[BhavaInterpretation]
    dasha_interpretation: Optional[Dict[str, Any]] = None

@router.post("/interpret", response_model=PhalitResponse)
def get_kundali_interpretations(req: PhalitRequest):
    """
    Computes complete classical Phalit interpretations for a horoscope:
    - 12 Bhavas analysis (Sign, Lord, Lord placement, Slokas from Parashar).
    - Mansagari Bhavastha Graha slokas for all 9 planets.
    - Chamatkar Chintamani slokas across 29 classical authorities.
    - Current Mahadasha & Antardasha interpretation slokas.
    """
    b = req.birth_details
    jd = get_julian_day(b.year, b.month, b.day, b.hour, b.minute, b.second, b.timezone_offset)
    ayan_val = get_ayanamsha_value(jd, b.ayanamsha)
    
    # 1. Lagna Rashi
    lagna_lon, _ = calc_lagna_and_houses(jd, b.latitude, b.longitude, b.house_system, ayan_val)
    lagna_rashi = int(lagna_lon / 30.0) + 1
    
    # 2. 9 Planetary Rashis
    planet_rashis = {}
    for p_name, p_id in PLANET_IDS.items():
        p_lon, _ = calc_planet_position(jd, p_id, ayan_val)
        planet_rashis[p_name] = int(p_lon / 30.0) + 1
        
    # 3. Determine current dasha if not provided
    md = req.current_mahadasha
    ad = req.current_antardasha
    if not md:
        moon_lon, _ = calc_planet_position(jd, PLANET_IDS["MOON"], ayan_val)
        b_date = datetime(b.year, b.month, b.day, b.hour, b.minute)
        d_res = calculate_vimshottari_dasha(moon_lon, b_date)
        md = d_res.get("current_dasha", {}).get("mahadasha")
        ad = d_res.get("current_dasha", {}).get("antardasha")
        
    result = compute_kundali_phalit(
        lagna_rashi=lagna_rashi,
        planet_rashis=planet_rashis,
        current_mahadasha=md,
        current_antardasha=ad
    )
    return PhalitResponse(**result)
