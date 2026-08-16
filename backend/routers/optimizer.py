"""
Optimizer router — runs OR-Tools on confirmed deals + pipeline/route options.
Returns ranked strategies with baseline comparison.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends

from db import get_db, DBClient
from schemas import OptimizeRequest, OptimizationResponse, StrategyResult
from services.optimizer_service import OptOption, OptConfig, run_optimization
from config import get_settings

router = APIRouter(prefix="/api/optimize", tags=["optimizer"])

# Pipeline data — loaded from DB or hardcoded fallback
PIPELINE_FALLBACK = [
    {
        "id": "pipe-001", "name": "IPSA (Saudi Red Sea)", "from_name": "Ras Tanura",
        "to_name": "Yanbu", "tariff_usd_per_bbl": 1.40, "transit_days": 3,
        "capacity_mbbl_per_day": 5000, "risk_score": 0.06,
        "product_compatible": ["crude"], "provenance_status": "REAL_REFERENCE",
    },
    {
        "id": "pipe-002", "name": "Habshan–Fujairah (ADNOC)", "from_name": "Abu Dhabi",
        "to_name": "Fujairah", "tariff_usd_per_bbl": 1.20, "transit_days": 1,
        "capacity_mbbl_per_day": 1500, "risk_score": 0.05,
        "product_compatible": ["crude"], "provenance_status": "REAL_REFERENCE",
    },
    {
        "id": "pipe-003", "name": "SUMED Pipeline", "from_name": "Ain Sukhna",
        "to_name": "Sidi Kerir", "tariff_usd_per_bbl": 2.10, "transit_days": 1,
        "capacity_mbbl_per_day": 2500, "risk_score": 0.10,
        "product_compatible": ["crude", "refined"], "provenance_status": "REAL_REFERENCE",
    },
]

ALTROUTE_FALLBACK = [
    {
        "id": "alt-001", "name": "Cape of Good Hope bypass",
        "from_name": "Persian Gulf", "to_name": "India",
        "freight_usd_per_bbl": 3.20, "transit_days": 28,
        "risk_score": 0.12, "product_compatible": ["crude", "diesel", "refined"],
        "provenance_status": "SIMULATED",
    },
    {
        "id": "alt-002", "name": "Suez → Mediterranean alternate",
        "from_name": "Persian Gulf", "to_name": "Rotterdam",
        "freight_usd_per_bbl": 2.80, "transit_days": 22,
        "risk_score": 0.14, "product_compatible": ["crude", "refined"],
        "provenance_status": "SIMULATED",
    },
]


def _deals_to_options(deals: list[dict], scenario_product: str) -> list[OptOption]:
    opts = []
    for d in deals:
        if d.get("deal_verdict") not in ("GO", "NEGOTIATE", None):
            continue  # skip rejected deals
        # Use landed cost per bbl if available, else quoted / volume
        vol = float(d.get("capacity_volume") or 0)
        if vol <= 0:
            continue
        cost_per_bbl = float(d.get("landed_cost_per_bbl") or 0)
        if cost_per_bbl <= 0:
            quoted_usd = float(d.get("quoted_price_usd") or d.get("quoted_price") or 0)
            cost_per_bbl = quoted_usd / vol if vol > 0 else 5.0
        opts.append(OptOption(
            id=d["id"], name=d.get("counterparty") or d.get("deal_type", "vessel"),
            option_type=d.get("deal_type", "vessel"),
            max_volume=vol,
            cost_per_bbl=cost_per_bbl,
            eta_days=int(d.get("eta_days") or 14),
            risk_score=float(d.get("risk_score") or 0.15),
            product=d.get("product", scenario_product),
            provenance_status=d.get("provenance_status", "CONFIRMED"),
        ))
    return opts


def _pipelines_to_options(
    pipelines: list[dict], product: str, volume_required: float
) -> list[OptOption]:
    opts = []
    for p in pipelines:
        compat = p.get("product_compatible", [])
        if isinstance(compat, str):
            compat = compat.split(",")
        if product.lower() not in [c.lower().strip() for c in compat]:
            continue
        # max daily capacity capped to required volume (simplified)
        max_vol = min(
            float(p.get("capacity_mbbl_per_day", 0)) * float(p.get("transit_days", 1)),
            volume_required
        )
        opts.append(OptOption(
            id=p["id"], name=p["name"],
            option_type="pipeline",
            max_volume=max_vol,
            cost_per_bbl=float(p.get("tariff_usd_per_bbl", 2.0)),
            eta_days=int(p.get("transit_days", 3)),
            risk_score=float(p.get("risk_score", 0.08)),
            product=product,
            provenance_status=p.get("provenance_status", "REAL_REFERENCE"),
        ))
    return opts


def _altroutes_to_options(
    routes: list[dict], product: str, volume_required: float
) -> list[OptOption]:
    opts = []
    for r in routes:
        compat = r.get("product_compatible", [])
        if isinstance(compat, str):
            compat = compat.split(",")
        if product.lower() not in [c.lower().strip() for c in compat]:
            continue
        opts.append(OptOption(
            id=r["id"], name=r["name"],
            option_type="alternate_route",
            max_volume=volume_required,
            cost_per_bbl=float(r.get("freight_usd_per_bbl", 3.0)),
            eta_days=int(r.get("transit_days", 20)),
            risk_score=float(r.get("risk_score", 0.15)),
            product=product,
            provenance_status=r.get("provenance_status", "SIMULATED"),
        ))
    return opts


@router.post("/", response_model=OptimizationResponse)
async def optimize(req: OptimizeRequest, db: DBClient = Depends(get_db)):
    """Run OR-Tools optimization over confirmed deals + pipeline/route options."""
    settings = get_settings()

    scenario = db.select_one("scenarios", req.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Load confirmed deals
    deals = [db.select_one("confirmed_deals", did) for did in req.deal_ids]
    deals = [d for d in deals if d]
    if not deals:
        raise HTTPException(status_code=422, detail="No valid confirmed deals provided")

    product = scenario.get("product", "crude")
    volume_required = float(scenario.get("volume_required", 1))
    deadline = int(scenario.get("deadline_days", 30))

    # Resolve weights
    cost_w = req.cost_weight or scenario.get("priority_cost_weight", 0.4)
    time_w = req.time_weight or scenario.get("priority_time_weight", 0.35)
    risk_w = req.risk_weight or scenario.get("priority_risk_weight", 0.25)
    total_w = cost_w + time_w + risk_w
    if total_w > 0:
        cost_w, time_w, risk_w = cost_w/total_w, time_w/total_w, risk_w/total_w

    config = OptConfig(
        required_volume=volume_required,
        deadline_days=deadline,
        product=product,
        cost_weight=cost_w,
        time_weight=time_w,
        risk_weight=risk_w,
        market_price_per_bbl=settings.market_price_usd_per_bbl,
        min_target_margin=settings.default_min_target_margin,
    )

    # Build options list
    all_options = _deals_to_options(deals, product)

    if req.include_pipelines:
        pipes = db.select("pipelines") or PIPELINE_FALLBACK
        all_options += _pipelines_to_options(pipes, product, volume_required)

    if req.include_alternate_routes:
        routes = db.select("alternate_routes") or ALTROUTE_FALLBACK
        all_options += _altroutes_to_options(routes, product, volume_required)

    if not all_options:
        raise HTTPException(status_code=422, detail="No feasible options to optimize")

    # Run optimization
    strategies = run_optimization(all_options, config)
    if not strategies:
        raise HTTPException(status_code=422, detail="No feasible strategies found")

    # Build baseline: use first confirmed deal as-is (status quo)
    baseline_deal = deals[0]
    baseline_vol = float(baseline_deal.get("capacity_volume") or 0)
    baseline_cost = float(baseline_deal.get("landed_cost_usd") or
                          baseline_deal.get("quoted_price_usd") or 0)
    baseline_cost_per_bbl = baseline_cost / baseline_vol if baseline_vol > 0 else 5.0
    baseline_profit = (settings.market_price_usd_per_bbl - baseline_cost_per_bbl) * baseline_vol
    baseline_margin = baseline_profit / (settings.market_price_usd_per_bbl * baseline_vol) * 100 if baseline_vol > 0 else 0

    from schemas import AllocationItem
    baseline = StrategyResult(
        id=None, rank=0, is_recommended=False, is_baseline=True,
        name=f"Baseline: {baseline_deal.get('counterparty') or 'Current Deal'}",
        allocations=[AllocationItem(
            option_type=baseline_deal.get("deal_type", "vessel"),
            option_id=baseline_deal["id"],
            option_name=baseline_deal.get("counterparty") or "Current Deal",
            allocated_volume=baseline_vol,
            allocated_pct=round(baseline_vol / volume_required * 100, 1),
            cost_usd=round(baseline_cost, 0),
            eta_days=None, risk_score=None,
            provenance_status="CONFIRMED",
        )],
        total_cost_usd=round(baseline_cost, 2),
        cost_per_bbl=round(baseline_cost_per_bbl, 4),
        expected_profit_usd=round(baseline_profit, 2),
        expected_margin_pct=round(baseline_margin, 2),
        eta_days=14, risk_score=0.15,
        coverage_pct=round(baseline_vol / volume_required * 100, 1),
        allocated_volume=round(baseline_vol, 0),
        provenance_status="CONFIRMED",
    )

    # Save optimization run + strategies to DB
    run_id = str(uuid.uuid4())
    db.insert("optimization_runs", {
        "id": run_id,
        "scenario_id": req.scenario_id,
        "solver": "or_tools" if True else "greedy",
        "weights_used": {"cost": cost_w, "time": time_w, "risk": risk_w},
        "status": "done",
    })

    for s in strategies[:10]:  # save top 10
        s_row = db.insert("strategies", {
            "optimization_run_id": run_id,
            "scenario_id": req.scenario_id,
            "rank": s.rank,
            "is_recommended": s.is_recommended,
            "is_baseline": False,
            "name": s.name,
            "total_cost_usd": s.total_cost_usd,
            "cost_per_bbl": s.cost_per_bbl,
            "expected_profit_usd": s.expected_profit_usd,
            "expected_margin_pct": s.expected_margin_pct,
            "eta_days": s.eta_days,
            "risk_score": s.risk_score,
            "coverage_pct": s.coverage_pct,
            "allocated_volume": s.allocated_volume,
            "provenance_status": "CALCULATED",
        })
        s.id = s_row.get("id")

    recommended = next((s for s in strategies if s.is_recommended), strategies[0])

    # STRICT VALIDATION: s.total_cost_usd / s.cost_per_bbl must equal s.allocated_volume exactly
    for s in strategies:
        if s.allocated_volume > 0:
            derived_vol = s.total_cost_usd / s.cost_per_bbl if s.cost_per_bbl > 0 else 0
            if abs(derived_vol - s.allocated_volume) > 2.0:
                raise ValueError(
                    f"Validation Error: Strategy total_cost / cost_per_bbl does not equal allocated volume. "
                    f"Cost: {s.total_cost_usd}, Per Bbl: {s.cost_per_bbl}, Vol: {s.allocated_volume}"
                )

    return OptimizationResponse(
        optimization_run_id=run_id,
        scenario_id=req.scenario_id,
        solver="or_tools",
        strategies=strategies[:10],
        baseline=baseline,
        recommended=recommended,
        volume_required=volume_required,
        weights_used={"cost": cost_w, "time": time_w, "risk": risk_w},
    )
