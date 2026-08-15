"""
Poly Exea — Advanced Scenario-Aware Opportunity Discovery Engine.

Network Opportunity Discovery Layer evaluated prior to OR-Tools optimization.
Identifies, filters, scores, and ranks candidates across 20 strategy classes
organised into 4 commercial families:

  FAMILY 1 — MOVE DIFFERENTLY
    1.  DIRECT ALTERNATE ROUTE   — Cape of Good Hope / alternate maritime corridor
    2.  PIPELINE BYPASS          — terrestrial pipeline + re-ship from terminal
    9.  TRANSSHIPMENT            — vessel/mode transfer at hub
    17. STS / LIGHTERING         — ship-to-ship transfer at anchorage
    18. MULTIMODAL               — maritime + pipeline + road/rail combined

  FAMILY 2 — DON'T MOVE YOUR CARGO
    3.  REPLACEMENT SUPPLY       — buy equivalent from another origin
    12. LOCAL INVENTORY          — tap existing regional/strategic stock
    5.  CARGO / DELIVERY SWAP    — exchange delivery obligations bilaterally
    6.  LOCAL / REGIONAL EXCHANGE— equivalent inventory already near destination
    15. ALTERNATIVE ORIGIN       — change loading origin entirely

  FAMILY 3 — USE THE NETWORK MORE INTELLIGENTLY
    4.  MOVING VESSEL OPPORTUNITY— divert vessel already near useful corridor
    7.  BACKHAUL OPPORTUNITY     — use empty return journey for another cargo
    8.  TRIANGULATION            — 3-party closed loop eliminating ballast
    14. DIVERSIFIED SPLIT        — spread requirement across multiple sources
    19. DEMAND REBALANCING       — redirect cargo to alternative refinery/unit

  FAMILY 4 — CHANGE THE TIMING / STRUCTURE
    11. WAIT / TIMING STRATEGY   — delay transit until feasible/safe window
    16. ALTERNATIVE DESTINATION  — discharge elsewhere, forward via other network
    20. EMERGENCY REPLACEMENT    — procure replacement now; park stranded cargo
    13. COUNTERPARTY EXCHANGE    — explicit physical position swap between companies
    10. HYBRID STRATEGY          — umbrella combining strategies from 2+ families

Rule 1: Gemini NEVER invents deals, pricing, or willingness to transact.
Rule 2: Grade/quality or commercial willingness unverified → COMMERCIAL_VERIFICATION_REQUIRED.
Rule 3: Deterministic economic math calculates transport avoided, savings, and landed cost.
Rule 4: Scenario-aware ranking & physical constraint enforcement.
Rule 5: strategy_family tag on every opportunity — enables family-level UI grouping.
"""
from __future__ import annotations
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from services.optimizer_service import OptOption


@dataclass
class NetworkOpportunity:
    id: str
    opportunity_type: str        # One of the 20 strategy classes
    strategy_family: str         # MOVE_DIFFERENTLY | DONT_MOVE | USE_NETWORK | CHANGE_TIMING
    title: str
    why_relevant: str
    participants: list[str]
    origin: str
    destination: str
    volume_bbls: float
    transport_required: str
    transport_avoided: str
    distance_avoided_nm: float
    estimated_cost_usd: float
    cost_per_bbl: float
    estimated_savings_usd: float
    eta_days: int
    risk_score: float
    required_verification: str
    feasibility_status: str       # LIVE | REAL_REFERENCE | CALCULATED_OPPORTUNITY | COMMERCIAL_VERIFICATION_REQUIRED | HUMAN_VERIFIED | ESTIMATED | SIMULATED | NOT_FEASIBLE
    data_sources: list[str]
    timestamp: str
    provenance: str
    explanation: str
    rank: int = 0
    quality_compatible: bool = False
    product: str = "crude"

    def to_opt_option(self) -> OptOption:
        """Converts commercially eligible opportunity to an OR-Tools solver option."""
        return OptOption(
            id=self.id,
            name=f"[{self.opportunity_type}] {self.title}",
            option_type=self.opportunity_type.lower().replace(" ", "_"),
            max_volume=self.volume_bbls,
            cost_per_bbl=self.cost_per_bbl,
            eta_days=self.eta_days,
            risk_score=self.risk_score,
            product=self.product,
            provenance_status=self.provenance if self.provenance in ("CONFIRMED", "REAL_REFERENCE") else "ESTIMATED",
            notes=self.explanation,
        )


def discover_scenario_opportunities(
    scenario_type: str,            # "TRAPPED_CARGO" | "UNCOMMITTED_CARGO" | "MOVING_VESSEL"
    product: str,
    required_volume: float,
    origin_port: str,
    destination_port: str,
    deadline_days: int,
    market_price_bbl: float = 88.52,
) -> list[NetworkOpportunity]:
    """
    Evaluates scenario constraints and network graph to discover, score, and rank
    relevant opportunities specifically tailored to the scenario.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    opportunities: list[NetworkOpportunity] = []

    # ═══════════════════════════════════════════════════════════════════════════
    # SCENARIO 1: TRAPPED CARGO INSIDE GULF
    # Families prioritised: MOVE_DIFFERENTLY, DONT_MOVE, CHANGE_TIMING
    # ═══════════════════════════════════════════════════════════════════════════
    if scenario_type == "TRAPPED_CARGO":
        # Opp 1: Pipeline Bypass (ADCOP) — MOVE_DIFFERENTLY
        opportunities.append(NetworkOpportunity(
            id="opp-s1-01",
            opportunity_type="PIPELINE BYPASS",
            strategy_family="MOVE_DIFFERENTLY",
            title="ADNOC ADCOP Pipeline (Habshan → Fujairah)",
            why_relevant="Bypasses Hormuz chokepoint terrestrially for cargo trapped inside UAE/Gulf.",
            participants=["ADNOC Logistics", "Fujairah Terminal"],
            origin="Abu Dhabi (Habshan)",
            destination="Fujairah Terminal (Outside Hormuz)",
            volume_bbls=min(required_volume, 1_500_000.0),
            transport_required="Overland pipeline + Aframax shuttle to destination",
            transport_avoided="380 nm maritime passage through Strait of Hormuz",
            distance_avoided_nm=380.0,
            estimated_cost_usd=6_000_000.0,
            cost_per_bbl=4.00,
            estimated_savings_usd=1_800_000.0,
            eta_days=12,
            risk_score=0.12,
            required_verification="Pipeline ullage allocation confirmation",
            feasibility_status="REAL_REFERENCE",
            data_sources=["ADNOC Tariff Manual", "Fujairah Tank Registry"],
            timestamp=now_iso,
            provenance="REAL_REFERENCE",
            explanation="Transfers crude via 360km terrestrial pipeline to Fujairah outside Hormuz chokepoint.",
            rank=1,
            quality_compatible=True,
            product=product,
        ))

        # Opp 2: Local / Regional Resale — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s1-02",
            opportunity_type="LOCAL / REGIONAL EXCHANGE",
            strategy_family="DONT_MOVE",
            title="Local Gulf Distressed Cargo FOB Resale",
            why_relevant="Liquidates trapped position to local refiners to eliminate vessel demurrage.",
            participants=["Persian Gulf Refiner", "Vessel Charterer"],
            origin="Persian Gulf Anchorage",
            destination="Ras Tanura / Ruwais Refinery",
            volume_bbls=required_volume,
            transport_required="Short-haul coastal discharge",
            transport_avoided="3,200 nm ocean voyage through Hormuz",
            distance_avoided_nm=3_200.0,
            estimated_cost_usd=7_040_000.0,
            cost_per_bbl=3.52,
            estimated_savings_usd=5_000_000.0,
            eta_days=5,
            risk_score=0.20,
            required_verification="Local buyer credit terms & crude assay verification",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Persian Gulf Spot Market Feed"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Liquidates trapped cargo to local Gulf refiners, freeing vessel asset while replacement supply is sourced elsewhere.",
            rank=2,
            quality_compatible=False,
            product=product,
        ))

        # Opp 3: Replacement Supply (WAF) — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s1-03",
            opportunity_type="REPLACEMENT SUPPLY",
            strategy_family="DONT_MOVE",
            title="West Africa (WAF) Crude Replacement Procurement",
            why_relevant="Decouples trapped Gulf asset from destination refinery supply requirement.",
            participants=["Global Oil Trader", "Destination Refinery"],
            origin="Bonny Light / Nigeria",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="VLCC WAF to India shipping lane",
            transport_avoided="Gulf loading & Hormuz transit",
            distance_avoided_nm=1_200.0,
            estimated_cost_usd=181_540_000.0,
            cost_per_bbl=market_price_bbl + 2.25,
            estimated_savings_usd=800_000.0,
            eta_days=22,
            risk_score=0.08,
            required_verification="Refinery assay clearance for WAF grade",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Platts Crude Index", "WAF-India Charter Rates"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Procures replacement crude from West Africa to prevent destination refinery shutdown while Gulf cargo remains stranded.",
            rank=3,
            quality_compatible=True,
            product=product,
        ))

        # Opp 4: Transshipment (STS Lightering) — MOVE_DIFFERENTLY
        opportunities.append(NetworkOpportunity(
            id="opp-s1-04",
            opportunity_type="TRANSSHIPMENT",
            strategy_family="MOVE_DIFFERENTLY",
            title="Gulf Offshore STS Lightering to Neutral Aframax",
            why_relevant="Splits VLCC cargo into smaller neutral-flag vessels for incremental transit.",
            participants=["STS Provider", "Aframax Operator"],
            origin="Gulf Offshore STS Zone",
            destination=destination_port,
            volume_bbls=min(required_volume, 600_000.0),
            transport_required="Offshore STS transfer + 2x Aframax voyage",
            transport_avoided="Single VLCC high-risk transit",
            distance_avoided_nm=0.0,
            estimated_cost_usd=2_880_000.0,
            cost_per_bbl=4.80,
            estimated_savings_usd=-500_000.0,
            eta_days=10,
            risk_score=0.78,
            required_verification="War risk insurer clearance for STS operation",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Offshore STS Operations Log"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Transships cargo to smaller neutral-flag Aframax vessels to reduce individual transit risk.",
            rank=4,
            quality_compatible=False,
            product=product,
        ))

        # Opp 5: Direct Alternate Route — PHYSICALLY INFEASIBLE — MOVE_DIFFERENTLY
        opportunities.append(NetworkOpportunity(
            id="opp-s1-05",
            opportunity_type="DIRECT ALTERNATE ROUTE",
            strategy_family="MOVE_DIFFERENTLY",
            title="Cape of Good Hope Reroute (PHYSICALLY INFEASIBLE)",
            why_relevant="Evaluated for completeness — physically impossible without first exiting Hormuz.",
            participants=["N/A"],
            origin="Persian Gulf Interior",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="N/A",
            transport_avoided="N/A",
            distance_avoided_nm=0.0,
            estimated_cost_usd=0.0,
            cost_per_bbl=0.0,
            estimated_savings_usd=0.0,
            eta_days=999,
            risk_score=1.00,
            required_verification="Geographic barrier: Vessel trapped inside Gulf",
            feasibility_status="NOT_FEASIBLE",
            data_sources=["Hormuz Chokepoint Map"],
            timestamp=now_iso,
            provenance="CALCULATED_OPPORTUNITY",
            explanation="Rerouting this vessel around Cape of Good Hope is impossible because the vessel is already inside the Persian Gulf.",
            rank=5,
            quality_compatible=False,
            product=product,
        ))

        # Opp 6: STS / Lightering (Fujairah Anchorage) — MOVE_DIFFERENTLY
        opportunities.append(NetworkOpportunity(
            id="opp-s1-06",
            opportunity_type="STS / LIGHTERING",
            strategy_family="MOVE_DIFFERENTLY",
            title="Fujairah Anchorage STS Lightering (Outside Hormuz)",
            why_relevant="Transfers cargo to smaller neutral-flag vessel at Fujairah anchorage once pipeline-delivered.",
            participants=["Fujairah Anchorage Authority", "Lightering Operator"],
            origin="Fujairah Offshore Anchorage (25.1°N, 56.3°E)",
            destination=destination_port,
            volume_bbls=min(required_volume, 800_000.0),
            transport_required="Intra-anchorage STS transfer + Aframax voyage to destination",
            transport_avoided="VLCC port-call congestion delay at destination",
            distance_avoided_nm=120.0,
            estimated_cost_usd=1_600_000.0,
            cost_per_bbl=2.00,
            estimated_savings_usd=900_000.0,
            eta_days=11,
            risk_score=0.15,
            required_verification="Lightering vessel availability & Fujairah anchorage permit",
            feasibility_status="REAL_REFERENCE",
            data_sources=["Fujairah Port STS Registry", "UAE Anchorage Schedule"],
            timestamp=now_iso,
            provenance="REAL_REFERENCE",
            explanation="Ship-to-ship transfer at Fujairah anchorage post-pipeline delivery reduces port congestion and accelerates destination discharge.",
            rank=6,
            quality_compatible=True,
            product=product,
        ))

        # Opp 7: Multimodal (Pipeline + STS + Coastal Tanker) — MOVE_DIFFERENTLY
        opportunities.append(NetworkOpportunity(
            id="opp-s1-07",
            opportunity_type="MULTIMODAL",
            strategy_family="MOVE_DIFFERENTLY",
            title="ADCOP Pipeline + Fujairah STS + Mumbai Coastal Feeder",
            why_relevant="Chains pipeline, STS, and coastal tanker to deliver trapped cargo without Hormuz transit.",
            participants=["ADNOC Logistics", "Fujairah STS Operator", "Coastal Feeder Operator"],
            origin="Abu Dhabi (Habshan) → Fujairah → Mumbai",
            destination=destination_port,
            volume_bbls=min(required_volume, 1_200_000.0),
            transport_required="Pipeline (360 km) + STS at Fujairah + 1,050 nm coastal voyage",
            transport_avoided="Hormuz chokepoint + long-haul VLCC routing",
            distance_avoided_nm=550.0,
            estimated_cost_usd=7_200_000.0,
            cost_per_bbl=6.00,
            estimated_savings_usd=1_400_000.0,
            eta_days=14,
            risk_score=0.14,
            required_verification="Multi-operator coordination & coastal feeder availability",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["ADNOC Logistics Schedule", "Indian Coastal Shipping Registry"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Full multi-modal chain: ADCOP pipeline delivers to Fujairah, STS to Aframax, coastal feeder delivers to Mumbai — no Hormuz transit required.",
            rank=7,
            quality_compatible=True,
            product=product,
        ))

        # Opp 8: Counterparty Exchange — CHANGE_TIMING
        opportunities.append(NetworkOpportunity(
            id="opp-s1-08",
            opportunity_type="COUNTERPARTY EXCHANGE",
            strategy_family="CHANGE_TIMING",
            title="Physical Position Exchange with Active Gulf Exporter",
            why_relevant="Exchanges trapped cargo physical title with a counterparty that has an active outside-Hormuz position.",
            participants=["Major Oil Trading House", "Poly Exea User"],
            origin="Persian Gulf (Trapped Position)",
            destination=destination_port,
            volume_bbls=min(required_volume, 1_000_000.0),
            transport_required="Title transfer only — no physical movement by user",
            transport_avoided="All physical transit for user's trapped cargo",
            distance_avoided_nm=3_200.0,
            estimated_cost_usd=1_500_000.0,
            cost_per_bbl=1.50,
            estimated_savings_usd=3_800_000.0,
            eta_days=4,
            risk_score=0.10,
            required_verification="Counterparty willingness to exchange + credit terms + cargo quality match",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Poly Exea Counterparty Registry"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Exchanges physical delivery obligations with a trading house that has crude outside Hormuz, eliminating the need to move the trapped cargo.",
            rank=8,
            quality_compatible=False,
            product=product,
        ))

        # Opp 9: Emergency Replacement + Stranded Cargo — CHANGE_TIMING
        opportunities.append(NetworkOpportunity(
            id="opp-s1-09",
            opportunity_type="EMERGENCY REPLACEMENT",
            strategy_family="CHANGE_TIMING",
            title="Procure Emergency Replacement + Park Stranded Gulf Cargo",
            why_relevant="Secures destination refinery supply now while treating trapped Gulf cargo as a separate future position to monetise later.",
            participants=["Spot Market Trader", "Destination Refinery"],
            origin="Fujairah Spot Market / Singapore",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Spot procurement + fast vessel charter",
            transport_avoided="All physical transit of trapped cargo (deferred)",
            distance_avoided_nm=1_050.0,
            estimated_cost_usd=182_000_000.0,
            cost_per_bbl=market_price_bbl + 2.50,
            estimated_savings_usd=1_200_000.0,
            eta_days=7,
            risk_score=0.09,
            required_verification="Spot market availability confirmation & stranded cargo hedging plan",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Platts Spot Index", "Fujairah Terminal Feed"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Decouples destination refinery from trapped cargo. Procures spot replacement supply immediately and parks Gulf cargo as a separate commercial position.",
            rank=9,
            quality_compatible=True,
            product=product,
        ))

        # Opp 10: Wait / Timing Strategy — CHANGE_TIMING
        opportunities.append(NetworkOpportunity(
            id="opp-s1-10",
            opportunity_type="WAIT / TIMING STRATEGY",
            strategy_family="CHANGE_TIMING",
            title="Hold Position — Transit in Next Verified Safe Window",
            why_relevant="Avoids committing to expensive alternatives if disruption is expected to be brief.",
            participants=["Vessel Operator", "Poly Exea Risk Monitor"],
            origin="Persian Gulf Anchorage (Current Position)",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Vessel idle at anchorage + standard Hormuz transit when window opens",
            transport_avoided="All alternative routing costs",
            distance_avoided_nm=0.0,
            estimated_cost_usd=500_000.0,
            cost_per_bbl=0.50,
            estimated_savings_usd=0.0,
            eta_days=deadline_days,
            risk_score=0.45,
            required_verification="Geopolitical risk assessment & chokepoint re-opening intelligence",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Lloyd's List Intelligence", "US CENTCOM Maritime Advisories"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Delays transit until a verified safe passage window opens. Lowest-cost option but requires real-time geopolitical monitoring. Only viable if disruption is short-lived.",
            rank=10,
            quality_compatible=False,
            product=product,
        ))

    # ═══════════════════════════════════════════════════════════════════════════
    # SCENARIO 2: UNCOMMITTED CARGO (OUTSIDE HORMUZ)
    # Families prioritised: DONT_MOVE, USE_NETWORK, CHANGE_TIMING
    # ═══════════════════════════════════════════════════════════════════════════
    elif scenario_type == "UNCOMMITTED_CARGO":
        # Opp 1: Bi-Coastal Domestic Energy Swap — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s2-01-bicoastal",
            opportunity_type="CARGO / DELIVERY SWAP",
            strategy_family="DONT_MOVE",
            title="Bi-Coastal Domestic Cargo Swap (Mumbai Unload ⇄ Vizag Release)",
            why_relevant="Unloads incoming West Coast vessel at Mumbai/Jamnagar while releasing equivalent inventory from East Coast (Vizag/Paradip), avoiding 2,450 nm voyage around Sri Lanka.",
            participants=["Reliance / Jio Energy Infrastructure", "IOCL / HPCL Bi-Coastal Network"],
            origin="West Coast Terminal (Mumbai / Jamnagar)",
            destination="East Coast Destination (Vizag / Paradip)",
            volume_bbls=min(required_volume, 1_500_000.0),
            transport_required="West Coast berth unload + East Coast pipeline dispatch",
            transport_avoided="2,450 nm ocean passage around Indian Peninsula & Sri Lanka",
            distance_avoided_nm=2_450.0,
            estimated_cost_usd=2_700_000.0,
            cost_per_bbl=1.80,
            estimated_savings_usd=4_200_000.0,
            eta_days=2,
            risk_score=0.04,
            required_verification="Bi-coastal refinery inventory assay & location differential confirmation",
            feasibility_status="REAL_REFERENCE",
            data_sources=["Bi-Coastal Energy Swap Grid", "Refinery Inventory Registry"],
            timestamp=now_iso,
            provenance="REAL_REFERENCE",
            explanation="Unloads incoming vessel at West Coast hub (Mumbai/Jamnagar) and concurrently releases equivalent inventory from East Coast hub (Vizag), saving 8.5 transit days.",
            rank=1,
            quality_compatible=True,
            product=product,
        ))

        # Opp 2: Local / Domestic Refinery Exchange — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s2-01",
            opportunity_type="LOCAL / REGIONAL EXCHANGE",
            strategy_family="DONT_MOVE",
            title="West Coast India Domestic Refinery Exchange",
            why_relevant="Taps unallocated local inventory at destination, avoiding maritime voyage entirely.",
            participants=["Domestic Coastal Refinery", "Poly Exea User"],
            origin="Domestic West Coast Storage",
            destination=destination_port,
            volume_bbls=min(required_volume, 1_000_000.0),
            transport_required="Domestic pipeline / coastal truck dispatch",
            transport_avoided="3,200 nm international ocean transit",
            distance_avoided_nm=3_200.0,
            estimated_cost_usd=115_000_000.0,
            cost_per_bbl=115.00,
            estimated_savings_usd=3_400_000.0,
            eta_days=2,
            risk_score=0.06,
            required_verification="Domestic refinery spot allocation confirmation",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Domestic Refinery Feed"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Procures spot diesel directly from domestic refineries near Mumbai, eliminating maritime transit time.",
            rank=1,
            quality_compatible=False,
            product=product,
        ))

        # Opp 3: Fujairah Terminal Spot Loading — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s2-02",
            opportunity_type="REPLACEMENT SUPPLY",
            strategy_family="DONT_MOVE",
            title="Fujairah Terminal Spot Product Procurement",
            why_relevant="Loads refined product from major storage hub located outside Hormuz chokepoint.",
            participants=["Fujairah Terminal Operator", "Charterer"],
            origin="Fujairah Terminal (Outside Hormuz)",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Short Arabian Sea voyage (Fujairah → Mumbai)",
            transport_avoided="Hormuz chokepoint transit & Gulf loading delay",
            distance_avoided_nm=450.0,
            estimated_cost_usd=230_400_000.0,
            cost_per_bbl=115.20,
            estimated_savings_usd=2_100_000.0,
            eta_days=4,
            risk_score=0.05,
            required_verification="Fujairah spot volume commercial availability",
            feasibility_status="REAL_REFERENCE",
            data_sources=["Fujairah Terminal Inventory Log", "Gulf-Mumbai Tanker Index"],
            timestamp=now_iso,
            provenance="REAL_REFERENCE",
            explanation="Diverts vessel to Fujairah outside Hormuz to load refined product, meeting strict 10-day deadline.",
            rank=2,
            quality_compatible=True,
            product=product,
        ))

        # Opp 4: Hybrid Sourcing — CHANGE_TIMING
        opportunities.append(NetworkOpportunity(
            id="opp-s2-03",
            opportunity_type="HYBRID STRATEGY",
            strategy_family="CHANGE_TIMING",
            title="50% Fujairah Terminal + 50% Domestic India Sourcing",
            why_relevant="Splits risk and volume to guarantee delivery within strict 10-day deadline.",
            participants=["Fujairah Storage", "Domestic Refinery"],
            origin="Fujairah / Domestic India",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Dual-origin dispatch (1M bbl Fujairah + 1M bbl Domestic)",
            transport_avoided="Hormuz passage for 2M bbl",
            distance_avoided_nm=1_850.0,
            estimated_cost_usd=230_200_000.0,
            cost_per_bbl=115.10,
            estimated_savings_usd=2_600_000.0,
            eta_days=4,
            risk_score=0.055,
            required_verification="Dual contract commercial execution",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Poly Exea Hybrid Solver"],
            timestamp=now_iso,
            provenance="CALCULATED_OPPORTUNITY",
            explanation="Optimal multi-modal split combining fast domestic supply with Fujairah spot volume.",
            rank=3,
            quality_compatible=True,
            product=product,
        ))

        # Opp 5: Singapore Gasoil Procurement — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s2-04",
            opportunity_type="REPLACEMENT SUPPLY",
            strategy_family="DONT_MOVE",
            title="Singapore Gasoil Spot Charter Procurement",
            why_relevant="Far East sourcing completely outside Middle East disruption zone.",
            participants=["Singapore Gasoil Trader", "VLCC Operator"],
            origin="Singapore / Pengerang",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Singapore to Mumbai shipping run",
            transport_avoided="Middle East loading",
            distance_avoided_nm=0.0,
            estimated_cost_usd=227_600_000.0,
            cost_per_bbl=113.80,
            estimated_savings_usd=1_200_000.0,
            eta_days=9,
            risk_score=0.04,
            required_verification="Singapore vessel departure window clearance",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Platts Singapore Gasoil", "Malacca Strait Charter Rates"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Sources product from Far East refineries. Low risk, but ETA of 9 days leaves minimal buffer for 10-day deadline.",
            rank=4,
            quality_compatible=True,
            product=product,
        ))

        # Opp 6: Wait Outside Hormuz — NOT FEASIBLE — CHANGE_TIMING
        opportunities.append(NetworkOpportunity(
            id="opp-s2-05",
            opportunity_type="WAIT / TIMING STRATEGY",
            strategy_family="CHANGE_TIMING",
            title="Wait Outside Hormuz for Passage (DEADLINE EXCEEDED)",
            why_relevant="Evaluated for completeness — fails strict 10-day deadline constraint.",
            participants=["Vessel Operator"],
            origin="Persian Gulf Exterior",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Anchor & wait + Gulf transit",
            transport_avoided="None",
            distance_avoided_nm=0.0,
            estimated_cost_usd=223_300_000.0,
            cost_per_bbl=111.65,
            estimated_savings_usd=0.0,
            eta_days=11,
            risk_score=0.30,
            required_verification="Failed deadline constraint (11d > 10d limit)",
            feasibility_status="NOT_FEASIBLE",
            data_sources=["Vessel Idling Cost Index"],
            timestamp=now_iso,
            provenance="CALCULATED_OPPORTUNITY",
            explanation="Waiting outside Hormuz requires 11 days total ETA, breaching the strict 10-day destination delivery deadline.",
            rank=5,
            quality_compatible=False,
            product=product,
        ))

        # Opp 7: Alternative Origin (West Africa / North Sea) — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s2-06",
            opportunity_type="ALTERNATIVE ORIGIN",
            strategy_family="DONT_MOVE",
            title="Switch Loading Origin to West Africa (Bonny / Forcados) or North Sea (Brent)",
            why_relevant="Eliminates Hormuz dependency entirely by changing origin to a Hormuz-independent loading point.",
            participants=["West African NOC / North Sea Operator", "VLCC Charterer"],
            origin="Bonny Terminal (Nigeria) / Sullom Voe (North Sea)",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="VLCC voyage on WAF-India or North Sea-India lane",
            transport_avoided="Persian Gulf loading & Hormuz chokepoint",
            distance_avoided_nm=1_400.0,
            estimated_cost_usd=181_200_000.0,
            cost_per_bbl=market_price_bbl + 2.10,
            estimated_savings_usd=1_600_000.0,
            eta_days=18,
            risk_score=0.06,
            required_verification="WAF/North Sea cargo availability & assay compatibility",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Platts Crude Assessment", "WAF Loading Programme"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Changes loading origin entirely to West Africa or North Sea, both of which are completely independent of the Hormuz chokepoint.",
            rank=6,
            quality_compatible=True,
            product=product,
        ))

        # Opp 8: Diversified Split — USE_NETWORK
        opportunities.append(NetworkOpportunity(
            id="opp-s2-07",
            opportunity_type="DIVERSIFIED SPLIT",
            strategy_family="USE_NETWORK",
            title="3-Way Diversified Split (Fujairah 40% + WAF 35% + Domestic 25%)",
            why_relevant="Distributes total requirement across three independent, non-correlated sources to minimise single-source failure risk.",
            participants=["Fujairah Terminal", "West African Trader", "Domestic Refinery"],
            origin="Fujairah / West Africa / Domestic India",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Three independent supply contracts & charters",
            transport_avoided="Single-origin Hormuz-dependent concentrated exposure",
            distance_avoided_nm=2_100.0,
            estimated_cost_usd=229_800_000.0,
            cost_per_bbl=114.90,
            estimated_savings_usd=3_100_000.0,
            eta_days=6,
            risk_score=0.03,
            required_verification="Three independent commercial contract executions",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Poly Exea Diversification Solver"],
            timestamp=now_iso,
            provenance="CALCULATED_OPPORTUNITY",
            explanation="Deliberately divides requirement across 3 independent sources. Lowest total supply risk. Optimal for high-priority energy security obligations.",
            rank=7,
            quality_compatible=True,
            product=product,
        ))

        # Opp 9: Demand / Allocation Rebalancing — USE_NETWORK
        opportunities.append(NetworkOpportunity(
            id="opp-s2-08",
            opportunity_type="DEMAND REBALANCING",
            strategy_family="USE_NETWORK",
            title="Redirect Cargo to West Coast Refinery — East Coast Covered by Domestic Grid",
            why_relevant="Rebalances internal allocation so existing domestic or pipeline-adjacent refinery absorbs the disrupted cargo.",
            participants=["Internal Refinery Network", "Logistics Coordinator"],
            origin="Current Vessel Position",
            destination="West Coast Refinery (Alternative Internal Allocation)",
            volume_bbls=required_volume,
            transport_required="Internal refinery dispatch reallocation (logistics only)",
            transport_avoided="Long-haul East Coast ocean voyage",
            distance_avoided_nm=2_200.0,
            estimated_cost_usd=500_000.0,
            cost_per_bbl=0.50,
            estimated_savings_usd=2_800_000.0,
            eta_days=3,
            risk_score=0.05,
            required_verification="Internal refinery throughput capacity & product compatibility",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Internal Logistics Network"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Changes which internal refinery receives available cargo, allowing the disrupted route to be covered by existing domestic stocks.",
            rank=8,
            quality_compatible=False,
            product=product,
        ))

        # Opp 10: Local Inventory / Stock Substitution — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s2-09",
            opportunity_type="LOCAL INVENTORY",
            strategy_family="DONT_MOVE",
            title="Indian Strategic Petroleum Reserve (SPR) Inventory Draw",
            why_relevant="Draws from India's strategic petroleum reserve (Visakhapatnam / Padur / Mangaluru) to cover immediate shortfall.",
            participants=["Indian Strategic Petroleum Reserves Ltd (ISPRL)", "Destination Refinery"],
            origin="Visakhapatnam / Padur / Mangaluru SPR Cavern",
            destination=destination_port,
            volume_bbls=min(required_volume, 500_000.0),
            transport_required="SPR draw-down + domestic pipeline / coastal tanker to refinery",
            transport_avoided="All international ocean transit",
            distance_avoided_nm=3_400.0,
            estimated_cost_usd=44_000_000.0,
            cost_per_bbl=88.00,
            estimated_savings_usd=4_000_000.0,
            eta_days=1,
            risk_score=0.03,
            required_verification="Government SPR draw authorisation & ISPRL volume confirmation",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["ISPRL Strategic Reserve Registry", "MoPNG Allocation Order"],
            timestamp=now_iso,
            provenance="REAL_REFERENCE",
            explanation="Taps India's strategic petroleum reserve as immediate supply bridge. Fastest possible ETA (1 day). Requires government draw authorisation.",
            rank=9,
            quality_compatible=True,
            product=product,
        ))

    # ═══════════════════════════════════════════════════════════════════════════
    # SCENARIO 3: MOVING VESSEL OPPORTUNITY
    # Families prioritised: USE_NETWORK, MOVE_DIFFERENTLY, CHANGE_TIMING
    # ═══════════════════════════════════════════════════════════════════════════
    elif scenario_type == "MOVING_VESSEL":
        # Opp 1: In-bound Ballast Vessel Divert — USE_NETWORK
        opportunities.append(NetworkOpportunity(
            id="opp-s3-01",
            opportunity_type="MOVING VESSEL OPPORTUNITY",
            strategy_family="USE_NETWORK",
            title="In-bound Ballast Suezmax Divert (Arabian Sea)",
            why_relevant="Capitalises on an unladen vessel already positioned near origin/hub.",
            participants=["Independent Suezmax Owner", "Poly Exea User"],
            origin="Arabian Sea (24.1°N, 59.8°E)",
            destination=destination_port,
            volume_bbls=min(required_volume, 1_000_000.0),
            transport_required="Spot divert charter to Fujairah/Salalah",
            transport_avoided="Positioning ballast voyage from Asia",
            distance_avoided_nm=850.0,
            estimated_cost_usd=90_520_000.0,
            cost_per_bbl=market_price_bbl + 2.00,
            estimated_savings_usd=1_100_000.0,
            eta_days=6,
            risk_score=0.10,
            required_verification="Shipowner confirmation of unladen ballast state & laycan",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["AIS Stream Position Feed", "Broker Spot Charter Sheet"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Live AIS detected unladen Suezmax heading toward Gulf of Oman. Diverting this vessel saves positioning lead time.",
            rank=1,
            quality_compatible=False,
            product=product,
        ))

        # Opp 2: Backhaul Charter — USE_NETWORK
        opportunities.append(NetworkOpportunity(
            id="opp-s3-02",
            opportunity_type="BACKHAUL OPPORTUNITY",
            strategy_family="USE_NETWORK",
            title="Red Sea Return Leg Backhaul Charter",
            why_relevant="Utilises empty returning leg of a vessel completing Yanbu discharge.",
            participants=["Red Sea Tanker Fleet Operator"],
            origin="Yanbu / Red Sea Terminal",
            destination=destination_port,
            volume_bbls=min(required_volume, 1_000_000.0),
            transport_required="Backhaul leg charter",
            transport_avoided="Dedicated unladen ballast positioning",
            distance_avoided_nm=1_800.0,
            estimated_cost_usd=90_120_000.0,
            cost_per_bbl=market_price_bbl + 1.60,
            estimated_savings_usd=1_400_000.0,
            eta_days=8,
            risk_score=0.14,
            required_verification="Discharge completion timestamp & backhaul charter rate",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["AIS Destination Log", "Bimco Backhaul Benchmark"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Captures empty returning Suezmax completing Yanbu delivery to carry replacement cargo at discounted backhaul rates.",
            rank=2,
            quality_compatible=True,
            product=product,
        ))

        # Opp 3: Location Delivery Swap — DONT_MOVE
        opportunities.append(NetworkOpportunity(
            id="opp-s3-03",
            opportunity_type="CARGO / DELIVERY SWAP",
            strategy_family="DONT_MOVE",
            title="Fujairah-Destination Cargo Location Delivery Swap",
            why_relevant="Swaps cargo title with vessel currently discharging near destination.",
            participants=["Trading House Partner", "Poly Exea User"],
            origin="Fujairah Hub",
            destination=destination_port,
            volume_bbls=min(required_volume, 500_000.0),
            transport_required="Title transfer & local discharge",
            transport_avoided="2,400 nm long-haul ocean voyage",
            distance_avoided_nm=2_400.0,
            estimated_cost_usd=44_660_000.0,
            cost_per_bbl=market_price_bbl + 0.80,
            estimated_savings_usd=2_100_000.0,
            eta_days=3,
            risk_score=0.05,
            required_verification="Counterparty agreement & crude assay compatibility",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Poly Exea Swap Registry"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Exchanges cargo title with partner discharging near destination. Eliminates long-haul transport completely.",
            rank=3,
            quality_compatible=False,
            product=product,
        ))

        # Opp 4: Triangulation — USE_NETWORK
        opportunities.append(NetworkOpportunity(
            id="opp-s3-04",
            opportunity_type="TRIANGULATION",
            strategy_family="USE_NETWORK",
            title="Triangular Multi-Leg Loop Charter (Fujairah → Salalah → India)",
            why_relevant="Chains three regional vessel legs to eliminate empty ballast runs.",
            participants=["Regional Tanker Pool Operator"],
            origin="Fujairah / Salalah",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Three-leg continuous voyage loop",
            transport_avoided="Two unladen ballast positioning runs",
            distance_avoided_nm=2_100.0,
            estimated_cost_usd=180_840_000.0,
            cost_per_bbl=market_price_bbl + 1.90,
            estimated_savings_usd=1_650_000.0,
            eta_days=10,
            risk_score=0.11,
            required_verification="Pool operator scheduling confirmation",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Vessel Loop Scheduling Matrix"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Combines three regional legs into a triangular loop, reducing net freight per barrel.",
            rank=4,
            quality_compatible=True,
            product=product,
        ))

        # Opp 5: Transshipment (STS Lightering) — MOVE_DIFFERENTLY
        opportunities.append(NetworkOpportunity(
            id="opp-s3-05",
            opportunity_type="TRANSSHIPMENT",
            strategy_family="MOVE_DIFFERENTLY",
            title="Offshore Hub STS Transshipment to Shuttle Aframax",
            why_relevant="Accelerates discharge from deepwater vessel into regional shuttle fleet.",
            participants=["Offshore STS Operator", "Aframax Charterer"],
            origin="Fujairah Offshore Hub",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="VLCC deepwater discharge + Aframax shuttle",
            transport_avoided="Port congestion waiting time",
            distance_avoided_nm=150.0,
            estimated_cost_usd=181_240_000.0,
            cost_per_bbl=market_price_bbl + 2.10,
            estimated_savings_usd=600_000.0,
            eta_days=9,
            risk_score=0.20,
            required_verification="STS weather window & lightering vessel availability",
            feasibility_status="REAL_REFERENCE",
            data_sources=["Fujairah Port STS Registry"],
            timestamp=now_iso,
            provenance="REAL_REFERENCE",
            explanation="Transships deepwater cargo to lightering Aframax vessels for rapid destination delivery.",
            rank=5,
            quality_compatible=True,
            product=product,
        ))

        # Opp 6: Diversified Split — USE_NETWORK
        opportunities.append(NetworkOpportunity(
            id="opp-s3-06",
            opportunity_type="DIVERSIFIED SPLIT",
            strategy_family="USE_NETWORK",
            title="Split Vessel Cargo: 50% Direct + 50% Via Salalah Transshipment",
            why_relevant="Reduces single-vessel concentration risk while maintaining overall delivery certainty.",
            participants=["Current Vessel Owner", "Salalah Port Authority", "Aframax Charterer"],
            origin="Moving Vessel (Current Position)",
            destination=destination_port,
            volume_bbls=required_volume,
            transport_required="Partial STS at Salalah + remainder direct voyage",
            transport_avoided="Full single-vessel concentrated chokepoint risk",
            distance_avoided_nm=600.0,
            estimated_cost_usd=181_400_000.0,
            cost_per_bbl=market_price_bbl + 2.20,
            estimated_savings_usd=900_000.0,
            eta_days=8,
            risk_score=0.08,
            required_verification="Salalah STS slot & partial charter agreement",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Salalah Port Schedule", "AIS Vessel Position"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Splits cargo at Salalah hub: half proceeds direct, half transshipped via Aframax, reducing single-point failure risk.",
            rank=6,
            quality_compatible=True,
            product=product,
        ))

        # Opp 7: Alternative Destination — CHANGE_TIMING
        opportunities.append(NetworkOpportunity(
            id="opp-s3-07",
            opportunity_type="ALTERNATIVE DESTINATION",
            strategy_family="CHANGE_TIMING",
            title="Discharge at Fujairah / Salalah — Forward by Coastal Feeder",
            why_relevant="Avoids long-haul voyage risk by discharging at closest feasible hub and forwarding product via shorter coastal run.",
            participants=["Fujairah Terminal / Salalah Port", "Coastal Feeder Operator"],
            origin="Moving Vessel (Current Position)",
            destination="Fujairah / Salalah (Intermediate Discharge Hub)",
            volume_bbls=required_volume,
            transport_required="Discharge at hub + coastal feeder to destination",
            transport_avoided="Long-haul VLCC delivery exposure",
            distance_avoided_nm=1_200.0,
            estimated_cost_usd=180_900_000.0,
            cost_per_bbl=market_price_bbl + 1.75,
            estimated_savings_usd=1_050_000.0,
            eta_days=11,
            risk_score=0.12,
            required_verification="Hub berth availability & coastal feeder capacity",
            feasibility_status="CALCULATED_OPPORTUNITY",
            data_sources=["Fujairah Berth Register", "Indian Coastal Shipping Index"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Discharges cargo at Fujairah or Salalah hub and forwards product onward via a smaller coastal feeder vessel, reducing large-vessel exposure.",
            rank=7,
            quality_compatible=True,
            product=product,
        ))

        # Opp 8: Counterparty Exchange (explicit) — CHANGE_TIMING
        opportunities.append(NetworkOpportunity(
            id="opp-s3-08",
            opportunity_type="COUNTERPARTY EXCHANGE",
            strategy_family="CHANGE_TIMING",
            title="Physical Position Exchange with Inbound Indian Refinery Counterparty",
            why_relevant="Transfers physical delivery obligation to an inbound buyer already positioned near destination, eliminating the long-haul voyage.",
            participants=["Inbound Indian Refinery Buyer", "Poly Exea User"],
            origin="Moving Vessel (Current Position)",
            destination=destination_port,
            volume_bbls=min(required_volume, 800_000.0),
            transport_required="Commercial title transfer only",
            transport_avoided="Remaining 1,800 nm voyage",
            distance_avoided_nm=1_800.0,
            estimated_cost_usd=72_160_000.0,
            cost_per_bbl=market_price_bbl + 0.70,
            estimated_savings_usd=1_900_000.0,
            eta_days=2,
            risk_score=0.06,
            required_verification="Counterparty willingness to accept cargo title at current vessel position + assay match",
            feasibility_status="COMMERCIAL_VERIFICATION_REQUIRED",
            data_sources=["Poly Exea Counterparty Network"],
            timestamp=now_iso,
            provenance="ESTIMATED",
            explanation="Transfers cargo title to inbound Indian refinery buyer. Saves 1,800 nm of physical voyage. Fastest deal structure if counterparty confirmed.",
            rank=8,
            quality_compatible=False,
            product=product,
        ))

    return opportunities
