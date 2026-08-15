'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] text-[#18181B] font-sans selection:bg-[#18181B] selection:text-white">

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — Full Viewport (100vh) Video & Clean Content
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-between" id="hero">
        
        {/* Background Ocean Stream Video — Vivid Visibility */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 w-full h-[130%] object-cover object-top opacity-95 pointer-events-none"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
            type="video/mp4"
          />
        </video>

        {/* Lightweight Gradient Overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#FAFAF8]/10 via-[#FAFAF8]/25 to-[#FAFAF8] pointer-events-none" />

        {/* Floating Navigation Bar */}
        <header className="relative z-10 w-full pt-5 px-4 flex justify-center">
          <div className="w-full max-w-5xl bg-white/85 backdrop-blur-xl rounded-full px-6 py-3.5 shadow-md border border-[#18181B]/10 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg className="w-6 h-6 text-[#18181B] transition-transform group-hover:scale-105" viewBox="0 0 256 256" fill="none">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" opacity="0.55" />
              </svg>
              <span className="font-['Instrument_Serif'] text-2xl font-semibold tracking-wide text-[#18181B]">
                EON EXEA
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-8 text-sm font-semibold">
              <a href="#hero" className="text-[#18181B]/85 hover:text-[#18181B] transition-colors">
                Overview
              </a>
              <a href="#capabilities" className="text-[#18181B]/85 hover:text-[#18181B] transition-colors">
                Capabilities
              </a>
              <Link href="/intake" className="text-[#18181B]/85 hover:text-[#18181B] transition-colors">
                AI Consultation
              </Link>
            </nav>

            {/* Nav CTA */}
            <Link
              href="/intake"
              className="rounded-full bg-[#18181B] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-black transition-all"
            >
              Start Analysis &rarr;
            </Link>
          </div>
        </header>

        {/* Hero Body Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto space-y-6">
          
          {/* Status Descriptor Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#18181B]/15 bg-white/90 backdrop-blur-md px-4.5 py-2 text-xs sm:text-sm font-semibold text-[#18181B] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#18181B]" />
            <span>AI MARITIME DECISION PLATFORM</span>
          </div>

          {/* Core Hero Message */}
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-6xl lg:text-7xl text-[#18181B] leading-[1.05] font-normal tracking-tight drop-shadow-xs">
            Find the best way<br />
            <em className="italic font-light opacity-95">to move your energy.</em>
          </h1>

          {/* Supporting Statement */}
          <p className="text-base sm:text-xl text-[#18181B]/90 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-xs">
            EON EXEA evaluates vessels, pipelines, alternate routes, and spot suppliers simultaneously to determine the most economically viable strategy for your energy supply requirements.
          </p>

          {/* Primary Action Button */}
          <div className="pt-3">
            <Link
              href="/intake"
              className="rounded-full bg-[#18181B] px-9 py-4 text-base font-semibold text-white shadow-lg hover:bg-black hover:scale-[1.02] transition-all flex items-center gap-2.5"
            >
              Start Analysis
              <span className="text-lg">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-6 text-center text-xs font-bold text-[#18181B]/60 uppercase tracking-widest">
          Scroll to explore ↓
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: CORE CAPABILITIES (Clean Editorial Cards)
          ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#FAFAF8] py-24 px-6 md:px-12 text-[#18181B] border-t border-[#18181B]/10" id="capabilities">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181B]/5 border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B]">
              Decision Infrastructure
            </div>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B] leading-tight">
              Multi-Modal Energy Supply Optimization
            </h2>
            <p className="text-base text-[#18181B]/70 font-light leading-relaxed">
              Four integrated intelligence layers designed for energy procurement, trading, and chartering teams.
            </p>
          </div>

          {/* 4 Clean Editorial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 01 */}
            <div className="p-8 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40">01 &middot; INTAKE & SPECIFICATION</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Natural Language Supply Intake</h3>
              <p className="text-sm text-[#18181B]/70 leading-relaxed font-light">
                State your operational energy requirement in plain text. Gemini parses commodity specifications, volume targets, discharge ports, and delivery deadlines into structured parameters.
              </p>
            </div>

            {/* 02 */}
            <div className="p-8 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40">02 &middot; MARITIME NETWORK DISCOVERY</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">AIS Vessel & Pipeline Tracking</h3>
              <p className="text-sm text-[#18181B]/70 leading-relaxed font-light">
                Monitors live AIS candidate vessels, Yanbu IPSA pipeline bypass capacity, and alternative transit corridors with transparent data provenance tags.
              </p>
            </div>

            {/* 03 */}
            <div className="p-8 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40">03 &middot; COMMERCIAL DEAL EVALUATOR</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Deterministic P&L & Ceiling Price</h3>
              <p className="text-sm text-[#18181B]/70 leading-relaxed font-light">
                Evaluates verified commercial quotes against target margins to compute landed cost per barrel, expected profit, maximum acceptable freight ceilings, and GO/NEGOTIATE/REJECT verdicts.
              </p>
            </div>

            {/* 04 */}
            <div className="p-8 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-[#18181B]/40">04 &middot; STRATEGY OPTIMIZER</div>
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">OR-Tools Hybrid Allocation</h3>
              <p className="text-sm text-[#18181B]/70 leading-relaxed font-light">
                Computes continuous linear allocations across vessels, pipelines, and alternate routes to maximize on-time delivery while generating executive decision briefings.
              </p>
            </div>

          </div>

          {/* Clean Metric Highlights */}
          <div className="p-8 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="font-['Instrument_Serif'] text-4xl text-[#18181B]">21%</div>
              <div className="text-xs text-[#18181B]/60 mt-1">Global oil trade passing Hormuz</div>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-[#18181B]/10 py-4 sm:py-0">
              <div className="font-['Instrument_Serif'] text-4xl text-[#18181B]">2.5M bbl/day</div>
              <div className="text-xs text-[#18181B]/60 mt-1">IPSA bypass pipeline capacity</div>
            </div>
            <div>
              <div className="font-['Instrument_Serif'] text-4xl text-[#18181B]">$170M</div>
              <div className="text-xs text-[#18181B]/60 mt-1">Average baseline savings</div>
            </div>
          </div>

          {/* Bottom Action Banner */}
          <div className="p-8 rounded-3xl bg-[#18181B] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-['Instrument_Serif'] text-3xl text-white">Evaluate your supply requirement</h3>
              <p className="text-xs text-white/70">Input operational parameters to generate optimized multi-modal strategies.</p>
            </div>

            <Link
              href="/intake"
              className="rounded-full bg-white text-[#18181B] px-8 py-3.5 text-sm font-semibold hover:bg-slate-100 transition-all shrink-0"
            >
              Start Analysis →
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#FAFAF8] py-8 px-6 text-center text-xs text-[#18181B]/50 border-t border-[#18181B]/10">
        <div>EON EXEA &copy; 2026. AI Maritime Decision Platform. All rights reserved.</div>
      </footer>

    </div>
  )
}
