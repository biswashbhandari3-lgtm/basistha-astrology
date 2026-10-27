"""
Basistha Astronomical & Astrological Backend Engine
Main FastAPI Application Entrypoint (Production Hardened)
"""
import time
import logging
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.core.database import check_db_health, get_pool
from app.core.swisseph_wrapper import HAS_SWISSEPH
from app.api import (
    routes_auth,
    routes_kundali,
    routes_panchang,
    routes_dasha,
    routes_shadbala,
    routes_varshaphala,
    routes_matchmaking,
    routes_database,
    routes_phalit
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("basistha.main")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
# Basistha Astronomical & Astrological Engine API

**Basistha** is a modern, high-precision astronomical and astrological backend calculation engine 
integrating NASA JPL Swiss Ephemeris (`pyswisseph`), classical Vedic Siddhantas (Surya Siddhanta & Parashari),
and a PostgreSQL classical sloka & geographic atlas database.

### Core Capabilities:
* **Authentication:** Astrologer & User login, cryptographically signed JWT tokens.
* **Janmakundali:** Lagna, 9 Planets, Bhava Chalit, Shodashavarga (D1 to D60).
* **Panchanga & Muhurta:** Tithi, Vara, Nakshatra, Yoga, Karana, Sunrise/Sunset, Choghadiya, Hora, Rahukaal.
* **Dasha Systems:** Vimshottari (5-level tree), Yogini (36y), Ashtottari (108y), Tribhagi (80y).
* **Strengths:** Shadbala (6-fold strengths in Rupas & Shashtiamsas) and Ashtakavarga (BAV, SAV, Shodhana).
* **Varshaphala:** Tajika Annual Solar Return, Muntha, 5 Office-Bearers, 16 Tajika Yogas, Sahams, Mudda Dasha.
* **Matchmaking:** Ashtakoota 36 Guna Milan & Manglik Dosha Analysis.
* **Database & Atlas:** Integrated PostgreSQL database with 142 tables of places, atlas, and classical texts.
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ─── Production Security Headers Middleware ────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = round((time.perf_counter() - start_time) * 1000, 2)
        
        # Performance & Tracking Header
        response.headers["X-Process-Time"] = f"{process_time}ms"
        response.headers["X-Engine"] = settings.APP_NAME
        
        # OWASP Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ─── CORS Configuration for Modern Web Frontends ───────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Engine"]
)

# ─── Include API Routers under /api/v1 ─────────────────────────────────────────
app.include_router(routes_auth.router, prefix=settings.API_PREFIX)
app.include_router(routes_kundali.router, prefix=settings.API_PREFIX)
app.include_router(routes_panchang.router, prefix=settings.API_PREFIX)
app.include_router(routes_dasha.router, prefix=settings.API_PREFIX)
app.include_router(routes_shadbala.router, prefix=settings.API_PREFIX)
app.include_router(routes_varshaphala.router, prefix=settings.API_PREFIX)
app.include_router(routes_matchmaking.router, prefix=settings.API_PREFIX)
app.include_router(routes_database.router, prefix=settings.API_PREFIX)
app.include_router(routes_phalit.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def startup_event():
    """Initializes pools and logs system readiness."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT} mode)")
    logger.info(f"Swiss Ephemeris status: {'ENABLED (pyswisseph)' if HAS_SWISSEPH else 'FALLBACK (Analytical Engine)'}")
    # Attempt DB pool warmup
    get_pool()

@app.get("/", tags=["Health & Info"])
def root():
    return {
        "engine": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "Online",
        "documentation": "/docs",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "supported_features": [
            "User Authentication & Astrologer Accounts (JWT)",
            "Lagna & Planetary Degrees (Drik & Surya Siddhanta)",
            "Panchanga & Muhurta (5 Angas, Choghadiya, Rahukaal)",
            "Vimshottari, Yogini & Tribhagi Dasha",
            "Shadbala & Ashtakavarga",
            "Shodashavarga (D1 to D60)",
            "Tajika Varshaphala & Mudda Dasha",
            "Ashtakoota 36 Guna Matchmaking",
            "PostgreSQL Classical Texts & Geographic Places"
        ]
    }

@app.get("/health", tags=["Health & Info"])
@app.get("/api/v1/health", tags=["Health & Info"])
def health_check():
    """Comprehensive health & diagnostics endpoint for monitoring."""
    db_health = check_db_health()
    return {
        "status": "healthy",
        "engine": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "swisseph": {
            "available": HAS_SWISSEPH,
            "mode": "Swiss Ephemeris (C-Library)" if HAS_SWISSEPH else "Vedic Analytical Engine Fallback"
        },
        "database": db_health,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
