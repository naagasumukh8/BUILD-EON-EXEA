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
    "vessel_situation",
]

SYSTEM_INTAKE = """You are an AI assistant for an oil supply chain decision platform.
Your role is to extract structured fields from the user's natural-language description of their supply requirement.

RULES:
- Extract ONLY what the user explicitly stated. Do NOT invent or assume values.
- If a required field is missing, list it in missing_fields and compose ONE clear follow_up_question for ALL missing fields at once.
- For volume, always extract the number and unit separately.
- For product: normalise to one of: crude, diesel, gasoline, refined, lng.
- For vessel_situation: map to one of: own, chartered, seeking.
- Return ONLY a valid JSON object — no markdown fences, no explanation.

Required fields: product, volume_required, volume_unit, destination_port_name, deadline_days, vessel_situation.

Output format (JSON only):
{
  "product": "diesel" | null,
  "volume_required": 2000000 | null,
  "volume_unit": "bbls" | "mt" | null,
  "destination_port_name": "Mumbai" | null,
  "deadline_days": 7 | null,
  "vessel_situation": "own" | "chartered" | "seeking" | null,
  "origin_port_name": "Ras Tanura" | null,
  "supplier": "Aramco" | null,
  "purchase_price_usd_per_bbl": 82.5 | null,
  "missing_fields": ["deadline_days", "vessel_situation"],
  "follow_up_question": "To complete your scenario, could you tell me: your required delivery deadline in days, and whether you own a vessel, have a chartered one, or need to find one?"
}"""

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
            try:
                self._model = genai.GenerativeModel(
                    model_name=self._model_name,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=2000,
                    ),
                )
            except Exception as e:
                # If the model name is wrong, raise ConfigError — never substitute
                raise ConfigError(
                    f"Gemini model '{self._model_name}' is unavailable: {e}. "
                    "Update GEMINI_MODEL in .env to a valid model name."
                ) from e
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
        merged = {**existing_fields}
        for k, v in data.items():
            if k not in ("missing_fields", "follow_up_question") and v is not None:
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
