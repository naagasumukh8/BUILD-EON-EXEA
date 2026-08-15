'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [demoTab, setDemoTab] = useState<'prompt' | 'map' | 'evaluator' | 'optimizer'>('prompt')
  const [samplePrompt, setSamplePrompt] = useState('We need 2 million barrels of low-sulfur diesel delivered to Mumbai, India within 7 days. Primary supply from Ras Tanura.')

  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] text-[#18181B] font-sans selection:bg-[#18181B] selection:text-white">

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO LANDING — Video + Overlaid Content (100vh)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-between" id="hero">
        
        {/* Background Ocean Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 w-full h-[130%] object-cover object-top opacity-55 pointer-events-none"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient Scrim for Editorial Contrast */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#FAFAF8]/40 via-[#FAFAF8]/70 to-[#FAFAF8] pointer-events-none" />

        {/* Floating Header Navigation */}
        <header className="relative z-10 w-full pt-4 md:pt-6 px-4 flex justify-center">
          <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-2xl px-5 md:px-7 py-3.5 shadow-xs border border-[#18181B]/10 flex items-center justify-between gap-4">
            
            {/* EON EXEA Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg className="w-6 h-6 text-[#18181B] transition-transform group-hover:scale-105" viewBox="0 0 256 256" fill="none">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" opacity="0.55" />
              </svg>
              <span className="font-['Instrument_Serif'] text-2xl font-normal tracking-wide text-[#18181B]">
                EON EXEA
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <a href="#hero" className="text-[#18181B]/75 hover:text-[#18181B] transition-colors">
                Overview
              </a>
              <a href="#story" className="text-[#18181B]/75 hover:text-[#18181B] transition-colors">
                Disruption
              </a>
              <a href="#demo" className="text-[#18181B]/75 hover:text-[#18181B] transition-colors">
                Interactive Workspace
              </a>
              <Link href="/intake" className="text-[#18181B]/75 hover:text-[#18181B] transition-colors">
                AI Consultation
              </Link>
            </nav>

            {/* Nav CTA */}
            <Link
              href="/intake"
              className="rounded-full bg-[#18181B] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-black transition-all"
            >
              Start Analysis →
            </Link>
          </div>
        </header>

        {/* Hero Body Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-6 md:mt-10 mb-12 max-w-4xl mx-auto space-y-6">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#18181B]/15 bg-white/90 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-medium text-[#18181B] shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI MARITIME SUPPLY DECISION PLATFORM</span>
            <span className="text-[#18181B]/30">·</span>
            <span className="text-[#18181B]/70">OR-Tools Solver & Gemini AI</span>
          </div>

          {/* Heading */}
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-6xl lg:text-7xl text-[#18181B] leading-[1.05] font-normal tracking-tight">
            When a supply route breaks,<br />
            <em className="italic font-light opacity-90">find the fastest way forward.</em>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#18181B]/80 max-w-2xl mx-auto font-light leading-relaxed">
            Eliminate uncertainty in maritime supply disruptions. EON EXEA evaluates vessel candidates, pipeline bypasses, and alternate sea lanes &mdash; simultaneously &mdash; and surfaces the optimal decision in minutes.
          </p>

          {/* Hero Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/intake"
              className="rounded-full bg-[#18181B] px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-black transition-all flex items-center gap-2"
            >
              Launch AI Workspace
              <span className="text-lg">&rarr;</span>
            </Link>
            <a
              href="#demo"
              className="rounded-full bg-white/90 border border-[#18181B]/15 px-7 py-4 text-base font-semibold text-[#18181B] shadow-xs hover:bg-white transition-all"
            >
              Explore Interactive Demo
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-6 text-center text-xs font-medium text-[#18181B]/50 uppercase tracking-widest">
          Scroll to explore ↓
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: GOOGLE OPAL-INSPIRED STORY & DISRUPTION TILES
          ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#FAFAF8] py-24 px-6 md:px-12 text-[#18181B] border-t border-[#18181B]/10" id="story">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B]/5 border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B]">
              Disruption Intelligence
            </div>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl lg:text-6xl text-[#18181B] leading-tight">
              Real-time optimization when global chokepoints close.
            </h2>
            <p className="text-base sm:text-lg text-[#18181B]/70 font-light leading-relaxed">
              From Bab-el-Mandeb to the Strait of Hormuz, maritime bottlenecks disrupt millions of barrels daily. EON EXEA replaces slow manual spreadsheet calculations with instant, deterministic multi-modal decision optimization.
            </p>
          </div>

          {/* 4 Feature Story Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tile 1 */}
            <div className="bg-white p-7 rounded-3xl border border-[#18181B]/10 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-2xl font-bold">
                📦
              </div>
              <div className="space-y-2">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Natural Language Intake</h3>
                <p className="text-xs sm:text-sm text-[#18181B]/70 leading-relaxed">
                  State demand requirements in plain text. Gemini AI extracts commodity volume, destination, and deadline instantly.
                </p>
              </div>
              <div className="text-xs font-medium text-[#18181B]/50 uppercase tracking-wider">Sub-60s Execution</div>
            </div>

            {/* Tile 2 */}
            <div className="bg-white p-7 rounded-3xl border border-[#18181B]/10 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center text-2xl font-bold">
                🗺️
              </div>
              <div className="space-y-2">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">AIS Vessel Discovery</h3>
                <p className="text-xs sm:text-sm text-[#18181B]/70 leading-relaxed">
                  Track live AIS candidate vessels, pipeline bypasses, and chokepoint delays with complete data provenance tags.
                </p>
              </div>
              <div className="text-xs font-medium text-[#18181B]/50 uppercase tracking-wider">Provenance Audited</div>
            </div>

            {/* Tile 3 */}
            <div className="bg-white p-7 rounded-3xl border border-[#18181B]/10 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                ⚖️
              </div>
              <div className="space-y-2">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Deterministic P&L</h3>
                <p className="text-xs sm:text-sm text-[#18181B]/70 leading-relaxed">
                  Calculates landed cost, expected margin %, target price negotiation ceilings, and GO/NEGOTIATE/REJECT verdicts.
                </p>
              </div>
              <div className="text-xs font-medium text-[#18181B]/50 uppercase tracking-wider">100% Arithmetic</div>
            </div>

            {/* Tile 4 */}
            <div className="bg-white p-7 rounded-3xl border border-[#18181B]/10 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-700 flex items-center justify-center text-2xl font-bold">
                ⚙️
              </div>
              <div className="space-y-2">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">OR-Tools Optimizer</h3>
                <p className="text-xs sm:text-sm text-[#18181B]/70 leading-relaxed">
                  Solves continuous linear capacity allocation across vessels and pipelines to maximize on-time volume fulfillment.
                </p>
              </div>
              <div className="text-xs font-medium text-[#18181B]/50 uppercase tracking-wider">Hybrid Routing</div>
            </div>

          </div>

          {/* Key Industry Impact Stats Banner */}
          <div className="p-8 md:p-10 rounded-3xl bg-white border border-[#18181B]/10 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="space-y-1">
              <div className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">21%</div>
              <div className="text-xs sm:text-sm text-[#18181B]/70">Global oil trade passing through Strait of Hormuz</div>
            </div>
            <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-[#18181B]/10 py-6 sm:py-0">
              <div className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">2.5M bbl</div>
              <div className="text-xs sm:text-sm text-[#18181B]/70">Daily capacity on Yanbu / IPSA bypass pipeline</div>
            </div>
            <div className="space-y-1">
              <div className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">$170M</div>
              <div className="text-xs sm:text-sm text-[#18181B]/70">Average baseline savings vs single-route fallback</div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: GOOGLE OPAL-STYLE INTERACTIVE WORKSPACE DEMO
          ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#F4F4F0] py-24 px-6 md:px-12 text-[#18181B] border-t border-[#18181B]/10" id="demo">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
              Interactive Workflow
            </div>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
              Experience the EON EXEA Workspace
            </h2>
            <p className="text-sm text-[#18181B]/70">
              Select a step below to inspect how AI intake, AIS discovery, P&L evaluator, and OR-Tools optimization operate.
            </p>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-white/80 p-2 rounded-full border border-[#18181B]/10 max-w-3xl mx-auto shadow-xs">
            <button
              onClick={() => setDemoTab('prompt')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                demoTab === 'prompt' ? 'bg-[#18181B] text-white shadow-sm' : 'text-[#18181B]/70 hover:text-[#18181B]'
              }`}
            >
              1. AI Prompt Intake
            </button>

            <button
              onClick={() => setDemoTab('map')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                demoTab === 'map' ? 'bg-[#18181B] text-white shadow-sm' : 'text-[#18181B]/70 hover:text-[#18181B]'
              }`}
            >
              2. AIS Vessel Map
            </button>

            <button
              onClick={() => setDemoTab('evaluator')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                demoTab === 'evaluator' ? 'bg-[#18181B] text-white shadow-sm' : 'text-[#18181B]/70 hover:text-[#18181B]'
              }`}
            >
              3. P&L Evaluator
            </button>

            <button
              onClick={() => setDemoTab('optimizer')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                demoTab === 'optimizer' ? 'bg-[#18181B] text-white shadow-sm' : 'text-[#18181B]/70 hover:text-[#18181B]'
              }`}
            >
              4. Strategy Solver
            </button>
          </div>

          {/* Demo Content Cards */}
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#18181B]/10 shadow-sm max-w-4xl mx-auto min-h-[380px] flex flex-col justify-between">
            
            {/* TAB 1: PROMPT INTAKE */}
            {demoTab === 'prompt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]/50">Step 1 — Natural Language Requirement Extraction</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold">Gemini 2.5 Active</span>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#18181B]/70">Sample Operational Request:</label>
                  <textarea
                    rows={3}
                    value={samplePrompt}
                    onChange={(e) => setSamplePrompt(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#18181B]/10 text-center">
                    <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Commodity</div>
                    <div className="text-sm font-semibold text-[#18181B]">Low-Sulfur Diesel</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#18181B]/10 text-center">
                    <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Volume</div>
                    <div className="text-sm font-semibold text-[#18181B]">2,000,000 bbl</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#18181B]/10 text-center">
                    <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Destination</div>
                    <div className="text-sm font-semibold text-[#18181B]">Mumbai, India</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#18181B]/10 text-center">
                    <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Deadline</div>
                    <div className="text-sm font-semibold text-[#18181B]">7 Days</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AIS MAP */}
            {demoTab === 'map' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]/50">Step 2 — Discovered Vessels & Route Network</span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold">4 Discovered Options</span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#18181B]">Stena Bulk Charter (VLCC)</div>
                      <div className="text-xs text-[#18181B]/60">Djibouti Anchorage · 300,000 bbl · ETA 6 days</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold">CONFIRMED</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#18181B]">IPSA Bypass Pipeline</div>
                      <div className="text-xs text-[#18181B]/60">Yanbu Terminal · 400,000 bbl · ETA 3 days</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-bold">REAL_REFERENCE</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#18181B]">MV Atlantic Pioneer</div>
                      <div className="text-xs text-[#18181B]/60">Arabian Sea · 500,000 bbl · ETA 4 days</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold">CANDIDATE_UNVERIFIED</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: P&L EVALUATOR */}
            {demoTab === 'evaluator' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]/50">Step 3 — Deterministic P&L & Negotiation Ceiling</span>
                  <span className="px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold">VERDICT: NEGOTIATE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-xs text-[#18181B]/60">Quoted Freight</div>
                    <div className="text-2xl font-bold text-[#18181B]">$40.00 / bbl</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-xs text-[#18181B]/60">Target Ceiling</div>
                    <div className="text-2xl font-bold text-[#18181B]">$25.00 / bbl</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-xs text-[#18181B]/60">Expected Profit</div>
                    <div className="text-2xl font-bold text-emerald-700">$24,250,000</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>Negotiation Insight:</strong> Quoted price ($40.00/bbl) exceeds target ceiling by $15.00/bbl. Counterparty has spare capacity — negotiate freight down to target ceiling of $1,250,000 total ($25.00/bbl) to meet 10% target margin.
                </div>
              </div>
            )}

            {/* TAB 4: OR-TOOLS OPTIMIZER */}
            {demoTab === 'optimizer' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]/50">Step 4 — OR-Tools Multi-Modal Hybrid Allocation</span>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold">100% On-Time Fulfillment</span>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#18181B]">Optimal Hybrid Strategy (Rank 1):</div>
                  <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-3">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>30% Stena Bulk + 40% IPSA Pipeline + 30% Cape Route</span>
                      <span className="text-emerald-700 font-bold">$4,730.00 / bbl</span>
                    </div>

                    <div className="w-full bg-[#18181B]/10 h-3 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: '30%' }} title="30% Stena Bulk" />
                      <div className="bg-blue-500 h-full" style={{ width: '40%' }} title="40% IPSA Pipeline" />
                      <div className="bg-purple-500 h-full" style={{ width: '30%' }} title="30% Cape Route" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#18181B]/70 pt-1">
                      <span>Total Cost: $4,730,000,000</span>
                      <span className="font-bold text-emerald-700">Baseline Savings: +$170,000,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Direct Route Launch Button */}
            <div className="pt-6 border-t border-[#18181B]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#18181B]/60">
                Ready to run this analysis on your own operational data?
              </div>
              <Link
                href="/intake"
                className="rounded-full bg-[#18181B] px-7 py-3 text-sm font-semibold text-white hover:bg-black transition-all shadow-sm shrink-0"
              >
                Launch Full Workspace →
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#FAFAF8] py-10 px-6 text-center text-xs text-[#18181B]/50 border-t border-[#18181B]/10">
        <div>EON EXEA &copy; 2026. AI Maritime Supply Decision Platform. All rights reserved.</div>
      </footer>

    </div>
  )
}
