'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  scenarioId?: string
}

export function Navbar({ scenarioId }: NavbarProps) {
  const pathname = usePathname()
  const querySuffix = scenarioId ? `?scenario_id=${scenarioId}` : ''

  const navLinks = [
    { label: 'Intake', href: `/intake${querySuffix}`, pathKey: '/intake' },
    { label: 'Network Map', href: `/map${querySuffix}`, pathKey: '/map' },
    { label: 'Deal Evaluator', href: `/deals/new${querySuffix}`, pathKey: '/deals' },
    { label: 'Strategy Solver', href: `/strategy${querySuffix}`, pathKey: '/strategy' },
    { label: 'Briefing Report', href: `/report${querySuffix}`, pathKey: '/report' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAFAF8]/90 backdrop-blur-xl border-b border-[#1B133C]/10 px-4 md:px-8 py-3.5 flex items-center justify-between transition-all duration-300 shadow-xs">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <svg className="w-6 h-6 text-[#1B133C] transition-transform group-hover:scale-105" viewBox="0 0 256 256" fill="none">
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
            <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" opacity="0.55" />
          </svg>
          <span className="font-['Instrument_Serif'] text-2xl font-normal tracking-wide text-[#1B133C]">
            EON EXEA
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B133C]/5 border border-[#1B133C]/10 text-xs text-[#1B133C]/70 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AI MARITIME DECISION PLATFORM</span>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav className="flex items-center gap-1 sm:gap-1.5 bg-white/80 p-1.5 rounded-full border border-[#1B133C]/10 shadow-xs">
        {navLinks.map((link) => {
          const isActive = pathname?.startsWith(link.pathKey)
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#1B133C] text-white shadow-sm'
                  : 'text-[#1B133C]/70 hover:text-[#1B133C] hover:bg-[#1B133C]/5'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Landing Link */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-xs sm:text-sm font-medium text-[#1B133C]/70 hover:text-[#1B133C] transition-colors"
        >
          ← Back to Landing
        </Link>
      </div>

    </header>
  )
}
