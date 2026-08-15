"""
AI Maritime Supply Decision Platform — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""
from __future__ import annotations
import os
import sys

# Ensure backend/ is in path when run from project root
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from db import get_db
from routers import intake, vessels, deals, evaluator, optimizer, report

settings = get_settings()

app = FastAPI(
    title="AI Maritime Supply Decision Platform",
    description=(
        "Helps energy buyers find the best single or hybrid strategy "
        "to secure oil supply during normal operations or disruptions."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(intake.router)
app.include_router(vessels.router)
app.include_router(deals.router)
app.include_router(evaluator.router)
app.include_router(optimizer.router)
app.include_router(report.router)


# ── Health ────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    db = get_db()
    return {
        "status": "ok",
        "service": "AI Maritime Supply Decision Platform",
        "version": "2.0.0",
        "providers": {
            "ai": settings.gemini_model if settings.has_gemini else "not_configured",
            "database": db.mode,
            "ais": "aisstream.io" if settings.has_aisstream else "SIMULATED",
            "optimizer": _check_ortools(),
            "routing": _check_searoute(),
        },
        "warnings": _build_warnings(),
    }


def _check_ortools() -> str:
    try:
        from ortools.linear_solver import pywraplp
        return "or_tools"
    except ImportError:
        return "greedy_fallback (install ortools)"


def _check_searoute() -> str:
    try:
        import searoute
        return "searoute"
    except ImportError:
        return "haversine_fallback (install searoute)"


def _build_warnings() -> list[str]:
    warnings = []
    if not settings.has_gemini:
        warnings.append("GEMINI_API_KEY not set — AI features disabled")
    if not settings.has_supabase:
        warnings.append("Supabase not configured — using in-memory demo store")
    if not settings.has_aisstream:
        warnings.append("AISSTREAM_API_KEY not set — using SIMULATED vessel data")
    return warnings


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "type": type(exc).__name__},
    )


if __name__ == "__main__":
    import uvicorn
    # Load .env if present
    if os.path.exists(os.path.join(os.path.dirname(__file__), "..", ".env")):
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

    print(f"\n[Maritime Decision Platform API]")
    print(f"  Docs:     http://localhost:{settings.backend_port}/api/docs")
    print(f"  AI:       {'Gemini (' + settings.gemini_model + ')' if settings.has_gemini else 'NOT CONFIGURED'}")
    print(f"  Database: {'Supabase' if settings.has_supabase else 'In-memory (demo)'}")
    print(f"  AIS:      {'aisstream.io' if settings.has_aisstream else 'SIMULATED'}\n")

    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True,
        app_dir=os.path.dirname(__file__),
    )
