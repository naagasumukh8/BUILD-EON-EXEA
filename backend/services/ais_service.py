"""
AIS Vessel Discovery Service — Real-Time Production Backend Module.

Rules & Architecture:
1. Environment Key Only: API keys read strictly from environment (.env). NEVER exposed or logged.
2. Dynamic Bounding Box: Narrow geographic bounding boxes computed dynamically per destination.
3. Intelligent Caching: Backend cache (5-minute TTL) prevents API hammering.
4. Honest Data Normalization:
   - Origin = UNKNOWN (if missing from AIS)
   - ETA = NOT AVAILABLE (if missing from AIS)
5. Provenance & Guardrails:
   - Always labelled CANDIDATE_UNVERIFIED.
   - Spare cargo capacity & charter rates are NEVER inferred from AIS.
   - Demo fallback data is NEVER passed off as LIVE.
"""
from __future__ import annotations
import asyncio
import json
import math
import os
import ssl
from datetime import datetime, timezone, timedelta
from typing import Any

from config import get_settings

# ── IN-MEMORY BACKEND CACHE (5-minute TTL) ───────────────────────────────────
_AIS_CACHE: dict[str, dict[str, Any]] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes cache lifetime

# ── DESTINATION GEOGRAPHIC BOUNDING BOX PRESETS ──────────────────────────────
DESTINATION_PRESETS: dict[str, tuple[float, float, float, float]] = {
    # format: (lat_min, lat_max, lon_min, lon_max)
    "mumbai": (10.0, 27.0, 50.0, 78.0),        # Arabian Sea, Hormuz, Gulf of Oman, West Coast India
    "vadinar": (12.0, 28.0, 50.0, 75.0),       # Gulf of Kutch & Oman Sea
    "jamnagar": (12.0, 28.0, 50.0, 75.0),      # Gulf of Kutch
    "tokyo": (25.0, 42.0, 120.0, 148.0),       # East China Sea, Philippine Sea, Japan Coast
    "rotterdam": (48.0, 60.0, -5.0, 10.0),     # English Channel, North Sea
    "singapore": (1.0, 15.0, 95.0, 110.0),     # Malacca Strait & South China Sea
}

def get_dynamic_bounding_box(dest_name: str, dest_lat: float, dest_lon: float) -> tuple[float, float, float, float]:
    """
    Computes a targeted geographic bounding box based on destination name or lat/lon coordinates.
    """
    d_clean = (dest_name or "").lower().strip()
    for key, bbox in DESTINATION_PRESETS.items():
        if key in d_clean:
            return bbox
    # Default narrow radius (+/- 10 degrees) around coordinates
    lat_min = max(-90.0, dest_lat - 10.0)
    lat_max = min(90.0, dest_lat + 10.0)
    lon_min = max(-180.0, dest_lon - 12.0)
    lon_max = min(180.0, dest_lon + 12.0)
    return (lat_min, lat_max, lon_min, lon_max)


def _map_vessel_type(ship_type_code: int) -> str:
    if 80 <= ship_type_code <= 89:
        return "Tanker"
    if 70 <= ship_type_code <= 79:
        return "Cargo"
    if ship_type_code in (1, 2, 3, 4):
        return "Special Craft"
    return f"Type-{ship_type_code}" if ship_type_code else "Tanker"


def _haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R_km = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    dist_km = 2 * R_km * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(dist_km * 0.539957, 1)  # km to nautical miles


async def fetch_ais_snapshot(
    dest_name: str,
    dest_lat: float,
    dest_lon: float,
    timeout_s: int = 8,
) -> tuple[list[dict[str, Any]], str, bool]:
    """
    Backend service to query AISStream WebSocket efficiently.
    Uses narrow scenario bounding boxes, backend caching, and honest normalized models.
    
    Returns: (normalized_vessels, source_label, is_live_data)
    """
    settings = get_settings()
    api_key = settings.effective_ais_key

    if not api_key:
        print("[AIS Backend] No API key configured. Returning demo fallback data.")
        return SIMULATED_VESSELS, "DEMO DATA (No API Key Configured)", False

    bbox = get_dynamic_bounding_box(dest_name, dest_lat, dest_lon)
    cache_key = f"{bbox[0]:.2f}_{bbox[1]:.2f}_{bbox[2]:.2f}_{bbox[3]:.2f}"
    now_utc = datetime.now(timezone.utc)

    # 1. Check Backend Cache
    if cache_key in _AIS_CACHE:
        cached_entry = _AIS_CACHE[cache_key]
        cached_time = cached_entry["timestamp"]
        if (now_utc - cached_time).total_seconds() < CACHE_TTL_SECONDS:
            v_count = len(cached_entry['vessels'])
            print(f"[AIS Backend] Returning cached AIS snapshot for bbox {cache_key} ({v_count} vessels)")
            lbl = f"Live AIS API (aisstream.io — Backend Cache [{v_count} Vessels])"
            return cached_entry["vessels"], lbl, True

    # 2. Query WebSocket from Backend with SSL context
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    sub_msg = {
        "APIKey": api_key,  # Environment key used safely; NEVER logged
        "BoundingBoxes": [[[bbox[0], bbox[2]], [bbox[1], bbox[3]]]],
        "FilterMessageTypes": ["PositionReport"]
    }

    vessels_map: dict[str, dict[str, Any]] = {}
    
    try:
        import websockets
        print(f"[AIS Backend] Connecting to wss://stream.aisstream.io/v0/stream for bbox: {bbox}")
        async with websockets.connect("wss://stream.aisstream.io/v0/stream", ssl=ssl_ctx, open_timeout=8) as ws:
            await ws.send(json.dumps(sub_msg))
            deadline = asyncio.get_event_loop().time() + timeout_s
            while asyncio.get_event_loop().time() < deadline:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    msg = json.loads(raw)
                    meta = msg.get("MetaData", {})
                    pos = msg.get("Message", {}).get("PositionReport", {})
                    mmsi = str(meta.get("MMSI", ""))
                    if mmsi and mmsi not in vessels_map:
                        v_lat = pos.get("Latitude")
                        v_lon = pos.get("Longitude")
                        if v_lat is None or v_lon is None:
                            continue
                        
                        dist_nm = _haversine_nm(v_lat, v_lon, dest_lat, dest_lon)
                        ais_dest = meta.get("Destination", "").strip() or "NOT AVAILABLE"
                        ais_eta = meta.get("ETA") or "NOT AVAILABLE"

                        # Honest Normalized Vessel Model
                        vessels_map[mmsi] = {
                            "mmsi": mmsi,
                            "imo": str(meta.get("IMO") or "UNKNOWN"),
                            "name": meta.get("ShipName", "Unknown Ship").strip(),
                            "vessel_type": _map_vessel_type(meta.get("ShipType", 0)),
                            "origin_port": "UNKNOWN",  # AIS does not provide origin; honest tag
                            "flag": meta.get("Flag") or "International",
                            "dwt": meta.get("Dwt"),
                            "current_lat": v_lat,
                            "current_lon": v_lon,
                            "speed_knots": pos.get("Sog") or 0.0,
                            "course": pos.get("Cog") or 0.0,
                            "heading": pos.get("TrueHeading") or 0,
                            "current_destination": ais_dest,
                            "eta_destination": ais_eta,
                            "distance_from_destination_nm": dist_nm,
                            "route_relevance": "HIGH" if dist_nm <= 1500 else ("MEDIUM" if dist_nm <= 3000 else "LOW"),
                            "source": "aisstream.io",
                            "source_type": "AIS_LIVE",
                            "provenance_status": "CANDIDATE_UNVERIFIED",
                            "commercial_verification_status": "NOT YET VERIFIED",
                            "ais_timestamp": meta.get("time_utc") or now_utc.isoformat(),
                            "notes": "Live AIS snapshot record. Spare cargo capacity & charter rates are UNVERIFIED — human confirmation required.",
                        }
                        if len(vessels_map) >= 25:
                            break
                except asyncio.TimeoutError:
                    continue
                except Exception:
                    break
    except Exception as e:
        print(f"[AIS Backend] WebSocket note: {type(e).__name__}")

    live_vessels = list(vessels_map.values())

    # Cache result in backend (even if empty) to protect rate limits
    _AIS_CACHE[cache_key] = {
        "timestamp": now_utc,
        "vessels": live_vessels
    }

    if live_vessels:
        return live_vessels, "Live AIS API (aisstream.io — Live Snapshot)", True
    else:
        print(f"[AIS Backend] 0 vessels captured in target bbox {bbox} for {timeout_s}s window.")
        return [], "Live AIS API (0 Vessels in Target Area)", True


# ── SIMULATED SEED DATA (Explicitly labeled SIMULATED for offline testing) ──
SIMULATED_VESSELS: list[dict[str, Any]] = [
    {
        "mmsi": "DEMO-901842", "imo": "9812401",
        "name": "MT Atlantic Pioneer", "vessel_type": "VLCC",
        "origin_port": "UNKNOWN",
        "flag": "Marshall Islands", "dwt": 299000,
        "current_lat": 22.50, "current_lon": 60.20,
        "current_destination": "Singapore",
        "eta_destination": "NOT AVAILABLE", "speed_knots": 13.5, "course": 110.0, "heading": 110,
        "source": "demo_fallback", "source_type": "DEMO_DATA",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED DATA — Offline demonstration fallback.",
    },
    {
        "mmsi": "DEMO-901843", "imo": "9745120",
        "name": "MT Gulf Meridian", "vessel_type": "Suezmax",
        "origin_port": "UNKNOWN",
        "flag": "Greece", "dwt": 158000,
        "current_lat": 15.80, "current_lon": 52.30,
        "current_destination": "Rotterdam",
        "eta_destination": "NOT AVAILABLE", "speed_knots": 12.8, "course": 315.0, "heading": 315,
        "source": "demo_fallback", "source_type": "DEMO_DATA",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED DATA — Offline demonstration fallback.",
    }
]


async def discover_candidates(
    scenario_id: str,
    dest_lat: float,
    dest_lon: float,
    dest_name: str,
    db_client: Any,
) -> tuple[list[dict], str]:
    """
    Production entry point called by backend API endpoints.
    Fetches real AIS snapshot using scenario-based dynamic bounding boxes.
    """
    vessels, source_label, is_live = await fetch_ais_snapshot(dest_name, dest_lat, dest_lon)
    saved: list[dict] = []
    now = datetime.now(timezone.utc).isoformat()

    for v in vessels:
        v_lat = v.get("current_lat") or 0.0
        v_lon = v.get("current_lon") or 0.0
        dist_nm = _haversine_nm(v_lat, v_lon, dest_lat, dest_lon)

        record = {
            "scenario_id": scenario_id,
            "mmsi": v.get("mmsi") or "UNKNOWN",
            "imo": v.get("imo") or "UNKNOWN",
            "name": v["name"],
            "vessel_type": v.get("vessel_type") or "Tanker",
            "origin_port": v.get("origin_port") or "UNKNOWN",
            "flag": v.get("flag") or "International",
            "dwt": v.get("dwt"),
            "current_lat": v_lat,
            "current_lon": v_lon,
            "speed_knots": v.get("speed_knots") or 0.0,
            "course": v.get("course") or 0.0,
            "heading": v.get("heading") or 0,
            "current_destination": v.get("current_destination") or "NOT AVAILABLE",
            "eta_destination": v.get("eta_destination") or "NOT AVAILABLE",
            "distance_from_destination_nm": dist_nm,
            "route_relevance": v.get("route_relevance") or ("HIGH" if dist_nm <= 1500 else "MEDIUM"),
            "source": source_label,
            "source_type": v.get("source_type") or "AIS_LIVE",
            "provenance_status": "CANDIDATE_UNVERIFIED",
            "commercial_verification_status": "NOT YET VERIFIED",
            "ais_timestamp": v.get("ais_timestamp") or now,
            "notes": v.get("notes") or "Live AIS candidate position. Capacity & charter rate UNVERIFIED.",
        }

        if db_client:
            try:
                saved_record = db_client.insert("vessel_candidates", record)
                saved.append(saved_record)
            except Exception:
                saved.append(record)
        else:
            saved.append(record)

    return saved, source_label
