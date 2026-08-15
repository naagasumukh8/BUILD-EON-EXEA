'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar({ scenarioId }: { scenarioId?: string }) {
  const pathname = usePathname()
  const sid = scenarioId || 'scen-demo-001'

  const navItems = [
    { label: 'Network', href: `/map?scenario_id=${sid}` },
    { label: 'Intake', href: `/intake?scenario_id=${sid}` },
    { label: 'Deals', href: `/deals/new?scenario_id=${sid}` },
    { label: 'Strategies', href: `/strategy?scenario_id=${sid}` },
    { label: 'Reports', href: `/report?scenario_id=${sid}` },
  ]

  return (
    <header className="w-full pt-4 px-4 flex justify-center sticky top-0 z-50 pointer-events-auto">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-sm border border-[#18181B]/10 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg className="w-5 h-5 text-[#18181B] transition-transform group-hover:scale-105" viewBox="0 0 256 256" fill="none">
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
            <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" opacity="0.55" />
          </svg>
          <span className="font-['Instrument_Serif'] text-2xl font-normal tracking-wide text-[#18181B]">
            EON EXEA
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href.split('?')[0]
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-[#18181B] font-semibold border-b-2 border-[#18181B]'
                    : 'text-[#18181B]/70 hover:text-[#18181B]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Navigation Action */}
        <Link
          href={`/intake?scenario_id=${sid}`}
          className="rounded-full bg-[#18181B] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-black transition-all"
        >
          Start Analysis &rarr;
        </Link>

      </div>
    </header>
  )
}
