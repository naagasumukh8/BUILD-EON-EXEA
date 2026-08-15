import React from 'react'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div
      className={`glass-panel p-6 sm:p-8 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  )
}

export function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`sight-card-glass ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function SightCard({
  kicker,
  title,
  subtitle,
  children,
  badge,
  onClick,
  className = '',
}: {
  kicker?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  badge?: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={`sight-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        {kicker && <span className="text-xs uppercase tracking-widest font-semibold text-[#111411]/60">{kicker}</span>}
        {badge}
      </div>
      <h3 className="title-ogg text-2xl text-[#111411] mb-1 font-semibold leading-tight">{title}</h3>
      {subtitle && <p className="text-sm text-[#111411]/80 mb-3 font-normal">{subtitle}</p>}
      {children}
    </div>
  )
}
