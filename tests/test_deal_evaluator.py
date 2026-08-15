import json
import os
import pytest
import sys

sys.path.insert(0, 'backend')

from services.deal_evaluator import evaluate_deal_advanced
from schemas import DealVerdict, ProvenanceStatus


FIXTURES_PATH = os.path.join(os.path.dirname(__file__), 'fixtures', 'deal_evaluator_fixtures.json')


def load_fixtures():
    with open(FIXTURES_PATH, 'r') as f:
        return json.load(f)


# ── TEST 1 (GO) ─────────────────────────────────────────────────────────────
def test_deal_evaluator_go():
    fixtures = load_fixtures()
    data = fixtures['test_1_go']
    inputs = data['inputs']
    expected = data['expected']

    res = evaluate_deal_advanced(
        volume_bbls=inputs['volume'],
        deal_price_quoted=inputs['deal_price'],
        origin_price_per_bbl=inputs['origin_price'],
        insurance_per_bbl=inputs['insurance'],
        market_price_per_bbl=inputs['market_price'],
        target_margin=inputs['target_margin'],
        quoted_price_unit='lumpsum',
    )

    assert res.freight_per_bbl == pytest.approx(expected['freight_per_bbl'], abs=1e-2), f"Expected freight {expected['freight_per_bbl']}, got {res.freight_per_bbl}"
    assert res.landed_cost_per_bbl == pytest.approx(expected['landed_cost'], abs=1e-2), f"Expected landed cost {expected['landed_cost']}, got {res.landed_cost_per_bbl}"
    assert (res.market_price_used_usd - res.landed_cost_per_bbl) == pytest.approx(expected['margin'], abs=1e-2), f"Expected margin {expected['margin']}, got {res.market_price_used_usd - res.landed_cost_per_bbl}"
    assert res.expected_profit_usd == pytest.approx(expected['profit'], abs=1e-2), f"Expected profit {expected['profit']}, got {res.expected_profit_usd}"
    assert res.max_acceptable_price_usd == pytest.approx(expected['ceiling'], abs=1e-2), f"Expected ceiling {expected['ceiling']}, got {res.max_acceptable_price_usd}"
    assert res.deal_verdict == expected['verdict'], f"Expected verdict {expected['verdict']}, got {res.deal_verdict}"
    assert res.profitability_provenance in (ProvenanceStatus.CALCULATED, "CALCULATED")


# ── TEST 2 (NEGOTIATE) ──────────────────────────────────────────────────────
def test_deal_evaluator_negotiate():
    fixtures = load_fixtures()
    data = fixtures['test_2_negotiate']
    inputs = data['inputs']
    expected = data['expected']

    res = evaluate_deal_advanced(
        volume_bbls=inputs['volume'],
        deal_price_quoted=inputs['deal_price'],
        origin_price_per_bbl=inputs['origin_price'],
        insurance_per_bbl=inputs['insurance'],
        market_price_per_bbl=inputs['market_price'],
        target_margin=inputs['target_margin'],
        quoted_price_unit='lumpsum',
    )

    assert res.freight_per_bbl == pytest.approx(expected['freight_per_bbl'], abs=1e-2)
    assert res.landed_cost_per_bbl == pytest.approx(expected['landed_cost'], abs=1e-2)
    assert (res.market_price_used_usd - res.landed_cost_per_bbl) == pytest.approx(expected['margin'], abs=1e-2)
    assert res.expected_profit_usd == pytest.approx(expected['profit'], abs=1e-2)
    assert res.max_acceptable_price_usd == pytest.approx(expected['ceiling'], abs=1e-2)
    assert res.deal_verdict == expected['verdict']

    for substr in expected['reason_contains']:
        assert substr in res.verdict_reason, f"Expected '{substr}' in reason '{res.verdict_reason}'"

    # INVARIANT: NEGOTIATE ceiling is not None and ceiling < deal_price
    assert res.max_acceptable_price_usd is not None
    assert res.max_acceptable_price_usd < res.quoted_price_usd


# ── TEST 3 (REJECT, no viable ceiling) ──────────────────────────────────────
def test_deal_evaluator_reject():
    fixtures = load_fixtures()
    data = fixtures['test_3_reject']
    inputs = data['inputs']
    expected = data['expected']

    res = evaluate_deal_advanced(
        volume_bbls=inputs['volume'],
        deal_price_quoted=inputs['deal_price'],
        origin_price_per_bbl=inputs['origin_price'],
        insurance_per_bbl=inputs['insurance'],
        market_price_per_bbl=inputs['market_price'],
        target_margin=0.08,
        quoted_price_unit='lumpsum',
    )

    assert res.freight_per_bbl == pytest.approx(expected['freight_per_bbl'], abs=1e-2)
    assert res.landed_cost_per_bbl == pytest.approx(expected['landed_cost'], abs=1e-2)
    assert (res.market_price_used_usd - res.landed_cost_per_bbl) == pytest.approx(expected['margin'], abs=1e-2)
    assert res.expected_profit_usd == pytest.approx(expected['profit'], abs=1e-2)
    assert res.deal_verdict == expected['verdict']

    # INVARIANT: REJECT ceiling is 0.0 / None representation
    assert res.max_acceptable_price_usd == 0.0 or res.max_acceptable_price_usd is None


# ── ADVERSARIAL TESTS ───────────────────────────────────────────────────────
def test_deal_evaluator_zero_volume():
    with pytest.raises(ValueError):
        evaluate_deal_advanced(volume_bbls=0, deal_price_quoted=100000)


def test_deal_evaluator_negative_price():
    with pytest.raises(ValueError):
        evaluate_deal_advanced(volume_bbls=50000, deal_price_quoted=-500)
