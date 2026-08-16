"""
Golden Scenario Search Execution & Verification Script:
Runs Scenarios A, B, C, D through full backend optimization & evaluation pipeline.
Prints exact numbers for verification.
"""
import sys, os, json
sys.path.insert(0, 'backend')
os.chdir('backend')
from dotenv import load_dotenv
load_dotenv('../.env')

from services.optimizer_service import OptOption, OptConfig, solve_optimization
from services.deal_evaluator import evaluate_deal, EconAssumptions
from schemas import ProvenanceStatus

scenarios = [
    {
        "id": "A",
        "label": "Scenario A: 2,000,000 bbl diesel -> Mumbai, 7 days, priority cost",
        "product": "diesel",
        "volume": 2_000_000,
        "destination": "Mumbai, India",
        "deadline": 7,
        "priority": "cost",
        "weights": (0.50, 0.25, 0.25),
        "options": [
            OptOption(id="vess-mumbai", name="Stena Bulk Charter (VLCC)", option_type="vessel", max_volume=400_000, cost_per_bbl=92.30, eta_days=6, risk_score=0.10, product="diesel", provenance_status="CONFIRMED"),
            OptOption(id="pipe-ipsa", name="Yanbu IPSA Pipeline Bypass", option_type="pipeline", max_volume=2_500_000, cost_per_bbl=89.50, eta_days=3, risk_score=0.05, product="diesel", provenance_status="REAL_REFERENCE"),
            OptOption(id="lane-cape", name="Cape Bypass Alternate Sea Lane", option_type="alternate_route", max_volume=3_000_000, cost_per_bbl=97.20, eta_days=11, risk_score=0.15, product="diesel", provenance_status="REAL_REFERENCE"),
        ]
    },
    {
        "id": "B",
        "label": "Scenario B: 2,500,000 bbl crude -> Rotterdam, 18 days, priority cost",
        "product": "crude",
        "volume": 2_500_000,
        "destination": "Rotterdam, Netherlands",
        "deadline": 18,
        "priority": "cost",
        "weights": (0.50, 0.25, 0.25),
        "options": [
            OptOption(id="pipe-ipsa", name="Yanbu IPSA Pipeline Bypass", option_type="pipeline", max_volume=2_500_000, cost_per_bbl=89.50, eta_days=6, risk_score=0.06, product="crude", provenance_status="REAL_REFERENCE"),
            OptOption(id="vess-stena", name="Stena Bulk VLCC Charter", option_type="vessel", max_volume=400_000, cost_per_bbl=92.30, eta_days=12, risk_score=0.10, product="crude", provenance_status="CONFIRMED"),
            OptOption(id="cape-rot", name="Cape of Good Hope Bypass", option_type="alternate_route", max_volume=3_000_000, cost_per_bbl=97.20, eta_days=16, risk_score=0.14, product="crude", provenance_status="REAL_REFERENCE"),
        ]
    },
    {
        "id": "C",
        "label": "Scenario C: 1,000,000 bbl gasoline -> Singapore, 10 days, priority time",
        "product": "gasoline",
        "volume": 1_000_000,
        "destination": "Singapore",
        "deadline": 10,
        "priority": "time",
        "weights": (0.25, 0.50, 0.25),
        "options": [
            OptOption(id="vess-sg", name="Fast Aframax Spot Charter", option_type="vessel", max_volume=500_000, cost_per_bbl=94.10, eta_days=5, risk_score=0.08, product="gasoline", provenance_status="CONFIRMED"),
            OptOption(id="pipe-adcop", name="ADCOP Fujairah Pipeline Bypass", option_type="pipeline", max_volume=1_000_000, cost_per_bbl=90.20, eta_days=4, risk_score=0.05, product="gasoline", provenance_status="REAL_REFERENCE"),
            OptOption(id="route-sunda", name="Sunda Strait Bypass Route", option_type="alternate_route", max_volume=1_000_000, cost_per_bbl=95.50, eta_days=8, risk_score=0.12, product="gasoline", provenance_status="REAL_REFERENCE"),
        ]
    },
    {
        "id": "D",
        "label": "Scenario D: 1,500,000 bbl crude -> Houston, 14 days, priority risk",
        "product": "crude",
        "volume": 1_500_000,
        "destination": "Houston, USA",
        "deadline": 14,
        "priority": "risk",
        "weights": (0.25, 0.25, 0.50),
        "options": [
            OptOption(id="pipe-adcop", name="Habshan-Fujairah ADCOP Low-Risk Pipeline", option_type="pipeline", max_volume=1_500_000, cost_per_bbl=90.20, eta_days=4, risk_score=0.04, product="crude", provenance_status="REAL_REFERENCE"),
            OptOption(id="vess-us", name="US Flagged Suezmax Charter", option_type="vessel", max_volume=600_000, cost_per_bbl=93.50, eta_days=10, risk_score=0.07, product="crude", provenance_status="CONFIRMED"),
            OptOption(id="lane-transatl", name="Transatlantic Alternate Route", option_type="alternate_route", max_volume=2_000_000, cost_per_bbl=98.00, eta_days=12, risk_score=0.10, product="crude", provenance_status="REAL_REFERENCE"),
        ]
    }
]

print("=" * 80)
print("GOLDEN SCENARIO SEARCH VERIFICATION RUN")
print("=" * 80)

results = {}

for sc in scenarios:
    print(f"\n--- RUNNING {sc['label']} ---")
    cfg = OptConfig(
        required_volume=sc["volume"],
        deadline_days=sc["deadline"],
        product=sc["product"],
        cost_weight=sc["weights"][0],
        time_weight=sc["weights"][1],
        risk_weight=sc["weights"][2],
        market_price_per_bbl=105.00
    )
    opt_res = solve_optimization(sc["options"], cfg)
    rec = opt_res.recommended_strategy
    base = opt_res.baseline_strategy

    # Test deal evaluation
    deal_res = evaluate_deal(
        deal_id=f"deal-{sc['id']}",
        volume_bbls=min(400_000, sc["volume"]),
        quoted_price=5.00,
        quoted_price_unit="per_bbl",
        quoted_price_currency="USD",
        assumptions=EconAssumptions(market_price_usd_per_bbl=105.00)
    )

    results[sc['id']] = {
        "status": opt_res.status,
        "fulfilled_volume": opt_res.fulfilled_volume,
        "shortfall_volume": opt_res.shortfall_volume,
        "recommended_name": rec.name if rec else None,
        "cost_per_bbl": rec.cost_per_bbl if rec else None,
        "total_cost_usd": rec.total_cost_usd if rec else None,
        "expected_profit_usd": rec.expected_profit_usd if rec else None,
        "expected_margin_pct": rec.expected_margin_pct if rec else None,
        "eta_days": rec.eta_days if rec else None,
        "risk_score": rec.risk_score if rec else None,
        "allocations": [
            {
                "pct": a.allocated_pct,
                "name": a.option_name,
                "vol": a.allocated_volume,
                "cost": a.cost_usd,
                "eta": a.eta_days
            } for a in rec.allocations
        ] if rec else [],
        "deal_verdict": deal_res.deal_verdict.value,
        "deal_reason": deal_res.verdict_reason
    }

    print(f"Status: {opt_res.status}")
    print(f"Fulfilled: {opt_res.fulfilled_volume:,.0f} bbl | Shortfall: {opt_res.shortfall_volume:,.0f} bbl")
    print(f"Recommended Strategy: {rec.name}")
    print(f"Landed Cost: ${rec.cost_per_bbl:.2f}/bbl | Total: ${rec.total_cost_usd:,.0f}")
    print(f"Expected Profit: ${rec.expected_profit_usd:,.0f} | Margin: {rec.expected_margin_pct:.1f}% | ETA: {rec.eta_days} days")
    print("Allocations:")
    for a in rec.allocations:
        print(f"  - {a.allocated_pct}% {a.option_name}: {a.allocated_volume:,.0f} bbl ({a.eta_days} days)")
    print(f"Deal Verdict: {deal_res.deal_verdict.value}")

print("\n" + "=" * 80)
print("RAW JSON RESULTS FOR REPORTING")
print("=" * 80)
print(json.dumps(results, indent=2))
