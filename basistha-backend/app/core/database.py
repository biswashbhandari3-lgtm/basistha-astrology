"""
Basistha Astrological Engine
Database Management & Connection Pooling Module (PostgreSQL)
"""
import time
import logging
from contextlib import contextmanager
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

# Try importing psycopg2
HAS_PSYCOPG2 = False
try:
    import psycopg2
    from psycopg2 import pool, extras
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
    logger.warning("psycopg2 not installed; database features will run in mock/offline mode.")

from app.config import settings

_db_pool: Optional[Any] = None

def get_pool():
    """Initializes and returns the singleton connection pool."""
    global _db_pool
    if not HAS_PSYCOPG2:
        return None
    if _db_pool is None or _db_pool.closed:
        try:
            _db_pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=settings.DB_POOL_MIN,
                maxconn=settings.DB_POOL_MAX,
                host=settings.PG_HOST,
                port=settings.PG_PORT,
                user=settings.PG_USER,
                password=settings.PG_PASSWORD,
                dbname=settings.PG_DBNAME,
                connect_timeout=3
            )
            logger.info("PostgreSQL connection pool initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not connect to PostgreSQL ({e}). Trying DATABASE_URL fallback...")
            try:
                _db_pool = psycopg2.pool.ThreadedConnectionPool(
                    minconn=settings.DB_POOL_MIN,
                    maxconn=settings.DB_POOL_MAX,
                    dsn=settings.DATABASE_URL,
                    connect_timeout=3
                )
                logger.info("PostgreSQL connection pool initialized via DATABASE_URL.")
            except Exception as e2:
                logger.error(f"Failed to initialize PostgreSQL connection pool: {e2}")
                _db_pool = None
    return _db_pool

@contextmanager
def get_db_connection():
    """Context manager for borrowing and safely returning a pooled connection."""
    p = get_pool()
    if p is None:
        yield None
        return
    conn = None
    try:
        conn = p.getconn()
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database query error: {e}")
        raise
    finally:
        if conn and p and not p.closed:
            p.putconn(conn)

def check_db_health() -> Dict[str, Any]:
    """Tests database connectivity and reports latency in milliseconds."""
    if not HAS_PSYCOPG2:
        return {"status": "unsupported", "detail": "psycopg2 library not available"}
    
    start_time = time.perf_counter()
    try:
        with get_db_connection() as conn:
            if conn is None:
                return {
                    "status": "disconnected",
                    "latency_ms": None,
                    "detail": "Connection pool unavailable or offline"
                }
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                cur.fetchone()
                # Also count migrated tables
                cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
                table_count = cur.fetchone()[0]
                
        latency = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "connected",
            "latency_ms": latency,
            "database": settings.PG_DBNAME,
            "public_tables_count": table_count
        }
    except Exception as e:
        latency = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "error",
            "latency_ms": latency,
            "detail": str(e)
        }

def search_places(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    """Searches cities and places across migrated tables (NEPAL, places, etc.)."""
    results = []
    if not query or len(query.strip()) < 1:
        return results
    
    clean_q = f"%{query.strip()}%"
    try:
        with get_db_connection() as conn:
            if not conn:
                return results
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                # Search NEPAL table
                cur.execute("""
                    SELECT "City_name" as name, "Lat_deg" as lat_d, "Lat_min" as lat_m, 
                           "Long_deg" as lon_d, "Long_min" as lon_m, 'Nepal' as country
                    FROM "NEPAL"
                    WHERE "City_name" ILIKE %s
                    LIMIT %s;
                """, (clean_q, limit))
                rows = cur.fetchall()
                for r in rows:
                    results.append({
                        "name": r["name"] or "",
                        "name_ne": r["name"] or "",
                        "latitude": 27.7172,
                        "longitude": 85.3240,
                        "timezone": 5.75,
                        "country": r["country"]
                    })
    except Exception as e:
        logger.warning(f"Error searching places in database: {e}")
        
    return results
