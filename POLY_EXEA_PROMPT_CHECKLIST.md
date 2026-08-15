# POLY EXEA — MASTER PROMPT CHECKLIST

Source: `USER_PROMPTS_HISTORY.txt` and the user's chronological requirements. This is the canonical implementation checklist. Do not mark `VERIFIED` unless the item is actually tested in the current repo.

Legend:
- ☐ NOT DONE
- 🟡 PARTIAL / NEEDS VERIFICATION
- ✅ VERIFIED

---

## A. PRODUCT / EXPERIENCE

- ☐ / 🟡 / ✅ POLY EXEA branding is consistent across the product
- ☐ / 🟡 / ✅ Landing page is clean, simple, professional, and understandable to both a beginner and an experienced energy/logistics user
- ☐ / 🟡 / ✅ Landing page explains the sustained Hormuz disruption problem clearly
- ☐ / 🟡 / ✅ Landing page explains what Poly Exea actually does over 3–4+ scrolls
- ☐ / 🟡 / ✅ Background video is visible and not excessively blurred/opaque
- ☐ / 🟡 / ✅ No unnecessary AI decoration, fake chat UI, excessive gradients, or generic dashboard styling
- ☐ / 🟡 / ✅ User can enter a natural-language business requirement
- ☐ / 🟡 / ✅ Analysis is presented as one continuous decision workflow rather than disconnected demos
- ☐ / 🟡 / ✅ Results are understandable to a business decision-maker
- ☐ / 🟡 / ✅ Final decision board clearly shows why the recommended strategy wins

## B. NATURAL-LANGUAGE PARSING

- ☐ / 🟡 / ✅ Extract product correctly
- ☐ / 🟡 / ✅ Extract required volume correctly
- ☐ / 🟡 / ✅ Extract destination correctly
- ☐ / 🟡 / ✅ Extract deadline correctly
- ☐ / 🟡 / ✅ Extract optimization priority
- ☐ / 🟡 / ✅ Support multiple supply origins in one request
- ☐ / 🟡 / ✅ Store available volume separately for each origin
- ☐ / 🟡 / ✅ Separate supply origins from disruption conditions
- ☐ / 🟡 / ✅ Extract transportation constraints
- ☐ / 🟡 / ✅ Extract concentration constraints such as max % through one transport option
- ☐ / 🟡 / ✅ Extract target landed cost only when explicitly provided
- ☐ / 🟡 / ✅ Missing information is represented as NOT SPECIFIED rather than guessed
- ☐ / 🟡 / ✅ Ambiguous information triggers clarification
- ☐ / 🟡 / ✅ Previous scenario values never leak into a new scenario
- ☐ / 🟡 / ✅ Parsed specification can be manually edited before analysis
- ☐ / 🟡 / ✅ Parsed specification is validated against the original user request
- ☐ / 🟡 / ✅ `Hormuz is expected to remain unavailable` is parsed as DISRUPTION, never as an origin
- ☐ / 🟡 / ✅ Example multi-origin test parses Western Australia 1.2M, Middle East 800K, West Africa 1M, Rotterdam, 18 days, 2.5M demand, and no invented landed-cost target

## C. CORE DECISION PIPELINE

- ☐ / 🟡 / ✅ Business requirement → supply availability → transport options → commercial opportunities → deterministic economics → optimization → top strategies → What-If → executive decision
- ☐ / 🟡 / ✅ OR-Tools remains the mathematical decision engine
- ☐ / 🟡 / ✅ Gemini/LLM explains results but does not invent numerical results
- ☐ / 🟡 / ✅ Numerical outputs shown to the user exactly match deterministic backend calculations
- ☐ / 🟡 / ✅ Optimizer variables, constraints, capacities, allocations, cost, ETA, profit, margin, uncovered volume and feasibility can be inspected
- ☐ / 🟡 / ✅ No feasible strategy is presented as executable when constraints are violated
- ☐ / 🟡 / ✅ Up to 5 genuinely feasible strategies are returned
- ☐ / 🟡 / ✅ Strategy #1 is explicitly compared against alternatives
- ☐ / 🟡 / ✅ Recommended / Alternative / Lowest Cost / Fastest / Lowest Risk labels are meaningful rather than cosmetic
- ☐ / 🟡 / ✅ What-If changes dynamically recalculate volume, cost, profit, margin, risk and shortfall

## D. SCENARIO AWARENESS

- ☐ / 🟡 / ✅ Scenario 1: cargo already trapped inside the Gulf
- ☐ / 🟡 / ✅ Scenario 2: cargo not yet committed / about to enter Hormuz
- ☐ / 🟡 / ✅ Scenario 3: moving-vessel opportunity
- ☐ / 🟡 / ✅ Trapped cargo prioritizes physically possible recovery, pipeline bypass, transshipment, exchanges, replacement supply, etc.
- ☐ / 🟡 / ✅ Uncommitted cargo prioritizes prevention, alternative origins, replacement supply, alternate routes, etc.
- ☐ / 🟡 / ✅ Moving-vessel scenario prioritizes vessel, backhaul, triangulation, exchange and transshipment opportunities when supported
- ☐ / 🟡 / ✅ The three scenarios do not blindly return the same ranking
- ☐ / 🟡 / ✅ Physical feasibility is scenario-dependent
- ☐ / 🟡 / ✅ The engine never recommends a route that the current physical position cannot actually use
- ☐ / 🟡 / ✅ Source and destination are not hardcoded to Mumbai or another default location

## E. SUPPLY NETWORK

- ☐ / 🟡 / ✅ Multiple supply origins
- ☐ / 🟡 / ✅ Available volume per origin
- ☐ / 🟡 / ✅ Product/grade compatibility
- ☐ / 🟡 / ✅ Supply availability and timing
- ☐ / 🟡 / ✅ Alternative origins
- ☐ / 🟡 / ✅ Replacement supply
- ☐ / 🟡 / ✅ Local inventory / stock substitution
- ☐ / 🟡 / ✅ Regional supply exchange
- ☐ / 🟡 / ✅ Demand/allocation rebalancing
- ☐ / 🟡 / ✅ Alternative destination/discharge
- ☐ / 🟡 / ✅ Stranded cargo can be treated separately from replacement procurement

## F. TRANSPORT NETWORK

- ☐ / 🟡 / ✅ Direct alternate maritime routes
- ☐ / 🟡 / ✅ Pipeline bypass
- ☐ / 🟡 / ✅ Vessels
- ☐ / 🟡 / ✅ Alternate ports and terminals
- ☐ / 🟡 / ✅ Transshipment
- ☐ / 🟡 / ✅ STS / lightering where legally, safely and commercially feasible
- ☐ / 🟡 / ✅ Multimodal transport
- ☐ / 🟡 / ✅ Route ETA calculation
- ☐ / 🟡 / ✅ Route distance / transport avoided calculation
- ☐ / 🟡 / ✅ Deadline feasibility filtering
- ☐ / 🟡 / ✅ Transport concentration constraints

## G. NETWORK OPPORTUNITY DISCOVERY

The discovery layer must search the network before final optimization. It must not blindly return every class; opportunities must be supported by data and relevant to the scenario.

### MOVE DIFFERENTLY
- ☐ / 🟡 / ✅ Direct Alternate Route
- ☐ / 🟡 / ✅ Pipeline Bypass
- ☐ / 🟡 / ✅ Transshipment
- ☐ / 🟡 / ✅ STS / Lightering
- ☐ / 🟡 / ✅ Multimodal Strategy

### DON'T MOVE YOUR CARGO
- ☐ / 🟡 / ✅ Replacement Supply
- ☐ / 🟡 / ✅ Local Inventory / Stock Substitution
- ☐ / 🟡 / ✅ Cargo / Delivery Swap
- ☐ / 🟡 / ✅ Local / Regional Exchange
- ☐ / 🟡 / ✅ Alternative Origin
- ☐ / 🟡 / ✅ Emergency Replacement + Stranded Cargo

### USE THE NETWORK MORE INTELLIGENTLY
- ☐ / 🟡 / ✅ Moving Vessel Opportunity
- ☐ / 🟡 / ✅ Backhaul Opportunity
- ☐ / 🟡 / ✅ Triangulation
- ☐ / 🟡 / ✅ Diversified Split
- ☐ / 🟡 / ✅ Demand / Allocation Rebalancing

### CHANGE TIMING / STRUCTURE
- ☐ / 🟡 / ✅ Wait / Timing Strategy
- ☐ / 🟡 / ✅ Alternative Destination / Discharge
- ☐ / 🟡 / ✅ Hybrid Strategy

### OPPORTUNITY QUALITY
- ☐ / 🟡 / ✅ Every opportunity has strategy type
- ☐ / 🟡 / ✅ Why relevant
- ☐ / 🟡 / ✅ Origin / destination
- ☐ / 🟡 / ✅ Volume
- ☐ / 🟡 / ✅ Transport avoided
- ☐ / 🟡 / ✅ Distance avoided
- ☐ / 🟡 / ✅ Estimated cost
- ☐ / 🟡 / ✅ Estimated savings
- ☐ / 🟡 / ✅ ETA
- ☐ / 🟡 / ✅ Risk
- ☐ / 🟡 / ✅ Required verification
- ☐ / 🟡 / ✅ Source
- ☐ / 🟡 / ✅ Timestamp
- ☐ / 🟡 / ✅ Provenance
- ☐ / 🟡 / ✅ Only commercially verified opportunities enter automatic optimization when verification is required

## H. COMMERCIAL EXCHANGE / DEAL INTELLIGENCE

- ☐ / 🟡 / ✅ Detect companies/counterparties with compatible inventory at different geographic locations
- ☐ / 🟡 / ✅ Detect potential two-sided exchange: give cargo at Location A and collect equivalent cargo at Location B
- ☐ / 🟡 / ✅ Detect delivery-obligation swaps
- ☐ / 🟡 / ✅ Detect local/regional inventory exchange
- ☐ / 🟡 / ✅ Detect cargo that can be exchanged to avoid long-haul transport caused by Hormuz disruption
- ☐ / 🟡 / ✅ Compare normal plan vs swap/exchange plan
- ☐ / 🟡 / ✅ Calculate distance avoided
- ☐ / 🟡 / ✅ Calculate freight avoided
- ☐ / 🟡 / ✅ Include handling, storage and transfer costs
- ☐ / 🟡 / ✅ Check timing
- ☐ / 🟡 / ✅ Check quantity compatibility
- ☐ / 🟡 / ✅ Check grade/product compatibility
- ☐ / 🟡 / ✅ Flag ownership/title constraints where known
- ☐ / 🟡 / ✅ Flag tax/regulatory constraints where known
- ☐ / 🟡 / ✅ Never assume two crude grades/products are interchangeable
- ☐ / 🟡 / ✅ Commercial willingness is never inferred from map/AIS data
- ☐ / 🟡 / ✅ Candidate deal is labeled COMMERCIAL VERIFICATION REQUIRED until confirmed

## I. MOVING VESSEL / AIS

- ☐ / 🟡 / ✅ Real AIS Stream integration uses backend environment credentials only
- ☐ / 🟡 / ✅ API key is never printed, logged, committed or returned
- ☐ / 🟡 / ✅ Narrow geographic bounding boxes are generated from the user's scenario
- ☐ / 🟡 / ✅ No global vessel query for a local scenario
- ☐ / 🟡 / ✅ One reusable backend connection where appropriate
- ☐ / 🟡 / ✅ Latest vessel state is cached
- ☐ / 🟡 / ✅ Refresh is rate-limit conscious
- ☐ / 🟡 / ✅ Vessel identity captured when available
- ☐ / 🟡 / ✅ IMO/MMSI captured when available
- ☐ / 🟡 / ✅ Vessel type captured when available
- ☐ / 🟡 / ✅ Latitude/longitude captured when available
- ☐ / 🟡 / ✅ Speed captured when available
- ☐ / 🟡 / ✅ Course captured when available
- ☐ / 🟡 / ✅ Heading captured when available
- ☐ / 🟡 / ✅ AIS destination captured when available
- ☐ / 🟡 / ✅ ETA captured only when AIS provides it
- ☐ / 🟡 / ✅ Missing AIS fields are NOT invented
- ☐ / 🟡 / ✅ Network Map displays actual vessel position and timestamp
- ☐ / 🟡 / ✅ Scenario-specific filtering changes when destination changes
- ☐ / 🟡 / ✅ Real vessel is labeled CANDIDATE — UNVERIFIED
- ☐ / 🟡 / ✅ AIS never proves spare cargo capacity
- ☐ / 🟡 / ✅ AIS never proves charter availability
- ☐ / 🟡 / ✅ AIS never proves freight price
- ☐ / 🟡 / ✅ AIS never proves willingness to transact
- ☐ / 🟡 / ✅ Commercial flow is REAL AIS → CANDIDATE → HUMAN VERIFICATION → CAPACITY + QUOTE → DEAL EVALUATOR → OR-TOOLS
- ☐ / 🟡 / ✅ Mumbai → Tokyo test changes geographic query and vessel relevance
- ☐ / 🟡 / ✅ No demo/simulated vessel is ever labeled LIVE
- ☐ / 🟡 / ✅ Final AIS report gives PASS/FAIL honestly, including zero-vessel results

## J. ECONOMICS / PROVENANCE

- ☐ / 🟡 / ✅ Product cost is separated from freight/transport
- ☐ / 🟡 / ✅ Insurance/risk premium is separate
- ☐ / 🟡 / ✅ Handling and fees are separate where applicable
- ☐ / 🟡 / ✅ Landed cost = product + transport + insurance + handling + fees
- ☐ / 🟡 / ✅ Landed cost per barrel is calculated correctly
- ☐ / 🟡 / ✅ Required volume, allocated volume and remaining/shortfall volume are always shown
- ☐ / 🟡 / ✅ Partial/infeasible status is explicit when coverage is incomplete
- ☐ / 🟡 / ✅ Expected profit and margin are deterministic
- ☐ / 🟡 / ✅ Savings vs baseline are deterministic
- ☐ / 🟡 / ✅ Every economic value has provenance
- ☐ / 🟡 / ✅ LIVE / REAL_REFERENCE / HUMAN_VERIFIED / ESTIMATED / CALCULATED / SIMULATED labels are used correctly
- ☐ / 🟡 / ✅ Retail-derived or otherwise indirect values are clearly ESTIMATED
- ☐ / 🟡 / ✅ Simulated values cannot silently enter a live-data claim
- ☐ / 🟡 / ✅ Secrets never appear in reports/UI logs

## K. EXECUTIVE DECISION BOARD

- ☐ / 🟡 / ✅ One integrated decision layer combines relevant opportunities across the whole network
- ☐ / 🟡 / ✅ User does not need to interpret separate scenario reports
- ☐ / 🟡 / ✅ Top 5 are genuinely feasible, not merely the five strategy classes
- ☐ / 🟡 / ✅ Strategies can combine pipeline + vessel + replacement + exchange + route + other opportunities
- ☐ / 🟡 / ✅ Each strategy shows allocation
- ☐ / 🟡 / ✅ Each strategy shows volume
- ☐ / 🟡 / ✅ Each strategy shows coverage
- ☐ / 🟡 / ✅ Each strategy shows remaining volume
- ☐ / 🟡 / ✅ Each strategy shows landed cost
- ☐ / 🟡 / ✅ Each strategy shows transport cost
- ☐ / 🟡 / ✅ Each strategy shows ETA
- ☐ / 🟡 / ✅ Each strategy shows risk
- ☐ / 🟡 / ✅ Each strategy shows expected profit
- ☐ / 🟡 / ✅ Each strategy shows savings vs baseline
- ☐ / 🟡 / ✅ Each strategy shows required verification
- ☐ / 🟡 / ✅ Each strategy shows source/provenance
- ☐ / 🟡 / ✅ Executive explanation uses actual optimizer numbers
- ☐ / 🟡 / ✅ Executive explanation does not invent or alter numbers
- ☐ / 🟡 / ✅ Commercial opportunities are surfaced separately from executable strategies when unverified

## L. VALIDATION / DEMO TESTS

- ☐ / 🟡 / ✅ Trapped Cargo test
- ☐ / 🟡 / ✅ Uncommitted Cargo test
- ☐ / 🟡 / ✅ Moving Vessel test
- ☐ / 🟡 / ✅ Multi-origin Rotterdam test
- ☐ / 🟡 / ✅ Concentration constraint test: max 40% through one transport option
- ☐ / 🟡 / ✅ Parser regression test for `Hormuz is expected to remain unavailable`
- ☐ / 🟡 / ✅ Destination regression test so Mumbai is not hardcoded
- ☐ / 🟡 / ✅ Source regression test so disruption text cannot become an origin
- ☐ / 🟡 / ✅ Real AIS connection test
- ☐ / 🟡 / ✅ AIS scenario-filter test
- ☐ / 🟡 / ✅ No-fabrication test
- ☐ / 🟡 / ✅ Swap/exchange opportunity test
- ☐ / 🟡 / ✅ Backhaul opportunity test
- ☐ / 🟡 / ✅ Triangulation opportunity test
- ☐ / 🟡 / ✅ Hybrid strategy test
- ☐ / 🟡 / ✅ End-to-end test: natural language → parsed scenario → discovery → economics → optimizer → decision board

## M. FINAL STATUS GATE

- ☐ / 🟡 / ✅ Decision Engine
- ☐ / 🟡 / ✅ Real Economic Data
- ☐ / 🟡 / ✅ Real AIS Moving Vessel
- ☐ / 🟡 / ✅ Poly Exea End-to-End Flow

### Non-negotiable rules

1. Do not claim PASS/VERIFIED from simulation alone.
2. Do not invent missing values.
3. Do not let the LLM determine numerical optimization results.
4. Do not call simulated AIS LIVE.
5. Do not infer commercial capacity or willingness from AIS.
6. Do not treat Hormuz disruption text as an origin.
7. Do not hardcode Mumbai as the destination.
8. Do not present an unverified commercial opportunity as executable.
9. Do not rebuild working components unnecessarily.
10. The goal is a defensible, scenario-aware Energy Supply & Transportation Decision Platform — not merely a trapped-ship rescue demo.

## Prompt-history coverage

This checklist consolidates the requirements from the user's chronological prompts, including the original two-scenario operational test, deterministic backend/OR-Tools validation, AIS requirements, the Poly Exea product definition, opportunity discovery, the three-scenario quality test, integrated decision board, AIS key/security requirements, parser bug requirements, landing-page requirements, deployment checks, and the final request to audit the full prompt history. The repository's `USER_PROMPTS_HISTORY.txt` remains the source-of-truth archive for the original prompts.
