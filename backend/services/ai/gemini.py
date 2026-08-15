"""
GeminiProvider — implements AIProvider using Google Gemini.

CRITICAL RULES (enforced by system prompts + post-processing):
- Gemini parses language → structures fields → asks follow-up questions.
- Gemini explains pre-computed results → does NOT compute them.
- Gemini NEVER performs arithmetic, pricing, or optimization.
- Model name comes from GEMINI_MODEL env var. If unavailable → ConfigError raised.
"""
from __future__ import annotations
import json
import re
from typing import Any

import google.generativeai as genai

from config import get_settings
from services.ai.provider import AIProvider, ConfigError, IntakeParseResult

# Required fields for a complete scenario
REQUIRED_INTAKE_FIELDS = [
    "product",
    "volume_required",
    "volume_unit",
    "destination_port_name",
    "deadline_days",
]

SYSTEM_INTAKE = """\
You are a structured-data extraction engine for an oil supply chain decision platform.
Your job is to parse a natural-language supply requirement into a precise JSON specification.

══════════════════════════════════════════════════════════
CRITICAL PARSING RULES (NEVER violate these)
══════════════════════════════════════════════════════════

RULE 1 — NEVER invent data.
  Extract ONLY what the user explicitly stated.
  If a field is absent from the input, set it to null.
  Never guess, infer, or carry over a value from a previous scenario.

RULE 2 — Disruption ≠ Origin.
  A disruption condition (e.g. "Hormuz is unavailable", "Red Sea is blocked",
  "Suez is closed") is a DISRUPTION CONDITION, NOT an origin.
  Place it in disruption_conditions[], never in sources[].

  Examples:
    "Strait of Hormuz is expected to remain unavailable"
       → disruption_conditions: ["Strait of Hormuz: unavailable / expected sustained disruption"]
       → NOT an origin

    "1M barrels available from West Africa"
       → sources: [{ "origin": "West Africa", "available_volume_bbl": 1000000 }]

    "crude from Middle East, 800k bbl"
       → sources: [{ "origin": "Middle East", "available_volume_bbl": 800000 }]

RULE 3 — Multi-origin support.
  When the user names several supply origins, populate the sources array with ONE entry per origin.
  Each entry must have: origin (string) and available_volume_bbl (number or null).
  Do NOT concatenate multiple origins into a single string.
  Do NOT place disruption language inside any origin field.

RULE 4 — target_landed_cost must be null if not stated.
  If the user did not provide a target landed cost or cost constraint, set it to null.
  Never default to $95/bbl or any other value.

RULE 5 — Constraints must be captured.
  Concentration limits, regulatory constraints, or any "no more than X%" rule
  go into constraints[] as plain English strings.

RULE 6 — Return ONLY valid JSON (no markdown fences, no explanation).

══════════════════════════════════════════════════════════
OUTPUT FORMAT
══════════════════════════════════════════════════════════
{
  "product": "crude" | "diesel" | "gasoline" | "refined" | "lng" | null,
  "volume_required": 2500000 | null,
  "volume_unit": "bbls" | "mt" | null,
  "destination_port_name": "Rotterdam, Netherlands" | null,
  "deadline_days": 18 | null,
  "vessel_situation": "own" | "chartered" | "seeking" | null,
  "optimization_priority": "MINIMIZE_TOTAL_LANDED_COST" | "MINIMIZE_TRANSIT_TIME" | "MINIMIZE_RISK" | null,
  "target_landed_cost_usd_bbl": null,
  "sources": [
    { "origin": "Western Australia", "available_volume_bbl": 1200000 },
    { "origin": "Middle East", "available_volume_bbl": 800000 },
    { "origin": "West Africa", "available_volume_bbl": 1000000 }
  ],
  "disruption_conditions": [
    "Strait of Hormuz: unavailable / expected sustained disruption"
  ],
  "constraints": [
    "No more than 40% of required volume may depend on a single transportation option"
  ],
  "missing_fields": [],
  "follow_up_question": null
}

If sources are not mentioned, set sources to [].
If disruption_conditions are not mentioned, set disruption_conditions to [].
If constraints are not mentioned, set constraints to [].
If optimization_priority is not explicitly stated, set it to null.
If target_landed_cost is not explicitly stated, set it to null.\
"""



SYSTEM_EXPLAIN = """You are an AI assistant for a maritime oil supply chain platform.
You receive structured results from a deterministic optimization engine and explain them clearly to a non-technical user.

CRITICAL RULES:
- DO NOT perform any arithmetic.
- DO NOT invent any numbers, prices, margins, or capacities.
- ONLY reference numbers provided to you in the data.
- Always distinguish between CONFIRMED data and ESTIMATED/SIMULATED data.
- Use clear, professional language appropriate for an energy company executive.
- Explain WHY the recommended strategy is better than alternatives.
- Highlight key trade-offs and risks."""

SYSTEM_REPORT = """You are an AI report writer for a maritime oil supply chain decision platform.
You receive structured data from a deterministic optimization engine and produce an executive decision report.

CRITICAL RULES:
- DO NOT invent or calculate any numbers.
- ONLY use numbers explicitly provided in the data.
- Use Markdown formatting.
- Include sections: Executive Summary, Recommended Strategy, Cost Analysis, Risk Assessment, Alternative Options, Key Assumptions, Next Steps.
- Label all data provenance exactly as provided (CONFIRMED, SIMULATED, ESTIMATED, CALCULATED).
- Keep the report under 800 words."""


class GeminiProvider(AIProvider):

    def __init__(self) -> None:
        settings = get_settings()
        if not settings.has_gemini:
            raise ConfigError(
                "GEMINI_API_KEY is not configured. "
                "Add it to .env to enable AI features."
            )
        genai.configure(api_key=settings.gemini_api_key)
        self._model_name = settings.gemini_model
        self._model: genai.GenerativeModel | None = None

    def _get_model(self) -> genai.GenerativeModel:
        if self._model is None:
            candidates = [
                self._model_name,
                f"models/{self._model_name}" if not self._model_name.startswith("models/") else self._model_name,
                "models/gemini-flash-latest",
                "gemini-flash-latest",
            ]
            last_err = None
            for name in candidates:
                try:
                    self._model = genai.GenerativeModel(
                        model_name=name,
                        generation_config=genai.types.GenerationConfig(
                            temperature=0.2,
                            max_output_tokens=2000,
                        ),
                    )
                    break
                except Exception as e:
                    last_err = e

            if self._model is None:
                raise ConfigError(
                    f"Gemini model '{self._model_name}' is unavailable: {last_err}. "
                    "Update GEMINI_MODEL in .env to a valid model name."
                ) from last_err
        return self._model

    async def _call(self, system: str, user_prompt: str) -> str:
        model = self._get_model()
        prompt = f"{system}\n\n---\n{user_prompt}"
        response = model.generate_content(prompt)
        return response.text.strip()

    async def parse_intake(
        self, text: str, existing_fields: dict[str, Any]
    ) -> IntakeParseResult:
        existing_summary = json.dumps(existing_fields, indent=2) if existing_fields else "None"
        prompt = (
            f"Previously extracted fields:\n{existing_summary}\n\n"
            f"New user input:\n\"{text}\"\n\n"
            "Extract any new/updated fields. Return JSON only."
        )
        raw = await self._call(SYSTEM_INTAKE, prompt)

        # Strip any markdown fences Gemini might add
        raw = re.sub(r"^```[a-z]*\n?", "", raw, flags=re.M)
        raw = re.sub(r"\n?```$", "", raw, flags=re.M)

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            # Gemini returned non-JSON — treat as empty parse
            return IntakeParseResult(
                fields={},
                missing_fields=REQUIRED_INTAKE_FIELDS,
                follow_up_question=(
                    "I didn't quite understand that. Could you tell me: "
                    "what product, volume, destination, and delivery deadline do you need?"
                ),
            )

        # Merge with existing fields
        # Lists (sources, disruption_conditions, constraints) replace rather than append
        merged = {**existing_fields}
        for k, v in data.items():
            if k in ("missing_fields", "follow_up_question"):
                continue
            if v is None:
                # Explicitly null → only override if not already set in existing
                merged.setdefault(k, None)
            elif isinstance(v, list):
                # Lists always replace (new parse wins)
                merged[k] = v
            else:
                merged[k] = v

        # Compute missing fields server-side (don't trust LLM's list)
        missing = [f for f in REQUIRED_INTAKE_FIELDS if not merged.get(f)]

        return IntakeParseResult(
            fields=merged,
            missing_fields=missing,
            follow_up_question=data.get("follow_up_question") if missing else None,
        )

    async def explain_optimization(
        self, structured_result: dict[str, Any], scenario: dict[str, Any]
    ) -> str:
        prompt = (
            f"SCENARIO:\n{json.dumps(scenario, indent=2, default=str)}\n\n"
            f"OPTIMIZATION RESULT:\n{json.dumps(structured_result, indent=2, default=str)}\n\n"
            "Explain why the recommended strategy was selected. "
            "Compare it to the top alternatives. "
            "Highlight the key trade-offs and any risks the decision maker should know about."
        )
        return await self._call(SYSTEM_EXPLAIN, prompt)

    async def generate_report(
        self,
        scenario: dict[str, Any],
        recommended_strategy: dict[str, Any],
        all_strategies: list[dict[str, Any]],
        deals: list[dict[str, Any]],
    ) -> str:
        payload = {
            "scenario": scenario,
            "recommended_strategy": recommended_strategy,
            "all_strategies": all_strategies[:5],  # top 5 only
            "confirmed_deals": deals,
        }
        prompt = (
            f"Generate an executive decision report based on this data:\n"
            f"{json.dumps(payload, indent=2, default=str)}"
        )
        return await self._call(SYSTEM_REPORT, prompt)
