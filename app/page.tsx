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
            <a href="#features" className="hover:text-white transition-colors">Strategy Families</a>
            <a href="#decision" className="hover:text-white transition-colors">Executive Preview</a>
            <Link href="/map" className="hover:text-white transition-colors">Live Map Network</Link>
          </nav>

          <Link href="/intake"
            className="rounded-sm bg-white px-5 py-2.5 text-[13px] font-semibold text-black hover:bg-white/90 transition-all">
            Start Requirement Intake
          </Link>
        </header>

        {/* Hero Content */}
        <main className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 py-20 max-w-6xl">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
              Strait of Hormuz: Sustained Disruption Protocol Active
            </span>
          </div>

          <h1 className="font-['Instrument_Serif'] text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[1.0] tracking-tight text-white max-w-5xl">
            When the world&apos;s main oil route closes, most buyers know one move. <span className="text-sky-400">POLY EXEA</span> finds the other <span className="text-sky-400">nineteen</span>.
          </h1>

          <p className="mt-8 text-[15px] sm:text-base leading-relaxed text-white/55 max-w-2xl font-light">
            An energy supply decision platform that calculates pipelines, ship-to-ship transfers, backhaul loops, and alternate origins, returning mathematically verified strategies in minutes, not days.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <a href="https://drive.google.com/file/d/1tT0dmzhF2pGDpCeXixenK81ioJpk4CFn/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-sky-400 px-8 py-4 text-[13px] font-bold text-black hover:bg-sky-300 transition-all shadow-lg shadow-sky-400/30">
              Watch Demo Video
            </a>
            <Link href="/intake"
              className="rounded-sm border border-white/20 px-7 py-4 text-[13px] font-semibold text-white/70 hover:text-white hover:border-white/40 transition-all">
              Start Requirement Intake
            </Link>
          </div>
        </main>

        {/* Stat Row */}
        <div className="relative z-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4">
          {[
            { value: '20%', label: 'of global oil moves through one 33km strait' },
            { value: '+14 days', label: 'added transit time via Cape bypass' },
            { value: '20 strategies', label: 'evaluated per scenario by the OR-Tools solver' },
            { value: '4-7 days', label: 'until refineries hit inventory drawdown without a plan' },
          ].map((stat) => (
            <div key={stat.label} className="px-8 py-6 border-r border-white/10 last:border-r-0">
              <div className="font-['Instrument_Serif'] text-2xl text-white">{stat.value}</div>
              <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>


      {/* ── THE PROBLEM ─────────────────────────────────────────────── */}
      <section id="problem" className="py-24 px-8 md:px-16 bg-white border-b border-[#18181B]/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">The Problem</span>
          <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,4.5vw,3.2rem)] leading-tight text-[#18181B]">
            Rerouting isn&apos;t the only option. It&apos;s just the only one calculated today.
          </h2>
          <p className="text-lg text-[#18181B]/80 font-light leading-relaxed max-w-3xl mx-auto">
            Most buyers do one thing when Hormuz closes: reroute around the Cape of Good Hope. That adds 14-20 days and $12-18/bbl. Existing infrastructure (pipelines, swaps, and backhaul capacity worth 6.5M bbl/day) goes uncalculated. POLY EXEA calculates it.
          </p>
        </div>
      </section>


      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-8 md:px-16 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">How It Works</span>
          <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-white mt-4 max-w-3xl">
            From plain English to exact mathematical allocation in four steps.
          </h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {[
              {
                n: '01',
                title: 'Natural Language Intake',
                body: 'State your requirement in plain English. Missing fields are marked NOT SPECIFIED, never guessed.',
              },
              {
                n: '02',
                title: 'Live AIS Vessel Discovery',
                body: 'Candidate vessels surfaced from real position data. Spare capacity is never assumed, only confirmed by a human.',
              },
              {
                n: '03',
                title: '20-Strategy Discovery',
                body: 'Every physical and commercial option scanned across four families: reroute, swap, network, retime.',
              },
              {
                n: '04',
                title: 'Deterministic Optimization',
                body: 'Google OR-Tools computes the exact allocation, cost, and profit. The AI explains it, it never calculates it.',
              },
            ].map((step) => (
              <div key={step.n} className="bg-[#0F0F0F] p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-['Instrument_Serif'] text-5xl text-white/10">{step.n}</div>
                  <div className="text-[13px] font-bold uppercase tracking-wider text-white">{step.title}</div>
                  <p className="text-[13px] text-white/60 font-light leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/intake"
              className="inline-block rounded-sm bg-white px-8 py-4 text-[13px] font-semibold text-black hover:bg-white/90 transition-all">
              Start Requirement Intake
            </Link>
          </div>
        </div>
      </section>


      {/* ── STRATEGY FAMILIES ────────────────────────────────────────── */}
      <section id="features" className="py-28 px-8 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]/40">Strategy Families</span>
          <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#18181B] mt-4 max-w-3xl">
            20 options structured across four commercial families.
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                family: 'Move Differently',
                desc: 'Pipeline bypass, ship-to-ship transfer, alternate maritime routes.'
              },
              {
                family: "Don't Move Your Cargo",
                desc: 'Alternate origins, inventory swaps, stock draws.'
              },
              {
                family: 'Use the Network',
                desc: 'Divert a transiting vessel, backhaul capacity, closed-loop triangulation.'
              },
              {
                family: 'Change Timing',
                desc: 'Alternate discharge hub, wait-and-bypass economics, multi-modal hybrids.'
              },
            ].map((f) => (
              <div key={f.family} className="border border-[#18181B]/15 p-8 space-y-3 bg-[#FAFAF8]">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">{f.family}</h3>
                <p className="text-sm text-[#18181B]/70 font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-left">
            <a
              href="/Poly_Exea_Mumbai_Real_World_Strategy_Examples.pdf"
              download="Poly_Exea_Mumbai_Real_World_Strategy_Examples.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-sky-50 border border-sky-300 text-sky-950 font-bold text-sm shadow-sm hover:bg-sky-100 hover:border-sky-400 hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">📄</span>
              <span className="underline decoration-sky-400 underline-offset-4">See all 20 strategies inside</span>
              <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
            </a>
          </div>
        </div>
      </section>


      {/* ── EXECUTIVE PREVIEW (VERIFIED GOLDEN SCENARIO B NUMBERS) ────── */}
      <section id="decision" className="py-28 px-8 md:px-16 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Executive Decision Board</span>
          <h2 className="font-['Instrument_Serif'] text-[clamp(2rem,5vw,3.5rem)] leading-tight text-white mt-4 max-w-3xl">
            Verified Golden Scenario Preview
          </h2>
          <p className="mt-4 text-sm text-white/50 font-light max-w-2xl leading-relaxed">
            Scenario B: 2,500,000 bbl Crude Oil to Rotterdam, Netherlands (18-Day Deadline). Computed deterministically by OR-Tools.
          </p>

          {/* Decision board card */}
          <div className="mt-12 border border-white/10 bg-[#0F0F0F]">
            <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Executive Recommendation</div>
                <div className="text-white font-['Instrument_Serif'] text-xl mt-1">100% Yanbu IPSA Pipeline Bypass</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase">Status</div>
                <div className="text-emerald-400 font-bold text-sm">OPTIMAL</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10">
              {[
                { label: 'Total Landed Cost', value: '$223.75M', sub: '$89.50 / bbl', tag: 'CALCULATED' },
                { label: 'Expected Profit', value: '+$38.75M', sub: '14.8% margin', tag: 'CALCULATED' },
                { label: 'Savings vs Baseline', value: '$19.25M', sub: '$7.70 / bbl saved', tag: 'CALCULATED' },
                { label: 'Estimated Transit ETA', value: '6 Days', sub: '12 days under deadline', tag: 'CALCULATED' },
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
                { label: 'Option 1: IPSA Pipeline Bypass', alloc: '100%', vol: '2,500,000 bbl', eta: '6 days', cost: '$89.50/bbl', risk: 'LOW', prov: 'REAL REFERENCE' },
                { label: 'Option 2: Stena Bulk VLCC', alloc: '0%', vol: '0 bbl (Excluded)', eta: '12 days', cost: '$92.30/bbl', risk: 'LOW', prov: 'CONFIRMED' },
                { label: 'Option 3: Cape Bypass', alloc: '0%', vol: '0 bbl (Baseline)', eta: '16 days', cost: '$97.20/bbl', risk: 'MEDIUM', prov: 'REAL REFERENCE' },
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
        </div>
      </section>


      {/* ── PROVENANCE STRIP ──────────────────────────────────────────── */}
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
              { tag: 'COMMERCIAL VERIFICATION REQUIRED', color: 'bg-red-600', desc: 'Candidate opportunity: not yet actionable' },
            ].map((p) => (
              <div key={p.tag} className="border border-[#18181B]/10 p-5 space-y-2 bg-[#FAFAF8]">
                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider text-white px-2 py-1 ${p.color}`}>{p.tag}</span>
                <p className="text-[11px] text-[#18181B]/55 font-light">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-28 px-8 md:px-16 bg-[#0A0A0A] border-t border-white/10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-['Instrument_Serif'] text-[clamp(2.5rem,6vw,4.5rem)] leading-tight text-white">
            Twenty options. One answer.
          </h2>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://drive.google.com/file/d/1tT0dmzhF2pGDpCeXixenK81ioJpk4CFn/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm bg-sky-400 px-10 py-4 text-sm font-bold text-black hover:bg-sky-300 transition-all shadow-lg shadow-sky-400/30">
              Watch Demo Video
            </a>
            <Link href="/intake"
              className="inline-block rounded-sm border border-white/20 px-10 py-4 text-sm font-semibold text-white/70 hover:text-white hover:border-white/40 transition-all">
              Start Requirement Intake
            </Link>
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
            <span className="text-[12px] text-white/30 font-light">POLY EXEA &copy; 2026 · Energy Supply &amp; Transportation Decision Platform</span>
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
