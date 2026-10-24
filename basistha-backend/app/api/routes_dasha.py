"""
Basistha Astrological Engine
Dasha API Endpoints
"""
from datetime import datetime
from fastapi import APIRouter
from app.models.schemas import BirthDetailsRequest, DashaResponse
from app.core.swisseph_wrapper import get_julian_day, get_ayanamsha_value, calc_planet_position, PLANET_IDS
from app.core.dasha import calculate_vimshottari_dasha, calculate_yogini_dasha

router = APIRouter(prefix="/dasha", tags=["Dasha Systems"])

@router.post("/vimshottari", response_model=DashaResponse)
def get_vimshottari(req: BirthDetailsRequest):
    """Computes Vimshottari Mahadasha and Antardasha tree up to 100 years."""
    jd = get_julian_day(req.year, req.month, req.day, req.hour, req.minute, req.second, req.timezone_offset)
    ayan_val = get_ayanamsha_value(jd, req.ayanamsha)
    moon_lon, _ = calc_planet_position(jd, PLANET_IDS["MOON"], ayan_val)
    
    b_date = datetime(req.year, req.month, req.day, req.hour, req.minute)
    data = calculate_vimshottari_dasha(moon_lon, b_date)
    return DashaResponse(**data)

@router.post("/yogini", response_model=DashaResponse)
def get_yogini(req: BirthDetailsRequest):
    """Computes Yogini Dasha (36 Years)."""
    jd = get_julian_day(req.year, req.month, req.day, req.hour, req.minute, req.second, req.timezone_offset)
    ayan_val = get_ayanamsha_value(jd, req.ayanamsha)
    moon_lon, _ = calc_planet_position(jd, PLANET_IDS["MOON"], ayan_val)
    
    b_date = datetime(req.year, req.month, req.day, req.hour, req.minute)
    data = calculate_yogini_dasha(moon_lon, b_date)
    return DashaResponse(**data)
