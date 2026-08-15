"""
AIS Vessel Discovery Service.

Primary: aisstream.io WebSocket — server-side snapshot, NOT live streaming.
         Opens WS, collects data for SNAPSHOT_SECONDS, caches in DB.
Fallback: SIMULATED seed data when AISSTREAM_API_KEY is absent.

Every candidate is labelled CANDIDATE_UNVERIFIED — never CONFIRMED.
Spare capacity is NEVER inferred from AIS — only human-entered.
"""
from __future__ import annotations
import asyncio
import json
import math
from datetime import datetime, timezone
from typing import Any

from config import get_settings

# ── SIMULATED seed vessels (used when AIS key is absent) ──────────────
# Clearly labelled SIMULATED — never passed off as real AIS data.
SIMULATED_VESSELS: list[dict[str, Any]] = [
    {
        "mmsi": "DEMO-001", "imo": None,
        "name": "MV Atlantic Pioneer", "vessel_type": "VLCC",
        "flag": "Marshall Islands", "dwt": 299000,
        "current_lat": 22.50, "current_lon": 60.20,
        "current_destination": "Singapore",
        "eta_destination": None, "speed_knots": 13.5, "heading": 110,
        "source": "simulated", "source_type": "SIMULATED",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED — demo vessel. Not real AIS data.",
    },
    {
        "mmsi": "DEMO-002", "imo": None,
        "name": "MT Gulf Meridian", "vessel_type": "Suezmax",
        "flag": "Greece", "dwt": 158000,
        "current_lat": 15.80, "current_lon": 52.30,
        "current_destination": "Rotterdam",
        "eta_destination": None, "speed_knots": 12.8, "heading": 315,
        "source": "simulated", "source_type": "SIMULATED",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED — demo vessel. Not real AIS data.",
    },
    {
        "mmsi": "DEMO-003", "imo": None,
        "name": "MT Horizon Star", "vessel_type": "Aframax",
        "flag": "Norway", "dwt": 105000,
        "current_lat": 18.20, "current_lon": 68.40,
        "current_destination": "Mumbai",
        "eta_destination": None, "speed_knots": 14.2, "heading": 85,
        "source": "simulated", "source_type": "SIMULATED",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED — demo vessel. Not real AIS data.",
    },
    {
        "mmsi": "DEMO-004", "imo": None,
        "name": "MV Pacific Fortune", "vessel_type": "VLCC",
        "flag": "Liberia", "dwt": 320000,
        "current_lat": 8.50, "current_lon": 77.80,
        "current_destination": "Qingdao",
        "eta_destination": None, "speed_knots": 13.0, "heading": 45,
        "source": "simulated", "source_type": "SIMULATED",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED — demo vessel. Not real AIS data.",
    },
    {
        "mmsi": "DEMO-005", "imo": None,
        "name": "MT Coral Sea", "vessel_type": "MR Tanker",
        "flag": "Singapore", "dwt": 47000,
        "current_lat": 12.30, "current_lon": 45.10,
        "current_destination": "Mumbai",
        "eta_destination": None, "speed_knots": 15.0, "heading": 95,
        "source": "simulated", "source_type": "SIMULATED",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED — demo vessel. Not real AIS data.",
    },
    {
        "mmsi": "DEMO-006", "imo": None,
        "name": "MT Norse Trader", "vessel_type": "Suezmax",
        "flag": "Denmark", "dwt": 155000,
        "current_lat": 25.30, "current_lon": 57.10,
        "current_destination": "Trieste",
        "eta_destination": None, "speed_knots": 13.2, "heading": 290,
        "source": "simulated", "source_type": "SIMULATED",
        "provenance_status": "CANDIDATE_UNVERIFIED",
        "notes": "SIMULATED — demo vessel. Not real AIS data.",
    },
]

SNAPSHOT_SECONDS = 8  # how long to hold the WS open per discovery run
BOUNDING_BOX_DEGREES = 25.0  # search radius around destination


async def _fetch_aisstream_snapshot(
    dest_lat: float,
    dest_lon: float,
    api_key: str,
    timeout_s: int = SNAPSHOT_SECONDS,
) -> list[dict[str, Any]]:
    """
    Open aisstream.io WebSocket, subscribe to a bounding box around the
    destination, collect vessel messages for `timeout_s` seconds, then close.
    Returns raw parsed vessel records.
    """
    try:
        import websockets

        box_lat_min = dest_lat - BOUNDING_BOX_DEGREES
        box_lat_max = dest_lat + BOUNDING_BOX_DEGREES
        box_lon_min = dest_lon - BOUNDING_BOX_DEGREES
        box_lon_max = dest_lon + BOUNDING_BOX_DEGREES

        subscribe_msg = {
            "APIKey": api_key,
            "BoundingBoxes": [[
                [box_lat_min, box_lon_min],
                [box_lat_max, box_lon_max],
            ]],
            "FilterMessageTypes": ["PositionReport"],
        }

        vessels: dict[str, dict] = {}
        try:
            async with websockets.connect(
                "wss://stream.aisstream.io/v0/stream",
                open_timeout=10,
                close_timeout=3,
            ) as ws:
                await ws.send(json.dumps(subscribe_msg))
                deadline = asyncio.get_event_loop().time() + timeout_s
                while asyncio.get_event_loop().time() < deadline:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=2.0)
                        msg = json.loads(raw)
                        meta = msg.get("MetaData", {})
                        pos = msg.get("Message", {}).get("PositionReport", {})
                        mmsi = str(meta.get("MMSI", ""))
                        if mmsi and mmsi not in vessels:
                            vessels[mmsi] = {
                                "mmsi": mmsi,
                                "imo": None,
                                "name": meta.get("ShipName", "Unknown").strip(),
                                "vessel_type": _map_vessel_type(meta.get("ShipType", 0)),
                                "flag": None,
                                "dwt": None,
                                "current_lat": pos.get("Latitude"),
                                "current_lon": pos.get("Longitude"),
                                "current_destination": meta.get("Destination", "").strip(),
                                "eta_destination": None,
                                "speed_knots": pos.get("Sog"),
                                "heading": pos.get("Cog"),
                                "source": "aisstream.io",
                                "source_type": "AIS_LIVE",
                                "provenance_status": "CANDIDATE_UNVERIFIED",
                                "ais_timestamp": datetime.now(timezone.utc).isoformat(),
                                "raw_ais_payload": msg,
                                "notes": "Live AIS position. Spare cargo capacity NOT known — contact vessel operator to verify.",
                            }
                            if len(vessels) >= 20:
                                break
                    except asyncio.TimeoutError:
                        continue
                    except Exception:
                        break
        except Exception as ws_err:
            print(f"[AIS] WebSocket note: {ws_err}")

        if vessels:
            return list(vessels.values())
        return []

    except Exception as e:
        print(f"[AIS] aisstream.io error: {e} — falling back to SIMULATED")
        return []


async def _fetch_ais_rest_snapshot(
    dest_lat: float,
    dest_lon: float,
    api_key: str,
    api_url: str,
) -> list[dict[str, Any]]:
    """
    Fetch live AIS positions via REST HTTP request to vendor endpoint.
    """
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"Authorization": f"Bearer {api_key}", "x-api-key": api_key}
            params = {"lat": dest_lat, "lon": dest_lon, "radius_km": 1500, "api_key": api_key}
            res = await client.get(api_url, headers=headers, params=params)
            if res.status_code == 200:
                data = res.json()
                vessels_list = data.get("vessels") or data.get("data") or []
                results = []
                for item in vessels_list[:20]:
                    results.append({
                        "mmsi": str(item.get("mmsi") or item.get("id")),
                        "imo": item.get("imo"),
                        "name": item.get("name") or item.get("shipname") or "Unknown Vessel",
                        "vessel_type": item.get("vessel_type") or "Tanker",
                        "flag": item.get("flag"),
                        "dwt": item.get("dwt"),
                        "current_lat": item.get("lat") or item.get("latitude"),
                        "current_lon": item.get("lon") or item.get("longitude"),
                        "current_destination": item.get("destination", "En Route"),
                        "eta_destination": item.get("eta"),
                        "speed_knots": item.get("speed") or 13.0,
                        "heading": item.get("heading") or 0,
                        "source": api_url,
                        "source_type": "AIS_LIVE",
                        "provenance_status": "CANDIDATE_UNVERIFIED",
                        "ais_timestamp": datetime.now(timezone.utc).isoformat(),
                        "notes": "Live AIS position. Spare cargo capacity NOT known — verify with vessel owner.",
                    })
                return results
    except Exception as e:
        print(f"[AIS] REST endpoint {api_url} error: {e}")
    return []


def _map_vessel_type(ship_type_code: int) -> str:
    if 80 <= ship_type_code <= 89:
        return "Tanker"
    if 70 <= ship_type_code <= 79:
        return "Cargo"
    if ship_type_code in (1, 2, 3, 4):
        return "Reserved"
    return f"Type-{ship_type_code}"


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def discover_candidates(
    scenario_id: str,
    dest_lat: float,
    dest_lon: float,
    dest_name: str,
    db_client: Any,
) -> tuple[list[dict], str]:
    """
    Discover vessel candidates for a scenario.
    Returns (list_of_candidates, data_source_label).
    All records are labelled CANDIDATE_UNVERIFIED.
    """
    settings = get_settings()
    raw_vessels: list[dict] = []
    source_label: str = "SIMULATED"

    if settings.has_aisstream:
        api_key = settings.effective_ais_key
        # Check if custom REST API URL provided
        if settings.ais_api_url:
            raw_vessels = await _fetch_ais_rest_snapshot(dest_lat, dest_lon, api_key, settings.ais_api_url)
            source_label = f"Live AIS API ({settings.ais_api_url})"
        else:
            raw_vessels = await _fetch_aisstream_snapshot(dest_lat, dest_lon, api_key)
            source_label = "aisstream.io (AIS_LIVE)"

        if not raw_vessels:
            raw_vessels = SIMULATED_VESSELS
            source_label = "SIMULATED (Live AIS offline/fallback)"
    else:
        raw_vessels = SIMULATED_VESSELS
        source_label = "SIMULATED"

    now = datetime.now(timezone.utc).isoformat()
    saved: list[dict] = []

    for v in raw_vessels:
        # Compute rough ETA to destination
        if v.get("current_lat") and v.get("current_lon") and v.get("speed_knots"):
            dist_km = _haversine_km(
                v["current_lat"], v["current_lon"], dest_lat, dest_lon
            )
            # sea factor ~1.3
            dist_nm = dist_km * 0.539957 * 1.3
            speed = max(v["speed_knots"], 1)
            eta_hours = dist_nm / speed
            v["eta_days_to_dest"] = round(eta_hours / 24, 1)

        record = {
            "scenario_id": scenario_id,
            "mmsi": v.get("mmsi"),
            "imo": v.get("imo"),
            "name": v["name"],
            "vessel_type": v.get("vessel_type"),
            "flag": v.get("flag"),
            "dwt": v.get("dwt"),
            "current_lat": v.get("current_lat"),
            "current_lon": v.get("current_lon"),
            "current_destination": v.get("current_destination"),
            "eta_destination": v.get("eta_destination"),
            "speed_knots": v.get("speed_knots"),
            "heading": v.get("heading"),
            "source": v.get("source", "simulated"),
            "source_type": v.get("source_type", "SIMULATED"),
            "provenance_status": "CANDIDATE_UNVERIFIED",
            "ais_timestamp": v.get("ais_timestamp") or now,
            "raw_ais_payload": v.get("raw_ais_payload"),
            "notes": v.get("notes", ""),
        }

        saved_record = db_client.insert("vessel_candidates", record)
        saved.append(saved_record)

    return saved, source_label
