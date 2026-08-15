"""Report router — Gemini generates executive decision report + download."""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import PlainTextResponse

from db import get_db, DBClient
from schemas import ExplainRequest, ExplainResponse, ReportGenerateRequest, ReportResponse
from config import get_settings

router = APIRouter(prefix="/api/report", tags=["report"])


def _get_ai():
    settings = get_settings()
    if not settings.has_gemini:
        return None
    try:
        from services.ai.gemini import GeminiProvider
        return GeminiProvider()
    except Exception:
        return None


@router.post("/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest, db: DBClient = Depends(get_db)):
    """Generate Gemini explanation of the optimization result."""
    ai = _get_ai()
    settings = get_settings()

    # Load data
    scenario = db.select_one("scenarios", req.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    strategies = db.select("strategies", {"optimization_run_id": req.optimization_run_id})
    recommended = next((s for s in strategies if s.get("is_recommended")), strategies[0] if strategies else {})

    if not ai:
        return ExplainResponse(
            explanation=(
                "AI explanation unavailable — GEMINI_API_KEY not configured. "
                f"The recommended strategy is: {recommended.get('name', 'Unknown')}. "
                f"It achieves a cost of ${recommended.get('cost_per_bbl', 0):.2f}/bbl, "
                f"ETA {recommended.get('eta_days', '?')} days, "
                f"risk score {recommended.get('risk_score', '?'):.2f}."
            ),
            generated_by="fallback",
            model_used=None,
        )

    try:
        explanation = await ai.explain_optimization(
            structured_result={
                "strategies": strategies[:5],
                "recommended": recommended,
                "optimizer": "OR-Tools",
            },
            scenario=scenario,
        )
        return ExplainResponse(
            explanation=explanation,
            generated_by="gemini",
            model_used=settings.gemini_model,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {e}")


@router.post("/generate", response_model=ReportResponse)
async def generate_report(req: ReportGenerateRequest, db: DBClient = Depends(get_db)):
    """Generate full executive decision report."""
    ai = _get_ai()
    settings = get_settings()

    scenario = db.select_one("scenarios", req.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    strategies = db.select("strategies", {"optimization_run_id": req.optimization_run_id})
    recommended = next((s for s in strategies if s.get("is_recommended")), strategies[0] if strategies else {})
    deals = db.select("confirmed_deals", {"scenario_id": req.scenario_id})

    if not ai:
        # Generate a basic structured report without AI
        report_md = _generate_fallback_report(scenario, recommended, strategies, deals)
        generated_by = "template"
        model_used = None
    else:
        try:
            report_md = await ai.generate_report(scenario, recommended, strategies[:5], deals)
            generated_by = "gemini"
            model_used = settings.gemini_model
        except Exception as e:
            report_md = _generate_fallback_report(scenario, recommended, strategies, deals)
            generated_by = "template_fallback"
            model_used = None

    report_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    db.insert("decision_reports", {
        "id": report_id,
        "scenario_id": req.scenario_id,
        "optimization_run_id": req.optimization_run_id,
        "report_text": report_md,
        "report_markdown": report_md,
        "generated_by": generated_by,
        "model_used": model_used,
        "created_at": now,
    })

    return ReportResponse(
        id=report_id,
        scenario_id=req.scenario_id,
        report_markdown=report_md,
        generated_by=generated_by,
        model_used=model_used,
        created_at=now,
    )


@router.get("/{report_id}/download")
async def download_report(report_id: str, db: DBClient = Depends(get_db)):
    """Return report as plain Markdown (downloadable)."""
    report = db.select_one("decision_reports", report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return PlainTextResponse(
        content=report.get("report_markdown", ""),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="maritime_decision_report_{report_id[:8]}.md"'},
    )


def _generate_fallback_report(
    scenario: dict, recommended: dict, strategies: list, deals: list
) -> str:
    """Structured fallback report when Gemini is unavailable."""
    name = recommended.get("name", "N/A")
    cost = recommended.get("cost_per_bbl", 0)
    profit = recommended.get("expected_profit_usd", 0)
    margin = recommended.get("expected_margin_pct", 0)
    eta = recommended.get("eta_days", "N/A")
    risk = recommended.get("risk_score", 0)
    coverage = recommended.get("coverage_pct", 0)

    deals_rows = []
    for d in deals:
        cp = d.get('counterparty', '?')
        dt = d.get('deal_type', '?')
        vol = d.get('capacity_volume', 0)
        curr = d.get('quoted_price_currency', 'USD')
        qp = d.get('quoted_price', 0)
        ver = d.get('deal_verdict', 'PENDING')
        deals_rows.append(f"| {cp} | {dt} | {vol:,.0f} bbls | {curr} {qp:,.0f} | **{ver}** |")
    deals_table = "\n".join(deals_rows)

    strat_rows = []
    for s in strategies[:8]:
        rk = s.get('rank', '?')
        nm = s.get('name', '?')
        cpb = s.get('cost_per_bbl', 0)
        mg = s.get('expected_margin_pct', 0)
        et = s.get('eta_days', '?')
        strat_rows.append(f"| #{rk} | {nm} | ${cpb:.2f} | {mg:.1f}% | {et}d |")
    strat_table = "\n".join(strat_rows)

    return f"""# Maritime Supply Decision Report

*Generated: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}*
*Data provenance: CALCULATED (deterministic optimizer)*

---

## Executive Summary

The optimization engine evaluated **{len(strategies)} strategies** for securing
**{scenario.get('volume_required', 'N/A'):,} {scenario.get('volume_unit', 'bbls')}**
of **{scenario.get('product', 'N/A')}** to **{scenario.get('destination_port_name', 'N/A')}**
within **{scenario.get('deadline_days', 'N/A')} days**.

---

## Recommended Strategy [CALCULATED]

**{name}**

| Metric | Value | Provenance |
|--------|-------|------------|
| Cost per barrel | ${cost:.2f} | CALCULATED |
| Total cost | ${recommended.get('total_cost_usd', 0):,.0f} | CALCULATED |
| Expected profit | ${profit:,.0f} | CALCULATED |
| Expected margin | {margin:.1f}% | CALCULATED |
| ETA | {eta} days | CALCULATED |
| Risk score | {risk:.2f} | CALCULATED |
| Volume coverage | {coverage:.1f}% | CALCULATED |

---

## Confirmed Deals

| Counterparty | Type | Volume | Quoted Price | Verdict |
|---|---|---|---|---|
{deals_table}

---

## All Strategies Evaluated

| Rank | Strategy | Cost/bbl | Margin | ETA |
|---|---|---|---|---|
{strat_table}

---

## Key Assumptions [SIMULATED unless stated]

- Market selling price: ${scenario.get('market_price_used', 85)}/bbl (SIMULATED)
- Minimum target margin: 8%
- Insurance: $0.15/bbl (SIMULATED)
- Handling: $0.10/bbl (SIMULATED)

---

*Note: Add GEMINI_API_KEY to .env for AI-generated narrative.*
"""

