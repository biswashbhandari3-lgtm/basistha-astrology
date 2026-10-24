"""
Basistha Astrological Engine
Kundali Milan & Matchmaking API Endpoints
"""
from fastapi import APIRouter
from app.models.schemas import MatchmakingRequest, MatchmakingResponse
from app.core.swisseph_wrapper import get_julian_day, get_ayanamsha_value, calc_planet_position, calc_lagna_and_houses, PLANET_IDS
from app.core.matchmaking import calculate_ashtakoota, check_manglik

router = APIRouter(prefix="/matchmaking", tags=["Matchmaking (Kundali Milan)"])

@router.post("/ashtakoota", response_model=MatchmakingResponse)
def get_matchmaking(req: MatchmakingRequest):
    """
    Computes Ashtakoota 36 Gunas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakuta, Nadi)
    and Manglik Dosha analysis for bride and groom.
    """
    # Male
    jd_m = get_julian_day(req.male.year, req.male.month, req.male.day, req.male.hour, req.male.minute, req.male.second, req.male.timezone_offset)
    ayan_m = get_ayanamsha_value(jd_m, req.male.ayanamsha)
    m_moon, _ = calc_planet_position(jd_m, PLANET_IDS["MOON"], ayan_m)
    m_mars, _ = calc_planet_position(jd_m, PLANET_IDS["MARS"], ayan_m)
    m_lagna, _ = calc_lagna_and_houses(jd_m, req.male.latitude, req.male.longitude, req.male.house_system, ayan_m)
    
    m_nak = int(m_moon / (360.0 / 27.0))
    m_rashi = int(m_moon / 30.0)
    
    # Female
    jd_f = get_julian_day(req.female.year, req.female.month, req.female.day, req.female.hour, req.female.minute, req.female.second, req.female.timezone_offset)
    ayan_f = get_ayanamsha_value(jd_f, req.female.ayanamsha)
    f_moon, _ = calc_planet_position(jd_f, PLANET_IDS["MOON"], ayan_f)
    f_mars, _ = calc_planet_position(jd_f, PLANET_IDS["MARS"], ayan_f)
    f_lagna, _ = calc_lagna_and_houses(jd_f, req.female.latitude, req.female.longitude, req.female.house_system, ayan_f)
    
    f_nak = int(f_moon / (360.0 / 27.0))
    f_rashi = int(f_moon / 30.0)
    
    # Ashtakoota 36 Gunas
    total_pts, kootas = calculate_ashtakoota(m_nak, m_rashi, f_nak, f_rashi)
    
    # Manglik
    m_manglik = check_manglik(m_mars, m_lagna)
    f_manglik = check_manglik(f_mars, f_lagna)
    
    is_compatible = (total_pts >= 18.0) and (kootas["Nadi (नाडी)"]["obtained"] > 0)
    if is_compatible:
        rec = f"३६ मा कुल {total_pts} गुण मिलेकाले विवाह उत्तम र शुभ मानिन्छ।"
    elif total_pts >= 18.0:
        rec = f"३६ मा कुल {total_pts} गुण मिले तापनि नाडी दोष रहेकाले ज्योतिषीय शान्ति आवश्यक पर्छ।"
    else:
        rec = f"३६ मा कुल {total_pts} गुण मात्र मिलेकाले सामान्य मानिन्छ।"
        
    return MatchmakingResponse(
        engine_name="Basistha Astronomical Engine",
        total_points=total_pts,
        max_points=36.0,
        is_compatible=is_compatible,
        ashtakoota=kootas,
        manglik_analysis={
            "male_groom": m_manglik,
            "female_bride": f_manglik,
            "both_manglik_neutralized": (m_manglik["is_manglik"] and f_manglik["is_manglik"])
        },
        recommendation=rec
    )
