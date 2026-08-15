'use client'

import Link from 'next/link'

const opportunityGroups = [
  {
    title: "MOVE DIFFERENTLY",
    items: "Pipeline · Alternate Route · Transshipment · STS · Multimodal",
  },
  {
    title: "DON'T MOVE YOUR CARGO",
    items: "Replacement Supply · Local Inventory · Cargo Swap · Regional Exchange · Alternative Origin",
  },
  {
    title: "USE THE NETWORK",
    items: "Moving Vessel · Backhaul · Triangulation · Diversified Split · Demand Rebalancing",
  },
  {
    title: "CHANGE THE PLAN",
    items: "Timing · Alternative Destination · Emergency Replacement · Hybrid",
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1B133C] selection:bg-[#1B133C] selection:text-white">
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video autoPlay muted loop playsInline className="w-full h-[120%] object-cover object-top opacity-45">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/25 via-[#FAFAF8]/45 to-[#FAFAF8]/90" />
        </div>

        <header className="relative z-10 w-full pt-4 md:pt-6 flex justify-center px-4">
          <div className="bg-white/70 backdrop-blur-md rounded-xl px-4 md:px-6 py-3 shadow-sm border border-[#1B133C]/10 flex items-center justify-between gap-6 max-w-5xl w-full">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <svg width="24" height="24" viewBox="0 0 256 256" fill="none" aria-hidden="true">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="#1B133C" />
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="#1B133C" />
              </svg>
              <span className="font-['Instrument_Serif'] text-xl tracking-tight">POLY EXEA</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#1B133C]/75">
              <a href="#problem" className="hover:text-[#1B133C] transition-colors">Problem</a>
              <a href="#how" className="hover:text-[#1B133C] transition-colors">How It Works</a>
              <a href="#opportunities" className="hover:text-[#1B133C] transition-colors">Opportunities</a>
              <a href="#decision" className="hover:text-[#1B133C] transition-colors">Decision Engine</a>
            </nav>
            <Link href="/intake" className="rounded-lg bg-[#1B133C] px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-all shrink-0">
              Run a Scenario →
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#1B133C]/10 bg-white/70 backdrop-blur-sm px-4 py-2 text-xs sm:text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-[#1B133C]" />
              Energy continuity under disruption
            </div>
            <h1 className="font-['Instrument_Serif'] text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] leading-[0.9] tracking-tight max-w-5xl mx-auto">
              When Hormuz is unavailable,
              <br />
              <span className="italic font-normal">find another way.</span>
            </h1>
            <p className="mt-7 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-[#1B133C]/70">
              Poly Exea maps available supply, vessels, pipelines, exchanges and alternate routes, then compares their economics to find the best feasible way forward.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/intake" className="rounded-xl bg-[#1B133C] px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-black transition-all">
                Run a Scenario →
              </Link>
              <a href="#how" className="rounded-xl bg-white/75 backdrop-blur-sm border border-[#1B133C]/10 px-7 py-3.5 text-sm font-semibold hover:bg-white transition-all">
                See How It Works ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#1B133C]/45">THE PROBLEM</p>
        <h2 className="mt-4 font-['Instrument_Serif'] text-5xl md:text-7xl leading-[0.95] max-w-3xl">Hormuz is a chokepoint. Your business still has to deliver.</h2>
        <p className="mt-6 max-w-2xl text-[#1B133C]/65 leading-relaxed">A sustained disruption can strand cargo, block planned voyages, increase freight and risk, and create shortages at destination. Poly Exea starts with the business requirement and works backward.</p>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            ['01', 'TRAPPED', 'Cargo already inside the affected network.'],
            ['02', 'AT RISK', 'Cargo that has not yet entered the disruption.'],
            ['03', 'OPPORTUNITY', 'Vessels, inventory and commercial positions elsewhere that may help.'],
          ].map(([n, title, body]) => (
            <div key={n} className="rounded-2xl border border-[#1B133C]/10 bg-white/65 p-7">
              <span className="text-xs text-[#1B133C]/40">{n}</span>
              <h3 className="mt-10 font-['Instrument_Serif'] text-3xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#1B133C]/60">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="opportunities" className="border-y border-[#1B133C]/10 bg-white/55 px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#1B133C]/45">THE DIFFERENTIATOR</p>
          <h2 className="mt-4 font-['Instrument_Serif'] text-5xl md:text-7xl leading-[0.95] max-w-3xl">The best answer isn&apos;t always another route.</h2>
          <p className="mt-6 max-w-2xl text-[#1B133C]/65 leading-relaxed">Poly Exea searches the physical and commercial network for ways to change the problem itself — including opportunities to avoid moving cargo altogether.</p>
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {opportunityGroups.map((group, i) => (
              <div key={group.title} className="rounded-2xl border border-[#1B133C]/10 bg-[#FAFAF8]/75 p-7 md:p-9">
                <span className="text-xs text-[#1B133C]/35">0{i + 1}</span>
                <h3 className="mt-8 text-sm font-semibold tracking-[0.14em]">{group.title}</h3>
                <p className="mt-4 font-['Instrument_Serif'] text-2xl md:text-3xl leading-tight">{group.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#1B133C]/45">HOW IT WORKS</p>
        <h2 className="mt-4 font-['Instrument_Serif'] text-5xl md:text-7xl leading-[0.95] max-w-3xl">Start with the problem, not a form.</h2>
        <div className="mt-12 grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
          <div className="rounded-3xl border border-[#1B133C]/10 bg-[#1B133C] text-white p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Natural language input</p>
            <p className="mt-8 font-['Instrument_Serif'] text-3xl md:text-4xl leading-tight">“I need 2.5M barrels of crude delivered to Rotterdam within 18 days. I have 1.2M in Western Australia, 800K in the Middle East and 1M in West Africa. Hormuz is expected to remain unavailable.”</p>
          </div>
          <div className="rounded-3xl border border-[#1B133C]/10 bg-white p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-[#1B133C]/40">Validated scenario</p>
            <div className="mt-8 grid grid-cols-2 gap-5 text-sm">
              <div><span className="text-[#1B133C]/40">Volume</span><p className="mt-1 font-semibold">2.5M bbl</p></div>
              <div><span className="text-[#1B133C]/40">Destination</span><p className="mt-1 font-semibold">Rotterdam</p></div>
              <div><span className="text-[#1B133C]/40">Deadline</span><p className="mt-1 font-semibold">18 days</p></div>
              <div><span className="text-[#1B133C]/40">Disruption</span><p className="mt-1 font-semibold">Hormuz unavailable</p></div>
            </div>
            <div className="mt-8 border-t border-[#1B133C]/10 pt-6">
              <p className="text-xs text-[#1B133C]/40">Supply sources</p>
              <div className="mt-3 space-y-2 text-sm"><p>Western Australia <span className="float-right font-semibold">1.2M</span></p><p>Middle East <span className="float-right font-semibold">800K</span></p><p>West Africa <span className="float-right font-semibold">1M</span></p></div>
            </div>
          </div>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            ['01', 'UNDERSTAND', 'Natural language → validated structured scenario'],
            ['02', 'DISCOVER', 'Supply + vessels + pipelines + routes + opportunities'],
            ['03', 'OPTIMIZE', 'Deterministic economics + OR-Tools'],
            ['04', 'DECIDE', 'Top 5 strategies + trade-offs + What-If analysis'],
          ].map(([n, title, body]) => <div key={n} className="border-t border-[#1B133C]/20 pt-5"><span className="text-xs text-[#1B133C]/40">{n}</span><h3 className="mt-5 text-sm font-semibold tracking-[0.12em]">{title}</h3><p className="mt-2 text-sm text-[#1B133C]/60 leading-relaxed">{body}</p></div>)}
        </div>
      </section>

      <section id="decision" className="bg-[#1B133C] text-white px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/40">THE DECISION</p>
          <h2 className="mt-4 font-['Instrument_Serif'] text-5xl md:text-7xl leading-[0.95] max-w-3xl">Five ways forward. One decision you can defend.</h2>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Recommended', 'Lowest Cost', 'Fastest', 'Lowest Risk'].map((label, i) => <div key={label} className="rounded-2xl border border-white/15 bg-white/5 p-6"><span className="text-xs text-white/40">0{i + 1}</span><h3 className="mt-10 font-['Instrument_Serif'] text-3xl">{label}</h3><p className="mt-3 text-sm text-white/55">Allocation, coverage, landed cost, ETA, risk, profit and required verification.</p></div>)}
          </div>
          <div className="mt-12 rounded-3xl border border-white/15 bg-white/5 p-7 md:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Trust layer</p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs"><span className="rounded-full border border-white/15 px-4 py-2">Deterministic economics</span><span className="rounded-full border border-white/15 px-4 py-2">Source provenance</span><span className="rounded-full border border-white/15 px-4 py-2">Commercial verification</span><span className="rounded-full border border-white/15 px-4 py-2">No inferred vessel capacity</span></div>
          </div>
        </div>
      </section>

      <section className="px-6 py-28 md:py-36 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-['Instrument_Serif'] text-6xl md:text-8xl leading-[0.9]">Give Poly Exea the problem.</h2>
          <p className="mt-6 text-[#1B133C]/60">Tell us what you need to deliver, where it is coming from, and when it has to arrive.</p>
          <Link href="/intake" className="inline-flex mt-8 rounded-xl bg-[#1B133C] px-8 py-4 text-sm font-semibold text-white hover:bg-black transition-all">Run a Scenario →</Link>
        </div>
        <p className="mt-24 text-xs text-[#1B133C]/35">POLY EXEA © 2026 · Energy continuity under disruption</p>
      </section>
    </main>
  )
}
