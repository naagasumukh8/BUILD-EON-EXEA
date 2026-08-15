"""Intake router — parse free text with Gemini, save validated scenario."""
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Depends

from db import get_db, DBClient
from schemas import IntakeParseRequest, ScenarioCreateRequest, ScenarioResponse, IntakeParsedFields
from services.ai.provider import ConfigError

router = APIRouter(prefix="/api/intake", tags=["intake"])


def _get_ai_provider():
    """Return GeminiProvider or raise 503 if not configured."""
    from config import get_settings
    settings = get_settings()
    if not settings.has_gemini:
        return None
    try:
        from services.ai.gemini import GeminiProvider
        return GeminiProvider()
    except ConfigError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/parse")
async def parse_intake(req: IntakeParseRequest):
    """
    Parse free-text user input into structured scenario fields using Gemini.
    If Gemini is not configured, returns the text unprocessed with a flag.
    """
    ai = _get_ai_provider()

    if not ai:
        # Graceful degradation — no AI, user must fill form manually
        return {
            "parsed_fields": {},
            "missing_fields": [
                "product", "volume_required", "volume_unit",
                "destination_port_name", "deadline_days", "vessel_situation"
            ],
            "follow_up_question": None,
            "ai_available": False,
            "note": "GEMINI_API_KEY not configured. Please fill in the form fields manually.",
        }

    try:
        result = await ai.parse_intake(req.text, req.existing_fields)
        return {
            "parsed_fields": result.fields,
            "missing_fields": result.missing_fields,
            "follow_up_question": result.follow_up_question,
            "ai_available": True,
            "complete": len(result.missing_fields) == 0,
        }
    except ConfigError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parse error: {e}")


@router.post("/save", response_model=ScenarioResponse)
async def save_scenario(
    req: ScenarioCreateRequest,
    db: DBClient = Depends(get_db),
):
    """Validate and persist a completed scenario."""
    # Normalise weights to sum to 1
    total_w = req.priority_cost_weight + req.priority_time_weight + req.priority_risk_weight
    if total_w <= 0:
        total_w = 1.0

    record = req.model_dump()
    record["priority_cost_weight"] = req.priority_cost_weight / total_w
    record["priority_time_weight"] = req.priority_time_weight / total_w
    record["priority_risk_weight"] = req.priority_risk_weight / total_w
    record["gemini_parsed"] = bool(req.raw_intake_text)
    record["status"] = "active"
    record["volume_unit"] = req.volume_unit.value

    saved = db.insert("scenarios", record)
    return ScenarioResponse(**saved)


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(scenario_id: str, db: DBClient = Depends(get_db)):
    row = db.select_one("scenarios", scenario_id)
    if not row:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return ScenarioResponse(**row)
