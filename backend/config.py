"""
Backend configuration — reads from environment variables / .env file.
ALL secrets are server-side only. Never expose to frontend.
"""
from __future__ import annotations
import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── AI ─────────────────────────────────────────────────────────────
    gemini_api_key: str = ""
    # CRITICAL: model name is read from env. If the configured model is
    # unavailable, the application raises ConfigError. It does NOT
    # silently substitute another model.
    gemini_model: str = "gemini-2.5-flash"

    # ── Database ────────────────────────────────────────────────────────
    supabase_url: str = ""
    supabase_service_key: str = ""

    # ── AIS ────────────────────────────────────────────────────────────
    aisstream_api_key: str = ""

    # ── Economics / Reference ───────────────────────────────────────────
    market_price_usd_per_bbl: float = 85.00
    default_min_target_margin: float = 0.08
    inr_usd_rate: float = 83.5

    # ── Server ─────────────────────────────────────────────────────────
    backend_port: int = 8000
    backend_host: str = "0.0.0.0"
    cors_origins: str = "http://localhost:3001,http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def has_supabase(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_key)

    @property
    def has_aisstream(self) -> bool:
        return bool(self.aisstream_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
