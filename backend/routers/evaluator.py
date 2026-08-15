"""
Evaluator router — GO / NEGOTIATE / REJECT.
All calculations are DETERMINISTIC. No LLM is involved here.
"""
from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends

from db import get_db, DBClient
from schemas import EvaluateRequest, EvaluationResult, WhatIfRequest
from services.deal_evaluator import evaluate_deal, get_default_assumptions

router = APIRouter(prefix="/api/evaluate", tags=["evaluator"])


@router.post("/", response_model=EvaluationResult)
async def evaluate(req: EvaluateRequest, db: DBClient = Depends(get_db)):
    """
    Evaluate a confirmed deal.
    Returns GO / NEGOTIATE / REJECT with full P&L breakdown.
    DETERMINISTIC — no LLM involved.
    """
    deal = db.select_one("confirmed_deals", req.deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    volume_bbls = float(deal.get("capacity_volume") or 0)
    if volume_bbls <= 0:
        raise HTTPException(status_code=422, detail="Deal has no capacity volume set")

    assumptions = get_default_assumptions(
        product=deal.get("product", "crude"),
        override_market_price=req.market_price_usd_per_bbl,
        override_freight=req.freight_usd_per_bbl,
        override_insurance=req.insurance_usd_per_bbl,
        override_handling=req.handling_usd_per_bbl,
        override_margin=req.min_target_margin,
    )

    result = evaluate_deal(
        deal_id=req.deal_id,
        volume_bbls=volume_bbls,
        quoted_price=float(deal["quoted_price"]),
        quoted_price_unit=deal.get("quoted_price_unit", "lumpsum"),
        quoted_price_currency=deal.get("quoted_price_currency", "USD"),
        assumptions=assumptions,
    )

    # Persist evaluation result back to deal record
    db.update("confirmed_deals", req.deal_id, {
        "market_price_used_usd": result.market_price_used_usd,
        "market_price_provenance": result.market_price_provenance.value,
        "freight_usd": result.freight_usd,
        "insurance_usd": result.insurance_usd,
        "handling_usd": result.handling_usd,
        "landed_cost_usd": result.landed_cost_usd,
        "landed_cost_per_bbl": result.landed_cost_per_bbl,
        "expected_revenue_usd": result.expected_revenue_usd,
        "expected_profit_usd": result.expected_profit_usd,
        "expected_margin_pct": result.expected_margin_pct,
        "max_acceptable_price_usd": result.max_acceptable_price_usd,
        "deal_verdict": result.deal_verdict.value,
        "verdict_reason": result.verdict_reason,
        "profitability_provenance": result.profitability_provenance.value,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    })

    return result


@router.post("/whatif", response_model=EvaluationResult)
async def what_if(req: WhatIfRequest, db: DBClient = Depends(get_db)):
    """
    Re-evaluate a deal with a changed quote price.
    Allows interactive what-if simulation in the UI.
    DETERMINISTIC — no LLM.
    """
    deal = db.select_one("confirmed_deals", req.deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    volume_bbls = float(deal.get("capacity_volume") or 0)
    if volume_bbls <= 0:
        raise HTTPException(status_code=422, detail="Deal has no capacity volume set")

    assumptions = get_default_assumptions(
        product=deal.get("product", "crude"),
        override_market_price=req.market_price_usd_per_bbl,
        override_freight=req.freight_usd_per_bbl,
    )

    # Use new_quoted_price but keep same currency + unit as original deal
    result = evaluate_deal(
        deal_id=req.deal_id,
        volume_bbls=volume_bbls,
        quoted_price=req.new_quoted_price,
        quoted_price_unit=deal.get("quoted_price_unit", "lumpsum"),
        quoted_price_currency=deal.get("quoted_price_currency", "USD"),
        assumptions=assumptions,
    )

    return result  # Do NOT persist what-if results to DB
