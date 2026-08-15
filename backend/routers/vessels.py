"""Vessels router — discover AIS candidates and retrieve vessel details."""
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks

from db import get_db, DBClient
from schemas import VesselCandidateResponse
from services.ais_service import discover_candidates

router = APIRouter(prefix="/api/vessels", tags=["vessels"])

# Port coordinate lookup (populated from reference_ports seed data)
PORT_COORDS: dict[str, tuple[float, float]] = {
    "Mumbai": (18.95, 72.83), "JNPT": (18.95, 72.83),
    "Chennai": (13.08, 80.27),
    "Singapore": (1.29, 103.85),
    "Shanghai": (31.23, 121.47),
    "Rotterdam": (51.92, 4.48),
    "Houston": (29.76, -95.37),
    "Ras Tanura": (26.64, 50.16),
    "Abu Dhabi": (24.45, 54.38),
    "Fujairah": (25.13, 56.33),
    "Yanbu": (24.08, 38.05),
    "India": (20.59, 78.96),  # center of India fallback
}


def _resolve_port_coords(port_name: str) -> tuple[float, float]:
    for key, coords in PORT_COORDS.items():
        if key.lower() in port_name.lower() or port_name.lower() in key.lower():
            return coords
    # Default: Arabian Sea centroid
    return (15.0, 65.0)


@router.get("/discover")
async def discover_vessels(
    scenario_id: str,
    background_tasks: BackgroundTasks,
    db: DBClient = Depends(get_db),
):
    """
    Discover AIS vessel candidates for a scenario.
    All results are labelled CANDIDATE_UNVERIFIED.
    """
    scenario = db.select_one("scenarios", scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    dest_name = scenario.get("destination_port_name", "India")
    dest_lat, dest_lon = _resolve_port_coords(dest_name)

    candidates, source_label = await discover_candidates(
        scenario_id=scenario_id,
        dest_lat=dest_lat,
        dest_lon=dest_lon,
        dest_name=dest_name,
        db_client=db,
    )

    return {
        "scenario_id": scenario_id,
        "candidates": candidates,
        "count": len(candidates),
        "source": source_label,
        "provenance_note": (
            "All vessels shown as CANDIDATE — UNVERIFIED. "
            "AIS data indicates movement — it does NOT confirm available cargo capacity. "
            "Contact vessel operator/broker to verify commercial availability."
        ),
    }


@router.get("/{vessel_id}")
async def get_vessel(vessel_id: str, db: DBClient = Depends(get_db)):
    vessel = db.select_one("vessel_candidates", vessel_id)
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return vessel


@router.get("/")
async def list_vessels(scenario_id: str, db: DBClient = Depends(get_db)):
    rows = db.select("vessel_candidates", {"scenario_id": scenario_id})
    return {"vessels": rows, "count": len(rows)}
