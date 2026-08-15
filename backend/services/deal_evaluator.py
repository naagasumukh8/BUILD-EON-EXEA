"""
Deal Evaluator — 100% deterministic arithmetic engine. No LLM involved.
Strict adherence to financial P&L formulas and negotiation ceiling rules.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any

from schemas import DealVerdict, EvaluationResult, ProvenanceStatus


@dataclass
class EconAssumptions:
    market_price_usd_per_bbl: float = 85.00
    market_price_provenance: ProvenanceStatus = ProvenanceStatus.SIMULATED
    origin_price_usd_per_bbl: float = 0.00
    freight_usd_per_bbl: float = 0.00
    insurance_usd_per_bbl: float = 0.15
    handling_usd_per_bbl: float = 0.10
    min_target_margin: float = 0.08  # Can be ratio (e.g. 0.08) or fixed dollar amount (e.g. 250)


def evaluate_deal_advanced(
    volume_bbls: float,
    deal_price_quoted: float,     # total lump sum OR per-bbl depending on unit
    origin_price_per_bbl: float = 0.0,
    insurance_per_bbl: float = 0.0,
    handling_per_bbl: float = 0.0,
    market_price_per_bbl: float = 85.0,
    target_margin: float = 0.08,  # ratio or fixed dollar amount
    quoted_price_unit: str = "lumpsum",
    quoted_price_currency: str = "USD",
    deal_id: str = "eval-001",
) -> EvaluationResult:
    """
    100% Deterministic P&L and Verdict Evaluator.

    Formulas:
      1. freight_per_bbl = deal_price / volume (if lumpsum)
      2. landed_cost_per_bbl = origin_price + freight_per_bbl + insurance + handling
      3. margin_per_bbl = market_price - landed_cost_per_bbl
      4. profit_usd = margin_per_bbl * volume
      5. target_margin_dollar = target_margin if target_margin >= 1.0 else market_price * target_margin
      6. ceiling_per_bbl = market_price - origin_price - insurance - handling - target_margin_dollar
      7. negotiation_ceiling = ceiling_per_bbl * volume if ceiling_per_bbl > 0 else None
      8. verdict:
         - REJECT if margin_per_bbl < 0 or ceiling_per_bbl is None
         - GO if deal_price <= negotiation_ceiling
         - NEGOTIATE if deal_price > negotiation_ceiling (and margin >= 0)
    """
    if volume_bbls <= 0:
        raise ValueError("Volume must be strictly positive (> 0)")
    if deal_price_quoted < 0 or origin_price_per_bbl < 0 or market_price_per_bbl < 0:
        raise ValueError("Prices cannot be negative")

    # 1. Normalise freight price
    if quoted_price_unit == "per_bbl":
        deal_lump_usd = deal_price_quoted * volume_bbls
        freight_per_bbl = deal_price_quoted
    else:
        deal_lump_usd = deal_price_quoted
        freight_per_bbl = deal_price_quoted / volume_bbls

    # 2. Landed cost
    landed_cost_per_bbl = origin_price_per_bbl + freight_per_bbl + insurance_per_bbl + handling_per_bbl
    landed_cost_usd = landed_cost_per_bbl * volume_bbls

    # 3. Revenue, Margin & Profit
    expected_revenue_usd = market_price_per_bbl * volume_bbls
    margin_per_bbl = market_price_per_bbl - landed_cost_per_bbl
    expected_profit_usd = margin_per_bbl * volume_bbls
    expected_margin_pct = (margin_per_bbl / market_price_per_bbl * 100.0) if market_price_per_bbl > 0 else 0.0

    # 4. Target margin & Negotiation Ceiling
    if target_margin >= 1.0:
        target_margin_dollar = target_margin
    else:
        target_margin_dollar = market_price_per_bbl * target_margin

    ceiling_per_bbl = market_price_per_bbl - origin_price_per_bbl - insurance_per_bbl - handling_per_bbl - target_margin_dollar

    if ceiling_per_bbl > 0:
        negotiation_ceiling = ceiling_per_bbl * volume_bbls
    else:
        negotiation_ceiling = None
        ceiling_per_bbl = None

    # 5. Verdict determination & Reason formatting
    if margin_per_bbl < 0 or negotiation_ceiling is None or ceiling_per_bbl is None:
        verdict = DealVerdict.REJECT
        negotiation_ceiling = None
        reason = (
            f"Deal is uneconomic (margin: ${margin_per_bbl:.2f}/bbl, profit: ${expected_profit_usd:,.0f}). "
            f"No viable positive freight ceiling exists to hit the target margin."
        )
    elif deal_lump_usd <= negotiation_ceiling:
        verdict = DealVerdict.GO
        reason = (
            f"At ${freight_per_bbl:.2f}/bbl (${deal_lump_usd:,.0f} total), expected margin is ${margin_per_bbl:.2f}/bbl "
            f"(${expected_profit_usd:,.0f} profit), which meets the target ceiling of ${negotiation_ceiling:,.0f}."
        )
    else:
        verdict = DealVerdict.NEGOTIATE
        gap_per_bbl = freight_per_bbl - ceiling_per_bbl
        reason = (
            f"At ${freight_per_bbl:.2f}/bbl the quoted price exceeds target ceiling by ${gap_per_bbl:.0f}/bbl (${gap_per_bbl:.2f}/bbl). "
            f"Negotiate down to target ceiling of ${negotiation_ceiling:,.0f} (${ceiling_per_bbl:.2f}/bbl) or lower."
        )

    return EvaluationResult(
        deal_id=deal_id,
        volume_bbls=volume_bbls,
        quoted_price_usd=deal_lump_usd,
        quoted_price_per_bbl=freight_per_bbl,
        freight_usd=deal_lump_usd,
        freight_per_bbl=freight_per_bbl,
        insurance_usd=insurance_per_bbl * volume_bbls,
        handling_usd=handling_per_bbl * volume_bbls,
        landed_cost_usd=landed_cost_usd,
        landed_cost_per_bbl=landed_cost_per_bbl,
        market_price_used_usd=market_price_per_bbl,
        market_price_provenance=ProvenanceStatus.SIMULATED,
        expected_revenue_usd=expected_revenue_usd,
        expected_profit_usd=expected_profit_usd,
        expected_margin_pct=expected_margin_pct,
        max_acceptable_price_usd=negotiation_ceiling if negotiation_ceiling is not None else 0.0,
        max_acceptable_price_per_bbl=ceiling_per_bbl if ceiling_per_bbl is not None else 0.0,
        min_target_margin_used=target_margin,
        deal_verdict=verdict,
        verdict_reason=reason,
        profitability_provenance=ProvenanceStatus.CALCULATED,
    )


def evaluate_deal(
    deal_id: str,
    volume_bbls: float,
    quoted_price: float,
    quoted_price_unit: str,
    quoted_price_currency: str,
    assumptions: EconAssumptions,
) -> EvaluationResult:
    return evaluate_deal_advanced(
        volume_bbls=volume_bbls,
        deal_price_quoted=quoted_price,
        origin_price_per_bbl=assumptions.origin_price_usd_per_bbl,
        insurance_per_bbl=assumptions.insurance_usd_per_bbl,
        handling_per_bbl=assumptions.handling_usd_per_bbl,
        market_price_per_bbl=assumptions.market_price_usd_per_bbl,
        target_margin=assumptions.min_target_margin,
        quoted_price_unit=quoted_price_unit,
        quoted_price_currency=quoted_price_currency,
        deal_id=deal_id,
    )
