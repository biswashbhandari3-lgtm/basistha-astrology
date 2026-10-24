"""
Basistha Astrological Engine
Shadbala and Ashtakavarga API Endpoints
"""
from fastapi import APIRouter
from app.models.schemas import BirthDetailsRequest, ShadbalaResponse, AshtakvargaResponse
from app.core.swisseph_wrapper import get_julian_day, get_ayanamsha_value, calc_planet_position, calc_lagna_and_houses, PLANET_IDS
from app.core.shadbala import calculate_shadbala_for_planets
from app.core.ashtakvarga import calculate_ashtakvarga

router = APIRouter(prefix="/strength", tags=["Strengths (Shadbala & Ashtakavarga)"])

@router.post("/shadbala", response_model=ShadbalaResponse)
def get_shadbala(req: BirthDetailsRequest):
    """Computes 6-fold strengths (Sthana, Dig, Kaala, Chesta, Naisargika, Drik) in Rupas and Shashtiamshas."""
    jd = get_julian_day(req.year, req.month, req.day, req.hour, req.minute, req.second, req.timezone_offset)
    ayan_val = get_ayanamsha_value(jd, req.ayanamsha)
    lagna_lon, _ = calc_lagna_and_houses(jd, req.latitude, req.longitude, req.house_system, ayan_val)
    
    positions = {}
    for p_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        p_id = PLANET_IDS[p_name.upper()]
        p_lon, _ = calc_planet_position(jd, p_id, ayan_val)
        positions[p_name] = p_lon
        
    is_day = 6 <= req.hour < 18
    planets_data = calculate_shadbala_for_planets(positions, lagna_lon, is_day)
    return ShadbalaResponse(engine_name="Basistha Astronomical Engine", planets=planets_data)

@router.post("/ashtakvarga", response_model=AshtakvargaResponse)
def get_ashtakvarga(req: BirthDetailsRequest):
    """Computes BAV for 7 planets, SAV, Trikona Shodhana, and Shodhya Pinda."""
    jd = get_julian_day(req.year, req.month, req.day, req.hour, req.minute, req.second, req.timezone_offset)
    ayan_val = get_ayanamsha_value(jd, req.ayanamsha)
    
    rashis = {}
    for p_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        p_id = PLANET_IDS[p_name.upper()]
        p_lon, _ = calc_planet_position(jd, p_id, ayan_val)
        rashis[p_name] = int(p_lon / 30.0)
        
    data = calculate_ashtakvarga(rashis)
    return AshtakvargaResponse(**data)
