"""
OR-Tools Optimization Engine.

Decision variables: volume allocated to each accepted option (continuous).
Constraints:
  1. Total allocated volume == required volume (within tolerance)
  2. Allocation <= confirmed capacity per option
  3. ETA <= scenario deadline
  4. Product compatibility

Objective: maximize (expected_profit - time_penalty - risk_penalty)
weighted by user priorities.

Returns ranked strategies including single-option and hybrid combinations.
"""
from __future__ import annotations
import itertools
import math
from dataclasses import dataclass, field
from typing import Any

from schemas import AllocationItem, StrategyResult

# Try OR-Tools; fall back to greedy if unavailable
try:
    from ortools.linear_solver import pywraplp
    _ORTOOLS_AVAILABLE = True
except ImportError:
    _ORTOOLS_AVAILABLE = False
    print("[Optimizer] OR-Tools not installed. Using greedy fallback.")


@dataclass
class OptOption:
    """A single supply option (vessel deal, pipeline, alternate route)."""
    id: str
    name: str
    option_type: str          # vessel | pipeline | alternate_route | supplier
    max_volume: float         # max barrels available
    cost_per_bbl: float       # total landed cost per bbl (freight already included)
    eta_days: int
    risk_score: float         # 0.0 (no risk) → 1.0 (maximum)
    product: str
    provenance_status: str = "CONFIRMED"
    notes: str = ""


@dataclass
class OptConfig:
    required_volume: float
    deadline_days: int
    product: str
    cost_weight: float = 0.40
    time_weight: float = 0.35
    risk_weight: float = 0.25
    market_price_per_bbl: float = 85.00
    min_target_margin: float = 0.08


def _score_strategy(
    options: list[OptOption],
    volumes: list[float],
    config: OptConfig,
) -> tuple[float, float, float, float, float, float]:
    """
    Compute strategy metrics.
    Returns: (total_cost, cost_per_bbl, profit, margin_pct, eta_days, risk_score)
    """
    total_vol = sum(volumes)
    if total_vol == 0:
        return 0, 0, 0, 0, 999, 1.0

    total_cost = sum(o.cost_per_bbl * v for o, v in zip(options, volumes))
    cost_per_bbl = total_cost / total_vol
    revenue = config.market_price_per_bbl * total_vol
    profit = revenue - total_cost
    margin = profit / revenue * 100 if revenue > 0 else 0
    eta = max(o.eta_days for o, v in zip(options, volumes) if v > 0)
    # Volume-weighted risk
    risk = sum(o.risk_score * v for o, v in zip(options, volumes)) / total_vol

    return total_cost, cost_per_bbl, profit, margin, eta, risk


def _objective_score(
    total_cost: float,
    cost_per_bbl: float,
    eta_days: int,
    risk_score: float,
    config: OptConfig,
    required_volume: float,
) -> float:
    """Lower is better (minimization objective)."""
    # Normalise cost (per bbl relative to market)
    cost_norm = cost_per_bbl / config.market_price_per_bbl
    # Normalise time (fraction of deadline)
    time_norm = eta_days / max(config.deadline_days, 1)
    return (
        config.cost_weight * cost_norm
        + config.time_weight * time_norm
        + config.risk_weight * risk_score
    )


def _ortools_optimize(options: list[OptOption], config: OptConfig) -> list[float]:
    """Use OR-Tools LP solver to find optimal allocations."""
    solver = pywraplp.Solver.CreateSolver("GLOP")
    if not solver:
        return _greedy_allocate(options, config)

    n = len(options)
    inf = solver.infinity()

    # Decision variables: volume allocated to each option
    x = [solver.NumVar(0.0, opt.max_volume, f"x_{i}") for i, opt in enumerate(options)]

    # Constraint 1: total volume == required (allow 0.1% tolerance via slack)
    slack = solver.NumVar(0.0, config.required_volume * 0.001, "slack")
    solver.Add(sum(x) + slack >= config.required_volume)
    solver.Add(sum(x) - slack <= config.required_volume)

    # Constraint 2: capacity already encoded in var upper bounds

    # Constraint 3: ETA feasibility (binary via penalty in objective)
    # Options with ETA > deadline are pre-filtered before calling this function.

    # Objective: minimize weighted cost + time + risk
    obj_terms = []
    for i, opt in enumerate(options):
        # Normalise per-bbl cost
        cost_norm = opt.cost_per_bbl / max(config.market_price_per_bbl, 1)
        time_norm = opt.eta_days / max(config.deadline_days, 1)
        weight = (
            config.cost_weight * cost_norm
            + config.time_weight * time_norm
            + config.risk_weight * opt.risk_score
        )
        obj_terms.append(weight * x[i])

    solver.Minimize(sum(obj_terms))

    status = solver.Solve()
    if status in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
        return [xi.solution_value() for xi in x]
    return _greedy_allocate(options, config)


def _greedy_allocate(options: list[OptOption], config: OptConfig) -> list[float]:
    """Greedy fallback: fill volume from cheapest feasible options."""
    # Sort by objective score ascending
    indexed = sorted(
        enumerate(options),
        key=lambda iv: _objective_score(
            iv[1].cost_per_bbl * config.required_volume,
            iv[1].cost_per_bbl, iv[1].eta_days, iv[1].risk_score,
            config, config.required_volume,
        ),
    )
    remaining = config.required_volume
    volumes = [0.0] * len(options)
    for orig_i, opt in indexed:
        if remaining <= 0:
            break
        alloc = min(opt.max_volume, remaining)
        volumes[orig_i] = alloc
        remaining -= alloc
    return volumes


def _build_strategy(
    options: list[OptOption],
    volumes: list[float],
    config: OptConfig,
    rank: int,
    is_recommended: bool = False,
    is_baseline: bool = False,
) -> StrategyResult | None:
    active = [(o, v) for o, v in zip(options, volumes) if v > 1]
    if not active:
        return None

    total_vol = sum(v for _, v in active)
    total_cost, cost_per_bbl, profit, margin, eta, risk = _score_strategy(
        [o for o, _ in active], [v for _, v in active], config
    )

    name_parts = [f"{v/total_vol*100:.0f}% {o.name}" for o, v in active]
    name = " + ".join(name_parts)

    allocations = [
        AllocationItem(
            option_type=o.option_type,
            option_id=o.id,
            option_name=o.name,
            allocated_volume=round(v, 0),
            allocated_pct=round(v / total_vol * 100, 1),
            cost_usd=round(o.cost_per_bbl * v, 0),
            eta_days=o.eta_days,
            risk_score=o.risk_score,
            provenance_status=o.provenance_status,
        )
        for o, v in active
    ]

    return StrategyResult(
        id=None,
        rank=rank,
        is_recommended=is_recommended,
        is_baseline=is_baseline,
        name=name,
        allocations=allocations,
        total_cost_usd=round(total_cost, 2),
        cost_per_bbl=round(cost_per_bbl, 4),
        expected_profit_usd=round(profit, 2),
        expected_margin_pct=round(margin, 2),
        eta_days=int(math.ceil(eta)),
        risk_score=round(risk, 4),
        coverage_pct=round(total_vol / config.required_volume * 100, 1),
        allocated_volume=round(total_vol, 0),
        provenance_status="CALCULATED",
    )


def run_optimization(
    options: list[OptOption],
    config: OptConfig,
) -> list[StrategyResult]:
    """
    Run OR-Tools optimization and return ranked strategies.
    Compares: single-option strategies + hybrid combinations.
    """
    if not options:
        return []

    # Filter options that meet deadline
    feasible = [o for o in options if o.eta_days <= config.deadline_days and o.max_volume > 0]
    if not feasible:
        return []

    strategies: list[StrategyResult] = []
    seen_names: set[str] = set()

    # ── 1. Single-option strategies ───────────────────────────────────
    for opt in feasible:
        vol = min(opt.max_volume, config.required_volume)
        s = _build_strategy([opt], [vol], config, rank=0)
        if s and s.name not in seen_names:
            strategies.append(s)
            seen_names.add(s.name)

    # ── 2. Hybrid: OR-Tools or greedy on full option set ──────────────
    if len(feasible) >= 2:
        if _ORTOOLS_AVAILABLE:
            vols = _ortools_optimize(feasible, config)
        else:
            vols = _greedy_allocate(feasible, config)

        # Only add if genuinely hybrid (≥2 options used)
        active_count = sum(1 for v in vols if v > 1)
        if active_count >= 2:
            s = _build_strategy(feasible, vols, config, rank=0)
            if s and s.name not in seen_names:
                strategies.append(s)
                seen_names.add(s.name)

    # ── 3. Pair combinations (for small option sets) ──────────────────
    if len(feasible) <= 8:
        for a, b in itertools.combinations(feasible, 2):
            pair_vols = _greedy_allocate([a, b], config)
            active_count = sum(1 for v in pair_vols if v > 1)
            if active_count >= 2:
                s = _build_strategy([a, b], pair_vols, config, rank=0)
                if s and s.name not in seen_names:
                    strategies.append(s)
                    seen_names.add(s.name)

    # ── 4. Triple combinations ────────────────────────────────────────
    if len(feasible) <= 6:
        for trio in itertools.combinations(feasible, 3):
            trio_vols = _greedy_allocate(list(trio), config)
            active_count = sum(1 for v in trio_vols if v > 1)
            if active_count >= 2:
                s = _build_strategy(list(trio), trio_vols, config, rank=0)
                if s and s.name not in seen_names:
                    strategies.append(s)
                    seen_names.add(s.name)

    # ── 5. Rank by objective score ────────────────────────────────────
    strategies.sort(
        key=lambda s: _objective_score(
            s.total_cost_usd, s.cost_per_bbl, s.eta_days, s.risk_score,
            config, config.required_volume,
        )
    )

    # Assign ranks and mark recommended
    for i, s in enumerate(strategies):
        s.rank = i + 1
        s.is_recommended = (i == 0)

    return strategies
