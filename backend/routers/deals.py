"""
Deals router — create confirmed deals and retrieve deal details.
Human-entered commercial terms are stored as CONFIRMED.
"""
from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends

from db import get_db, DBClient
from schemas import DealCreateRequest, DealResponse
from config import get_settings

router = APIRouter(prefix="/api/deals", tags=["deals"])


def _normalise_to_usd(
    price: float, currency: str, unit: str, volume_bbls: float
) -> float:
    """Normalise any quoted price to USD lump sum."""
    settings = get_settings()
    if currency.upper() == "INR":
        price_usd = price / settings.inr_usd_rate
    else:
        price_usd = price

    if unit == "per_bbl":
        return price_usd * volume_bbls
    return price_usd


@router.post("/", response_model=DealResponse)
async def create_deal(req: DealCreateRequest, db: DBClient = Depends(get_db)):
    """Record a human-verified commercial deal."""
    # Validate scenario exists
    scenario = db.select_one("scenarios", req.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Resolve capacity volume
    vol_required = scenario.get("volume_required", 0)
    if req.capacity_pct is not None and req.capacity_volume is None:
        capacity_volume = vol_required * req.capacity_pct / 100
    elif req.capacity_volume is not None:
        capacity_volume = req.capacity_volume
    else:
        raise HTTPException(
            status_code=422,
            detail="Provide either capacity_pct or capacity_volume"
        )

    # Normalise price to USD
    quoted_usd = _normalise_to_usd(
        req.quoted_price, req.quoted_price_currency,
        req.quoted_price_unit, capacity_volume
    )

    record = {
        "scenario_id": req.scenario_id,
        "vessel_candidate_id": req.vessel_candidate_id,
        "deal_type": req.deal_type.value,
        "counterparty": req.counterparty,
        "product": req.product,
        "capacity_pct": req.capacity_pct,
        "capacity_volume": round(capacity_volume, 0),
        "quoted_price": req.quoted_price,
        "quoted_price_currency": req.quoted_price_currency,
        "quoted_price_unit": req.quoted_price_unit,
        "quoted_price_usd": round(quoted_usd, 2),
        "availability_date": str(req.availability_date) if req.availability_date else None,
        "contact_reference": req.contact_reference,
        "notes": req.notes,
        "provenance_status": "CONFIRMED",
        "confirmed_at": datetime.now(timezone.utc).isoformat(),
    }

    saved = db.insert("confirmed_deals", record)
    return DealResponse(**saved)


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(deal_id: str, db: DBClient = Depends(get_db)):
    deal = db.select_one("confirmed_deals", deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return DealResponse(**deal)


@router.get("/")
async def list_deals(scenario_id: str, db: DBClient = Depends(get_db)):
    deals = db.select("confirmed_deals", {"scenario_id": scenario_id})
    return {"deals": deals, "count": len(deals)}
