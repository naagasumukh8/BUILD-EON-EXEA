"""
AI Provider abstraction.
Gemini is the primary LLM.
If the configured model is unavailable → raises ConfigError.
NEVER silently substitutes another model or provider.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


class ConfigError(Exception):
    """Raised when an AI provider is mis-configured."""


@dataclass
class IntakeParseResult:
    fields: dict[str, Any]
    missing_fields: list[str]
    follow_up_question: str | None


class AIProvider(ABC):
    """Abstract base — all LLM interactions go through this interface."""

    @abstractmethod
    async def parse_intake(
        self, text: str, existing_fields: dict[str, Any]
    ) -> IntakeParseResult:
        """Parse free-text user input into structured scenario fields."""

    @abstractmethod
    async def explain_optimization(
        self, structured_result: dict[str, Any], scenario: dict[str, Any]
    ) -> str:
        """Explain why the recommended strategy was selected.
        Receives structured data — MUST NOT invent numbers."""

    @abstractmethod
    async def generate_report(
        self,
        scenario: dict[str, Any],
        recommended_strategy: dict[str, Any],
        all_strategies: list[dict[str, Any]],
        deals: list[dict[str, Any]],
    ) -> str:
        """Generate an executive decision report in Markdown.
        MUST NOT invent numbers — only format/explain data provided."""
