'use client'

import { Suspense } from 'react'
import Link from 'next/link'

function LandingContent() {
  return (
    <div className="min-h-screen w-full font-sans text-[#18181B] bg-[#FAFAF8] selection:bg-[#18181B] selection:text-white">
      
      {/* ── HERO SECTION WITH HIGH-VISIBILITY BACKGROUND VIDEO ──────────────── */}
      <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
        
        {/* Background Video — High visibility (opacity 85%) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-85 scale-105 filter brightness-95 contrast-105 transition-all duration-1000"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
              type="video/mp4"
            />
          </video>
          {/* Subtle gradient overlay to ensure text contrast while keeping video visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/40 via-white/50 to-[#FAFAF8]" />
        </div>

        {/* Header Navigation */}
        <header className="relative z-10 w-full pt-4 md:pt-6 flex justify-center px-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 shadow-sm border border-[#18181B]/15 flex items-center justify-between gap-6 max-w-5xl w-full">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <svg width="26" height="26" viewBox="0 0 256 256" fill="none" className="text-[#18181B] transition-transform group-hover:scale-105">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
              </svg>
              <span className="font-['Instrument_Serif'] text-2xl font-bold tracking-tight text-[#18181B]">
                POLY EXEA
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#18181B]/80">
              <Link href="#problem" className="hover:text-[#18181B] transition-colors">The Problem</Link>
              <Link href="#how-it-works" className="hover:text-[#18181B] transition-colors">How It Works</Link>
              <Link href="#taxonomy" className="hover:text-[#18181B] transition-colors">20 Strategies</Link>
              <Link href="/map" className="hover:text-[#18181B] transition-colors">Live Map</Link>
              <Link href="/report" className="hover:text-[#18181B] transition-colors">Decision Board</Link>
            </nav>

            {/* CTA */}
            <Link
              href="/intake"
              className="rounded-full bg-[#18181B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black transition-all shadow-md shrink-0"
            >
              Analyze Requirement →
            </Link>

          </div>
        </header>

        {/* Hero Headline Content */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center my-auto max-w-5xl mx-auto py-16">
          
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#18181B]/15 bg-white/85 backdrop-blur-md px-4 py-2 text-xs font-bold text-[#18181B] shadow-sm uppercase tracking-wider">
            <span className="bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
              Y
            </span>
            <span>Hormuz Oil Flow Continuity Platform &middot; Executive Decision System</span>
          </div>

          {/* Headline */}
          <h1 className="font-['Instrument_Serif'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.98] tracking-tight text-[#18181B] max-w-5xl">
            When the Strait of Hormuz stops, <br />
            <span className="italic font-normal text-amber-900">POLY EXEA keeps energy moving.</span>
          </h1>

          {/* Simple Subtitle (Simple enough for a 5-year-old, powerful enough for a 50-year veteran) */}
          <p className="mt-6 sm:mt-8 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-[#18181B]/80 font-normal bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[#18181B]/10">
            When 21 million barrels of daily crude are blocked at the Strait of Hormuz, POLY EXEA calculates hidden pipelines, ship-to-ship transfers, coastal swaps, and moving vessels to deliver fuel on time — with 100% mathematical certainty.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/intake"
              className="rounded-full bg-[#18181B] px-8 py-4 text-sm font-semibold text-white shadow-xl hover:bg-black transition-all duration-300"
            >
              Start Natural Language Intake →
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full bg-white/90 backdrop-blur-md border border-[#18181B]/20 px-7 py-4 text-sm font-semibold text-[#18181B] hover:bg-white transition-all shadow-sm"
            >
              See How It Works ↓
            </Link>
          </div>

        </main>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-8 flex justify-center">
          <a href="#problem" className="text-xs text-[#18181B]/60 font-semibold uppercase tracking-widest flex items-center gap-2 hover:text-[#18181B]">
            <span>Scroll to explore</span>
            <span className="animate-bounce">↓</span>
          </a>
        </div>

      </section>


      {/* ── SCROLL 1: THE PROBLEM EXPLAINED SIMPLY ──────────────────────────── */}
      <section id="problem" className="py-24 px-4 bg-white border-t border-b border-[#18181B]/10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold uppercase tracking-wider">
              The Chokepoint Crisis
            </span>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
              Why does a Hormuz disruption freeze global oil?
            </h2>
            <p className="text-base sm:text-lg text-[#18181B]/70 max-w-2xl mx-auto font-light">
              Simple analogy: Think of the Strait of Hormuz as a narrow doorway where 20% of the world&apos;s daily oil must pass through. If that doorway locks:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 text-2xl font-bold flex items-center justify-center">
                🚢
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">21 Million Barrels Trapped</h3>
              <p className="text-sm text-[#18181B]/70 font-light leading-relaxed">
                Supertankers carrying crude inside the Persian Gulf cannot sail out. Refineries in Europe, India, and Asia face immediate shutdown within days.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 text-2xl font-bold flex items-center justify-center">
                ⏳
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Shipping Time Spikes</h3>
              <p className="text-sm text-[#18181B]/70 font-light leading-relaxed">
                Rerouting ships all the way around Africa (Cape of Good Hope) adds 14 to 20 extra sailing days, doubling freight costs and missing contract deadlines.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 text-2xl font-bold flex items-center justify-center">
                🔍
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Hidden Alternate Routes</h3>
              <p className="text-sm text-[#18181B]/70 font-light leading-relaxed">
                Overland pipelines (ADCOP, IPSA), cargo exchanges (Mumbai ⇄ Vizag), and floating vessels near destination ports exist — but buyers don&apos;t know how to combine them instantly.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ── SCROLL 2: HOW POLY EXEA WORKS IN 4 STEPS ────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto space-y-16">
          
          <div className="text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-[#18181B] text-white text-xs font-bold uppercase tracking-wider">
              The Poly Exea Decision Pipeline
            </span>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
              From natural language to deterministic optimization
            </h2>
            <p className="text-base sm:text-lg text-[#18181B]/70 max-w-2xl mx-auto font-light">
              How POLY EXEA solves complex maritime disruptions in 4 continuous steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-[#18181B]/10 space-y-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Intake Parser</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                State your requirement in plain English. Gemini extracts product, multi-origin volumes, destination, deadline, and constraints.
              </p>
              <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                ✓ Never invents missing data<br/>
                ✓ Disruption ≠ Origin
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-[#18181B]/10 space-y-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Live AIS Tracking</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                Real-time WebSocket AIS tracking of crude tankers in Strait of Hormuz, Persian Gulf, Arabian Sea, and West Coast India.
              </p>
              <div className="text-[10px] font-mono text-sky-700 bg-sky-50 p-2 rounded-xl">
                ✓ Live vessel position &amp; speed<br/>
                ✓ Never infers spare capacity
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-[#18181B]/10 space-y-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">20-Strategy Discovery</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                Discovers actionable opportunities across 4 commercial families: Move Differently, Don&apos;t Move, Use Network, Change Timing.
              </p>
              <div className="text-[10px] font-mono text-violet-700 bg-violet-50 p-2 rounded-xl">
                ✓ STS, Bicoastal, Pipelines<br/>
                ✓ Triangulation &amp; Swaps
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-[#18181B]/10 space-y-4 relative">
              <div className="w-8 h-8 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center">
                4
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">OR-Tools Solver</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                Google OR-Tools runs linear programming over verified options to compute top 5 multi-modal strategies with 100% accurate math.
              </p>
              <div className="text-[10px] font-mono text-amber-700 bg-amber-50 p-2 rounded-xl">
                ✓ Exact landed cost &amp; P&amp;L<br/>
                ✓ Zero AI arithmetic errors
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ── SCROLL 3: THE 20 STRATEGY CLASSES IN 4 FAMILIES ────────────────── */}
      <section id="taxonomy" className="py-24 px-4 bg-white border-t border-b border-[#18181B]/10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-violet-100 text-violet-900 text-xs font-bold uppercase tracking-wider">
              Commercial Decision Tree
            </span>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
              20 Strategy Classes across 4 Commercial Families
            </h2>
            <p className="text-base sm:text-lg text-[#18181B]/70 max-w-2xl mx-auto font-light">
              Instead of random suggestions, POLY EXEA organizes every physical &amp; commercial option into a structured decision taxonomy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Family 1 */}
            <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-600 text-white text-xs font-bold uppercase">
                🚢 Move Differently
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Alternative Physical Paths</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                Bypass Hormuz terrestrially or via alternate sea routes:
              </p>
              <ul className="text-xs font-medium text-[#18181B]/80 space-y-1.5 list-disc pl-4">
                <li><strong>Direct Alternate Route:</strong> Cape of Good Hope long-haul bypass</li>
                <li><strong>Pipeline Bypass:</strong> ADNOC ADCOP (Habshan → Fujairah), IPSA, SUMED</li>
                <li><strong>Transshipment:</strong> Transfer at Fujairah / Salalah hubs</li>
                <li><strong>STS / Lightering:</strong> Offshore ship-to-ship transfer to Aframax</li>
                <li><strong>Multi-modal:</strong> Pipeline + maritime shuttle combined</li>
              </ul>
            </div>

            {/* Family 2 */}
            <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase">
                📦 Don&apos;t Move Your Cargo
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Commercial Position Swaps</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                Eliminate physical passage through Hormuz entirely:
              </p>
              <ul className="text-xs font-medium text-[#18181B]/80 space-y-1.5 list-disc pl-4">
                <li><strong>Replacement Supply:</strong> Buy equivalent crude from non-Hormuz origins</li>
                <li><strong>Local Inventory / SPR:</strong> Draw down regional storage or SPR reserves</li>
                <li><strong>Bi-Coastal Swap:</strong> Discharge West Coast (Mumbai) ⇄ Release East Coast (Vizag)</li>
                <li><strong>Local / Regional Exchange:</strong> Counterparty inventory swap near destination</li>
                <li><strong>Alternative Origin:</strong> Load West Africa (Bonny) or North Sea (Sullom Voe)</li>
              </ul>
            </div>

            {/* Family 3 */}
            <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold uppercase">
                🌐 Use the Network
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Network Efficiency Optimization</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                Leverage existing vessel movements and multi-party loops:
              </p>
              <ul className="text-xs font-medium text-[#18181B]/80 space-y-1.5 list-disc pl-4">
                <li><strong>Moving Vessel Opportunity:</strong> Divert a vessel already near your corridor</li>
                <li><strong>Backhaul Opportunity:</strong> Utilize empty return voyages</li>
                <li><strong>3-Party Triangulation:</strong> Closed 3-node loop eliminating ballast legs</li>
                <li><strong>Diversified Split:</strong> Spread volume across independent supply sources</li>
                <li><strong>Demand Rebalancing:</strong> Shift crude grades between coastal refineries</li>
              </ul>
            </div>

            {/* Family 4 */}
            <div className="p-8 rounded-3xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold uppercase">
                ⏱️ Change Timing &amp; Structure
              </div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Temporal &amp; Contractual Options</h3>
              <p className="text-xs text-[#18181B]/70 font-light leading-relaxed">
                Adjust delivery schedules and commercial terms:
              </p>
              <ul className="text-xs font-medium text-[#18181B]/80 space-y-1.5 list-disc pl-4">
                <li><strong>Wait / Timing Strategy:</strong> Delay transit until a safe window opens</li>
                <li><strong>Alternative Destination:</strong> Discharge at intermediate hub for coastal forwarding</li>
                <li><strong>Emergency Replacement:</strong> Procure spot supply now, treat stranded cargo separately</li>
                <li><strong>Counterparty Exchange:</strong> Exchange physical positions between companies</li>
                <li><strong>Hybrid Strategy:</strong> Combine pipeline + moving vessel + spot supply</li>
              </ul>
            </div>

          </div>

        </div>
      </section>


      {/* ── SCROLL 4: REAL-TIME WHAT-IF & DECISION BOARD ────────────────────── */}
      <section className="py-24 px-4 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              Executive Decision Board
            </span>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
              Real-time P&amp;L evaluation &amp; negotiation ceilings
            </h2>
            <p className="text-base sm:text-lg text-[#18181B]/70 max-w-2xl mx-auto font-light">
              Every deal quote from a shipowner or broker is evaluated deterministically for landed cost, margin %, and maximum acceptable price ceiling.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#18181B] text-white space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  DETERMINISTIC EVALUATION RESULT
                </span>
                <h3 className="font-['Instrument_Serif'] text-3xl text-white mt-2">
                  Stena Bulk Charter &middot; 2,000,000 bbl VLCC
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/50 uppercase font-semibold">Verdict</div>
                <div className="font-bold text-2xl text-emerald-400">GO (CONFIRMED)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">Quoted Freight</div>
                <div className="text-xl font-bold text-white">$6,000,000</div>
                <div className="text-[10px] text-white/40">$3.00/bbl</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">Total Landed Cost</div>
                <div className="text-xl font-bold text-white">$92.30/bbl</div>
                <div className="text-[10px] text-white/40">$184.6M total</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">Expected Profit</div>
                <div className="text-xl font-bold text-emerald-400">+$25.40M</div>
                <div className="text-[10px] text-white/40">12.1% margin</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/40 uppercase">Negotiation Ceiling</div>
                <div className="text-xl font-bold text-amber-400">$6,800,000</div>
                <div className="text-[10px] text-white/40">$3.40/bbl max</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
              <div><strong>PROVENANCE:</strong> CALCULATED (Deterministic linear P&amp;L formula)</div>
              <div><strong>VERDICT REASON:</strong> Quoted price of $3.00/bbl is below maximum acceptable ceiling of $3.40/bbl to maintain target 8% profit margin.</div>
            </div>

          </div>

          {/* Final Call to Action */}
          <div className="text-center pt-8 space-y-4">
            <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B]">
              Ready to evaluate your Hormuz supply continuity scenario?
            </h3>
            <Link
              href="/intake"
              className="inline-block rounded-full bg-[#18181B] px-10 py-4 text-base font-semibold text-white shadow-xl hover:bg-black transition-all"
            >
              Start Supply Requirement Intake →
            </Link>
          </div>

        </div>
      </section>


      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-8 bg-white border-t border-[#18181B]/10 text-center text-xs text-[#18181B]/50 font-light">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>POLY EXEA &copy; 2026. Maritime Supply Decision Platform.</div>
          <div className="flex gap-6">
            <Link href="/intake" className="hover:text-[#18181B]">Intake</Link>
            <Link href="/map" className="hover:text-[#18181B]">Map</Link>
            <Link href="/strategy" className="hover:text-[#18181B]">Strategy Solver</Link>
            <Link href="/report" className="hover:text-[#18181B]">Decision Report</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading POLY EXEA...</div>}>
      <LandingContent />
    </Suspense>
  )
}
