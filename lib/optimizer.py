# Maritime Supply Chain Optimizer
# Uses deterministic logic + (optional) OR-Tools for hybrid allocation.
# The LLM is NOT used here — only for explanation after optimization.

import json
import math
from typing import Optional
from .data_providers import (
    load_ports, load_pipelines, get_vessels, get_route_weather_risk,
    estimate_sea_distance_km, estimate_voyage_days, get_port_by_id
)

# Try OR-Tools; fall back to greedy if not installed
try:
    from ortools.linear_solver import pywraplp
    ORTOOLS_AVAILABLE = True
except ImportError:
    ORTOOLS_AVAILABLE = False
    print("[Optimizer] OR-Tools not installed. Using greedy fallback solver.")


PRODUCT_COMPAT = {
    "crude": ["crude"],
    "gasoline": ["gasoline", "refined"],
    "diesel": ["diesel", "refined"],
    "refined": ["gasoline", "diesel", "refined"],
    "lng": ["lng"],
    "lpg": ["lpg"]
}


# ─────────────────────────────────────────────
# Candidate Generation
# ─────────────────────────────────────────────

def generate_candidates(scenario: dict) -> dict:
    """
    Generates all feasible transport candidates for a supply scenario.
    Returns vessels, pipelines, and alternate routes sorted by feasibility.
    """
    product = scenario.get("product", "crude")
    volume_mbbl = float(scenario.get("volume_mbbl", 500))
    dest_port_id = scenario.get("destination_port_id", "MUM")
    max_days = float(scenario.get("max_days", 30))
    origin_port_id = scenario.get("origin_port_id", "RAS")
    disruption_id = scenario.get("disruption_id")

    dest_port = get_port_by_id(dest_port_id)
    origin_port = get_port_by_id(origin_port_id)

    if not dest_port:
        raise ValueError(f"Unknown destination port: {dest_port_id}")

    vessels_data = get_vessels(product_filter=product)
    vessels_raw = vessels_data.get("vessels", [])

    # --- Vessel Candidates ---
    vessel_candidates = []
    for v in vessels_raw:
        raw_compat = v.get("product_compatible", [])
        if isinstance(raw_compat, str):
            raw_compat = raw_compat.split()
        elif not isinstance(raw_compat, list):
            raw_compat = list(raw_compat) if raw_compat else []
        compat = any(p in raw_compat for p in PRODUCT_COMPAT.get(product, [product]))
        spare_mbbl = float(v.get("estimated_spare_mbbl", 0) or 0)
        if not compat or spare_mbbl < 10:
            continue

        # Distance from vessel to destination
        dist_km = estimate_sea_distance_km(
            v["current_lat"], v["current_lon"],
            dest_port["lat"], dest_port["lon"]
        )
        eta_days = v.get("eta_days") or estimate_voyage_days(dist_km, v.get("speed_knots", 13.5))

        # Skip if too slow
        if eta_days > max_days:
            continue

        # Cost model: spot tanker rate estimate (simplified)
        freight_usd_per_bbl = _estimate_freight_usd_per_bbl(
            v.get("vessel_type", "Aframax"), dist_km, product
        )
        weather = get_route_weather_risk(v["current_lat"], v["current_lon"])
        route_risk = _compute_route_risk(v, dest_port, disruption_id, weather)

        vessel_candidates.append({
            "id": f"vessel-{v['mmsi']}",
            "type": "vessel",
            "name": v["name"],
            "vessel_type": v.get("vessel_type"),
            "available_volume_mbbl": spare_mbbl,
            "max_volume_mbbl": spare_mbbl,
            "eta_days": round(eta_days, 1),
            "freight_usd_per_bbl": round(freight_usd_per_bbl, 2),
            "route_risk": round(route_risk, 3),
            "confidence": v.get("confidence", "low"),
            "data_source": v.get("data_source"),
            "note": v.get("note", "Estimated spare capacity — not confirmed booking."),
            "current_lat": v["current_lat"],
            "current_lon": v["current_lon"],
            "destination": dest_port["name"]
        })

    # --- Pipeline Candidates ---
    pipelines = load_pipelines()
    pipeline_candidates = []
    for p in pipelines:
        if product not in p.get("product", [product]):
            continue
        if p.get("availability") == "unavailable":
            continue

        # Capacity in mbbls/day * max_days
        cap_mbbl = p["indicative_capacity_mbpd"] * 1000 * min(max_days, 30)  # cap realistic throughput
        max_vol = min(cap_mbbl, volume_mbbl)

        pipeline_candidates.append({
            "id": f"pipeline-{p['id']}",
            "type": "pipeline",
            "name": p["name"],
            "from": p["from"], "to": p["to"],
            "from_lat": p["from_lat"], "from_lon": p["from_lon"],
            "to_lat": p["to_lat"], "to_lon": p["to_lon"],
            "available_volume_mbbl": max_vol,
            "max_volume_mbbl": max_vol,
            "eta_days": p["transit_days"],
            "freight_usd_per_bbl": p["tariff_usd_per_barrel"],
            "route_risk": 0.08 if p["availability"] == "available" else 0.35,
            "confidence": p["confidence"],
            "data_source": "curated_scenario_data",
            "note": p.get("notes", "")
        })

    # --- Alternate Route Candidates ---
    alt_route_candidates = []
    if disruption_id:
        from .data_providers import load_disruption_scenarios
        scenarios_list = load_disruption_scenarios()
        dis = next((s for s in scenarios_list if s["id"] == disruption_id), None)
        if dis:
            for alt in dis.get("alternative_routes", []):
                if alt["via"] == "maritime":
                    extra_cost = alt["extra_cost_pct"] / 100
                    base_eta = estimate_voyage_days(
                        estimate_sea_distance_km(
                            origin_port["lat"] if origin_port else 24.0, origin_port["lon"] if origin_port else 54.0,
                            dest_port["lat"], dest_port["lon"]
                        )
                    ) if origin_port else 15.0
                    eta = base_eta + alt["extra_days"]
                    alt_route_candidates.append({
                        "id": f"altroute-{alt['id']}",
                        "type": "alternate_route",
                        "name": alt["name"],
                        "available_volume_mbbl": volume_mbbl,
                        "max_volume_mbbl": volume_mbbl,
                        "eta_days": round(eta, 1),
                        "freight_usd_per_bbl": round(2.5 * (1 + extra_cost), 2),
                        "route_risk": 0.15 + extra_cost * 0.3,
                        "confidence": "estimated",
                        "data_source": "disruption_scenario_model",
                        "note": f"Alternative to disrupted route. Extra cost ~{alt['extra_cost_pct']}% vs normal."
                    })

    return {
        "vessel_candidates": vessel_candidates,
        "pipeline_candidates": pipeline_candidates,
        "alt_route_candidates": alt_route_candidates,
        "vessels_data_warning": vessels_data.get("warning"),
        "total_candidates": len(vessel_candidates) + len(pipeline_candidates) + len(alt_route_candidates)
    }


# ─────────────────────────────────────────────
# Hybrid Optimization
# ─────────────────────────────────────────────

def optimize_strategies(scenario: dict, candidates: dict, weights: dict = None) -> dict:
    """
    Runs hybrid allocation optimizer.
    Produces ranked strategies including single-option and hybrid combinations.
    
    weights: {"cost": 0.4, "time": 0.35, "risk": 0.25, "emissions": 0.0}
    """
    if weights is None:
        weights = {"cost": 0.40, "time": 0.35, "risk": 0.25, "emissions": 0.00}

    volume_mbbl = float(scenario.get("volume_mbbl", 500))
    all_cands = (
        candidates["vessel_candidates"] +
        candidates["pipeline_candidates"] +
        candidates["alt_route_candidates"]
    )

    if not all_cands:
        return {"error": "No feasible candidates found for the given parameters."}

    if ORTOOLS_AVAILABLE:
        strategies = _ortools_optimize(all_cands, volume_mbbl, weights)
    else:
        strategies = _greedy_optimize(all_cands, volume_mbbl, weights)

    # Compute composite score and rank
    for s in strategies:
        s["score"] = _composite_score(s, weights)

    strategies.sort(key=lambda s: s["score"])

    # Tag winner
    if strategies:
        strategies[0]["is_winner"] = True

    return {
        "strategies": strategies,
        "volume_required_mbbl": volume_mbbl,
        "weights_used": weights,
        "solver": "OR-Tools" if ORTOOLS_AVAILABLE else "greedy_heuristic"
    }


def _ortools_optimize(candidates: list, volume_mbbl: float, weights: dict) -> list:
    """OR-Tools LP solver for hybrid allocation."""
    solver = pywraplp.Solver.CreateSolver("GLOP")
    n = len(candidates)
    
    # Variables: volume allocated to each candidate (continuous)
    x = [solver.NumVar(0.0, float(candidates[i]["max_volume_mbbl"]), f"x{i}") for i in range(n)]
    
    # Constraint: total allocated >= required volume
    solver.Add(solver.Sum(x) >= volume_mbbl)
    
    # Objective: minimize weighted cost
    cost_terms = []
    for i, c in enumerate(candidates):
        cost_norm = c["freight_usd_per_bbl"] / 10.0          # normalize ~$0-10
        eta_norm = c["eta_days"] / 30.0                       # normalize ~0-30 days
        risk_norm = c["route_risk"]                            # already 0-1
        
        obj_coeff = (
            weights["cost"] * cost_norm +
            weights["time"] * eta_norm +
            weights["risk"] * risk_norm
        )
        cost_terms.append(obj_coeff * x[i])
    
    solver.Minimize(solver.Sum(cost_terms))
    
    status = solver.Solve()
    
    if status not in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
        return _greedy_optimize(candidates, volume_mbbl, weights)
    
    # Build a single optimal hybrid strategy
    allocation = []
    total_allocated = 0
    for i, c in enumerate(candidates):
        vol = x[i].solution_value()
        if vol > 0.5:
            pct = vol / volume_mbbl * 100
            allocation.append({**c, "allocated_mbbl": round(vol, 0), "allocation_pct": round(pct, 1)})
            total_allocated += vol
    
    strategy = _build_strategy("Optimal Hybrid (OR-Tools)", allocation, total_allocated, volume_mbbl)
    
    # Also build top single-option strategies for comparison
    singles = _build_single_strategies(candidates, volume_mbbl)
    return [strategy] + singles[:4]


def _greedy_optimize(candidates: list, volume_mbbl: float, weights: dict) -> list:
    """Greedy heuristic: sort by composite score, fill greedily, then generate combos."""
    scored = sorted(candidates, key=lambda c: _composite_score_candidate(c, weights))
    
    strategies = []
    
    # Single-option strategies
    for c in scored[:5]:
        if c["max_volume_mbbl"] >= volume_mbbl:
            strategies.append(_build_strategy(
                f"Single: {c['name']}", 
                [{**c, "allocated_mbbl": volume_mbbl, "allocation_pct": 100.0}],
                volume_mbbl, volume_mbbl
            ))
    
    # Hybrid: top-2 combination
    if len(scored) >= 2:
        c1, c2 = scored[0], scored[1]
        vol1 = min(c1["max_volume_mbbl"], volume_mbbl * 0.6)
        vol2 = volume_mbbl - vol1
        if vol2 <= c2["max_volume_mbbl"]:
            strategies.append(_build_strategy(
                f"Hybrid: {c1['name']} + {c2['name']}",
                [
                    {**c1, "allocated_mbbl": round(vol1, 0), "allocation_pct": round(vol1/volume_mbbl*100, 1)},
                    {**c2, "allocated_mbbl": round(vol2, 0), "allocation_pct": round(vol2/volume_mbbl*100, 1)}
                ],
                volume_mbbl, volume_mbbl
            ))
    
    # Hybrid: top-3 combination
    if len(scored) >= 3:
        c1, c2, c3 = scored[0], scored[1], scored[2]
        v1 = min(c1["max_volume_mbbl"], volume_mbbl * 0.5)
        v2 = min(c2["max_volume_mbbl"], volume_mbbl * 0.3)
        v3 = volume_mbbl - v1 - v2
        if 0 < v3 <= c3["max_volume_mbbl"]:
            strategies.append(_build_strategy(
                f"Hybrid: {c1['name']} + {c2['name']} + {c3['name']}",
                [
                    {**c1, "allocated_mbbl": round(v1, 0), "allocation_pct": round(v1/volume_mbbl*100, 1)},
                    {**c2, "allocated_mbbl": round(v2, 0), "allocation_pct": round(v2/volume_mbbl*100, 1)},
                    {**c3, "allocated_mbbl": round(v3, 0), "allocation_pct": round(v3/volume_mbbl*100, 1)}
                ],
                volume_mbbl, volume_mbbl
            ))
    
    return strategies


def _build_single_strategies(candidates: list, volume_mbbl: float) -> list:
    strategies = []
    for c in sorted(candidates, key=lambda x: x["freight_usd_per_bbl"])[:5]:
        if c["max_volume_mbbl"] >= volume_mbbl:
            strategies.append(_build_strategy(
                f"Single: {c['name']}",
                [{**c, "allocated_mbbl": volume_mbbl, "allocation_pct": 100.0}],
                volume_mbbl, volume_mbbl
            ))
    return strategies


def _build_strategy(name: str, allocation: list, allocated_mbbl: float, required_mbbl: float) -> dict:
    if not allocation:
        return {}
    
    weighted_cost = sum(a["freight_usd_per_bbl"] * a["allocated_mbbl"] for a in allocation) / allocated_mbbl
    weighted_eta = max(a["eta_days"] for a in allocation)  # bottleneck ETA
    weighted_risk = sum(a["route_risk"] * a["allocated_mbbl"] for a in allocation) / allocated_mbbl
    total_cost_usd = weighted_cost * allocated_mbbl * 1000  # mbbl → bbl
    coverage_pct = min(allocated_mbbl / required_mbbl * 100, 100)
    
    return {
        "name": name,
        "allocation": allocation,
        "total_allocated_mbbl": round(allocated_mbbl, 0),
        "coverage_pct": round(coverage_pct, 1),
        "weighted_freight_usd_per_bbl": round(weighted_cost, 2),
        "estimated_total_cost_usd": round(total_cost_usd, 0),
        "eta_days": round(weighted_eta, 1),
        "weighted_risk": round(weighted_risk, 3),
        "is_hybrid": len(allocation) > 1,
        "is_winner": False,
        "confidence": min((a["confidence"] for a in allocation), key=lambda c: ["low","estimated","medium","high","confirmed"].index(c) if c in ["low","estimated","medium","high","confirmed"] else 0)
    }


def _composite_score(strategy: dict, weights: dict) -> float:
    cost_norm = strategy["weighted_freight_usd_per_bbl"] / 10.0
    eta_norm = strategy["eta_days"] / 30.0
    risk_norm = strategy["weighted_risk"]
    return (weights["cost"] * cost_norm + weights["time"] * eta_norm + weights["risk"] * risk_norm)


def _composite_score_candidate(c: dict, weights: dict) -> float:
    cost_norm = c["freight_usd_per_bbl"] / 10.0
    eta_norm = c["eta_days"] / 30.0
    risk_norm = c["route_risk"]
    return (weights["cost"] * cost_norm + weights["time"] * eta_norm + weights["risk"] * risk_norm)


# ─────────────────────────────────────────────
# Risk Engine
# ─────────────────────────────────────────────

def _compute_route_risk(vessel: dict, dest_port: dict, disruption_id: str, weather: dict) -> float:
    base_risk = 0.05
    
    # Route disruption proximity
    if disruption_id:
        disruption_risk = {
            "hormuz-blockage": 0.55,
            "suez-closure": 0.35,
            "malacca-restriction": 0.20
        }.get(disruption_id, 0.10)
        base_risk += disruption_risk
    
    # Weather risk
    base_risk += weather.get("weather_risk", 0.05) * 0.3
    
    return min(base_risk, 1.0)


# ─────────────────────────────────────────────
# Cost Models
# ─────────────────────────────────────────────

def _estimate_freight_usd_per_bbl(vessel_type: str, distance_km: float, product: str) -> float:
    """
    Estimates freight cost per barrel based on vessel type and distance.
    These are indicative estimates based on general market rates — not live quotes.
    """
    base_rates = {
        "VLCC": 0.80,
        "Suezmax": 1.10,
        "Aframax": 1.50,
        "MR Tanker": 2.20,
        "Panamax": 1.80
    }
    base = base_rates.get(vessel_type, 1.50)
    # Scale with distance (non-linear — long haul per-barrel cost drops slightly)
    dist_factor = 0.7 + 0.3 * min(distance_km / 10000, 1.0)
    return base * dist_factor


def run_full_optimization(raw_scenario: dict, weights: dict = None) -> dict:
    """
    Main entry point: scenario dict → full optimization result.
    """
    candidates = generate_candidates(raw_scenario)
    result = optimize_strategies(raw_scenario, candidates, weights)
    result["candidates"] = candidates
    result["scenario"] = raw_scenario
    return result
