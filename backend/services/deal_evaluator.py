"""
Deal Evaluator — 100% deterministic. No LLM involved.

Given a confirmed commercial deal and economic assumptions, calculates:
  - cargo volume
  - purchase cost
  - transportation / deal cost
  - insurance / handling
  - landed cost
  - landed cost per barrel
  - expected revenue
  - expected profit
  - expected margin
  - maximum acceptable deal price
  - verdict: GO / NEGOTIATE / REJECT
"""
from __future__ import annotations
from dataclasses import dataclass
from enum import Enum

from config import get_settings
from schemas import DealVerdict, EvaluationResult, ProvenanceStatus


@dataclass
class EconAssumptions:
    market_price_usd_per_bbl: float
    market_price_provenance: ProvenanceStatus
    freight_usd_per_bbl: float
    insurance_usd_per_bbl: float
    handling_usd_per_bbl: float
    min_target_margin: float  # e.g. 0.08 = 8%


def get_default_assumptions(
    product: str = "crude",
    override_market_price: float | None = None,
    override_freight: float | None = None,
    override_insurance: float | None = None,
    override_handling: float | None = None,
    override_margin: float | None = None,
) -> EconAssumptions:
    """Return default economic assumptions, clearly labelled SIMULATED."""
    settings = get_settings()

    product_prices = {
        "crude": 82.00,
        "diesel": 85.00,
        "gasoline": 88.00,
        "refined": 85.00,
        "lng": 70.00,
    }
    base_market = product_prices.get(product.lower(), 85.00)

    return EconAssumptions(
        market_price_usd_per_bbl=override_market_price or settings.market_price_usd_per_bbl or base_market,
        market_price_provenance=ProvenanceStatus.SIMULATED,
        freight_usd_per_bbl=override_freight or 1.50,
        insurance_usd_per_bbl=override_insurance or 0.15,
        handling_usd_per_bbl=override_handling or 0.10,
        min_target_margin=override_margin or settings.default_min_target_margin,
    )


def evaluate_deal(
    deal_id: str,
    volume_bbls: float,
    quoted_price: float,          # total lump sum OR per-bbl depending on unit
    quoted_price_unit: str,       # "lumpsum" | "per_bbl"
    quoted_price_currency: str,   # "USD" | "INR"
    assumptions: EconAssumptions,
) -> EvaluationResult:
    """
    DETERMINISTIC deal evaluation.
    All calculations are pure arithmetic — no LLM.

    Args:
        deal_id: UUID of the confirmed_deal record
        volume_bbls: volume in barrels
        quoted_price: as entered by human (lump sum or per-bbl)
        quoted_price_unit: "lumpsum" or "per_bbl"
        quoted_price_currency: "USD" or "INR"
        assumptions: EconAssumptions

    Returns:
        EvaluationResult with verdict and all financial figures
    """
    settings = get_settings()

    # ── 1. Normalise price to USD lump sum ────────────────────────────
    if quoted_price_currency.upper() == "INR":
        quoted_price_usd = quoted_price / settings.inr_usd_rate
    else:
        quoted_price_usd = quoted_price

    if quoted_price_unit == "per_bbl":
        quoted_price_usd_lump = quoted_price_usd * volume_bbls
        quoted_price_per_bbl = quoted_price_usd
    else:
        quoted_price_usd_lump = quoted_price_usd
        quoted_price_per_bbl = quoted_price_usd / volume_bbls if volume_bbls > 0 else 0

    # ── 2. Ancillary costs ────────────────────────────────────────────
    freight_usd  = assumptions.freight_usd_per_bbl  * volume_bbls
    insurance_usd = assumptions.insurance_usd_per_bbl * volume_bbls
    handling_usd  = assumptions.handling_usd_per_bbl  * volume_bbls

    # ── 3. Landed cost ────────────────────────────────────────────────
    landed_cost_usd     = quoted_price_usd_lump + freight_usd + insurance_usd + handling_usd
    landed_cost_per_bbl = landed_cost_usd / volume_bbls if volume_bbls > 0 else 0

    # ── 4. Revenue & profit ───────────────────────────────────────────
    expected_revenue_usd = assumptions.market_price_usd_per_bbl * volume_bbls
    expected_profit_usd  = expected_revenue_usd - landed_cost_usd
    expected_margin_pct  = (expected_profit_usd / expected_revenue_usd * 100
                            if expected_revenue_usd > 0 else 0)

    # ── 5. Maximum acceptable deal price ─────────────────────────────
    # The maximum price the buyer can pay while still hitting min_target_margin.
    # Derivation:
    #   profit_required = revenue × min_margin
    #   max_deal_cost   = revenue - profit_required - ancillary
    #   max_deal_price  = max_deal_cost (lump sum)
    ancillary_total       = freight_usd + insurance_usd + handling_usd
    profit_required       = expected_revenue_usd * assumptions.min_target_margin
    max_deal_cost_usd     = expected_revenue_usd - profit_required - ancillary_total
    max_acceptable_price  = max(0.0, max_deal_cost_usd)
    max_acceptable_per_bbl = max_acceptable_price / volume_bbls if volume_bbls > 0 else 0

    # ── 6. Verdict ────────────────────────────────────────────────────
    if quoted_price_usd_lump <= max_acceptable_price:
        verdict = DealVerdict.GO
        reason = (
            f"At ${quoted_price_per_bbl:.2f}/bbl the expected margin is "
            f"{expected_margin_pct:.1f}%, which meets the {assumptions.min_target_margin*100:.0f}% minimum target."
        )
    elif quoted_price_usd_lump <= max_acceptable_price * 1.15:
        verdict = DealVerdict.NEGOTIATE
        reason = (
            f"At ${quoted_price_per_bbl:.2f}/bbl the expected margin ({expected_margin_pct:.1f}%) "
            f"falls below the {assumptions.min_target_margin*100:.0f}% target. "
            f"A price of ${max_acceptable_per_bbl:.2f}/bbl "
            f"(${max_acceptable_price:,.0f} total) or lower would meet the target."
        )
    else:
        verdict = DealVerdict.REJECT
        reason = (
            f"At ${quoted_price_per_bbl:.2f}/bbl the deal is uneconomic "
            f"(margin: {expected_margin_pct:.1f}%, minimum: {assumptions.min_target_margin*100:.0f}%). "
            f"Maximum acceptable price is ${max_acceptable_per_bbl:.2f}/bbl."
        )

    return EvaluationResult(
        deal_id=deal_id,
        volume_bbls=volume_bbls,
        quoted_price_usd=quoted_price_usd_lump,
        quoted_price_per_bbl=quoted_price_per_bbl,
        freight_usd=freight_usd,
        freight_per_bbl=assumptions.freight_usd_per_bbl,
        insurance_usd=insurance_usd,
        handling_usd=handling_usd,
        landed_cost_usd=landed_cost_usd,
        landed_cost_per_bbl=landed_cost_per_bbl,
        market_price_used_usd=assumptions.market_price_usd_per_bbl,
        market_price_provenance=assumptions.market_price_provenance,
        expected_revenue_usd=expected_revenue_usd,
        expected_profit_usd=expected_profit_usd,
        expected_margin_pct=expected_margin_pct,
        max_acceptable_price_usd=max_acceptable_price,
        max_acceptable_price_per_bbl=max_acceptable_per_bbl,
        min_target_margin_used=assumptions.min_target_margin,
        deal_verdict=verdict,
        verdict_reason=reason,
        profitability_provenance=ProvenanceStatus.CALCULATED,
    )
