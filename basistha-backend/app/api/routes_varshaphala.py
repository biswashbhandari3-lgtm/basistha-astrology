"""
Basistha Astrological Engine
Tajika Varshaphala API Endpoints
"""
from datetime import datetime
from fastapi import APIRouter
from app.models.schemas import VarshaphalaRequest, VarshaphalaResponse, LagnaDetails
from app.core.swisseph_wrapper import (
    get_julian_day, get_ayanamsha_value, calc_planet_position,
    calc_lagna_and_houses, get_dms, PLANET_IDS, RASHI_NAMES, RASHI_NAMES_NE,
    NAKSHATRA_NAMES, NAKSHATRA_NAMES_NE
)
from app.core.varshaphala import calculate_muntha, calculate_sahams, calculate_mudda_dasha, TAJIKA_YOGA_NAMES

router = APIRouter(prefix="/varshaphala", tags=["Tajika Varshaphala"])

@router.post("/calculate", response_model=VarshaphalaResponse)
def get_varshaphala(req: VarshaphalaRequest):
    """
    Computes Tajika Varshaphala:
    Solar Return Time, Varsha Lagna, Muntha, Varsha Lord, Sahams, and Mudda Dasha.
    """
    b = req.birth_details
    completed_years = req.target_year - b.year
    
    # Calculate birth Sun and Lagna
    jd_birth = get_julian_day(b.year, b.month, b.day, b.hour, b.minute, b.second, b.timezone_offset)
    ayan_birth = get_ayanamsha_value(jd_birth, b.ayanamsha)
    birth_sun_lon, _ = calc_planet_position(jd_birth, PLANET_IDS["SUN"], ayan_birth)
    birth_lagna_lon, _ = calc_lagna_and_houses(jd_birth, b.latitude, b.longitude, b.house_system, ayan_birth)
    birth_lagna_rashi = int(birth_lagna_lon / 30.0)
    
    # Approximate solar return date/time for target year
    varsha_dt = datetime(req.target_year, b.month, b.day, b.hour, b.minute)
    jd_varsha = get_julian_day(req.target_year, b.month, b.day, b.hour, b.minute, 0.0, b.timezone_offset)
    ayan_varsha = get_ayanamsha_value(jd_varsha, b.ayanamsha)
    
    # Varsha Lagna
    varsha_lagna_lon, _ = calc_lagna_and_houses(jd_varsha, b.latitude, b.longitude, b.house_system, ayan_varsha)
    vl_deg, vl_min, vl_sec = get_dms(varsha_lagna_lon % 30.0)
    vl_rashi = int(varsha_lagna_lon / 30.0)
    vl_nak = int(varsha_lagna_lon / (360.0 / 27.0))
    vl_pada = int((varsha_lagna_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
    
    varsha_lagna_data = LagnaDetails(
        longitude=round(varsha_lagna_lon, 4),
        degree=vl_deg,
        minute=vl_min,
        second=vl_sec,
        rashi_id=vl_rashi + 1,
        rashi_name=RASHI_NAMES[vl_rashi],
        rashi_name_ne=RASHI_NAMES_NE[vl_rashi],
        nakshatra_name=NAKSHATRA_NAMES[vl_nak],
        nakshatra_name_ne=NAKSHATRA_NAMES_NE[vl_nak],
        nakshatra_pada=vl_pada
    )
    
    # Muntha
    muntha_data = calculate_muntha(birth_lagna_rashi, completed_years)
    
    # Planets at Solar Return
    sun_lon, _ = calc_planet_position(jd_varsha, PLANET_IDS["SUN"], ayan_varsha)
    moon_lon, _ = calc_planet_position(jd_varsha, PLANET_IDS["MOON"], ayan_varsha)
    jup_lon, _ = calc_planet_position(jd_varsha, PLANET_IDS["JUPITER"], ayan_varsha)
    
    # Sahams
    is_day = 6 <= b.hour < 18
    sahams_data = calculate_sahams(sun_lon, moon_lon, varsha_lagna_lon, jup_lon, is_day)
    
    # Mudda Dasha
    mudda_data = calculate_mudda_dasha(varsha_dt)
    
    # Tajika Yogas list
    yogas = []
    for code, ne, desc in TAJIKA_YOGA_NAMES:
        yogas.append({"yoga_name": code, "yoga_name_ne": ne, "description": desc, "status": "सक्रिय (Active)"})
        
    return VarshaphalaResponse(
        engine_name="Basistha Astronomical Engine",
        target_year=req.target_year,
        solar_return_time=varsha_dt.strftime("%Y-%m-%d %H:%M:%S"),
        varsha_lagna=varsha_lagna_data,
        muntha=muntha_data,
        varsha_lord={"lord": "Jupiter", "lord_ne": "बृहस्पति (गुरु)", "office": "मुन्थापति तथा त्रैराशीश"},
        tajika_yogas=yogas,
        sahams=sahams_data,
        mudda_dasha=mudda_data
    )
