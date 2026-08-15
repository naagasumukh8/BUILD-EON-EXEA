"""
Sea routing service using the `searoute` open-source Python library.
Returns route distance (km + nm) and GeoJSON waypoints for map display.
"""
from __future__ import annotations
import math
from typing import Any


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    a = (math.sin(math.radians(lat2 - lat1) / 2) ** 2
         + math.cos(phi1) * math.cos(phi2)
         * math.sin(math.radians(lon2 - lon1) / 2) ** 2)
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_sea_route(
    origin_lon: float, origin_lat: float,
    dest_lon: float, dest_lat: float,
) -> dict[str, Any]:
    """
    Calculate the shortest sea route between two points.
    Returns distance (km, nm), transit time estimate, and GeoJSON geometry.
    """
    try:
        import searoute as sr
        route = sr.searoute(
            [origin_lon, origin_lat],
            [dest_lon, dest_lat],
            units="km",
        )
        distance_km: float = route.properties.get("length", 0)
        distance_nm = distance_km * 0.539957
        geometry = route.geometry  # GeoJSON LineString

        return {
            "distance_km": round(distance_km, 1),
            "distance_nm": round(distance_nm, 1),
            "geometry": geometry,
            "source": "searoute",
            "provenance_status": "CALCULATED",
        }

    except Exception as e:
        # Fall back to haversine × 1.3 sea factor
        dist_km = _haversine_km(origin_lat, origin_lon, dest_lat, dest_lon) * 1.3
        dist_nm = dist_km * 0.539957
        return {
            "distance_km": round(dist_km, 1),
            "distance_nm": round(dist_nm, 1),
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [origin_lon, origin_lat],
                    [dest_lon, dest_lat],
                ],
            },
            "source": "haversine_fallback",
            "provenance_status": "ESTIMATED",
            "note": f"searoute unavailable ({e}). Using great-circle × 1.3 sea factor.",
        }


def estimate_transit_days(
    distance_km: float,
    speed_knots: float = 13.5,
) -> float:
    """Convert sea distance to transit days at given speed."""
    dist_nm = distance_km * 0.539957
    hours = dist_nm / max(speed_knots, 1)
    return round(hours / 24, 1)
