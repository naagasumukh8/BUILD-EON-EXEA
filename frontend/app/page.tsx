'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [disruption, setDisruption] = useState('hormuz-blockage')
  const [step, setStep] = useState(1)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [volume, setVolume] = useState('2000')
  const [dest, setDest] = useState('MUM')
  const [product, setProduct] = useState('crude')
  const [deadline, setDeadline] = useState('14')
  const [origin, setOrigin] = useState('RAS')
  const [price, setPrice] = useState('82.50')
  const [vesselMode, setVesselMode] = useState('seeking')

  // Weights
  const [costWeight, setCostWeight] = useState(40)
  const [timeWeight, setTimeWeight] = useState(35)
  const [riskWeight, setRiskWeight] = useState(25)

  return (
    <div className="w-full min-h-screen bg-[#1B133C] text-[#1B133C] font-sans selection:bg-orange-500 selection:text-white">

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO LANDING — Full Viewport (100vh)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-between">

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 w-full h-[130%] object-cover object-top pointer-events-none"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/20 via-white/40 to-white/70 pointer-events-none" />

        {/* Header Navigation */}
        <header className="relative z-10 w-full pt-4 md:pt-6 px-4 flex justify-center">
          <div className="w-full max-w-4xl bg-white/70 backdrop-blur-md rounded-xl px-4 md:px-6 py-3 shadow-sm border border-[#1B133C]/10 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg className="w-6 h-6 text-[#1B133C] transition-transform group-hover:scale-105" viewBox="0 0 256 256" fill="none">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" opacity="0.55" />
              </svg>
              <span className="font-semibold tracking-wider text-base uppercase text-[#1B133C]">
                AXON
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-6">
              <a href="#hero" className="text-sm font-medium text-[#1B133C]/80 hover:text-[#1B133C] transition-opacity">
                Features
              </a>
              <a href="#disruption" className="text-sm font-medium text-[#1B133C]/80 hover:text-[#1B133C] transition-opacity">
                Plans
              </a>
              <a href="#analysis" className="text-sm font-medium text-[#1B133C]/80 hover:text-[#1B133C] transition-opacity">
                Security
              </a>
              <Link href="/intake" className="text-sm font-medium text-[#1B133C]/80 hover:text-[#1B133C] transition-opacity">
                AI Intake
              </Link>
            </nav>

            {/* Nav CTA */}
            <Link
              href="/intake"
              className="rounded-lg bg-[#1B133C] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#2d2060] transition-all"
            >
              Get Early Access
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-4 md:mt-8 mb-12">
          
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-xl border border-[#1B133C]/10 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm font-medium text-[#1B133C] shadow-sm animate-fade-in">
            <div className="bg-orange-500 rounded w-5 h-5 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              Y
            </div>
            <span>Funded by Y Combinator</span>
            <span className="text-[#1B133C]/40">·</span>
            <span className="text-[#1B133C]/80 font-normal">Axon Platform</span>
          </div>

          {/* Heading */}
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-[#1B133C] max-w-4xl">
            Deploy digital workers<br />
            <em className="italic text-[#1B133C]/85">for mundane workflows</em>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-6 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-[#1B133C]/70">
            Eliminate your tedious browser work and 10x your team&apos;s capacity. Put intelligent agents on every routine process so you grow faster and deliver more for clients — effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 sm:mt-8 flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/intake"
              className="rounded-xl bg-[#FEFEFE] px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold text-[#1B133C] shadow-[0px_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center gap-2 group"
            >
              <span>Get Early Access</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            <a
              href="#analysis"
              className="rounded-xl bg-white/60 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-medium text-[#1B133C] border border-[#1B133C]/10 hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <span>Explore Analysis Engine</span>
              <span>↓</span>
            </a>
          </div>

          {/* Capability Tags */}
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#1B133C]/60 flex-wrap justify-center">
            <span>Route Disruption</span>
            <span>·</span>
            <span>Hybrid Optimization</span>
            <span>·</span>
            <span>AI Decision Support</span>
          </div>

        </div>

        {/* Bottom Scroll Indicator */}
        <div className="relative z-10 pb-6 flex justify-center text-xs text-[#1B133C]/50">
          <span>Scroll to explore analysis engine ↓</span>
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: OPAL-INSPIRED STORY & FEATURE TILES
          ═══════════════════════════════════════════════════════════ */}
      <section id="disruption" className="w-full bg-[#f8f6f2] py-20 px-6 md:px-12 text-[#1B133C]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Disruption Narrative */}
          <div className="space-y-6">
            <div className="text-xs font-bold tracking-widest uppercase text-orange-600">
              CRITICAL SUPPLY DISRUPTION
            </div>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl leading-tight text-[#1B133C]">
              The route is disrupted.<br />
              <span className="italic opacity-80">The clock is running.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#1B133C]/70 leading-relaxed max-w-lg">
              Every hour of indecision has an escalating financial cost. Axon evaluates every feasible option — vessels, pipelines, alternate routes, and hybrid combinations — simultaneously.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-5 rounded-2xl border border-[#1B133C]/10 shadow-sm">
                <div className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-[#1B133C]">21%</div>
                <div className="text-xs text-[#1B133C]/60 mt-1">of global oil trade passes through Strait of Hormuz</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#1B133C]/10 shadow-sm">
                <div className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-[#1B133C]">2.5M</div>
                <div className="text-xs text-[#1B133C]/60 mt-1">bbl/day capacity on IPSA bypass pipeline</div>
              </div>
            </div>
          </div>

          {/* Right Column: Opal-Inspired Feature Tiles */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-[#1B133C]/10 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-xl shrink-0">
                ⏱
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1B133C]">Sub-60s Analysis</h3>
                <p className="text-xs sm:text-sm text-[#1B133C]/70 mt-1">
                  From disruption alert to ranked strategy options — in under a minute.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#1B133C]/10 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-xl shrink-0">
                ⚓
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1B133C]">Multi-modal Routing</h3>
                <p className="text-xs sm:text-sm text-[#1B133C]/70 mt-1">
                  Vessels, pipelines, and alternate suppliers evaluated as a unified system.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#1B133C]/10 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-xl shrink-0">
                ✦
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1B133C]">AI Explanation Layer</h3>
                <p className="text-xs sm:text-sm text-[#1B133C]/70 mt-1">
                  Every recommendation is explained with transparent, auditable reasoning.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: COMMAND CENTER & ANALYSIS ENGINE
          ═══════════════════════════════════════════════════════════ */}
      <section id="analysis" className="w-full bg-[#0a121c] py-20 px-6 md:px-12 text-[#fdf1e1]">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Section Title */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf1e1]/10 border border-[#fdf1e1]/20 text-xs text-[#fdf1e1] font-medium tracking-widest uppercase">
              Interactive Workspace
            </div>
            <h2 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#fdf1e1]">
              Maritime Command Center
            </h2>
            <p className="text-sm text-[#fdf1e1]/70">
              Run real-time scenario solver, optimize hybrid volume allocation, and generate decision reports.
            </p>
          </div>

          {/* Direct Actions Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/intake"
              className="p-6 rounded-2xl bg-[#0f1a26] border border-[#fdf1e1]/15 hover:border-[#fdf1e1]/40 transition-all space-y-3 group"
            >
              <div className="text-2xl">📦</div>
              <h3 className="font-semibold text-lg text-[#fdf1e1] group-hover:text-white flex items-center justify-between">
                <span>1. AI Requirement Intake</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </h3>
              <p className="text-xs text-[#fdf1e1]/60">
                Parse natural language demand requirements using Gemini 2.5 engine.
              </p>
            </Link>

            <Link
              href="/map"
              className="p-6 rounded-2xl bg-[#0f1a26] border border-[#fdf1e1]/15 hover:border-[#fdf1e1]/40 transition-all space-y-3 group"
            >
              <div className="text-2xl">🗺️</div>
              <h3 className="font-semibold text-lg text-[#fdf1e1] group-hover:text-white flex items-center justify-between">
                <span>2. Interactive Route Map</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </h3>
              <p className="text-xs text-[#fdf1e1]/60">
                Inspect AIS vessel tracking, pipeline bypasses, and chokepoints.
              </p>
            </Link>

            <Link
              href="/strategy"
              className="p-6 rounded-2xl bg-[#0f1a26] border border-[#fdf1e1]/15 hover:border-[#fdf1e1]/40 transition-all space-y-3 group"
            >
              <div className="text-2xl">⚙️</div>
              <h3 className="font-semibold text-lg text-[#fdf1e1] group-hover:text-white flex items-center justify-between">
                <span>3. Strategy Optimizer</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </h3>
              <p className="text-xs text-[#fdf1e1]/60">
                Compute OR-Tools hybrid allocation and generate executive decision report.
              </p>
            </Link>
          </div>

          {/* Quick Consultation Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#172535] to-[#0c1622] border border-[#fdf1e1]/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-['Instrument_Serif'] text-3xl text-[#fdf1e1]">Ready to run your analysis?</h3>
              <p className="text-xs sm:text-sm text-[#fdf1e1]/70 max-w-xl">
                State your operational demand in natural language (e.g., &quot;I need 2 million barrels of diesel delivered to India within 7 days&quot;) and let AI compute the optimal path.
              </p>
            </div>

            <Link
              href="/intake"
              className="whitespace-nowrap px-8 py-4 rounded-full bg-[#fdf1e1] text-[#111411] font-semibold text-sm hover:bg-white transition-all shadow-lg hover:shadow-xl shrink-0"
            >
              Start AI Intake Consultation →
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#070c13] py-8 px-6 text-center text-xs text-[#fdf1e1]/40 border-t border-[#fdf1e1]/10">
        <div>EON EXEA — Axon Digital Worker Platform &copy; 2026. All rights reserved.</div>
      </footer>

    </div>
  )
}
