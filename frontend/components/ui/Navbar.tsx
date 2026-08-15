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
      {/* Main Nav Container */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg width="24" height="24" viewBox="0 0 256 256" fill="none" className="text-[#18181B] transition-transform group-hover:scale-105">
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
            <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
          </svg>
          <span className="font-['Instrument_Serif'] text-2xl font-bold tracking-tight text-[#18181B]">
            Wide Hormuz
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
                    ? 'bg-[#18181B]/5 text-[#18181B] font-medium hover:bg-[#18181B]/10'
                    : 'text-[#18181B]/50 hover:text-[#18181B]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-70">{s.step}</span>
                <span>{s.label}</span>
              </Link>
            )
          })}
        </div>

        {/* New Analysis Action */}
        <Link
          href="/intake"
          className="rounded-full bg-[#18181B]/5 border border-[#18181B]/15 px-4 py-1.5 text-xs font-semibold text-[#18181B] hover:bg-[#18181B] hover:text-white transition-all"
        >
          New Analysis &rarr;
        </Link>
      </div>
    </header>
  )
}
