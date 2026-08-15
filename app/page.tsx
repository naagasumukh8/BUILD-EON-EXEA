'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'

function LandingContent() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans selection:bg-[#18181B] selection:text-white relative">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[130%] object-cover object-top opacity-30"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/70 via-[#FAFAF8]/90 to-[#FAFAF8]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 max-w-6xl w-full mx-auto py-12 sm:py-20 space-y-16 sm:space-y-24">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-4xl">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#18181B]/10 text-xs font-medium text-[#18181B] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Wide Hormuz Platform &middot; Strait of Hormuz Energy Security</span>
            </div>

            {/* Title */}
            <h1 className="font-['Instrument_Serif'] text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-[#18181B]">
              When a supply route breaks, <br />
              <span className="italic font-normal">find the fastest way forward.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-[#18181B]/70 font-light max-w-2xl mx-auto leading-relaxed">
              Eliminate uncertainty in maritime supply chain disruptions. Wide Hormuz evaluates vessel candidates, pipeline bypasses, and alternate sea lanes simultaneously and surfaces the optimal decision in minutes.
            </p>

            {/* Primary Action Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/intake"
                className="w-full sm:w-auto rounded-full bg-[#18181B] px-8 py-4 text-sm font-semibold text-white shadow-md hover:bg-black transition-all duration-200"
              >
                Launch Decision Platform &rarr;
              </Link>
              
              <Link
                href="/map"
                className="w-full sm:w-auto rounded-full bg-white/90 backdrop-blur-md border border-[#18181B]/10 px-8 py-4 text-sm font-semibold text-[#18181B] hover:bg-[#FAFAF8] transition-all"
              >
                Explore Disruption Map &rarr;
              </Link>
            </div>

          </div>

          {/* Four Core Capabilities Section */}
          <div className="w-full space-y-8">
            
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50">
                Platform Capabilities
              </span>
              <h2 className="font-['Instrument_Serif'] text-3xl sm:text-5xl text-[#18181B]">
                How Wide Hormuz Solves Disruptions
              </h2>
              <p className="text-sm text-[#18181B]/60 max-w-lg mx-auto font-light">
                Four core decision layers working together to minimize cost, delay, and operational risk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Capability 01 */}
              <GlassPanel className="p-8 space-y-4 hover:border-[#18181B]/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#18181B]/40 font-bold">01</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#18181B]/5 text-[10px] font-bold uppercase tracking-wider text-[#18181B]/70">
                    Intake
                  </span>
                </div>
                
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                  Natural Language Prompt Intake
                </h3>
                
                <p className="text-xs text-[#18181B]/70 leading-relaxed font-light">
                  State your operational demand in plain text (e.g. &quot;2M barrels of diesel to Mumbai within 7 days&quot;). Natural language intake extracts commodity volume, destination, and delivery deadline in seconds.
                </p>
              </GlassPanel>

              {/* Capability 02 */}
              <GlassPanel className="p-8 space-y-4 hover:border-[#18181B]/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#18181B]/40 font-bold">02</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#18181B]/5 text-[10px] font-bold uppercase tracking-wider text-[#18181B]/70">
                    Discovery
                  </span>
                </div>

                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                  AIS Vessel & Pipeline Tracking
                </h3>

                <p className="text-xs text-[#18181B]/70 leading-relaxed font-light">
                  Tracks live AIS candidate vessels, Yanbu IPSA pipeline bypass throughput, and alternate sea lanes to construct real-time supply availability.
                </p>
              </GlassPanel>

              {/* Capability 03 */}
              <GlassPanel className="p-8 space-y-4 hover:border-[#18181B]/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#18181B]/40 font-bold">03</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#18181B]/5 text-[10px] font-bold uppercase tracking-wider text-[#18181B]/70">
                    Evaluation
                  </span>
                </div>

                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                  Commercial Deal Evaluator
                </h3>

                <p className="text-xs text-[#18181B]/70 leading-relaxed font-light">
                  Calculates landed cost per barrel, net margin, and ceiling price for charter proposals. Instantly outputs GO, NEGOTIATE, or REJECT recommendations.
                </p>
              </GlassPanel>

              {/* Capability 04 */}
              <GlassPanel className="p-8 space-y-4 hover:border-[#18181B]/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#18181B]/40 font-bold">04</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#18181B]/5 text-[10px] font-bold uppercase tracking-wider text-[#18181B]/70">
                    Optimization
                  </span>
                </div>

                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                  Multi-Modal Strategy Solver
                </h3>

                <p className="text-xs text-[#18181B]/70 leading-relaxed font-light">
                  Google OR-Tools solver optimizes continuous linear volume allocations across pipelines, vessels, and alternate routes to maximize savings and speed.
                </p>
              </GlassPanel>

            </div>

            {/* Clean Impact Banner with Provenance Tags */}
            <div className="p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-[#18181B]/10 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-['Instrument_Serif'] text-4xl text-[#18181B]">21%</div>
                <div className="text-xs text-[#18181B]/60 mt-1">Global oil trade passing Hormuz</div>
                <div className="text-[10px] text-[#18181B]/40 font-mono mt-1 uppercase font-bold">EIA REAL_REFERENCE</div>
              </div>
              <div className="border-y sm:border-y-0 sm:border-x border-[#18181B]/10 py-4 sm:py-0">
                <div className="font-['Instrument_Serif'] text-4xl text-[#18181B]">2.5M bbl/day</div>
                <div className="text-xs text-[#18181B]/60 mt-1">IPSA bypass pipeline capacity</div>
                <div className="text-[10px] text-[#18181B]/40 font-mono mt-1 uppercase font-bold">ARAMCO REAL_REFERENCE</div>
              </div>
              <div>
                <div className="font-['Instrument_Serif'] text-4xl text-[#18181B]">$170M</div>
                <div className="text-xs text-[#18181B]/60 mt-1">Average baseline savings</div>
                <div className="text-[10px] text-[#18181B]/40 font-mono mt-1 uppercase font-bold">MODEL CALCULATED ESTIMATE</div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="p-8 rounded-3xl bg-[#18181B] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-['Instrument_Serif'] text-3xl text-white">Ready to run your disruption analysis?</h3>
                <p className="text-xs text-white/70 font-light">Start your scenario intake and receive optimal decision recommendations.</p>
              </div>

              <Link
                href="/intake"
                className="rounded-full bg-white px-8 py-3.5 text-xs font-semibold text-[#18181B] hover:bg-[#FAFAF8] transition-all whitespace-nowrap"
              >
                Start Analysis &rarr;
              </Link>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Wide Hormuz Platform...</div>}>
      <LandingContent />
    </Suspense>
  )
}
