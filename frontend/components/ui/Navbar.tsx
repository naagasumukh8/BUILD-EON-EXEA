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
    { label: 'Network', href: `/map${querySuffix}`, pathKey: '/map' },
    { label: 'Intake', href: `/intake${querySuffix}`, pathKey: '/intake' },
    { label: 'Deals', href: `/deals/new${querySuffix}`, pathKey: '/deals' },
    { label: 'Strategies', href: `/strategy${querySuffix}`, pathKey: '/strategy' },
    { label: 'Reports', href: `/report${querySuffix}`, pathKey: '/report' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b1110]/80 backdrop-blur-xl border-b border-[rgba(253,241,225,0.12)] px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Brand / Logo */}
      <div className="flex items-center gap-6">
        <a
          href="http://localhost:3000"
          className="title-ogg text-2xl font-normal tracking-wide text-[#fdf1e1] hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>EON EXEA</span>
        </a>
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#fdf1e1]/70 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>AI MARITIME DECISION NETWORK</span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="flex items-center gap-1 sm:gap-2 bg-[#0f1a26]/70 p-1.5 rounded-full border border-[rgba(253,241,225,0.15)]">
        {navLinks.map((link) => {
          const isActive = pathname?.startsWith(link.pathKey)
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#fdf1e1] text-[#111411] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  : 'text-[#fdf1e1]/70 hover:text-[#fdf1e1] hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Action / Back to Landing */}
      <div className="flex items-center gap-3">
        <a
          href="http://localhost:3000"
          className="btn-ghost-glass text-xs py-2 px-5 hidden sm:inline-flex items-center gap-1.5"
        >
          <span>← Overview</span>
        </a>
      </div>
    </header>
  )
}
