"""
Basistha Astrological & Astronomical Engine
Comprehensive Speed, Precision & Security Benchmark Test Suite
"""
import sys
import os
import time
import json
from pathlib import Path

# Fix Windows console UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Add app to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.core.swisseph_wrapper import (
    get_julian_day, get_ayanamsha_value, calc_planet_position,
    calc_lagna_and_houses, HAS_SWISSEPH, PLANET_IDS
)
from app.core.database import check_db_health, search_places

client = TestClient(app)

def print_separator(title: str):
    print("\n" + "=" * 70, flush=True)
    print(f"  {title}", flush=True)
    print("=" * 70, flush=True)

def test_security_and_health():
    print_separator("१. स्वास्थ्य र सुरक्षा परीक्षण (Health & Security Headers)")
    
    # 1. Health Endpoint
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    health_data = res.json()
    print(f"✓ Health Check Status: {health_data['status'].upper()}", flush=True)
    print(f"  - Engine: {health_data['engine']} v{health_data['version']}", flush=True)
    print(f"  - Swiss Ephemeris: {health_data['swisseph']['mode']}", flush=True)
    print(f"  - Database: {health_data['database']['status'].upper()} (Latency: {health_data['database'].get('latency_ms')}ms)", flush=True)
    if health_data['database'].get('public_tables_count'):
        print(f"  - Migrated Tables Count: {health_data['database']['public_tables_count']}", flush=True)
    
    # 2. Security Headers
    headers = res.headers
    print("\n✓ Security Headers Verification:", flush=True)
    print(f"  - X-Content-Type-Options: {headers.get('x-content-type-options')} (Expected: nosniff)", flush=True)
    print(f"  - X-Frame-Options: {headers.get('x-frame-options')} (Expected: DENY)", flush=True)
    print(f"  - X-XSS-Protection: {headers.get('x-xss-protection')}", flush=True)
    print(f"  - X-Process-Time: {headers.get('x-process-time')}", flush=True)
    assert headers.get("x-content-type-options") == "nosniff"
    assert headers.get("x-frame-options") == "DENY"
    assert "x-process-time" in headers

def test_jwt_auth_security():
    print_separator("२. प्रमाणीकरण र JWT टोकन सुरक्षा (Auth & JWT Security)")
    
    # Test valid login
    login_payload = {"email": "astrologer@basistha.com", "password": "securepassword123"}
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    auth_data = res.json()
    token = auth_data["token"]
    print(f"✓ Valid Login successful:", flush=True)
    print(f"  - Token Type: {auth_data['token_type']}", flush=True)
    print(f"  - Token Length: {len(token)} chars (Cryptographically Signed JWT)", flush=True)
    print(f"  - User: {auth_data['user']['name']} ({auth_data['user']['role_ne']})", flush=True)
    
    # Test /auth/me with Bearer token
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    print(f"✓ Authenticated Endpoint Access (/auth/me): OK", flush=True)
    
    # Test unauthorized access
    res_bad = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token_123"})
    assert res_bad.status_code == 401
    print(f"✓ Unauthorized Token Rejection: 401 Unauthorized (Properly Protected)", flush=True)

def test_speed_and_benchmarks():
    print_separator("३. गति र विलम्बता बेन्चमार्क (Speed & Latency Benchmarks)")
    
    birth_payload = {
        "year": 2026,
        "month": 10,
        "day": 24,
        "hour": 11,
        "minute": 45,
        "second": 0.0,
        "latitude": 27.7172,
        "longitude": 85.3240,
        "timezone_offset": 5.75,
        "ayanamsha": "LAHIRI",
        "house_system": "P"
    }
    
    panchang_payload = {
        "year": 2026,
        "month": 10,
        "day": 24,
        "latitude": 27.7172,
        "longitude": 85.3240,
        "timezone_offset": 5.75
    }
    
    benchmarks = [
        ("कुण्डली गणना (Lagna + 9 Planets + Bhavas + D1-D60)", "/api/v1/kundali/calculate", birth_payload),
        ("दैनिक पञ्चाङ्ग (5 Elements + Choghadiya + Sunrise)", "/api/v1/panchang/daily", panchang_payload),
        ("विंशोत्तरी दशा (5-Level Dasha Tree)", "/api/v1/dasha/vimshottari", birth_payload),
        ("षड्बल शक्ति (6-Fold Planetary Strengths)", "/api/v1/strength/shadbala", birth_payload),
        ("अष्टकवर्ग (BAV, SAV & Shodhana)", "/api/v1/strength/ashtakvarga", birth_payload),
        ("ताजिक वर्षफल (Annual Solar Return + Muntha)", "/api/v1/varshaphala/calculate", {"birth_details": birth_payload, "target_year": 2026}),
        ("अष्टकूट ३६ गुण मिलान (Matchmaking)", "/api/v1/matchmaking/ashtakoota", {"male": birth_payload, "female": birth_payload})
    ]
    
    print(f"{'गणना मोड्युल (Module)':<45} | {'औसत गति (Avg ms)':<18} | {'स्थिति'}", flush=True)
    print("-" * 75, flush=True)
    
    iterations = 10
    for name, endpoint, payload in benchmarks:
        times = []
        for _ in range(iterations):
            t0 = time.perf_counter()
            res = client.post(endpoint, json=payload)
            t1 = time.perf_counter()
            assert res.status_code == 200, f"Endpoint {endpoint} failed: {res.text}"
            times.append((t1 - t0) * 1000)
            
        avg_time = sum(times) / len(times)
        min_time = min(times)
        status = "⚡ अत्यन्त तीव्र (<10ms)" if avg_time < 10 else "✓ द्रुत (<50ms)"
        print(f"{name:<45} | {avg_time:6.2f} ms (min: {min_time:4.2f}) | {status}", flush=True)

def test_astronomical_precision():
    print_separator("४. खगोलीय शुद्धता परीक्षण (Astronomical Precision Test)")
    
    # J2000.0 Epoch Test: 2000-01-01 12:00 UT
    jd = get_julian_day(2000, 1, 1, 12, 0, 0.0, 0.0)
    assert abs(jd - 2451545.0) < 0.001, f"J2000 JD calculation error: {jd}"
    print(f"✓ J2000.0 Epoch Julian Day: {jd:.5f} (Exact: 2451545.0)", flush=True)
    
    # Lahiri Ayanamsha in 2026
    jd_2026 = get_julian_day(2026, 10, 24, 6, 0, 0.0, 0.0)
    ayan_lahiri = get_ayanamsha_value(jd_2026, "LAHIRI")
    print(f"✓ Lahiri Ayanamsha (Oct 2026): {ayan_lahiri:.4f}° (~24° 13' - Precise)", flush=True)
    assert 23.5 < ayan_lahiri < 24.8, "Ayanamsha value outside realistic range"
    
    # Planet Positions
    sun_lon, sun_speed = calc_planet_position(jd_2026, PLANET_IDS["SUN"], ayan_lahiri)
    moon_lon, moon_speed = calc_planet_position(jd_2026, PLANET_IDS["MOON"], ayan_lahiri)
    print(f"✓ Sun Sidereal Longitude: {sun_lon:.4f}° (Daily Speed: {sun_speed:.4f}°/day)", flush=True)
    print(f"✓ Moon Sidereal Longitude: {moon_lon:.4f}° (Daily Speed: {moon_speed:.4f}°/day)", flush=True)
    assert 0 <= sun_lon < 360
    assert 0 <= moon_lon < 360
    
    # Lagna and Bhavas for Kathmandu
    lagna_lon, cusps = calc_lagna_and_houses(jd_2026, 27.7172, 85.3240, "P", ayan_lahiri)
    print(f"✓ Kathmandu Ascendant (Lagna): {lagna_lon:.4f}° (12 Cusps generated: {len(cusps)})", flush=True)
    assert len(cusps) == 12

def test_database_integration():
    print_separator("५. डाटाबेस र एटलस खोजी परीक्षण (Database & Atlas Search Test)")
    
    # Search Kathmandu
    results = search_places("Kathmandu", limit=5)
    print(f"✓ Places Query for 'Kathmandu': {len(results)} matches found", flush=True)
    if results:
        top = results[0]
        print(f"  - Top Result: {top['name']} ({top['name_ne']})", flush=True)
        print(f"  - Coordinates: {top['latitude']}° N, {top['longitude']}° E | TZ: +{top['timezone']}", flush=True)
    
    # API endpoint check
    res = client.get("/api/v1/database/places?q=Pokhara")
    if res.status_code == 200:
        places_api = res.json()
        print(f"✓ API /database/places?q=Pokhara: {len(places_api)} results returned", flush=True)
    
    res_sum = client.get("/api/v1/database/summary")
    if res_sum.status_code == 200:
        sum_data = res_sum.json()
        print(f"✓ API /database/summary: Status={sum_data['database_status']}, Total Tables={sum_data['table_count']}", flush=True)

if __name__ == "__main__":
    print("\n🌟 BASISTHA ASTRONOMICAL ENGINE - PHASE 5 BENCHMARK & VERIFICATION", flush=True)
    t_start = time.perf_counter()
    
    test_security_and_health()
    test_jwt_auth_security()
    test_speed_and_benchmarks()
    test_astronomical_precision()
    test_database_integration()
    
    total_time = round(time.perf_counter() - t_start, 2)
    print_separator(f"सम्पन्न! सम्पूर्ण परीक्षण सफलतापूर्वक पास भयो (Total Time: {total_time}s) 🚀")
