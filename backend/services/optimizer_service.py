"""
OR-Tools Optimization Engine — 100% deterministic decision solver.

Decision variables: continuous volume allocated to each VERIFIED supply option.

Constraints & Rules:
  1. UNVERIFIED candidate vessels are STRICTLY EXCLUDED.
  2. Options with ETA > deadline are EXCLUDED from on-time optimization.
  3. Allocations sum to required_volume when feasible.
  4. If capacity meeting deadline < required_volume, returns status "PARTIAL" / "INFEASIBLE"
     with exact fulfilled volume, shortfall volume, and shortfall explanation.
"""
from __future__ import annotations
import itertools
import math
from dataclasses import dataclass, field
from typing import Any

from schemas import AllocationItem, StrategyResult, ProvenanceStatus

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
    cost_per_bbl: float       # total landed cost per bbl
    eta_days: int
    risk_score: float = 0.1   # 0.0 → 1.0
    product: str = "diesel"
    provenance_status: str = "CONFIRMED"
    notes: str = ""


@dataclass
class OptConfig:
    required_volume: float
    deadline_days: int
    product: str = "diesel"
    cost_weight: float = 0.40
    time_weight: float = 0.35
    risk_weight: float = 0.25
    market_price_per_bbl: float = 85.00
    min_target_margin: float = 0.08


@dataclass
class OptimizationOutput:
    status: str  # "OPTIMAL" | "PARTIAL" | "INFEASIBLE"
    fulfilled_volume: float
    shortfall_volume: float
    strategies: list[StrategyResult]
    recommended_strategy: StrategyResult | None
    baseline_strategy: StrategyResult | None
    message: str


def _score_strategy(
    options: list[OptOption],
    volumes: list[float],
    config: OptConfig,
) -> tuple[float, float, float, float, float, float]:
    total_vol = sum(volumes)
    if total_vol == 0:
        return 0.0, 0.0, 0.0, 0.0, 999.0, 1.0

    total_cost = sum(o.cost_per_bbl * v for o, v in zip(options, volumes))
    cost_per_bbl = total_cost / total_vol
    revenue = config.market_price_per_bbl * total_vol
    profit = revenue - total_cost
    margin = (profit / revenue * 100.0) if revenue > 0 else 0.0
    eta = max(o.eta_days for o, v in zip(options, volumes) if v > 0)
    risk = sum(o.risk_score * v for o, v in zip(options, volumes)) / total_vol

    return total_cost, cost_per_bbl, profit, margin, eta, risk


def _objective_score(
    total_cost: float,
    cost_per_bbl: float,
    eta_days: int,
    risk_score: float,
    config: OptConfig,
) -> float:
    cost_norm = cost_per_bbl / max(config.market_price_per_bbl, 1.0)
    time_norm = eta_days / max(config.deadline_days, 1)
    return (
        config.cost_weight * cost_norm
        + config.time_weight * time_norm
        + config.risk_weight * risk_score
    )


def _ortools_optimize(options: list[OptOption], required_volume: float) -> list[float]:
    solver = pywraplp.Solver.CreateSolver("GLOP")
    if not solver:
        return _greedy_allocate(options, required_volume)

    x = [solver.NumVar(0.0, float(opt.max_volume), f"x_{i}") for i, opt in enumerate(options)]
    
    # Require total volume equal to required_volume (or max possible capacity)
    target_vol = min(required_volume, sum(opt.max_volume for opt in options))
    solver.Add(solver.Sum(x) == target_vol)

    # Objective: minimize total cost
    solver.Minimize(solver.Sum(opt.cost_per_bbl * x[i] for i, opt in enumerate(options)))

    status = solver.Solve()
    if status in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
        return [xi.solution_value() for xi in x]
    return _greedy_allocate(options, required_volume)


def _greedy_allocate(options: list[OptOption], required_volume: float) -> list[float]:
    indexed = sorted(enumerate(options), key=lambda iv: iv[1].cost_per_bbl)
    remaining = required_volume
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
    active = [(o, v) for o, v in zip(options, volumes) if v > 0.01]
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


def solve_optimization(
    options: list[OptOption],
    config: OptConfig,
) -> OptimizationOutput:
    """
    Solves capacity allocation with strict provenance filtering & feasibility checks.
    """
    if config.required_volume <= 0:
        raise ValueError("Required volume must be strictly positive (> 0)")
    if config.deadline_days < 0:
        raise ValueError("Deadline days cannot be negative")

    # RULE 1: Strictly exclude UNVERIFIED candidate options
    verified_options = [
        o for o in options
        if o.provenance_status.upper() not in ("UNVERIFIED", "CANDIDATE_UNVERIFIED")
    ]

    # Check product compatibility if product provided
    product_matched = [
        o for o in verified_options
        if not config.product or not o.product or o.product.lower() == config.product.lower()
    ]

    # Filter by deadline feasibility
    on_time_options = [o for o in product_matched if o.eta_days <= config.deadline_days]

    total_on_time_capacity = sum(o.max_volume for o in on_time_options)

    # FEASIBILITY CHECK: If capacity < required_volume
    if total_on_time_capacity < config.required_volume:
        fulfilled = total_on_time_capacity
        shortfall = config.required_volume - fulfilled
        msg = (
            f"Capacity shortfall of {shortfall:,.0f} barrels for deadline of {config.deadline_days} days. "
            f"Only {fulfilled:,.0f} barrels could be allocated on-time. Consider deadline relaxation."
        )

        # Allocate max possible on-time
        if on_time_options:
            vols = _greedy_allocate(on_time_options, fulfilled)
            strat = _build_strategy(on_time_options, vols, config, rank=1, is_recommended=True)
            strategies = [strat] if strat else []
        else:
            strategies = []

        return OptimizationOutput(
            status="PARTIAL" if fulfilled > 0 else "INFEASIBLE",
            fulfilled_volume=fulfilled,
            shortfall_volume=shortfall,
            strategies=strategies,
            recommended_strategy=strategies[0] if strategies else None,
            baseline_strategy=None,
            message=msg,
        )

    # FULLY FEASIBLE OPTIMIZATION
    vols = _ortools_optimize(on_time_options, config.required_volume)
    recommended = _build_strategy(on_time_options, vols, config, rank=1, is_recommended=True)

    # Single-option baseline (most cost-effective single route covering capacity)
    single_covering = [o for o in on_time_options if o.max_volume >= config.required_volume]
    if single_covering:
        single_covering.sort(key=lambda o: o.cost_per_bbl)
        baseline_opt = single_covering[0]
        baseline = _build_strategy([baseline_opt], [config.required_volume], config, rank=0, is_baseline=True)
    else:
        baseline = None

    strategies = [recommended] if recommended else []

    return OptimizationOutput(
        status="OPTIMAL",
        fulfilled_volume=config.required_volume,
        shortfall_volume=0.0,
        strategies=strategies,
        recommended_strategy=recommended,
        baseline_strategy=baseline,
        message="Optimal hybrid allocation found.",
    )


def run_optimization(
    options: list[OptOption],
    config: OptConfig,
) -> list[StrategyResult]:
    output = solve_optimization(options, config)
    return output.strategies
