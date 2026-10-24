"""
Basistha Astronomical & Astrological Backend Engine
Configuration Settings with Production Security Support
"""
import os
from typing import List
from pydantic import BaseModel, Field

class Settings(BaseModel):
    APP_NAME: str = "Basistha Astronomical Engine"
    APP_VERSION: str = "2.0.0"
    API_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development") # development / production
    
    # Astronomical Defaults
    EPHEMERIS_PATH: str = os.getenv("EPHEMERIS_PATH", "./ephe")
    DEFAULT_AYANAMSHA: str = os.getenv("DEFAULT_AYANAMSHA", "LAHIRI")  # LAHIRI, RAMAN, KP, SAYANA
    DEFAULT_HOUSE_SYSTEM: str = os.getenv("DEFAULT_HOUSE_SYSTEM", "P")  # P = Placidus, W = Whole Sign, O = Sripati
    DEFAULT_TIMEZONE_OFFSET: float = float(os.getenv("DEFAULT_TIMEZONE_OFFSET", "5.75")) # Nepal Time (UTC + 5:45)
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "basistha_vedic_super_secret_jwt_key_2026_change_in_production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 Hours
    
    # CORS Origins (Comma-separated in env or defaults)
    ALLOWED_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://basistha.vercel.app,https://vedaschakshu.com"
        ).split(",") if origin.strip()
    ]
    
    # Database Settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Biswash%40%2312@localhost:5432/basistha_astrology"
    )
    PG_HOST: str = os.getenv("PG_HOST", "localhost")
    PG_PORT: int = int(os.getenv("PG_PORT", "5432"))
    PG_USER: str = os.getenv("PG_USER", "postgres")
    PG_PASSWORD: str = os.getenv("PG_PASSWORD", "Biswash@#12")
    PG_DBNAME: str = os.getenv("PG_DBNAME", "basistha_astrology")
    DB_POOL_MIN: int = int(os.getenv("DB_POOL_MIN", "1"))
    DB_POOL_MAX: int = int(os.getenv("DB_POOL_MAX", "10"))
    
    # Rate Limiting & Throttling
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))

settings = Settings()
