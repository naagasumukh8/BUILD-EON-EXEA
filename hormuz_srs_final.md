# AI Maritime Supply Decision Platform — FINAL SRS

## FINAL RECOMMENDED TECH STACK

| Layer | Choice | Status |
|---|---|---|
| Frontend | Next.js + Tailwind, deployed on Vercel | REQUIRED |
| Backend | Python + FastAPI | REQUIRED |
| Database | Supabase (managed Postgres + PostGIS) | REQUIRED |
| Auth | Supabase Auth | REQUIRED (minimal use) |
| File storage (report PDFs) | Supabase Storage | REQUIRED |
| Live updates (optimizer progress) | Supabase Realtime | OPTIONAL |
| Edge Functions | — | NOT NEEDED |
| Redis / task queue | — | NOT NEEDED |
| Background workers (Celery etc.) | FastAPI `BackgroundTasks` only | NOT NEEDED beyond built-in |
| Optimization engine | Google OR-Tools (CP-SAT / linear solver) | REQUIRED |
| LLM — intake & structured extraction | Claude Haiku 4.5 | REQUIRED |
| LLM — explanation, deal narrative, report | Claude Sonnet 5 | REQUIRED |
| Multi-agent framework (LangChain/AutoGen etc.) | — | NOT NEEDED |
| Model fine-tuning | — | NOT NEEDED |
| RAG / vector database | — | NOT NEEDED |
| Machine learning (trained predictive models) | — | NOT NEEDED |
| AIS vessel-tracking API | One free/trial provider (e.g. AISHub / Datalastic trial) | REQUIRED |
| Sea-route/geometry | `searoute` (open-source library) over a paid routing API | REQUIRED (library, not paid API) |
| Market/freight reference data | Manually curated real snapshot (Brent, VLCC index) | OPTIONAL but strongly recommended |
| Weather API | — | NOT NEEDED |

## WHAT WE ARE NOT BUILDING

- No RAG or vector database — nothing here is unstructured-document retrieval; it's structured decision data, which belongs in Postgres.
- No multi-agent orchestration framework — one LLM with clear tool-calling sections, not four hopping agents.
- No fine-tuned or custom-trained model — hosted LLMs with good prompting, deterministic solver for math.
- No real-time AIS position streaming — periodic polling/snapshot is enough for a demo.
- No automated booking, execution, or payment of any deal — this is decision support, not a transacting system.
- No sanctions/compliance screening engine — mentioned conceptually in the report only.
- No weather, emissions, or full historical vessel-position time series — cut for MVP.
- No Redis, task queue, or Edge Functions — unnecessary infrastructure at hackathon scale.

---

## 1. Executive Summary

An AI-assisted decision platform for energy buyers (refineries, traders, supply-chain teams) who need to source a specific volume of product by a deadline during a supply disruption. The system discovers candidate transport options, routes confirmed human-verified deals through a profitability engine, and uses deterministic optimization to recommend the best single or hybrid strategy — explained in plain language by an LLM, never computed by one.

## 2. Problem

Disruptions (e.g. a Strait of Hormuz closure) fragment the supply chain across owned vessels, chartered vessels, third-party spare capacity, pipelines, and alternate suppliers. Deciding fast, under uncertainty, with real money on the line, is the actual problem — not a lack of information, but a lack of a trustworthy way to combine and evaluate it.

## 3. Core Idea (unchanged)

The user states product, volume, destination, deadline, current supply situation, and vessel ownership status. The system finds and evaluates ways to satisfy that requirement — owned/chartered/candidate vessels, pipelines, alternate routes, alternate suppliers — and can combine multiple options into a single hybrid strategy, optimized for cost, time, and risk.

## 4. Target User

Primary: a supply-chain/trading desk lead at a mid-size refiner or energy trading company who needs a defensible sourcing decision fast, and who will personally negotiate with shipowners/brokers based on the system's output.

## 5. User Journey

```
User states requirement
 → Guided intake structures it
 → AI discovers candidate options (unverified)
 → Human verifies real deals with owners/brokers
 → AI evaluates each confirmed deal's profitability
 → Optimizer combines accepted options into a strategy
 → AI explains the recommendation
 → Decision report generated
```

## 6. Guided Intake

Multi-step form, LLM-assisted for free-text parsing:
1. **Demand** — product, volume, destination, deadline, acceptable delay.
2. **Current supply** — origin/supplier, current price, current route if any.
3. **Vessel situation** — own / charter / need to find; if own or charter, capture only capacity, current location, ETA, and constraints (not every contractual sub-field — keep this shallow for MVP).
4. **Alternatives known** — pipelines, alternate suppliers, routes the user already knows about.
5. **Priority weighting** — cost vs time vs risk (a simple 3-slider input, not a full weighted-criteria wizard).

## 7. Vessel Discovery (Stage 1)

AIS-based pattern matching surfaces vessels whose route/ETA plausibly passes near the destination. Output is a **candidate list only** — never a capacity claim. Every candidate is labeled `CANDIDATE — UNVERIFIED` with source and timestamp.

## 8. Human Verification (Stage 2)

Operator contacts the shipowner/broker directly and enters the real terms: available capacity, product compatibility, price, availability date, restrictions. On entry, the record becomes `CONFIRMED`, tagged with source (shipowner/broker) and exact timestamp. This is a manual data-entry screen, not automation — that's the point.

## 9. Deal Profitability Engine (Stage 3) — key differentiator

For every confirmed deal, deterministically compute:

```
landed_cost_per_unit = (deal_cost / volume_secured) + origin_purchase_price + insurance_and_handling
expected_margin      = destination_market_price − landed_cost_per_unit
expected_profit      = expected_margin × volume_secured − time_penalty_if_deadline_at_risk
market_benchmark     = current reference freight rate ÷ typical parcel size, for comparison
negotiation_ceiling  = deal price at which expected_margin equals the user's target margin
```

Output: `GO`, `NEGOTIATE` (with the ceiling price and a one-line reason), or `REJECT`. This runs **before** optimization — it's a per-deal filter, so the optimizer only ever considers economically sane options.

## 10. Hybrid Optimization

The technical heart of the project, unchanged in spirit from the original SRS.

- **Decision variables**: volume allocated to each accepted option (continuous, bounded).
- **Constraints**: sum of allocations = required volume; allocation per option ≤ that option's available capacity; product-compatibility match; deadline feasibility per option (or a time-penalty term if late).
- **Objective**: maximize expected net profit − weighted time penalty − weighted risk penalty, with weights set by the user's priority sliders.
- **Solver**: OR-Tools (CP-SAT or linear solver, whichever fits the constraint shape once modeled).
- **Interaction with the LLM**: the LLM never touches the numbers. It (a) turns free text into the structured input OR-Tools consumes, and (b) turns OR-Tools' structured output into plain-language explanation and the decision report.

## 11. AI Responsibilities

| Task | Model | Why |
|---|---|---|
| Parse free-text intake into structured constraints | Claude Haiku 4.5 | Fast, cheap, good at structured extraction |
| Ask clarifying follow-up questions | Claude Haiku 4.5 | Same — low latency matters for a live demo |
| Explain the optimizer's recommendation | Claude Sonnet 5 | Needs higher-quality reasoning and writing |
| Generate the deal negotiation narrative | Claude Sonnet 5 | Same |
| Generate the final decision report | Claude Sonnet 5 | Same |

Architecture note: wrap all model calls behind a thin internal interface so either model tier can be swapped later without touching business logic.

## 12–14. Data Architecture, API Architecture, Database Schema

**Schema — trimmed from the original 17-table proposal to 10 for MVP build speed:**

- `scenarios` — merges the proposed `oil_requirements` in as columns (product, volume, destination, deadline, priority weights). One less table, one less join.
- `vessels` — static reference (name, IMO, type, deadweight).
- `vessel_candidates` — Stage 1 output; includes `status`, `source`, `timestamp` columns directly (no separate provenance table needed for MVP).
- `confirmed_deals` — Stage 2/3 output; same inline provenance columns, plus the computed profitability fields.
- `pipelines` — static reference (name, route, nameplate capacity, source = REAL REFERENCE).
- `suppliers` — static reference for alternate suppliers.
- `reference_data` — merges the proposed `market_inputs` and `cost_assumptions`: benchmark prices/rates, each row tagged `CONFIRMED / REAL REFERENCE / ESTIMATED / SIMULATED`.
- `optimization_runs` — one row per solver run, stores inputs/outputs for what-if comparison.
- `strategies` + `strategy_allocations` — a run's ranked strategies and their per-option volume splits.
- `decision_reports` — final generated report text/JSON, linked to a strategy.

Dropped as separate tables (merged or deferred): `oil_requirements`, `vessel_positions` (keep only latest position as columns on `vessel_candidates`), `routes` (store as JSON on the scenario/strategy for MVP), `risk_scores` (columns, not a table), `data_provenance` (columns, not a table), `users` (Supabase Auth handles identity; keep this table minimal).

**API endpoints (MVP):**

```
POST /scenarios                    create scenario from guided intake
POST /scenarios/{id}/discover      run Stage 1 AI vessel/option discovery
GET  /scenarios/{id}/candidates    list discovered candidates
POST /deals                        operator enters a human-verified deal
POST /deals/{id}/evaluate          run Stage 3 profitability → GO/NEGOTIATE/REJECT
POST /scenarios/{id}/optimize      run OR-Tools hybrid optimization
GET  /strategies/{id}              fetch a computed strategy
POST /scenarios/{id}/what-if       rerun optimizer with adjusted weights/allocations
POST /scenarios/{id}/report        generate the LLM decision report
GET  /reference-data               current benchmark numbers with provenance
```

## 15. Technology Stack

See the table at the top. Every choice there is justified by what the hackathon timeframe can actually deliver, not by what sounds impressive.

## 16. Model Selection

Claude Haiku 4.5 for fast/cheap structured tasks (intake parsing, follow-up questions); Claude Sonnet 5 for reasoning-heavy tasks (explanation, negotiation narrative, report). One provider, two tiers, swappable behind an interface. No fine-tuning.

## 17. RAG Decision

**Not used.** There is no corpus of unstructured documents that needs semantic search — every input here (vessel data, deals, prices, pipeline capacity) is structured and belongs in Postgres with normal queries. If a future version wanted to let users ask questions against maritime news or incident reports, that's where RAG would earn its place — not in the MVP.

## 18. Supabase Decision

**Used, specifically for:** managed Postgres + PostGIS (geospatial queries for candidate/route data), Auth (skip building auth from scratch), Storage (decision report PDFs). **Not used for:** Edge Functions — keep all business logic in one place (FastAPI) rather than splitting it across two runtimes, which adds debugging risk during a hackathon.

## 19. External APIs

- AIS provider (one free/trial source) — REQUIRED, powers Stage 1 discovery.
- `searoute` open-source library for sea-route geometry — REQUIRED, avoids a paid routing API.
- A manually curated real-market snapshot (current Brent price, current VLCC day-rate benchmark) — OPTIONAL but strongly recommended; costs nothing to add and turns your reference data from purely synthetic into `REAL REFERENCE`.
- Weather — NOT NEEDED.

## 20. Data Provenance

Every candidate, deal, and reference number carries `status` (`CONFIRMED / REAL REFERENCE / ESTIMATED / SIMULATED`), `source`, and `timestamp`, shown visibly in the UI next to the number itself — not buried in a tooltip. This is the platform's core trust mechanism and should be impossible to miss on screen.

## 21. UI Screens

Trimmed from 8 to 6 by combining screens that share a natural interaction:

1. **Landing** — simplified hero, one clean transition, not full parallax.
2. **Guided Intake** — the multi-step form.
3. **Network Map** — combines the old "Map" and "Vessel Candidate" screens: candidates shown as pins, click one for a detail panel inline.
4. **Deal Evaluation** — dedicated screen; this is the differentiator, give it room.
5. **Strategy & Optimizer** — combines "Strategy Comparison" and "Hybrid Optimizer": ranked strategies with a live slider that re-runs what-if.
6. **Decision Report** — final output.

## 22. Security

Standard Supabase Auth for login. No secrets in client code — all keys server-side in FastAPI. Provenance labeling doubles as an audit trail. No real trading/execution capability exists in the MVP, so financial/regulatory exposure is minimal by design.

## 23. Hackathon Scope

**MUST BUILD:** guided intake, Deal Evaluator (Stage 3 math + GO/NEGOTIATE/REJECT + ceiling), OR-Tools hybrid optimizer, strategy comparison with before/after, decision report generation, visible provenance labeling, at least one real anchor dataset.

**SHOULD BUILD:** map view with candidate pins (list view is an acceptable fallback), what-if slider, one real AIS query integration, simplified cinematic landing hero.

**DO NOT BUILD:** RAG/vector DB, multi-agent framework, fine-tuning, live AIS streaming, sanctions/compliance engine, weather/emissions, full auth beyond Supabase defaults, Redis/task queue, historical position time series, automated deal execution.

## 24. Demo Flow (2–3 min)

1. (0–10s) Disruption context on the map.
2. (10–30s) User types a natural-language request; parsed live into structured fields on screen.
3. (30–50s) Two or three sharp conditional intake questions, answered fast.
4. (50–65s) Candidates appear, tagged `UNVERIFIED`; one flips to `CONFIRMED` (pre-staged as if just verified) with a real quote — ₹20 lakh for 20% capacity.
5. (65–85s) Deal Evaluator runs live: shows the margin math and a `NEGOTIATE` verdict with a ceiling price.
6. (85–105s) Optimizer combines the confirmed deal with pipeline and alternate-route options into a hybrid strategy; before/after cost and ETA shown side by side.
7. (105–115s) AI explains the recommendation and states its one biggest assumption.
8. (115–130s) Decision report generated, close on the headline profit/savings number.

## 25. Future Roadmap

Real-time AIS streaming, licensed freight/insurance data partnerships, sanctions/compliance screening, emissions scoring, RAG over maritime incident reports and news for richer risk context, multi-user negotiation workflow with deal history.

---

## FINAL ARCHITECTURE IN ONE DIAGRAM

```
User
  → Frontend (Next.js, Vercel)
      → Backend (FastAPI)
          → Data APIs (AIS provider, searoute, reference-data snapshot)
          → Deal Verification (human-entered, stored in Supabase/Postgres)
          → Optimization (OR-Tools solver)
          → LLM Explanation (Claude Haiku 4.5 intake, Claude Sonnet 5 explain/report)
      → Decision Report → back to User
```
