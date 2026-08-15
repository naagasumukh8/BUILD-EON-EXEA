# Poly Exea Implementation Audit

This document separates what is present in the repository from what is actually proven by execution.

## Verified by code inspection

- Deterministic OR-Tools optimization service exists.
- Unverified AIS vessel candidates are filtered from optimization.
- Deadline filtering is inclusive (`ETA <= deadline`).
- Partial fulfillment and shortfall are represented by the optimizer.
- Network opportunity discovery contains 20 named strategy classes across four families.
- Opportunity records carry provenance, source, timestamp, verification requirements, volume, ETA and risk.
- AIS normalization explicitly keeps origin unknown when AIS does not provide an origin.
- AIS records are labeled candidate/unverified and do not claim spare capacity from position data.
- Natural-language intake is routed through Gemini and supports structured multi-origin fields in the schema.
- Deterministic deal evaluation exists outside the LLM.
- Economic inputs have provenance fields in the backend schema.
- The repository has an explicit prompt-history-derived product checklist.

## Newly hardened

- Deal evaluation now preserves the supplied market-price provenance instead of unconditionally labeling every market price as `SIMULATED`.
- A deterministic backend regression suite has been added for capacity, shortfall, unverified-vessel exclusion, deadline boundaries, determinism, provenance, and scenario-aware opportunity discovery.
- GitHub Actions now runs the backend regression suite and frontend production build on pushes/PRs to `main`.

## Still requires live/integration proof

### 1. Real AIS

A real aisstream.io response must be captured successfully with the current credential and network environment. The repository must prove that a displayed vessel came from the API response. A failed live connection must remain `NOT EXECUTED` or `FAIL`; simulated vessels are not evidence.

### 2. True network discovery

The opportunity layer currently contains scenario-aware opportunity classes, but the critical demonstration is proving that opportunities are derived from actual scenario/network data rather than merely being predefined candidates. The final system should pass actual supply, terminal, route, vessel and commercial records into discovery.

### 3. Commercial exchange discovery

Potential cargo swaps, regional exchanges, backhauls and triangulation need compatible inventory/obligation data. The system must identify a candidate relationship, quantify the avoided transport/economics, and then stop at `COMMERCIAL_VERIFICATION_REQUIRED` until counterparties confirm willingness, grade compatibility and quantity.

### 4. End-to-end moving-vessel chain

Required proof:

REAL AIS POSITION
→ relevant journey
→ candidate opportunity
→ human commercial verification
→ confirmed capacity + quote
→ deterministic deal evaluation
→ OR-Tools allocation
→ executive strategy

### 5. Parser regression

The natural-language parser still needs explicit automated regression coverage for:
- multiple origins and available volumes;
- disruption text such as `Hormuz is expected to remain unavailable` remaining a disruption condition, not an origin;
- destination changes such as Rotterdam/Tokyo/Houston not silently becoming Mumbai;
- missing destination causing a clarification rather than a guessed default;
- no target landed cost being invented when absent.

### 6. Strategy composition

The final Top-5 board should be composed from the currently eligible network options/opportunities, not merely from fixed strategy templates. Every allocation shown in the board should be traceable to an optimizer option ID.

### 7. Live economic provenance

Each live/reference market input needs value, unit, provider/source, timestamp and provenance visible in the decision evidence. Retail-derived values must remain estimates and must not be represented as wholesale benchmarks.

## Final gate

Do not call Poly Exea fully validated until all three independent gates are proven:

- DECISION ENGINE: PASS
- REAL ECONOMIC DATA: PASS/PARTIAL with evidence
- REAL AIS MOVING VESSEL: PASS

The core product remains an Energy Supply & Transportation Decision Platform for sustained Hormuz disruption. It is not a trapped-ship rescue application.
