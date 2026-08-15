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
    { label: 'Analysis', href: `/intake${querySuffix}`, pathKey: '/intake' },
    { label: 'Deals', href: `/deals/new${querySuffix}`, pathKey: '/deals' },
    { label: 'Strategies', href: `/strategy${querySuffix}`, pathKey: '/strategy' },
    { label: 'Reports', href: `/report${querySuffix}`, pathKey: '/report' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080e14]/75 backdrop-blur-xl border-b border-[rgba(30,80,120,0.35)] px-6 py-3.5 flex items-center justify-between transition-all duration-300">
      {/* Brand / Logo - visually identical to landing page logo */}
      <div className="flex items-center gap-6">
        <a
          href="http://localhost:3000"
          className="title-ogg text-2xl font-normal tracking-wider text-[#fdf1e1] hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>EON EXEA</span>
        </a>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f1a26]/80 border border-[rgba(30,80,120,0.3)] text-xs text-[#6b8499]">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>LIVE AIS & AI ENGINE</span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="flex items-center gap-1 md:gap-2 bg-[#0d1822]/60 p-1 rounded-full border border-[rgba(30,80,120,0.25)]">
        {navLinks.map((link) => {
          const isActive = pathname?.startsWith(link.pathKey)
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#1e6faa] to-[#164e78] text-[#fdf1e1] font-medium shadow-[0_4px_16px_rgba(30,111,170,0.4)]'
                  : 'text-[#8aacca] hover:text-[#fdf1e1] hover:bg-white/5'
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
          className="btn-ghost-glass text-xs py-1.5 px-4 hidden sm:inline-flex items-center gap-1.5"
        >
          <span>← Landing Page</span>
        </a>
      </div>
    </header>
  )
}
