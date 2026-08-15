"""Pydantic schemas for the Maritime Supply Decision Platform."""
from __future__ import annotations
from datetime import date, datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator
import uuid


# ── Enums ──────────────────────────────────────────────────────────────

class ProvenanceStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    REAL_REFERENCE = "REAL_REFERENCE"
    ESTIMATED = "ESTIMATED"
    SIMULATED = "SIMULATED"
    CANDIDATE_UNVERIFIED = "CANDIDATE_UNVERIFIED"
    CALCULATED = "CALCULATED"

class VesselSituation(str, Enum):
    OWN = "own"
    CHARTERED = "chartered"
    SEEKING = "seeking"

class DealType(str, Enum):
    VESSEL = "vessel"
    PIPELINE = "pipeline"
    ALTERNATE_ROUTE = "alternate_route"
    SUPPLIER = "supplier"

class DealVerdict(str, Enum):
    GO = "GO"
    NEGOTIATE = "NEGOTIATE"
    REJECT = "REJECT"

class VolumeUnit(str, Enum):
    BBLS = "bbls"
    MT = "mt"
    MBBLS = "mbbls"  # thousand barrels


# ── Intake Schemas ──────────────────────────────────────────────────────

class IntakeParseRequest(BaseModel):
    """Raw free-text from user, sent to Gemini for parsing."""
    text: str = Field(..., min_length=5, max_length=4000)
    existing_fields: dict[str, Any] = Field(default_factory=dict)


class SupplySource(BaseModel):
    """A single supply origin with its available volume."""
    origin: str
    available_volume_bbl: Optional[float] = None


class IntakeParsedFields(BaseModel):
    """Structured output from Gemini after parsing free text. Validated before use."""
    product: Optional[str] = None               # crude, diesel, gasoline, refined, lng
    volume_required: Optional[float] = None
    volume_unit: Optional[str] = None           # bbls, mt
    destination_port_name: Optional[str] = None
    deadline_days: Optional[int] = None
    vessel_situation: Optional[VesselSituation] = None
    optimization_priority: Optional[str] = None  # MINIMIZE_TOTAL_LANDED_COST | MINIMIZE_TRANSIT_TIME | MINIMIZE_RISK
    target_landed_cost_usd_bbl: Optional[float] = None  # null if not stated by user — NEVER default
    # Multi-origin supply sources (replaces single origin_port_name for complex scenarios)
    sources: list[SupplySource] = Field(default_factory=list)
    origin_port_name: Optional[str] = None      # kept for simple single-origin scenarios
    # Disruption and constraint context
    disruption_conditions: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)
    # Legacy fields
    supplier: Optional[str] = None
    purchase_price_usd_per_bbl: Optional[float] = None
    missing_fields: list[str] = Field(default_factory=list)
    follow_up_question: Optional[str] = None    # Gemini's next question if fields missing


class ScenarioCreateRequest(BaseModel):
    """Validated scenario saved to DB after intake completion."""
    product: str
    volume_required: float = Field(..., gt=0)
    volume_unit: VolumeUnit = VolumeUnit.BBLS
    destination_port_name: str
    deadline_days: int = Field(..., gt=0, le=365)
    origin_port_name: Optional[str] = None
    supplier: Optional[str] = None
    purchase_price_usd_per_bbl: Optional[float] = None
    freight_cost_usd_per_bbl: Optional[float] = None
    insurance_cost_usd_per_bbl: Optional[float] = None
    handling_cost_usd_per_bbl: Optional[float] = None
    vessel_situation: VesselSituation = VesselSituation.SEEKING
    vessel_type_required: Optional[str] = None
    priority_cost_weight: float = Field(0.4, ge=0, le=1)
    priority_time_weight: float = Field(0.35, ge=0, le=1)
    priority_risk_weight: float = Field(0.25, ge=0, le=1)
    raw_intake_text: Optional[str] = None

    @field_validator("priority_cost_weight", "priority_time_weight", "priority_risk_weight")
    @classmethod
    def weights_positive(cls, v: float) -> float:
        if v < 0 or v > 1:
            raise ValueError("Weight must be between 0 and 1")
        return v


class ScenarioResponse(BaseModel):
    id: str
    product: str
    volume_required: float
    volume_unit: str
    destination_port_name: Optional[str]
    deadline_days: int
    origin_port_name: Optional[str]
    vessel_situation: Optional[str]
    priority_cost_weight: float
    priority_time_weight: float
    priority_risk_weight: float
    status: str
    created_at: Optional[str]


# ── Vessel Schemas ─────────────────────────────────────────────────────

class VesselCandidateResponse(BaseModel):
    id: str
    scenario_id: Optional[str]
    mmsi: Optional[str]
    name: str
    vessel_type: Optional[str]
    flag: Optional[str]
    dwt: Optional[float]
    current_lat: Optional[float]
    current_lon: Optional[float]
    current_destination: Optional[str]
    eta_destination: Optional[str]
    speed_knots: Optional[float]
    source: str
    source_type: str
    provenance_status: str  # always CANDIDATE_UNVERIFIED
    ais_timestamp: Optional[str]
    notes: Optional[str]
    created_at: Optional[str]


# ── Deal Schemas ───────────────────────────────────────────────────────

class DealCreateRequest(BaseModel):
    """Human-entered commercial deal details."""
    scenario_id: str
    vessel_candidate_id: Optional[str] = None
    deal_type: DealType
    counterparty: Optional[str] = None
    product: str
    capacity_pct: Optional[float] = Field(None, ge=0, le=100)
    capacity_volume: Optional[float] = Field(None, ge=0)  # user can enter directly
    quoted_price: float = Field(..., gt=0)
    quoted_price_currency: str = "USD"
    quoted_price_unit: str = "lumpsum"  # lumpsum | per_bbl
    availability_date: Optional[date] = None
    contact_reference: Optional[str] = None
    notes: Optional[str] = None


class DealResponse(BaseModel):
    id: str
    scenario_id: str
    deal_type: str
    counterparty: Optional[str]
    product: str
    capacity_pct: Optional[float]
    capacity_volume: Optional[float]
    quoted_price: float
    quoted_price_currency: str
    quoted_price_unit: str
    quoted_price_usd: Optional[float]
    provenance_status: str
    confirmed_at: Optional[str]
    # Evaluation results (null until /evaluate called)
    landed_cost_usd: Optional[float]
    landed_cost_per_bbl: Optional[float]
    expected_revenue_usd: Optional[float]
    expected_profit_usd: Optional[float]
    expected_margin_pct: Optional[float]
    max_acceptable_price_usd: Optional[float]
    deal_verdict: Optional[str]
    verdict_reason: Optional[str]
    profitability_provenance: Optional[str]
    evaluated_at: Optional[str]


# ── Deal Evaluator Schemas ─────────────────────────────────────────────

class EvaluateRequest(BaseModel):
    deal_id: str
    # Override economic assumptions (optional — defaults from reference_data)
    market_price_usd_per_bbl: Optional[float] = None
    freight_usd_per_bbl: Optional[float] = None
    insurance_usd_per_bbl: Optional[float] = None
    handling_usd_per_bbl: Optional[float] = None
    min_target_margin: Optional[float] = None  # 0.0–1.0


class EvaluationResult(BaseModel):
    """100% deterministic output. Never produced by LLM."""
    deal_id: str
    volume_bbls: float
    # Costs
    quoted_price_usd: float
    quoted_price_per_bbl: float
    freight_usd: float
    freight_per_bbl: float
    insurance_usd: float
    handling_usd: float
    landed_cost_usd: float
    landed_cost_per_bbl: float
    # Revenue & profit
    market_price_used_usd: float
    market_price_provenance: ProvenanceStatus
    expected_revenue_usd: float
    expected_profit_usd: float
    expected_margin_pct: float
    # Negotiation ceiling
    max_acceptable_price_usd: float
    max_acceptable_price_per_bbl: float
    min_target_margin_used: float
    # Verdict
    deal_verdict: DealVerdict
    verdict_reason: str
    # Provenance
    profitability_provenance: ProvenanceStatus = ProvenanceStatus.CALCULATED


# ── What-If Schema ─────────────────────────────────────────────────────

class WhatIfRequest(BaseModel):
    deal_id: str
    new_quoted_price: float = Field(..., gt=0)
    market_price_usd_per_bbl: Optional[float] = None
    freight_usd_per_bbl: Optional[float] = None


# ── Optimization Schemas ───────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    scenario_id: str
    deal_ids: list[str] = Field(..., min_length=1)  # confirmed deals to include
    include_pipelines: bool = True
    include_alternate_routes: bool = True
    # Weight overrides (if None, use scenario weights)
    cost_weight: Optional[float] = None
    time_weight: Optional[float] = None
    risk_weight: Optional[float] = None


class AllocationItem(BaseModel):
    option_type: str
    option_id: Optional[str]
    option_name: str
    allocated_volume: float
    allocated_pct: float
    cost_usd: float
    eta_days: Optional[int]
    risk_score: Optional[float]
    provenance_status: str


class StrategyResult(BaseModel):
    id: Optional[str]
    rank: int
    is_recommended: bool
    is_baseline: bool
    name: str
    allocations: list[AllocationItem]
    total_cost_usd: float
    cost_per_bbl: float
    expected_profit_usd: float
    expected_margin_pct: float
    savings_vs_baseline_usd: Optional[float] = 0.0
    savings_vs_baseline_per_bbl: Optional[float] = 0.0
    eta_days: int
    risk_score: float
    coverage_pct: float
    allocated_volume: float
    provenance_status: str = "CALCULATED"


class OptimizationResponse(BaseModel):
    optimization_run_id: str
    scenario_id: str
    solver: str
    strategies: list[StrategyResult]
    baseline: Optional[StrategyResult]
    recommended: Optional[StrategyResult]
    volume_required: float
    weights_used: dict[str, float]


# ── Explain / Report Schemas ───────────────────────────────────────────

class ExplainRequest(BaseModel):
    optimization_run_id: str
    scenario_id: str


class ExplainResponse(BaseModel):
    explanation: str
    generated_by: str
    model_used: Optional[str]


class ReportGenerateRequest(BaseModel):
    scenario_id: str
    optimization_run_id: str


class ReportResponse(BaseModel):
    id: str
    scenario_id: str
    report_markdown: str
    generated_by: str
    model_used: Optional[str]
    created_at: str
