'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#0b1110] text-[#fdf1e1] font-sans selection:bg-[#fdf1e1] selection:text-[#111411]">
      
      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — EON EXEA Cinematic Video Layer
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Background Ocean Stream Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 w-full h-[130%] object-cover object-top opacity-60 pointer-events-none"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Atmospheric Scrim Overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0b1110]/50 via-[#0b1110]/80 to-[#0b1110] pointer-events-none" />

        {/* Floating Header Navigation */}
        <header className="relative z-10 w-full pt-4 md:pt-6 px-4 flex justify-center">
          <div className="w-full max-w-5xl bg-[#0f1a26]/75 backdrop-blur-xl rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[rgba(253,241,225,0.18)] flex items-center justify-between gap-4">
            
            {/* EON EXEA Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg className="w-6 h-6 text-[#fdf1e1] transition-transform group-hover:scale-105" viewBox="0 0 256 256" fill="none">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" opacity="0.55" />
              </svg>
              <span className="title-ogg text-xl tracking-wider text-[#fdf1e1]">
                EON EXEA
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <Link href="/map" className="text-[#fdf1e1]/75 hover:text-[#fdf1e1] transition-colors">
                Network Map
              </Link>
              <Link href="/intake" className="text-[#fdf1e1]/75 hover:text-[#fdf1e1] transition-colors">
                AI Consultation
              </Link>
              <Link href="/deals/new" className="text-[#fdf1e1]/75 hover:text-[#fdf1e1] transition-colors">
                Deal Evaluator
              </Link>
              <Link href="/strategy" className="text-[#fdf1e1]/75 hover:text-[#fdf1e1] transition-colors">
                Strategy Optimizer
              </Link>
            </nav>

            {/* Nav CTA */}
            <Link
              href="/intake"
              className="btn-paper text-xs sm:text-sm py-2 px-5 font-semibold"
            >
              Start Analysis →
            </Link>
          </div>
        </header>

        {/* Hero Body Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-6 md:mt-12 mb-12 max-w-4xl mx-auto space-y-6">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(253,241,225,0.25)] bg-[#0f1a26]/80 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-medium text-[#fdf1e1] shadow-lg animate-fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>AI MARITIME DECISION NETWORK</span>
            <span className="text-[#fdf1e1]/40">·</span>
            <span className="text-[#fdf1e1]/75">OR-Tools Solver & Gemini AI Active</span>
          </div>

          {/* Heading */}
          <h1 className="title-ogg text-4xl sm:text-6xl lg:text-7xl text-[#fdf1e1] leading-tight font-normal">
            When a supply route breaks,<br />
            <em className="italic font-light opacity-90">find the fastest way forward.</em>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#fdf1e1]/75 max-w-2xl mx-auto font-light leading-relaxed">
            Eliminate uncertainty in maritime supply disruptions. EON EXEA evaluates vessel candidates, pipeline bypasses, and alternate sea lanes &mdash; simultaneously &mdash; and surfaces the optimal decision in minutes.
          </p>

          {/* Hero Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/intake"
              className="btn-paper text-base px-8 py-4 font-semibold shadow-paper"
            >
              Launch AI Workspace →
            </Link>
            <Link
              href="/map"
              className="btn-glass text-base px-7 py-4"
            >
              🗺️ Explore Network Map
            </Link>
          </div>
        </div>

        {/* Bottom Feature Metrics Bar */}
        <div className="relative z-10 pb-8 px-4 w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f1a26]/70 border border-[rgba(253,241,225,0.15)] backdrop-blur-xl text-center space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">Supply Disruption</div>
              <div className="title-ogg text-3xl font-semibold text-[#fdf1e1]">21% Global Trade</div>
              <div className="text-xs text-[#fdf1e1]/60">Monitored near choke points</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1a26]/70 border border-[rgba(253,241,225,0.15)] backdrop-blur-xl text-center space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">OR-Tools Solver</div>
              <div className="title-ogg text-3xl font-semibold text-[#fdf1e1]">100% Deterministic</div>
              <div className="text-xs text-[#fdf1e1]/60">Continuous capacity allocation</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1a26]/70 border border-[rgba(253,241,225,0.15)] backdrop-blur-xl text-center space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">Decision Speed</div>
              <div className="title-ogg text-3xl font-semibold text-[#fdf1e1]">Sub-60s Analysis</div>
              <div className="text-xs text-[#fdf1e1]/60">Instant scenario evaluation</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
