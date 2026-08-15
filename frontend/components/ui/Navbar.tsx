'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export function Navbar({ scenarioId }: { scenarioId?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentScenarioId = scenarioId || searchParams.get('scenario_id') || 'scen-demo-001'

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#18181B]/10">
      {/* Main Nav Container */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
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

        {/* Clean Navigation Links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#18181B]/80">
          <Link
            href={`/?scenario_id=${currentScenarioId}`}
            className={`hover:text-[#18181B] transition-opacity ${pathname === '/' ? 'text-[#18181B] font-semibold' : ''}`}
          >
            Overview
          </Link>
          <Link
            href={`/intake?scenario_id=${currentScenarioId}`}
            className={`hover:text-[#18181B] transition-opacity ${pathname.includes('intake') ? 'text-[#18181B] font-semibold' : ''}`}
          >
            Capabilities
          </Link>
          <Link
            href={`/map?scenario_id=${currentScenarioId}`}
            className={`hover:text-[#18181B] transition-opacity ${pathname.includes('map') ? 'text-[#18181B] font-semibold' : ''}`}
          >
            Map Network
          </Link>
          <Link
            href={`/report?scenario_id=${currentScenarioId}`}
            className={`hover:text-[#18181B] transition-opacity ${pathname.includes('report') ? 'text-[#18181B] font-semibold' : ''}`}
          >
            AI Briefing
          </Link>
        </nav>

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
