"""
Basistha Astrological Engine
Kundali API Endpoints
"""
from fastapi import APIRouter
from app.models.schemas import BirthDetailsRequest, KundaliResponse, LagnaDetails, PlanetaryPosition, BhavaCusp
from app.core.swisseph_wrapper import (
    get_julian_day, get_ayanamsha_value, calc_planet_position,
    calc_lagna_and_houses, get_dms, PLANET_IDS, PLANET_NAMES_NE,
    RASHI_NAMES, RASHI_NAMES_NE, NAKSHATRA_NAMES, NAKSHATRA_NAMES_NE
)
from app.core.shodashavarga import get_all_vargas_for_longitude

router = APIRouter(prefix="/kundali", tags=["Kundali (Horoscope)"])

@router.post("/calculate", response_model=KundaliResponse)
def calculate_kundali(req: BirthDetailsRequest):
    """
    Computes complete Janmakundali (Lagna, 9 Planets, Bhava Cusps, Shodashavarga)
    Calculated via Basistha Astronomical Engine.
    """
    jd = get_julian_day(req.year, req.month, req.day, req.hour, req.minute, req.second, req.timezone_offset)
    ayan_val = get_ayanamsha_value(jd, req.ayanamsha)
    
    # Lagna & Houses
    lagna_lon, cusps = calc_lagna_and_houses(jd, req.latitude, req.longitude, req.house_system, ayan_val)
    l_deg, l_min, l_sec = get_dms(lagna_lon % 30.0)
    l_rashi = int(lagna_lon / 30.0)
    l_nak = int(lagna_lon / (360.0 / 27.0))
    l_pada = int((lagna_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
    
    lagna_data = LagnaDetails(
        longitude=round(lagna_lon, 4),
        degree=l_deg,
        minute=l_min,
        second=l_sec,
        rashi_id=l_rashi + 1,
        rashi_name=RASHI_NAMES[l_rashi],
        rashi_name_ne=RASHI_NAMES_NE[l_rashi],
        nakshatra_name=NAKSHATRA_NAMES[l_nak],
        nakshatra_name_ne=NAKSHATRA_NAMES_NE[l_nak],
        nakshatra_pada=l_pada
    )
    
    # Calculate Planets
    planet_list = []
    divisional_charts = {"Lagna": get_all_vargas_for_longitude(lagna_lon)}
    sun_lon = 0.0
    
    # Sun first for combustion check
    sun_lon, _ = calc_planet_position(jd, PLANET_IDS["SUN"], ayan_val)
    
    for p_key, p_id in PLANET_IDS.items():
        p_lon, p_speed = calc_planet_position(jd, p_id, ayan_val)
        p_deg, p_min, p_sec = get_dms(p_lon % 30.0)
        p_rashi = int(p_lon / 30.0)
        p_nak = int(p_lon / (360.0 / 27.0))
        p_pada = int((p_lon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1
        
        # Combustion check
        combust = False
        if p_id not in [0, 10, 11]: # Not Sun, Rahu, Ketu
            combust = abs((p_lon - sun_lon + 180.0) % 360.0 - 180.0) < 8.5
            
        planet_list.append(PlanetaryPosition(
            planet_id=p_id,
            name=p_key.capitalize(),
            name_ne=PLANET_NAMES_NE[p_id],
            longitude=round(p_lon, 4),
            degree=p_deg,
            minute=p_min,
            second=p_sec,
            rashi_id=p_rashi + 1,
            rashi_name=RASHI_NAMES[p_rashi],
            rashi_name_ne=RASHI_NAMES_NE[p_rashi],
            nakshatra_id=p_nak + 1,
            nakshatra_name=NAKSHATRA_NAMES[p_nak],
            nakshatra_name_ne=NAKSHATRA_NAMES_NE[p_nak],
            nakshatra_pada=p_pada,
            speed=round(p_speed, 4),
            is_retrograde=(p_speed < 0),
            is_combust=combust
        ))
        
        divisional_charts[p_key.capitalize()] = get_all_vargas_for_longitude(p_lon)
        
    # Bhavas
    bhavas = []
    for i, cusp in enumerate(cusps, start=1):
        r_idx = int(cusp / 30.0)
        start_c = (cusp - 15.0) % 360.0
        end_c = (cusp + 15.0) % 360.0
        bhavas.append(BhavaCusp(
            bhava=i,
            start_degree=round(start_c, 2),
            madhya_degree=round(cusp, 2),
            end_degree=round(end_c, 2),
            rashi_id=r_idx + 1,
            rashi_name_ne=RASHI_NAMES_NE[r_idx]
        ))
        
    return KundaliResponse(
        engine_name="Basistha Astronomical Engine",
        julian_day=round(jd, 5),
        ayanamsha_name=req.ayanamsha,
        ayanamsha_value=round(ayan_val, 4),
        lagna=lagna_data,
        planets=planet_list,
        bhavas=bhavas,
        divisional_charts=divisional_charts
    )
