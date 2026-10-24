"""
Basistha Astrological Engine
Pydantic Request & Response Schemas
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class BirthDetailsRequest(BaseModel):
    year: int = Field(..., example=2026)
    month: int = Field(..., example=10)
    day: int = Field(..., example=22)
    hour: int = Field(..., example=14)
    minute: int = Field(..., example=30)
    second: float = Field(0.0, example=0.0)
    latitude: float = Field(..., example=27.7172)     # Kathmandu: 27.7172
    longitude: float = Field(..., example=85.3240)    # Kathmandu: 85.3240
    timezone_offset: float = Field(5.75, example=5.75) # Nepal Time: +5.75
    ayanamsha: str = Field("LAHIRI", example="LAHIRI") # LAHIRI, RAMAN, KP, SAYANA
    house_system: str = Field("P", example="P")        # P = Placidus, W = Whole Sign, O = Sripati

class PlanetaryPosition(BaseModel):
    planet_id: int
    name: str
    name_ne: str
    longitude: float
    degree: int
    minute: int
    second: float
    rashi_id: int
    rashi_name: str
    rashi_name_ne: str
    nakshatra_id: int
    nakshatra_name: str
    nakshatra_name_ne: str
    nakshatra_pada: int
    speed: float
    is_retrograde: bool
    is_combust: bool

class LagnaDetails(BaseModel):
    longitude: float
    degree: int
    minute: int
    second: float
    rashi_id: int
    rashi_name: str
    rashi_name_ne: str
    nakshatra_name: str
    nakshatra_name_ne: str
    nakshatra_pada: int

class BhavaCusp(BaseModel):
    bhava: int
    start_degree: float
    madhya_degree: float
    end_degree: float
    rashi_id: int
    rashi_name_ne: str

class KundaliResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    julian_day: float
    ayanamsha_name: str
    ayanamsha_value: float
    lagna: LagnaDetails
    planets: List[PlanetaryPosition]
    bhavas: List[BhavaCusp]
    divisional_charts: Dict[str, Dict[str, int]]

class PanchangRequest(BaseModel):
    year: int = Field(..., example=2026)
    month: int = Field(..., example=10)
    day: int = Field(..., example=22)
    latitude: float = Field(27.7172, example=27.7172)
    longitude: float = Field(85.3240, example=85.3240)
    timezone_offset: float = Field(5.75, example=5.75)

class PanchangItem(BaseModel):
    name: str
    name_ne: str
    number: int
    progress_percentage: float

class PanchangResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    date_str: str
    sunrise: str
    sunset: str
    day_length_ghati: str
    day_length_hours: str
    night_length_hours: str
    vara: PanchangItem
    tithi: PanchangItem
    nakshatra: PanchangItem
    yoga: PanchangItem
    karana: PanchangItem
    abhijit_muhurta: Dict[str, str]
    rahukaal: Dict[str, str]
    choghadiya_day: List[Dict[str, Any]]
    choghadiya_night: List[Dict[str, Any]]

class DashaPeriod(BaseModel):
    planet: str
    planet_ne: str
    start_date: str
    end_date: str
    duration_years: float
    sub_dashas: Optional[List[Any]] = None

class DashaResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    dasha_system: str
    balance_of_dasha: Dict[str, Any]
    dasha_tree: List[DashaPeriod]

class ShadbalaPlanet(BaseModel):
    planet: str
    planet_ne: str
    sthana_bala: float
    dig_bala: float
    kaala_bala: float
    chesta_bala: float
    naisargika_bala: float
    drik_bala: float
    total_shashtiamsha: float
    total_rupa: float
    relative_rank: int

class ShadbalaResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    planets: List[ShadbalaPlanet]

class AshtakvargaResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    bav: Dict[str, List[int]]
    sav: List[int]
    shodhana: Dict[str, Any]

class VarshaphalaRequest(BaseModel):
    birth_details: BirthDetailsRequest
    target_year: int = Field(..., example=2026)

class VarshaphalaResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    target_year: int
    solar_return_time: str
    varsha_lagna: LagnaDetails
    muntha: Dict[str, Any]
    varsha_lord: Dict[str, Any]
    tajika_yogas: List[Dict[str, Any]]
    sahams: Dict[str, float]
    mudda_dasha: List[Dict[str, Any]]

class MatchmakingRequest(BaseModel):
    male: BirthDetailsRequest
    female: BirthDetailsRequest

class MatchmakingResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    total_points: float
    max_points: float = 36.0
    is_compatible: bool
    ashtakoota: Dict[str, Dict[str, Any]]
    manglik_analysis: Dict[str, Any]
    recommendation: str
