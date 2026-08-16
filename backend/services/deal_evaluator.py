"""
Deal Evaluator — 100% deterministic arithmetic engine. No LLM involved.
Strict adherence to financial P&L formulas and negotiation ceiling rules.
"""
from __future__ import annotations
from dataclasses import dataclass

from schemas import DealVerdict, EvaluationResult, ProvenanceStatus


@dataclass
class EconAssumptions:
    market_price_usd_per_bbl: float = 85.00
    market_price_provenance: ProvenanceStatus = ProvenanceStatus.SIMULATED
    origin_price_usd_per_bbl: float = 0.00
    freight_usd_per_bbl: float = 0.00
    insurance_usd_per_bbl: float = 0.15
    handling_usd_per_bbl: float = 0.10
    min_target_margin: float = 0.08


def get_default_assumptions(
    product: str = "crude",
    override_market_price: float | None = None,
    override_freight: float | None = None,
    override_insurance: float | None = None,
    override_handling: float | None = None,
    override_margin: float | None = None,
) -> EconAssumptions:
    # Default values based on product type (matching platform baseline assumptions)
    market_price = 105.00
    if "diesel" in product.lower():
        market_price = 115.00
    elif "gasoline" in product.lower():
        market_price = 110.00

    freight = 0.00
    insurance = 0.15
    handling = 0.10
    margin = 0.08

    # Apply overrides if provided
    if override_market_price is not None:
        market_price = override_market_price
    if override_freight is not None:
        freight = override_freight
    if override_insurance is not None:
        insurance = override_insurance
    if override_handling is not None:
        handling = override_handling
    if override_margin is not None:
        margin = override_margin

    return EconAssumptions(
        market_price_usd_per_bbl=market_price,
        market_price_provenance=ProvenanceStatus.REAL_REFERENCE if override_market_price is not None else ProvenanceStatus.SIMULATED,
        origin_price_usd_per_bbl=0.0,
        freight_usd_per_bbl=freight,
        insurance_usd_per_bbl=insurance,
        handling_usd_per_bbl=handling,
        min_target_margin=margin,
    )


def evaluate_deal_advanced(
    volume_bbls: float,
    deal_price_quoted: float,
    origin_price_per_bbl: float = 0.0,
    insurance_per_bbl: float = 0.0,
    handling_per_bbl: float = 0.0,
    market_price_per_bbl: float = 85.0,
    market_price_provenance: ProvenanceStatus = ProvenanceStatus.SIMULATED,
    target_margin: float = 0.08,
    quoted_price_unit: str = "lumpsum",
    quoted_price_currency: str = "USD",
    deal_id: str = "eval-001",
) -> EvaluationResult:
    """Deterministic P&L and commercial verdict. Never produced by an LLM."""
    if volume_bbls <= 0:
        raise ValueError("Volume must be strictly positive (> 0)")
    if deal_price_quoted < 0 or origin_price_per_bbl < 0 or market_price_per_bbl < 0:
        raise ValueError("Prices cannot be negative")
    if quoted_price_unit not in ("lumpsum", "per_bbl"):
        raise ValueError("quoted_price_unit must be 'lumpsum' or 'per_bbl'")

    if quoted_price_unit == "per_bbl":
        deal_lump_usd = deal_price_quoted * volume_bbls
        freight_per_bbl = deal_price_quoted
    else:
        deal_lump_usd = deal_price_quoted
        freight_per_bbl = deal_price_quoted / volume_bbls

    landed_cost_per_bbl = (
        origin_price_per_bbl + freight_per_bbl + insurance_per_bbl + handling_per_bbl
    )
    landed_cost_usd = landed_cost_per_bbl * volume_bbls

    expected_revenue_usd = market_price_per_bbl * volume_bbls
    margin_per_bbl = market_price_per_bbl - landed_cost_per_bbl
    expected_profit_usd = margin_per_bbl * volume_bbls
    expected_margin_pct = (
        margin_per_bbl / market_price_per_bbl * 100.0
        if market_price_per_bbl > 0 else 0.0
    )

    target_margin_dollar = (
        target_margin if target_margin >= 1.0
        else market_price_per_bbl * target_margin
    )
    ceiling_per_bbl = (
        market_price_per_bbl
        - origin_price_per_bbl
        - insurance_per_bbl
        - handling_per_bbl
        - target_margin_dollar
    )

    negotiation_ceiling = ceiling_per_bbl * volume_bbls if ceiling_per_bbl > 0 else None

    if margin_per_bbl < 0 or negotiation_ceiling is None:
        verdict = DealVerdict.REJECT
        negotiation_ceiling = None
        ceiling_per_bbl = None
        reason = (
            f"Deal is uneconomic (margin: ${margin_per_bbl:.2f}/bbl, "
            f"profit: ${expected_profit_usd:,.0f}). No viable positive freight "
            f"ceiling exists to hit the target margin."
        )
    elif deal_lump_usd <= negotiation_ceiling:
        verdict = DealVerdict.GO
        reason = (
            f"At ${freight_per_bbl:.2f}/bbl (${deal_lump_usd:,.0f} total), "
            f"expected margin is ${margin_per_bbl:.2f}/bbl "
            f"(${expected_profit_usd:,.0f} profit), meeting the target margin."
        )
    else:
        verdict = DealVerdict.NEGOTIATE
        gap_per_bbl = freight_per_bbl - ceiling_per_bbl
        reason = (
            f"At ${freight_per_bbl:.2f}/bbl the quote exceeds the target ceiling "
            f"by ${gap_per_bbl:.2f}/bbl. Negotiate to "
            f"${ceiling_per_bbl:.2f}/bbl or lower."
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
        market_price_provenance=market_price_provenance,
        expected_revenue_usd=expected_revenue_usd,
        expected_profit_usd=expected_profit_usd,
        expected_margin_pct=expected_margin_pct,
        max_acceptable_price_usd=negotiation_ceiling or 0.0,
        max_acceptable_price_per_bbl=ceiling_per_bbl or 0.0,
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
        market_price_provenance=assumptions.market_price_provenance,
        target_margin=assumptions.min_target_margin,
        quoted_price_unit=quoted_price_unit,
        quoted_price_currency=quoted_price_currency,
        deal_id=deal_id,
    )
