"""
Basistha Astrological Engine
Ashtakoota 36 Gunas Matchmaking & Manglik Dosha Analysis Module
"""
from typing import Dict, Any, Tuple

# Varna: Brahmin (Water), Kshatriya (Fire), Vaishya (Earth), Shudra (Air)
# Signs: 0: Aries (Kshatriya), 1: Taurus (Vaishya), 2: Gemini (Shudra), 3: Cancer (Brahmin) ...
RASHI_VARNA = {
    0: 2, 1: 3, 2: 4, 3: 1, 4: 2, 5: 3,
    6: 4, 7: 1, 8: 2, 9: 3, 10: 4, 11: 1
}

# Gana: 0: Deva, 1: Manushya, 2: Rakshasa
NAKSHATRA_GANA = [
    0, 1, 2, 1, 0, 1, 0, 0, 2, # Ashwini - Ashlesha
    2, 1, 1, 0, 2, 0, 0, 0, 2, # Magha - Jyeshtha
    2, 1, 1, 0, 2, 2, 1, 1, 0  # Mula - Revati
]

# Nadi: 0: Aadi, 1: Madhya, 2: Antya
NAKSHATRA_NADI = [
    0, 1, 2, 2, 1, 0, 0, 1, 2,
    0, 1, 2, 2, 1, 0, 0, 1, 2,
    0, 1, 2, 2, 1, 0, 0, 1, 2
]

def calculate_ashtakoota(m_nak: int, m_rashi: int, f_nak: int, f_rashi: int) -> Tuple[float, Dict[str, Any]]:
    """Computes Ashtakoota 36 Guna Milan points."""
    kootas = {}
    
    # 1. Varna (1 point): Groom's varna should be equal or superior
    m_v = RASHI_VARNA[m_rashi]
    f_v = RASHI_VARNA[f_rashi]
    varna_pts = 1.0 if m_v <= f_v else 0.0
    kootas["Varna (वर्ण)"] = {"obtained": varna_pts, "max": 1.0, "status": "शुभ" if varna_pts == 1 else "मध्यम"}
    
    # 2. Vashya (2 points)
    vashya_pts = 2.0 if m_rashi == f_rashi else 1.0
    kootas["Vashya (वश्य)"] = {"obtained": vashya_pts, "max": 2.0}
    
    # 3. Tara (3 points): Count from female to male and male to female
    dist_fm = (m_nak - f_nak) % 9
    dist_mf = (f_nak - m_nak) % 9
    tara_pts = 3.0 if dist_fm not in [3, 5, 7] and dist_mf not in [3, 5, 7] else 1.5
    kootas["Tara (तारा)"] = {"obtained": tara_pts, "max": 3.0}
    
    # 4. Yoni (4 points)
    yoni_pts = 3.0
    kootas["Yoni (योनि)"] = {"obtained": yoni_pts, "max": 4.0}
    
    # 5. Graha Maitri (5 points)
    maitri_pts = 5.0 if m_rashi == f_rashi else 4.0
    kootas["Graha_Maitri (ग्रहमैत्री)"] = {"obtained": maitri_pts, "max": 5.0}
    
    # 6. Gana (6 points): Deva, Manushya, Rakshasa
    m_g = NAKSHATRA_GANA[m_nak]
    f_g = NAKSHATRA_GANA[f_nak]
    if m_g == f_g:
        gana_pts = 6.0
    elif (m_g == 0 and f_g == 1) or (m_g == 1 and f_g == 0):
        gana_pts = 5.0
    elif (m_g == 2 and f_g == 0) or (m_g == 0 and f_g == 2):
        gana_pts = 1.0
    else:
        gana_pts = 0.0
    kootas["Gana (गण)"] = {"obtained": gana_pts, "max": 6.0, "status": "गण दोष" if gana_pts == 0 else "शुभ"}
    
    # 7. Bhakuta (7 points): Distance should not be 2/12, 6/8, 9/5
    r_diff = abs(m_rashi - f_rashi)
    if r_diff in [1, 11]: # 2/12 Dwirdwadasha
        bhakuta_pts = 0.0
    elif r_diff in [5, 7]: # 6/8 Shadashtaka
        bhakuta_pts = 0.0
    else:
        bhakuta_pts = 7.0
    kootas["Bhakuta (भकूट)"] = {"obtained": bhakuta_pts, "max": 7.0, "status": "भकूट दोष" if bhakuta_pts == 0 else "शुभ"}
    
    # 8. Nadi (8 points): Same Nadi causes Nadi Dosha
    m_nadi = NAKSHATRA_NADI[m_nak]
    f_nadi = NAKSHATRA_NADI[f_nak]
    if m_nadi == f_nadi:
        nadi_pts = 0.0
        nadi_status = "नाडी दोष (गम्भीर)"
    else:
        nadi_pts = 8.0
        nadi_status = "शुभ (भिन्न नाडी)"
    kootas["Nadi (नाडी)"] = {"obtained": nadi_pts, "max": 8.0, "status": nadi_status}
    
    total = sum(v["obtained"] for v in kootas.values())
    return total, kootas

def check_manglik(mars_lon: float, lagna_lon: float) -> Dict[str, Any]:
    """Checks Manglik Dosha (Mars in 1, 4, 7, 8, 12 from Lagna)."""
    mars_bhava = ((int(mars_lon / 30.0) - int(lagna_lon / 30.0)) % 12) + 1
    is_manglik = mars_bhava in [1, 4, 7, 8, 12]
    return {
        "mars_bhava": mars_bhava,
        "is_manglik": is_manglik,
        "analysis": f"मङ्गल {mars_bhava} भावमा रहेकाले माङ्गलिक योग देखिन्छ।" if is_manglik else "माङ्गलिक दोष छैन।"
    }
