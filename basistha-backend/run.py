"""
Basistha Astronomical Engine - Server Launcher
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print("=" * 60)
    print("  Basistha Astronomical & Astrological Backend Engine")
    print(f"  Server running at: http://0.0.0.0:{port}")
    print(f"  Interactive Docs at: http://0.0.0.0:{port}/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
