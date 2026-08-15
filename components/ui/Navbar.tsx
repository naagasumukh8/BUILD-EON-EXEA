'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const STAGES = [
  { id: 'intake', step: '01', label: 'Intake', href: '/intake' },
  { id: 'map', step: '02', label: 'Network', href: '/map' },
  { id: 'deals', step: '03', label: 'Deal', href: '/deals/new' },
  { id: 'strategy', step: '04', label: 'Strategy', href: '/strategy' },
  { id: 'report', step: '05', label: 'Briefing', href: '/report' },
]

export function Navbar({ scenarioId }: { scenarioId?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentScenarioId = scenarioId || searchParams.get('scenario_id') || 'scen-demo-001'

  const activeStageIndex = STAGES.findIndex((s) => pathname.includes(s.id))

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#18181B]/10">
      
      {/* Persistent Scenario Bar */}
      <div className="bg-[#18181B] text-white/90 text-xs py-2 px-4 border-b border-white/10 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3 max-w-5xl mx-auto w-full">
          <span className="font-semibold uppercase tracking-widest text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
            POLY EXEA &middot; ACTIVE REQUIREMENT
          </span>
          <span className="font-mono text-xs text-white/90 truncate">
            {currentScenarioId === 'scen-demo-001' ? '2,000,000 bbl Diesel → Mumbai, India (7d Deadline)' : `Scenario ID: ${currentScenarioId}`}
          </span>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg width="24" height="24" viewBox="0 0 256 256" fill="none" className="text-[#18181B] transition-transform group-hover:scale-105">
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
            <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
          </svg>
          <span className="font-['Instrument_Serif'] text-2xl font-bold tracking-tight text-[#18181B]">
            POLY EXEA
          </span>
        </Link>

        {/* Continuous Stage Progress Indicator */}
        <div className="flex items-center gap-1 sm:gap-2 bg-white p-1.5 rounded-full border border-[#18181B]/10 shadow-2xs text-xs">
          {STAGES.map((s, idx) => {
            const isActive = pathname.includes(s.id) || (s.id === 'intake' && pathname === '/intake')
            const isPassed = activeStageIndex > idx

            return (
              <Link
                key={s.id}
                href={`${s.href}?scenario_id=${currentScenarioId}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs ${
                  isActive
                    ? 'bg-[#18181B] text-white font-semibold shadow-xs'
                    : isPassed
                    ? 'text-[#18181B] font-medium hover:bg-[#FAFAF8]'
                    : 'text-[#18181B]/60 hover:text-[#18181B]'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-[#18181B]/40'}`}>{s.step}</span>
                <span>{s.label}</span>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <Link
          href={`/intake?scenario_id=${currentScenarioId}`}
          className="hidden md:inline-flex rounded-full bg-[#18181B] px-5 py-2 text-xs font-semibold text-white hover:bg-black transition-all shadow-2xs shrink-0"
        >
          New Analysis →
        </Link>
      </div>
    </header>
  )
}
