'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-[#18181B] font-sans overflow-hidden flex flex-col justify-between">
      
      {/* Ocean Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.95]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter brightness-105 contrast-105"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-top-aerial-view-of-ocean-waves-41611-large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF8]/90 via-[#FAFAF8]/50 to-[#FAFAF8]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 pt-6 md:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 256 256" fill="none" className="text-[#18181B]">
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor"/>
            <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>
          </svg>
          <span className="font-['Instrument_Serif'] text-3xl font-bold tracking-tight text-[#18181B]">
            EON EXEA
          </span>
        </div>

        <Link
          href="/intake"
          className="rounded-full bg-[#18181B] px-6 py-2.5 text-xs font-semibold text-white hover:bg-black transition-all shadow-sm"
        >
          Start Analysis →
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] backdrop-blur-md shadow-2xs">
          Maritime Energy Decision Platform
        </div>

        <h1 className="font-['Instrument_Serif'] text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#18181B] leading-[1.05]">
          Find the best way to move your energy.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#18181B]/80 max-w-2xl mx-auto font-light leading-relaxed">
          EON EXEA evaluates vessels, pipelines, alternate routes, and spot suppliers simultaneously to determine the most economically viable strategy for your energy supply requirements.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/intake"
            className="w-full sm:w-auto rounded-full bg-[#18181B] px-10 py-4 text-sm font-semibold text-white hover:bg-black transition-all shadow-md"
          >
            Start Analysis →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-[#18181B]/60 border-t border-[#18181B]/10">
        <div>EON EXEA &copy; 2026. AI Maritime Decision Platform. All rights reserved.</div>
      </footer>
    </div>
  )
}
