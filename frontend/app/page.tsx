'use client'

import { Suspense } from 'react'
import Link from 'next/link'

function LandingContent() {
  return (
    <div className="min-h-screen w-full font-sans text-[#18181B] bg-[#0A0A0A] selection:bg-white selection:text-black">

      {/* ── HERO: AXON-STYLE DARK PRECISION ──────────────────────────── */}
      <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0A0A0A]">

        {/* Grid texture */}
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }} />

        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video autoPlay muted loop playsInline
            className="w-full h-full object-cover opacity-20 scale-105">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]" />
        </div>

        {/* Header */}
        <header className="relative z-10 w-full pt-5 flex justify-between items-center px-8 md:px-16">
          <Link href="/" className="flex items-center gap-3 group">
            <svg width="22" height="22" viewBox="0 0 256 256" fill="none" className="text-white">
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
              <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
            </svg>
            <span className="font-['Instrument_Serif'] text-xl font-bold tracking-tight text-white">POLY EXEA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-white/60">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">All Features</a>
            <a href="#decision" className="hover:text-white transition-colors">Decision Board</a>
            <Link href="/map" className="hover:text-white transition-colors">Live Map</Link>
          </nav>

          <Link href="/intake"
            className="rounded-sm bg-white px-5 py-2.5 text-[13px] font-semibold text-black hover:bg-white/90 transition-all">
            New Analysis
          </Link>
        </header>

        {/* Hero Content */}
        <main className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 py-20 max-w-6xl">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
              Strait of Hormuz — Sustained Disruption Protocol Active
            </span>
          </div>

          <h1 className="font-['Instrument_Serif'] text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-tight text-white max-w-4xl">
            When the world&apos;s most critical oil chokepoint closes, decisions must be exact.
          </h1>

          <p className="mt-8 text-[15px] sm:text-base leading-relaxed text-white/55 max-w-2xl font-light">
            POLY EXEA is an Energy Supply and Transportation Decision Platform. It calculates pipelines,
            ship-to-ship transfers, cargo swaps, backhaul loops, triangulation exchanges, and alternative
            origins — and delivers five mathematically verified strategies in minutes.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link href="/intake"
              className="rounded-sm bg-white px-8 py-4 text-[13px] font-semibold text-black hover:bg-white/90 transition-all">
              Start Requirement Intake
            </Link>
            <a href="#problem"
              className="rounded-sm border border-white/20 px-7 py-4 text-[13px] font-semibold text-white/70 hover:text-white hover:border-white/40 transition-all">
              Understand the Problem
            </a>
          </div>
        </main>

        {/* Bottom bar — metrics */}
        <div className="relative z-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4">
          {[
            { value: '21M bbl', label: 'Daily flow at risk' },
            { value: '20%', label: 'Global oil supply through one strait' },
            { value: '+14 days', label: 'Added transit via Cape bypass' },
            { value: '20 strategies', label: 'Evaluated by OR-Tools solver' },
          ].map((stat) => (
            <div key={stat.label} className="px-8 py-6 border-r border-white/10 last:border-r-0">
              <div className="font-['Instrument_Serif'] text-2xl text-white">{stat.value}</div>
              <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>


      {/* ── SCROLL 1: THE PROBLEM ─────────────────────────────────────── */}
      <section id="problem" className="py-28 px-8 md:px-16 bg-white border-b border-[#18181B]/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">The Chokepoint Crisis</span>
              <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#18181B] mt-4">
                One narrow strait controls 20% of the world&apos;s daily oil.
              </h2>
              <p className="mt-6 text-base text-[#18181B]/65 font-light leading-relaxed">
                The Strait of Hormuz is 33 km wide at its narrowest point. Every day, supertankers carrying
                crude from Saudi Arabia, Iraq, Iran, Kuwait, and the UAE must transit this passage.
                When disruption occurs — by conflict, sanctions, or closure — refineries in Europe, India,
                Japan, and China face an immediate supply cliff.
              </p>
              <p className="mt-4 text-base text-[#18181B]/65 font-light leading-relaxed">
                Most buyers do one thing: reroute around the Cape of Good Hope. That costs 14 to 20 extra days and
                doubles freight expense. POLY EXEA finds what they miss: the other 19 options.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { label: '21 Million Barrels Per Day', desc: 'Supertanker volume that transits Hormuz daily. Disruption freezes all of it inside the Persian Gulf.' },
                { label: 'Refineries face shutdown in 4–7 days', desc: 'Without a contingency plan activated within the first 48 hours, European and Asian refineries begin inventory drawdown.' },
                { label: 'Cape detour adds $12–18/bbl landed cost', desc: 'Rerouting a VLCC around Africa at current bunker prices eliminates most commercial margin on a standard crude cargo.' },
                { label: 'Pipelines, swaps, and vessels go unused', desc: 'ADCOP, IPSA, SUMED, Yanbu — existing infrastructure worth 6.5M bbl/day capacity — remains uncalculated by most buyers.' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-none border-l-2 border-[#18181B] bg-[#FAFAF8]">
                  <div className="text-[13px] font-bold text-[#18181B]">{item.label}</div>
                  <div className="mt-1.5 text-sm text-[#18181B]/60 font-light leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── SCROLL 2: HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-8 md:px-16 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Decision Pipeline</span>
          <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-white mt-4 max-w-3xl">
            From a plain-English sentence to five verified strategies in four steps.
          </h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {[
              {
                n: '01',
                title: 'Natural Language Intake',
                body: 'State your requirement in plain English. POLY EXEA extracts product, multi-origin volumes, destination, deadline, priority, and constraints. Disruption conditions are never mistaken for supply origins. Missing fields are marked NOT SPECIFIED — never guessed.',
                tag: 'Gemini NLP Parser',
              },
              {
                n: '02',
                title: 'Live AIS Vessel Tracking',
                body: 'Real-time WebSocket connection to aisstream.io. Vessel positions, IMO, speed, course, and AIS-reported destination captured inside a geographic bounding box computed from your scenario. Spare capacity is never assumed from position data alone.',
                tag: 'AIS — Candidate Unverified',
              },
              {
                n: '03',
                title: '20-Strategy Network Discovery',
                body: 'Discovers opportunities across four commercial families: Move Differently (pipelines, STS, transshipment), Use the Network (triangulation, backhaul, moving vessel), Don\'t Move Your Cargo (swaps, exchanges, alt origins), and Change Timing (alt destination, hybrid).',
                tag: 'Opportunity Discovery Engine',
              },
              {
                n: '04',
                title: 'OR-Tools Deterministic Solver',
                body: 'Google OR-Tools CP-SAT runs linear programming over the verified option set. Outputs volume allocation, landed cost per barrel, expected profit, margin, savings vs baseline, and shortfall — all to the exact dollar. The LLM never touches the arithmetic.',
                tag: 'Google OR-Tools · Exact Math',
              },
            ].map((step) => (
              <div key={step.n} className="bg-[#0F0F0F] p-8 space-y-5">
                <div className="font-['Instrument_Serif'] text-5xl text-white/10">{step.n}</div>
                <div className="text-[13px] font-bold uppercase tracking-wider text-white">{step.title}</div>
                <p className="text-[13px] text-white/50 font-light leading-relaxed">{step.body}</p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-t border-white/10 pt-4">{step.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── SCROLL 3: ALL FEATURES DEEPLY EXPLAINED ──────────────────── */}
      <section id="features" className="py-28 px-8 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]/40">All 20 Strategy Classes</span>
          <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#18181B] mt-4 max-w-3xl">
            Every option your procurement team doesn&apos;t have time to calculate manually.
          </h2>
          <p className="mt-6 text-base text-[#18181B]/55 font-light leading-relaxed max-w-2xl">
            POLY EXEA organises every physical and commercial option into four families. Each is explained below
            in plain language — what it is, when it applies, and what it costs.
          </p>

          {/* Family A */}
          <div className="mt-16 border-t-2 border-[#18181B] pt-10">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]/40 mb-2">Family A</div>
            <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B]">Move Differently</h3>
            <p className="mt-3 text-sm text-[#18181B]/55 font-light max-w-xl">Your cargo still moves — but via a different physical path that bypasses Hormuz.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Direct Alternate Maritime Route',
                  tag: 'REAL REFERENCE',
                  body: 'Reroute the vessel around the Cape of Good Hope. Adds 14–20 sailing days and approximately $12–18/bbl landed cost uplift, but completely bypasses Hormuz. Suitable when deadline is flexible and volume is large.',
                  detail: 'Example: Ras Tanura (Persian Gulf) → Cape Town bypass → Rotterdam. Distance: 11,200 nm vs 7,400 nm via Suez. ETA: 28 days.'
                },
                {
                  name: 'Pipeline Bypass — ADNOC ADCOP',
                  tag: 'REAL REFERENCE',
                  body: 'Abu Dhabi\'s ADCOP pipeline runs 380 km from Habshan inland terminal to Fujairah on the Gulf of Oman coast. Capacity: 1.5M bbl/day. Pipeline to Fujairah bypasses Hormuz entirely. Cargo re-ships from Fujairah terminal.',
                  detail: 'Fujairah Terminal → Arabian Sea → Destination. ETA: 4 days from Fujairah. Cost: ~$1.40/bbl pipeline tariff + standard maritime freight.'
                },
                {
                  name: 'Pipeline Bypass — Saudi IPSA (Yanbu)',
                  tag: 'REAL REFERENCE',
                  body: 'The Saudi IPSA East-West Pipeline runs from Abqaiq in the Eastern Province to Yanbu on the Red Sea. Capacity: 2.5M bbl/day. Once at Yanbu, crude ships through the Red Sea and Suez Canal, bypassing Hormuz.',
                  detail: 'Yanbu Red Sea Terminal → Bab-el-Mandeb → Suez Canal → Mediterranean → Destination. Tariff: ~$1.40/bbl. ETA uplift: 3–5 days vs direct Hormuz.'
                },
                {
                  name: 'Pipeline Bypass — SUMED (Egypt)',
                  tag: 'REAL REFERENCE',
                  body: 'The SUMED Pipeline runs from Ain Sukhna (Red Sea) to Sidi Kerir (Mediterranean). Capacity: 2.5M bbl/day. Allows crude to move from Red Sea import to Mediterranean export without transiting the Suez Canal.',
                  detail: 'Yanbu → Red Sea → Ain Sukhna → SUMED → Sidi Kerir (Alexandria) → Atlantic. Used when Suez Canal is congested or draft-restricted.'
                },
                {
                  name: 'Transshipment Hub',
                  tag: 'REAL REFERENCE',
                  body: 'Discharge into a transshipment hub — Fujairah UAE, Salalah Oman, or Colombo Sri Lanka — and re-ship on a smaller-class Aframax to final destination. Reduces VLCC draft restrictions at destination ports.',
                  detail: 'VLCC → Fujairah discharge → Aframax re-ship → Destination. Saves 1,200–2,000 nm on direct approach. Cost: +$2–3/bbl transshipment handling.'
                },
                {
                  name: 'STS / Lightering — Offshore Transfer',
                  tag: 'REAL REFERENCE',
                  body: 'Ship-to-ship transfer at sea: the VLCC transfers cargo to an Aframax or Suezmax anchored in a safe offshore zone (Fujairah, Salalah, or international waters). The Aframax then proceeds to port. Allows VLCC to avoid port draft limits.',
                  detail: 'Fujairah Offshore Anchorage — STS Zone. Legal, commercially established. Transfer time: 18–36 hours. Cost: $0.80–1.20/bbl handling premium.'
                },
                {
                  name: 'Multimodal Strategy',
                  tag: 'CALCULATED',
                  body: 'Combines two or more transport modes: for example, pipeline to Fujairah then maritime STS to Aframax for final delivery. OR-Tools allocates volume between modes to minimise total landed cost while meeting deadline.',
                  detail: 'Example: 60% ADCOP pipeline → Fujairah → Aframax → Mumbai. 40% IPSA pipeline → Yanbu → Suezmax → Rotterdam. Optimised by solver.'
                },
              ].map((f) => (
                <div key={f.name} className="border border-[#18181B]/10 p-7 space-y-3 bg-[#FAFAF8]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] font-bold text-[#18181B]">{f.name}</div>
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 border border-[#18181B]/20 text-[#18181B]/50">{f.tag}</span>
                  </div>
                  <p className="text-[13px] text-[#18181B]/65 font-light leading-relaxed">{f.body}</p>
                  <p className="text-[11px] text-[#18181B]/40 font-light leading-relaxed border-t border-[#18181B]/10 pt-3">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family B */}
          <div className="mt-20 border-t-2 border-[#18181B] pt-10">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]/40 mb-2">Family B</div>
            <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B]">Do Not Move Your Cargo</h3>
            <p className="mt-3 text-sm text-[#18181B]/55 font-light max-w-xl">Avoid the physical passage through Hormuz entirely by repositioning supply without moving the trapped cargo.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Alternative Origin — West Africa',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Load a replacement crude cargo from Nigeria (Bonny Terminal), Angola, or Ghana instead. West African crude is completely independent of the Persian Gulf. Grade: Bonny Light (37° API, sweet). Shipping: direct Atlantic transit to Europe.',
                  detail: 'Bonny Terminal, Nigeria → Rotterdam: 4,100 nm, 12 days, estimated $89.80/bbl landed cost. No Hormuz exposure whatsoever.'
                },
                {
                  name: 'Alternative Origin — North Sea',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Purchase Brent or Forties crude at Sullom Voe (UK) or Troll (Norway). North Sea is the closest non-Hormuz origin to European refineries. Grade premium exists but transit cost is minimal — 300–500 nm to Rotterdam.',
                  detail: 'Sullom Voe, North Sea → Rotterdam: 850 nm, 3 days. Highest grade premium but lowest freight. Used when deadline is critical and Hormuz exposure must be zero.'
                },
                {
                  name: 'Bi-Coastal Domestic Swap',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Indian example: unload the VLCC at Mumbai (West Coast) and simultaneously release equivalent inventory at Visakhapatnam (East Coast). Reliance Industries and IOCL operate dual-coast terminals. Eliminates 2,450 nm of transit around Sri Lanka.',
                  detail: 'Mumbai West Hub (Reliance / Jio Energy) unload → Vizag East Hub (IOCL) release. Saves 8.5 transit days. Commercial: counterparty inventory compatibility must be verified before execution.'
                },
                {
                  name: 'Local / Regional Exchange',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Identify a counterparty with compatible crude inventory at the destination or nearby. Exchange delivery obligations: you give them a cargo at their origin, they give you equivalent volume at your destination. Zero transit for either party.',
                  detail: 'Example: Shell has Brent at Rotterdam. You have Arab Light at Ras Tanura. Exchange obligations. Neither cargo moves. Grade and quantity compatibility must be confirmed. Regulatory/title transfer structures apply.'
                },
                {
                  name: 'Replacement Supply — SPR / Stock Draw',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Access strategic petroleum reserves or commercial storage at the destination market. IEA member states can authorise emergency stock releases. Commercial inventory holders can offer short-term stock loans against future replenishment.',
                  detail: 'Requires government coordination for SPR. Commercial stock loans require credit-grade counterparty. Time to activate: 3–7 days. Volume coverage: up to 90-day national stock requirement.'
                },
                {
                  name: 'Emergency Replacement + Stranded Cargo Separation',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Procure spot replacement supply immediately from a non-Hormuz origin, and treat the trapped cargo inside the Gulf as a separate negotiation — for later extraction or sale. This decouples the urgent delivery problem from the stranded-asset problem.',
                  detail: 'Stranded cargo remains at Ras Tanura. Replacement spot cargo procured from WAF or North Sea. Two parallel commercial workstreams run independently. Reduces deadline risk to zero for the delivery commitment.'
                },
              ].map((f) => (
                <div key={f.name} className="border border-[#18181B]/10 p-7 space-y-3 bg-[#FAFAF8]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] font-bold text-[#18181B]">{f.name}</div>
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 border border-[#18181B]/20 text-[#18181B]/50">{f.tag}</span>
                  </div>
                  <p className="text-[13px] text-[#18181B]/65 font-light leading-relaxed">{f.body}</p>
                  <p className="text-[11px] text-[#18181B]/40 font-light leading-relaxed border-t border-[#18181B]/10 pt-3">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family C */}
          <div className="mt-20 border-t-2 border-[#18181B] pt-10">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]/40 mb-2">Family C</div>
            <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B]">Use the Network More Intelligently</h3>
            <p className="mt-3 text-sm text-[#18181B]/55 font-light max-w-xl">Leverage the existing movement of vessels and cargo in the global network to eliminate empty ballast legs and reduce total system cost.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Moving Vessel Opportunity',
                  tag: 'AIS — CANDIDATE UNVERIFIED',
                  body: 'A vessel already transiting near your corridor can be diverted to load your cargo, saving 3–5 days of positioning time vs dispatching a vessel from port. POLY EXEA identifies candidate vessels from live AIS position and trajectory data.',
                  detail: 'Example: VLCC spotted 300 nm from Ras Tanura on outbound transit. Divert for backload. Estimated positioning saving: 4 days, $0.40/bbl. Commercial verification: spare capacity, charter availability, and owner willingness must be confirmed independently of AIS data.'
                },
                {
                  name: 'Backhaul Opportunity',
                  tag: 'AIS — CANDIDATE UNVERIFIED',
                  body: 'A vessel returning empty (in ballast) to a load port passes through or near your cargo corridor. Offer it a backhaul cargo at below-market freight to fill the return voyage. Owner reduces ballast cost; you get below-market freight.',
                  detail: 'Typical backhaul discount: 15–25% below spot market rate. Example: Suezmax returning from Rotterdam to Sidi Kerir — backhaul crude from Yanbu at $2.80/bbl vs market $3.50/bbl. Must confirm owner willingness and grade acceptance.'
                },
                {
                  name: '3-Party Triangulation Swap',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Three companies form a closed loop: Company A (India) gives cargo to Company B (Singapore), Company B gives cargo to Company C (West Africa), Company C gives cargo to Company A (completing the loop). No company sails a ballast leg. Eliminates 4,800 nm of empty voyages across three fleets.',
                  detail: 'Node A (India Hub, 1.35N 103.8E Singapore) → Node B (West Africa, Bonny 4.43N 7.16E) → Node C (Rotterdam 51.92N 4.48E) → back to Node A. Grade and timing compatibility required. POLY EXEA calculates the closed-loop economics for each node.'
                },
                {
                  name: 'Diversified Split — Multi-Source Allocation',
                  tag: 'CALCULATED',
                  body: 'Instead of relying on one supply origin or transport option, allocate volume across two or more independent sources: for example, 50% West Africa, 30% pipeline bypass, 20% regional exchange. Concentration constraint: never more than 40% through a single transport option.',
                  detail: 'OR-Tools computes the optimal split that minimises total landed cost while satisfying deadline, volume, and concentration constraints simultaneously. Each allocation is shown with its own ETA, cost, and risk score.'
                },
                {
                  name: 'Demand / Allocation Rebalancing',
                  tag: 'CALCULATED',
                  body: 'If you supply multiple refineries, rebalance crude grade allocation between coastal terminals. Shift a Mediterranean-bound cargo to a closer North African terminal and substitute with a WAF spot cargo. Reduces aggregate system-wide transit distance.',
                  detail: 'Applicable when a buyer operates multiple refineries or terminals with shared crude grade tolerance. POLY EXEA models the cross-terminal rebalancing as an allocation optimisation problem with compatible grade constraints.'
                },
              ].map((f) => (
                <div key={f.name} className="border border-[#18181B]/10 p-7 space-y-3 bg-[#FAFAF8]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] font-bold text-[#18181B]">{f.name}</div>
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 border border-[#18181B]/20 text-[#18181B]/50">{f.tag}</span>
                  </div>
                  <p className="text-[13px] text-[#18181B]/65 font-light leading-relaxed">{f.body}</p>
                  <p className="text-[11px] text-[#18181B]/40 font-light leading-relaxed border-t border-[#18181B]/10 pt-3">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family D */}
          <div className="mt-20 border-t-2 border-[#18181B] pt-10">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]/40 mb-2">Family D</div>
            <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B]">Change Timing and Structure</h3>
            <p className="mt-3 text-sm text-[#18181B]/55 font-light max-w-xl">Adjust delivery schedule or commercial structure to create viable options that a fixed-deadline approach would miss.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Alternative Destination / Discharge Hub',
                  tag: 'COMMERCIAL VERIFICATION REQUIRED',
                  body: 'Instead of sailing the VLCC to the final destination port (e.g. Mumbai), discharge at an intermediate hub (Fujairah or Salalah) and forward by coastal feeder vessel. Avoids VLCC draft restrictions and reduces large-vessel exposure.',
                  detail: 'VLCC → Fujairah discharge → Coastal tanker (Aframax) → Mumbai. Adds 1.5 days but avoids Mumbai port congestion, VLCC port fees, and high-risk segment. Cost: +$1.80/bbl forwarding.'
                },
                {
                  name: 'Wait / Timing Strategy',
                  tag: 'CALCULATED',
                  body: 'When disruption is expected to be temporary, delaying transit by 5–10 days and holding cargo at Ras Tanura or Fujairah anchorage may allow passage when conditions ease. POLY EXEA models the wait cost vs bypass cost to determine the break-even window.',
                  detail: 'Anchorage cost: $35–60K/day for a VLCC. Break-even waiting period vs Cape bypass: calculated per scenario. Only viable if disruption window is credibly short. POLY EXEA never assumes disruption duration — user specifies it.'
                },
                {
                  name: 'Hybrid Strategy — Multi-Modal Combined',
                  tag: 'CALCULATED',
                  body: 'Combine pipeline bypass, vessel charter, and spot purchase in one allocation. Example: 80% through IPSA pipeline to Yanbu + 20% via Stena Bulk VLCC charter. OR-Tools finds the optimal percentage split across the verified option set.',
                  detail: 'OR-Tools output: 80% × 2.0M bbl IPSA pipeline at $89.50/bbl + 20% × 0.5M bbl Stena VLCC at $92.30/bbl = total landed cost $90.06/bbl, 100% volume coverage, ETA 6 days, savings $4.44/bbl vs baseline.'
                },
              ].map((f) => (
                <div key={f.name} className="border border-[#18181B]/10 p-7 space-y-3 bg-[#FAFAF8]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] font-bold text-[#18181B]">{f.name}</div>
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 border border-[#18181B]/20 text-[#18181B]/50">{f.tag}</span>
                  </div>
                  <p className="text-[13px] text-[#18181B]/65 font-light leading-relaxed">{f.body}</p>
                  <p className="text-[11px] text-[#18181B]/40 font-light leading-relaxed border-t border-[#18181B]/10 pt-3">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── SCROLL 4: DECISION BOARD PREVIEW ─────────────────────────── */}
      <section id="decision" className="py-28 px-8 md:px-16 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Executive Decision Board</span>
          <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-white mt-4 max-w-3xl">
            Every number is auditable. No AI arithmetic. No invented values.
          </h2>
          <p className="mt-6 text-base text-white/45 font-light max-w-2xl leading-relaxed">
            The OR-Tools solver outputs exact landed cost, P&amp;L, and negotiation ceiling per strategy.
            Every value is labeled LIVE, REAL_REFERENCE, CALCULATED, ESTIMATED, or COMMERCIAL_VERIFICATION_REQUIRED.
          </p>

          {/* Mock decision board */}
          <div className="mt-12 border border-white/10 bg-[#0F0F0F]">
            <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Section 01 · Executive Recommendation</div>
                <div className="text-white font-['Instrument_Serif'] text-xl mt-1">Proceed with Hybrid: 80% IPSA Pipeline + 20% VLCC Charter</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase">Strategy Status</div>
                <div className="text-emerald-400 font-bold text-sm">OPTIMAL</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10">
              {[
                { label: 'Total Delivered Cost', value: '$180.12M', sub: '$90.06/bbl', tag: 'CALCULATED' },
                { label: 'Expected Profit', value: '+$29.88M', sub: '14.2% margin', tag: 'CALCULATED' },
                { label: 'Savings vs Baseline', value: '$8.88M', sub: '$4.44/bbl saved', tag: 'CALCULATED' },
                { label: 'Negotiation Ceiling', value: '$1.65M', sub: '$4.12/bbl max', tag: 'CALCULATED' },
              ].map((m) => (
                <div key={m.label} className="px-6 py-6 border-r border-white/10 last:border-r-0">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</div>
                  <div className="font-['Instrument_Serif'] text-2xl text-white mt-2">{m.value}</div>
                  <div className="text-[11px] text-white/40 mt-1">{m.sub}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 mt-2">{m.tag}</div>
                </div>
              ))}
            </div>

            <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Option A — IPSA Pipeline', alloc: '80%', vol: '2,000,000 bbl', eta: '3 days', cost: '$89.50/bbl', risk: 'LOW', prov: 'REAL_REFERENCE' },
                { label: 'Option B — Stena Bulk VLCC', alloc: '20%', vol: '500,000 bbl', eta: '6 days', cost: '$92.30/bbl', risk: 'LOW', prov: 'HUMAN VERIFIED' },
                { label: 'Option C — Cape Bypass', alloc: '0%', vol: '—', eta: '28 days', cost: '$97.20/bbl', risk: 'MEDIUM', prov: 'REAL_REFERENCE' },
              ].map((o) => (
                <div key={o.label} className="border border-white/10 p-5 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">{o.label}</div>
                  <div className="font-['Instrument_Serif'] text-3xl text-white">{o.alloc}</div>
                  <div className="space-y-1.5 text-[11px] text-white/40">
                    <div className="flex justify-between"><span>Volume</span><span className="text-white/60">{o.vol}</span></div>
                    <div className="flex justify-between"><span>ETA</span><span className="text-white/60">{o.eta}</span></div>
                    <div className="flex justify-between"><span>Landed cost</span><span className="text-white/60">{o.cost}</span></div>
                    <div className="flex justify-between"><span>Risk</span><span className={o.risk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}>{o.risk}</span></div>
                    <div className="flex justify-between"><span>Provenance</span><span className="text-sky-400">{o.prov}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-start gap-6">
            <Link href="/intake"
              className="rounded-sm bg-white px-8 py-4 text-[13px] font-semibold text-black hover:bg-white/90 transition-all">
              Analyze Your Requirement
            </Link>
            <Link href="/map"
              className="rounded-sm border border-white/20 px-7 py-4 text-[13px] font-semibold text-white/60 hover:text-white hover:border-white/40 transition-all">
              View Live Map Network
            </Link>
          </div>
        </div>
      </section>


      {/* ── PROVENANCE RULES ──────────────────────────────────────────── */}
      <section className="py-20 px-8 md:px-16 bg-white border-t border-[#18181B]/10">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]/40">Data Provenance Standards</span>
          <h2 className="font-['Instrument_Serif'] text-3xl text-[#18181B] mt-4 max-w-2xl">
            Every value is labeled. Nothing is invented.
          </h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { tag: 'LIVE', color: 'bg-emerald-600', desc: 'Real-time AIS or market feed' },
              { tag: 'REAL REFERENCE', color: 'bg-sky-600', desc: 'Published tariff, pipeline rate, or route data' },
              { tag: 'HUMAN VERIFIED', color: 'bg-violet-600', desc: 'Confirmed by broker or operator' },
              { tag: 'CALCULATED', color: 'bg-amber-600', desc: 'Deterministic OR-Tools arithmetic' },
              { tag: 'COMMERCIAL VERIFICATION REQUIRED', color: 'bg-red-600', desc: 'Candidate opportunity — not yet actionable' },
            ].map((p) => (
              <div key={p.tag} className="border border-[#18181B]/10 p-5 space-y-2 bg-[#FAFAF8]">
                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider text-white px-2 py-1 ${p.color}`}>{p.tag}</span>
                <p className="text-[11px] text-[#18181B]/55 font-light">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="py-10 bg-[#0A0A0A] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 256 256" fill="none" className="text-white/40">
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
              <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
            </svg>
            <span className="text-[12px] text-white/30 font-light">POLY EXEA &copy; 2026 · Maritime Supply Decision Platform</span>
          </div>
          <div className="flex gap-8 text-[12px] text-white/30">
            <Link href="/intake" className="hover:text-white/70 transition-colors">Intake</Link>
            <Link href="/map" className="hover:text-white/70 transition-colors">Map Network</Link>
            <Link href="/strategy" className="hover:text-white/70 transition-colors">Strategy Solver</Link>
            <Link href="/report" className="hover:text-white/70 transition-colors">Decision Report</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white/30 text-sm">Loading POLY EXEA...</div>}>
      <LandingContent />
    </Suspense>
  )
}
