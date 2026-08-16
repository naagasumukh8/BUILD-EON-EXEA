"""Regression tests for Poly Exea's non-negotiable decision invariants.

Run from the backend directory with:
    python -m unittest discover -s tests -v

These tests intentionally avoid network calls. Live AIS and external market feeds
must be validated separately and reported as NOT EXECUTED when credentials/network
are unavailable.
"""
from __future__ import annotations
import unittest

from services.deal_evaluator import EconAssumptions, evaluate_deal
from services.opportunity_discovery import discover_scenario_opportunities
from services.optimizer_service import OptConfig, OptOption, solve_optimization
from schemas import ProvenanceStatus


class DecisionEngineRegressionTests(unittest.TestCase):
    def test_exact_capacity_match(self) -> None:
        options = [OptOption(
            id="v1", name="Confirmed Vessel", option_type="vessel",
            max_volume=400_000, cost_per_bbl=4.0, eta_days=5,
            product="crude", provenance_status="CONFIRMED",
        )]
        result = solve_optimization(options, OptConfig(
            required_volume=400_000, deadline_days=7, product="crude",
        ))
        self.assertEqual(result.status, "OPTIMAL")
        self.assertEqual(result.fulfilled_volume, 400_000)
        self.assertEqual(result.shortfall_volume, 0)
        self.assertGreaterEqual(len(result.strategies), 1)
        self.assertEqual(result.strategies[0].allocations[0].allocated_volume, 400_000)
        self.assertEqual(result.strategies[0].allocations[0].allocated_pct, 100.0)

    def test_demand_exceeds_on_time_capacity(self) -> None:
        options = [
            OptOption(id="a", name="A", option_type="pipeline", max_volume=1_000_000,
                      cost_per_bbl=4.0, eta_days=5, product="crude", provenance_status="CONFIRMED"),
            OptOption(id="b", name="B", option_type="vessel", max_volume=800_000,
                      cost_per_bbl=5.0, eta_days=7, product="crude", provenance_status="CONFIRMED"),
        ]
        result = solve_optimization(options, OptConfig(
            required_volume=5_000_000, deadline_days=7, product="crude",
        ))
        self.assertEqual(result.status, "PARTIAL")
        self.assertEqual(result.fulfilled_volume, 1_800_000)
        self.assertEqual(result.shortfall_volume, 3_200_000)
        self.assertIsNotNone(result.recommended_strategy)
        self.assertLess(result.recommended_strategy.coverage_pct, 100.0)

    def test_unverified_vessel_never_enters_solver(self) -> None:
        options = [
            OptOption(id="live-candidate", name="AIS Candidate", option_type="vessel",
                      max_volume=2_000_000, cost_per_bbl=1.0, eta_days=2,
                      product="crude", provenance_status="CANDIDATE_UNVERIFIED"),
            OptOption(id="confirmed", name="Confirmed Supply", option_type="supplier",
                      max_volume=2_000_000, cost_per_bbl=10.0, eta_days=4,
                      product="crude", provenance_status="CONFIRMED"),
        ]
        result = solve_optimization(options, OptConfig(
            required_volume=2_000_000, deadline_days=7, product="crude",
        ))
        self.assertEqual(result.status, "OPTIMAL")
        for allocation in result.recommended_strategy.allocations:
            self.assertNotEqual(allocation.option_id, "live-candidate")

    def test_deadline_is_inclusive(self) -> None:
        option = OptOption(id="exact", name="ETA Exact", option_type="vessel",
                           max_volume=1_000_000, cost_per_bbl=5.0, eta_days=7,
                           product="diesel", provenance_status="CONFIRMED")
        result = solve_optimization([option], OptConfig(
            required_volume=1_000_000, deadline_days=7, product="diesel",
        ))
        self.assertEqual(result.status, "OPTIMAL")
        self.assertEqual(result.fulfilled_volume, 1_000_000)

    def test_same_input_is_deterministic(self) -> None:
        options = [
            OptOption(id="p", name="Pipeline", option_type="pipeline", max_volume=1_500_000,
                      cost_per_bbl=4.0, eta_days=12, risk_score=0.12,
                      product="crude", provenance_status="REAL_REFERENCE"),
            OptOption(id="s", name="Spot", option_type="supplier", max_volume=1_000_000,
                      cost_per_bbl=5.0, eta_days=8, risk_score=0.08,
                      product="crude", provenance_status="CONFIRMED"),
        ]
        config = OptConfig(required_volume=2_000_000, deadline_days=20, product="crude")
        outputs = [solve_optimization(options, config).recommended_strategy.model_dump()
                   for _ in range(3)]
        self.assertEqual(outputs[0], outputs[1])
        self.assertEqual(outputs[1], outputs[2])

    def test_market_price_provenance_is_preserved(self) -> None:
        result = evaluate_deal(
            deal_id="ref-1",
            volume_bbls=100_000,
            quoted_price=2.0,
            quoted_price_unit="per_bbl",
            quoted_price_currency="USD",
            assumptions=EconAssumptions(
                market_price_usd_per_bbl=90.0,
                market_price_provenance=ProvenanceStatus.REAL_REFERENCE,
            ),
        )
        self.assertEqual(result.market_price_provenance, ProvenanceStatus.REAL_REFERENCE)
        self.assertEqual(result.profitability_provenance, ProvenanceStatus.CALCULATED)

    def test_opportunity_discovery_is_scenario_aware(self) -> None:
        trapped = discover_scenario_opportunities(
            scenario_type="TRAPPED_CARGO", product="crude", required_volume=2_000_000,
            origin_port="Ras Tanura", destination_port="Rotterdam", deadline_days=30,
        )
        moving = discover_scenario_opportunities(
            scenario_type="MOVING_VESSEL", product="crude", required_volume=1_000_000,
            origin_port="Arabian Sea", destination_port="Rotterdam", deadline_days=20,
        )
        trapped_types = {o.opportunity_type for o in trapped}
        moving_types = {o.opportunity_type for o in moving}
        self.assertTrue(trapped_types)
        self.assertTrue(moving_types)
        self.assertNotEqual(trapped_types, moving_types)

    def test_unverified_opportunities_do_not_become_confirmed(self) -> None:
        opportunities = discover_scenario_opportunities(
            scenario_type="TRAPPED_CARGO", product="crude", required_volume=2_000_000,
            origin_port="Ras Tanura", destination_port="Rotterdam", deadline_days=30,
        )
        for opportunity in opportunities:
            if opportunity.feasibility_status == "COMMERCIAL_VERIFICATION_REQUIRED":
                self.assertNotEqual(opportunity.provenance, "CONFIRMED")


if __name__ == "__main__":
    unittest.main()
