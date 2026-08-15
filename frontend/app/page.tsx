'use client'

import { Suspense } from 'react'
import Link from 'next/link'

function LandingContent() {
  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between font-sans text-[#1B133C] bg-[#FAFAF8] selection:bg-[#1B133C] selection:text-white">
      
      {/* 3. Background Video — absolutely positioned behind all content */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-[130%] object-cover object-top opacity-40"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/30 via-[#FAFAF8]/60 to-[#FAFAF8]/95" />
      </div>

      {/* 1. Navigation Bar — centered at top with pt-4 md:pt-6 */}
      <header className="relative z-10 w-full pt-4 md:pt-6 flex justify-center px-4">
        <div className="bg-white/70 backdrop-blur-md rounded-xl px-4 md:px-6 py-3 shadow-sm border border-[#1B133C]/10 flex items-center justify-between gap-6 max-w-4xl w-full">
          
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <svg width="24" height="24" viewBox="0 0 256 256" fill="none" className="text-[#1B133C] transition-transform group-hover:scale-105">
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
              <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
            </svg>
            <span className="font-['Instrument_Serif'] text-xl font-bold tracking-tight text-[#1B133C]">
              Wide Hormuz
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#1B133C]/80">
            <Link href="/" className="hover:text-[#1B133C] transition-opacity">
              Overview
            </Link>
            <Link href="/intake" className="hover:text-[#1B133C] transition-opacity">
              Capabilities
            </Link>
            <Link href="/map" className="hover:text-[#1B133C] transition-opacity">
              Map Network
            </Link>
            <Link href="/report" className="hover:text-[#1B133C] transition-opacity">
              AI Briefing
            </Link>
          </nav>

          {/* Action Link */}
          <Link
            href="/intake"
            className="rounded-lg bg-[#1B133C] px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-all shrink-0"
          >
            Start Analysis &rarr;
          </Link>

        </div>
      </header>

      {/* 2. Hero Content — centered below nav with mt-8 md:mt-16 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center my-auto max-w-5xl mx-auto">
        
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-xl border border-[#1B133C]/10 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm font-medium text-[#1B133C] shadow-2xs">
          <span className="bg-orange-500 rounded w-5 h-5 flex items-center justify-center text-white font-bold text-xs shrink-0">
            Y
          </span>
          <span>Funded by Y Combinator &middot; Hormuz Disruption Platform</span>
        </div>

        {/* Heading */}
        <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-[#1B133C] max-w-4xl">
          Deploy digital workers <br />
          <span className="italic font-normal">for energy supply disruptions</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-[#1B133C]/70 font-light">
          Eliminate your tedious browser work and 10x your team&apos;s capacity. Put intelligent agents on every routine process so you grow faster and deliver more for clients — effortlessly.
        </p>

        {/* CTA Button */}
        <Link
          href="/intake"
          className="mt-7 sm:mt-8 rounded-xl bg-[#FEFEFE] px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-semibold text-[#1B133C] shadow-[0px_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.2)] transition-all duration-300"
        >
          Get Early Access &rarr;
        </Link>

      </main>

      {/* Footer minimal spacer for 100vh layout */}
      <footer className="relative z-10 pb-4 text-center text-[11px] text-[#1B133C]/40">
        Wide Hormuz &copy; 2026. AI Maritime Decision Platform.
      </footer>

    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#1B133C]/70">Loading Wide Hormuz...</div>}>
      <LandingContent />
    </Suspense>
  )
}
