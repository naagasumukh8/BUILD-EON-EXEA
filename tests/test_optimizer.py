import json
import os
import pytest
import sys

sys.path.insert(0, 'backend')

from services.optimizer_service import OptOption, OptConfig, solve_optimization


FIXTURES_PATH = os.path.join(os.path.dirname(__file__), 'fixtures', 'optimizer_fixtures.json')


def load_fixtures():
    with open(FIXTURES_PATH, 'r') as f:
        return json.load(f)


# ── TEST 4 (HYBRID ALLOCATION, EXCLUDES UNVERIFIED) ──────────────────────────
def test_optimizer_hybrid_allocation():
    fixtures = load_fixtures()
    data = fixtures['test_4_hybrid_allocation']
    inputs = data['inputs']
    expected = data['expected']

    options = [
        OptOption(
            id=o['id'],
            name=o['name'],
            option_type=o['option_type'],
            max_volume=o['capacity'],
            cost_per_bbl=o['cost'],
            eta_days=o['days'],
            provenance_status=o['provenance_status'],
        )
        for o in inputs['options']
    ]

    config = OptConfig(
        required_volume=inputs['required_volume'],
        deadline_days=inputs['deadline_days'],
        cost_weight=1.0,
        time_weight=0.0,
        risk_weight=0.0,
        market_price_per_bbl=5000.0,
    )

    result = solve_optimization(options, config)
    assert result.status == "OPTIMAL"
    assert result.recommended_strategy is not None

    rec = result.recommended_strategy
    alloc_dict = {a.option_id: a.allocated_volume for a in rec.allocations}

    # Verify exact allocation matching ground truth fixture
    for opt_id, expected_vol in expected['strategy_allocations'].items():
        assert alloc_dict.get(opt_id, 0) == pytest.approx(expected_vol, abs=1.0), f"Mismatch for {opt_id}: expected {expected_vol}, got {alloc_dict.get(opt_id)}"

    # INVARIANT: sum of strategy allocations == required_volume
    assert sum(alloc_dict.values()) == pytest.approx(inputs['required_volume'], abs=1.0)

    # INVARIANT: option_D (UNVERIFIED) MUST NOT appear in allocations
    assert expected['excluded_option'] not in alloc_dict

    # Check metrics
    assert rec.cost_per_bbl == pytest.approx(expected['weighted_avg_cost'], abs=1.0)
    assert rec.total_cost_usd == pytest.approx(expected['total_cost'], abs=1.0)
    assert rec.eta_days <= expected['max_time_used']

    # Check baseline savings calculation
    if result.baseline_strategy:
        assert result.baseline_strategy.total_cost_usd == pytest.approx(expected['baseline_cost'], abs=1.0)
        savings = result.baseline_strategy.total_cost_usd - rec.total_cost_usd
        assert savings == pytest.approx(expected['savings'], abs=1.0)

    # INVARIANT: Provenance status check
    for a in rec.allocations:
        assert a.provenance_status in ("CONFIRMED", "REAL_REFERENCE", "ESTIMATED")
        assert a.provenance_status != "CANDIDATE_UNVERIFIED"


# ── TEST 5 (DEADLINE INFEASIBILITY, HONEST PARTIAL RESULT) ─────────────────
def test_optimizer_deadline_infeasibility():
    fixtures = load_fixtures()
    data = fixtures['test_5_deadline_infeasibility']
    inputs = data['inputs']
    expected = data['expected']

    options = [
        OptOption(
            id=o['id'],
            name=o['name'],
            option_type='pipeline',
            max_volume=o['capacity'],
            cost_per_bbl=o['cost'],
            eta_days=o['days'],
            provenance_status=o['provenance_status'],
        )
        for o in inputs['options']
    ]

    config = OptConfig(
        required_volume=inputs['required_volume'],
        deadline_days=inputs['deadline_days'],
    )

    result = solve_optimization(options, config)

    assert result.status in ("PARTIAL", "INFEASIBLE")
    assert result.fulfilled_volume == pytest.approx(expected['fulfilled'], abs=1.0)
    assert result.shortfall_volume == pytest.approx(expected['shortfall'], abs=1.0)

    for substr in expected['message_contains']:
        assert substr in result.message, f"Expected '{substr}' in message '{result.message}'"


# ── ADVERSARIAL TESTS ───────────────────────────────────────────────────────
def test_optimizer_zero_volume():
    with pytest.raises(ValueError):
        solve_optimization([], OptConfig(required_volume=0, deadline_days=7))


def test_optimizer_negative_deadline():
    with pytest.raises(ValueError):
        solve_optimization([], OptConfig(required_volume=100000, deadline_days=-3))


def test_optimizer_empty_options():
    res = solve_optimization([], OptConfig(required_volume=100000, deadline_days=7))
    assert res.status == "INFEASIBLE"
    assert res.fulfilled_volume == 0.0
    assert res.shortfall_volume == 100000.0


def test_optimizer_product_mismatch():
    options = [
        OptOption(id="o1", name="Crude Pipe", option_type="pipeline", max_volume=500000, cost_per_bbl=50, eta_days=2, product="crude"),
    ]
    config = OptConfig(required_volume=100000, deadline_days=7, product="diesel")
    res = solve_optimization(options, config)
    assert res.status == "INFEASIBLE"
