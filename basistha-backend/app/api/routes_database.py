"""
Basistha Astrological Engine
Database Query & Classical Slokas API Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from app.core.database import search_places, check_db_health, get_db_connection

router = APIRouter(prefix="/database", tags=["Database & Classical Texts"])

class PlaceItem(BaseModel):
    name: str
    name_ne: str
    latitude: float
    longitude: float
    timezone: float
    country: str

class DatabaseSummaryResponse(BaseModel):
    engine_name: str = "Basistha Astronomical Engine"
    database_status: str
    table_count: int
    sample_tables: List[str]

@router.get("/places", response_model=List[PlaceItem])
def get_places(q: str = Query(..., min_length=2, description="Search query for city or place in Nepal or worldwide")):
    """Searches geographic places and cities from the migrated database."""
    results = search_places(query=q)
    return [PlaceItem(**r) for r in results]

@router.get("/summary", response_model=DatabaseSummaryResponse)
def get_database_summary():
    """Returns the status and table summary of the migrated PostgreSQL database."""
    health = check_db_health()
    sample_tables = []
    table_count = health.get("public_tables_count", 0)
    
    try:
        with get_db_connection() as conn:
            if conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT table_name FROM information_schema.tables 
                        WHERE table_schema='public' 
                        ORDER BY table_name LIMIT 20;
                    """)
                    sample_tables = [row[0] for row in cur.fetchall()]
    except Exception:
        pass
        
    return DatabaseSummaryResponse(
        database_status=health.get("status", "unknown"),
        table_count=table_count or 0,
        sample_tables=sample_tables
    )
