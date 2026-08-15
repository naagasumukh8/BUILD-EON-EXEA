'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1B133C] flex flex-col font-sans selection:bg-[#1B133C] selection:text-white">
      
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO LANDING PAGE (Axon Ocean Video Style)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-slate-900">
        
        {/* Background Ocean Video with 95% Opacity */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-95 transition-opacity duration-1000"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-waves-in-the-sea-41548-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Lightweight Gradient Overlay for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/40 via-transparent to-[#FAFAF8]/80 pointer-events-none" />

        {/* Navigation Bar */}
        <nav className="relative z-10 w-full pt-4 md:pt-6 px-4 flex justify-center">
          <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 md:px-6 py-3 shadow-xs border border-[#1B133C]/10 flex items-center justify-between w-full max-w-4xl">
            
            {/* Custom SVG Chevron Logo */}
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 256 256" fill="none" className="text-[#1B133C]">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
              </svg>
              <span className="font-['Instrument_Serif'] text-2xl font-bold tracking-tight text-[#1B133C]">
                EON EXEA
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#1B133C]/70">
              <a href="#overview" className="hover:text-[#1B133C] transition-colors">Overview</a>
              <a href="#explanation" className="hover:text-[#1B133C] transition-colors">Capabilities</a>
              <a href="#consultation" className="hover:text-[#1B133C] transition-colors">AI Consultation</a>
            </div>

            {/* CTA */}
            <Link
              href="/intake"
              className="rounded-full bg-[#1B133C] px-5 py-2 text-xs font-semibold text-white hover:bg-black transition-all shadow-2xs"
            >
              Launch Workspace &rarr;
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 my-auto py-12" id="overview">
          
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#1B133C]/15 bg-white/90 backdrop-blur-md px-4.5 py-2 text-xs sm:text-sm font-semibold text-[#1B133C] shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI MARITIME SUPPLY DECISION PLATFORM</span>
          </div>

          {/* Heading */}
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-6xl lg:text-7xl text-[#1B133C] leading-[1.05] font-normal tracking-tight drop-shadow-xs">
            When a supply route breaks,<br />
            <em className="italic font-light opacity-95">find the fastest way forward.</em>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#1B133C]/90 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-xs">
            Eliminate uncertainty in maritime supply chain disruptions. EON EXEA evaluates vessel candidates, pipeline bypasses, and alternate sea lanes &mdash; simultaneously &mdash; and surfaces the optimal decision in minutes.
          </p>

          {/* Primary Action Button */}
          <div className="pt-3 flex justify-center">
            <Link
              href="/intake"
              className="rounded-full bg-[#1B133C] px-9 py-4 text-base font-semibold text-white shadow-lg hover:bg-black hover:scale-[1.02] transition-all flex items-center gap-2.5"
            >
              Launch AI Workspace
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-6 text-center text-xs font-bold text-[#1B133C]/60 uppercase tracking-widest">
          Scroll to explore ↓
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: CLEAN EXPLANATION SECTION (Minimal & Focused)
          ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#FAFAF8] py-24 px-6 md:px-12 text-[#1B133C] border-t border-[#1B133C]/10" id="explanation">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1B133C]/5 border border-[#1B133C]/10 text-xs font-semibold uppercase tracking-wider text-[#1B133C]">
              Platform Capabilities
            </div>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#1B133C] leading-tight">
              How EON EXEA Solves Disruptions
            </h2>
            <p className="text-base text-[#1B133C]/70 font-light leading-relaxed">
              Four core decision layers working together to minimize cost, delay, and operational risk.
            </p>
          </div>

          {/* 4 Clean Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 01 */}
            <div className="p-8 rounded-3xl bg-white border border-[#1B133C]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#1B133C]/40">01 &middot; INTAKE & PARSING</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#1B133C]">Natural Language Prompt Intake</h3>
              <p className="text-sm text-[#1B133C]/70 leading-relaxed font-light">
                State your operational demand in plain text (e.g. &quot;2M barrels of diesel to Mumbai within 7 days&quot;). Gemini AI extracts commodity volume, destination, and delivery deadline in seconds.
              </p>
            </div>

            {/* 02 */}
            <div className="p-8 rounded-3xl bg-white border border-[#1B133C]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#1B133C]/40">02 &middot; VESSEL & NETWORK DISCOVERY</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#1B133C]">AIS Vessel & Pipeline Tracking</h3>
              <p className="text-sm text-[#1B133C]/70 leading-relaxed font-light">
                Tracks live AIS candidate vessels, Yanbu IPSA pipeline bypass throughput, and chokepoints with transparent, auditable data provenance tags.
              </p>
            </div>

            {/* 03 */}
            <div className="p-8 rounded-3xl bg-white border border-[#1B133C]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#1B133C]/40">03 &middot; FINANCIAL EVALUATOR</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#1B133C]">Deterministic P&L & Ceiling</h3>
              <p className="text-sm text-[#1B133C]/70 leading-relaxed font-light">
                100% arithmetic engine computes landed cost per barrel, expected profit, target price negotiation ceilings, and GO/NEGOTIATE/REJECT commercial verdicts.
              </p>
            </div>

            {/* 04 */}
            <div className="p-8 rounded-3xl bg-white border border-[#1B133C]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#1B133C]/40">04 &middot; STRATEGY OPTIMIZER</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#1B133C]">OR-Tools Hybrid Strategy Solver</h3>
              <p className="text-sm text-[#1B133C]/70 leading-relaxed font-light">
                Solves continuous linear capacity allocation across vessels and pipelines to maximize on-time volume fulfillment and generate audit-ready briefing reports.
              </p>
            </div>

          </div>

          {/* Clean Impact Banner */}
          <div className="p-8 rounded-3xl bg-white border border-[#1B133C]/10 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="font-['Instrument_Serif'] text-4xl text-[#1B133C]">21%</div>
              <div className="text-xs text-[#1B133C]/60 mt-1">Global oil trade passing Hormuz</div>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-[#1B133C]/10 py-4 sm:py-0">
              <div className="font-['Instrument_Serif'] text-4xl text-[#1B133C]">2.5M bbl/day</div>
              <div className="text-xs text-[#1B133C]/60 mt-1">IPSA bypass pipeline capacity</div>
            </div>
            <div>
              <div className="font-['Instrument_Serif'] text-4xl text-[#1B133C]">$170M</div>
              <div className="text-xs text-[#1B133C]/60 mt-1">Average baseline savings</div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="p-8 rounded-3xl bg-[#1B133C] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md" id="consultation">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-['Instrument_Serif'] text-3xl text-white">Ready to run your disruption analysis?</h3>
              <p className="text-xs text-white/70">Start your scenario intake and receive optimal decision recommendations.</p>
            </div>

            <Link
              href="/intake"
              className="rounded-full bg-white text-[#1B133C] px-8 py-3.5 text-sm font-semibold hover:bg-slate-100 transition-all shrink-0"
            >
              Start AI Consultation →
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#FAFAF8] py-8 px-6 text-center text-xs text-[#1B133C]/50 border-t border-[#1B133C]/10">
        <div>EON EXEA &copy; 2026. AI Maritime Supply Decision Platform. All rights reserved.</div>
      </footer>

    </div>
  )
}
