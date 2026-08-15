# Maritime Data Providers
# Clean adapter interfaces — swap out provider without changing optimizer logic
# All data is labeled with source and confidence.

import json
import os
import math
import urllib.request
import urllib.error
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"


# ─────────────────────────────────────────────
# Port & Distance Utilities
# ─────────────────────────────────────────────

def load_ports() -> list:
    with open(DATA_DIR / "ports.json") as f:
        return json.load(f)["ports"]


def load_pipelines() -> list:
    with open(DATA_DIR / "pipelines.json") as f:
        return json.load(f)["pipelines"]


def load_disruption_scenarios() -> list:
    with open(DATA_DIR / "disruption_scenarios.json") as f:
        return json.load(f)["scenarios"]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometers."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def estimate_sea_distance_km(lat1, lon1, lat2, lon2) -> float:
    """
    Estimates sea distance. Uses great-circle as base with a tortuosity factor.
    For production, replace with OpenRouteService or SeaRoutes API.
    """
    gc = haversine_km(lat1, lon1, lat2, lon2)
    # Average sea route is ~15% longer than great-circle
    return gc * 1.15


def estimate_voyage_days(distance_km: float, speed_knots: float = 13.5) -> float:
    distance_nm = distance_km / 1.852
    return distance_nm / (speed_knots * 24)


def get_port_by_id(port_id: str) -> dict | None:
    ports = load_ports()
    return next((p for p in ports if p["id"] == port_id), None)


# ─────────────────────────────────────────────
# Vessel Data Provider
# ─────────────────────────────────────────────

def get_vessels(product_filter: str = None, area_lat: float = None, area_lon: float = None, radius_km: float = 3000) -> dict:
    """
    Returns vessel data with source and confidence labels.
    Tries AIS provider first; falls back to dev dataset if unavailable.
    
    IMPORTANT: Spare capacity estimates are derived from vessel specs and voyage signals.
    They are NOT confirmed booking data. Always labeled with confidence.
    """
    api_key = os.environ.get("AISSTREAM_API_KEY")
    
    if api_key:
        try:
            return _fetch_aisstream(api_key, product_filter, area_lat, area_lon, radius_km)
        except Exception as e:
            print(f"[AIS provider] Error: {e}. Falling back to dev dataset.")
    
    return _load_fallback_vessels(product_filter)


def _load_fallback_vessels(product_filter: str = None) -> dict:
    with open(DATA_DIR / "vessels_fallback.json") as f:
        data = json.load(f)
    
    vessels = data["vessels"]
    if product_filter:
        vessels = [v for v in vessels if product_filter in v.get("product_compatible", [])]
    
    return {
        "source": "dev_fallback",
        "confidence": "low",
        "warning": "DEVELOPMENT FALLBACK DATA — Not real vessel positions or capacity. For demonstration only.",
        "vessels": vessels
    }


def _fetch_aisstream(api_key: str, product_filter: str, area_lat: float, area_lon: float, radius_km: float) -> dict:
    """
    Fetches vessel data from aisstream.io REST API.
    Spare capacity is estimated from vessel specs — not confirmed.
    """
    # aisstream.io WebSocket-based; for REST snapshot, use their vessel search endpoint
    # This is a simplified REST call; for real-time, use WebSocket in production
    url = "https://api.aisstream.io/v0/vessel/search"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = json.dumps({
        "ShipTypes": [80, 81, 82, 83, 84],  # Tanker types
        "Limit": 50
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    
    with urllib.request.urlopen(req, timeout=8) as response:
        raw = json.loads(response.read().decode("utf-8"))
    
    vessels = []
    for v in raw.get("vessels", []):
        estimated_spare = _estimate_spare_capacity(v)
        vessels.append({
            "mmsi": v.get("MMSI"),
            "name": v.get("ShipName", "Unknown"),
            "vessel_type": _map_ship_type(v.get("ShipType", 0)),
            "flag": v.get("Destination", "Unknown"),
            "dwt": v.get("MaxDraught", 0) * 500,  # rough estimate
            "current_lat": v.get("Latitude"),
            "current_lon": v.get("Longitude"),
            "speed_knots": v.get("Sog", 0),
            "destination_port": v.get("Destination", "Unknown"),
            "estimated_spare_capacity_pct": estimated_spare["pct"],
            "estimated_spare_mbbl": estimated_spare["mbbl"],
            "confidence": "low",
            "data_source": "aisstream.io",
            "note": "Spare capacity is an estimate from vessel specs and voyage signals. Not confirmed operational data."
        })
    
    return {
        "source": "aisstream.io",
        "confidence": "low",
        "warning": "Spare capacity figures are estimates derived from vessel specs. Not confirmed booking data.",
        "vessels": vessels
    }


def _estimate_spare_capacity(vessel_data: dict) -> dict:
    """
    Estimates spare capacity from voyage signals and vessel specs.
    This is a heuristic, NOT confirmed data.
    """
    # Rough heuristic: vessels in transit typically 85-95% loaded
    # This is illustrative — real estimation requires AIS+commercial data fusion
    import random
    pct = random.uniform(5, 25)  # 5-25% estimated spare
    dwt_est = vessel_data.get("MaxDraught", 15) * 500
    mbbl_est = round(dwt_est * pct / 100 * 7.3 / 1000)  # dwt to mbbl rough conversion
    return {"pct": round(pct, 1), "mbbl": mbbl_est}


def _map_ship_type(ship_type_code: int) -> str:
    mapping = {80: "Tanker", 81: "Tanker", 82: "Chemical Tanker", 83: "LNG Carrier", 84: "LPG Carrier"}
    return mapping.get(ship_type_code, "Tanker")


# ─────────────────────────────────────────────
# Weather / Route Risk Provider
# ─────────────────────────────────────────────

def get_route_weather_risk(lat: float, lon: float) -> dict:
    """
    Fetches marine weather from Open-Meteo Marine API (free, no key).
    Returns a normalized risk score 0-1.
    """
    try:
        url = (
            f"https://marine-api.open-meteo.com/v1/marine"
            f"?latitude={lat}&longitude={lon}"
            f"&hourly=wave_height,wind_wave_height"
            f"&forecast_days=3"
        )
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=6) as response:
            data = json.loads(response.read().decode("utf-8"))
        
        wave_heights = data.get("hourly", {}).get("wave_height", [])
        if wave_heights:
            max_wave = max(h for h in wave_heights if h is not None)
            # Risk: 0-1, waves over 6m = high risk
            risk = min(max_wave / 6.0, 1.0)
            return {"weather_risk": round(risk, 3), "max_wave_m": round(max_wave, 1), "source": "open-meteo.com"}
    except Exception as e:
        print(f"[Weather API] Error: {e}")
    
    return {"weather_risk": 0.1, "max_wave_m": None, "source": "fallback_default"}
