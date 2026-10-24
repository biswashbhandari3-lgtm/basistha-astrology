"""
Basistha Astrological Engine
Panchang API Endpoints
"""
from fastapi import APIRouter
from app.models.schemas import PanchangRequest, PanchangResponse
from app.core.panchang import get_panchang

router = APIRouter(prefix="/panchang", tags=["Panchanga & Muhurta"])

@router.post("/daily", response_model=PanchangResponse)
def get_daily_panchang(req: PanchangRequest):
    """
    Computes complete 5 elements of Panchang (Tithi, Vara, Nakshatra, Yoga, Karana),
    Sunrise/Sunset, Abhijit Muhurta, Rahukaal, and Choghadiya.
    """
    data = get_panchang(req.year, req.month, req.day, req.latitude, req.longitude, req.timezone_offset)
    return PanchangResponse(**data)
