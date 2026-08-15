'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, SightCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

function VerdictHeroCard({ verdict, reason }: { verdict: string; reason: string }) {
  const isGo = verdict === 'GO'
  const isNegotiate = verdict === 'NEGOTIATE'

  const borderClass = isGo
    ? 'border-[#10b981]/50 bg-[#10b981]/15 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
    : isNegotiate
    ? 'border-[#f59e0b]/50 bg-[#f59e0b]/15 shadow-[0_0_50px_rgba(245,158,11,0.2)]'
    : 'border-[#ef4444]/50 bg-[#ef4444]/15 shadow-[0_0_50px_rgba(239,68,68,0.2)]'

  const textClass = isGo ? 'text-[#10b981]' : isNegotiate ? 'text-[#f59e0b]' : 'text-[#ef4444]'
  const icon = isGo ? '✅' : isNegotiate ? '🤝' : '❌'

  return (
    <div className={`p-8 sm:p-10 rounded-3xl border ${borderClass} text-center space-y-3 transition-all duration-300`}>
      <div className="text-4xl">{icon}</div>
      <div className={`title-ogg text-5xl sm:text-6xl font-semibold tracking-wide ${textClass}`}>
        {verdict}
      </div>
      <p className="text-base sm:text-lg text-[#fdf1e1] max-w-2xl mx-auto font-light leading-relaxed">
        {reason}
      </p>
    </div>
  )
}

function EvaluatorContent() {
  const params = useParams()
  const dealId = params?.id as string
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || ''

  const [deal, setDeal] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [evalLoading, setEvalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [whatIfPrice, setWhatIfPrice] = useState<number>(0)
  const [whatIfResult, setWhatIfResult] = useState<any>(null)
  const [whatIfLoading, setWhatIfLoading] = useState(false)

  const loadAndEvaluate = useCallback(async () => {
    try {
      const d = await api.getDeal(dealId)
      setDeal(d)
      setWhatIfPrice(parseFloat(d.quoted_price_usd || d.quoted_price) || 0)

      setEvalLoading(true)
      const ev = await api.evaluate(dealId)
      setEvaluation(ev)
      setWhatIfPrice(ev.quoted_price_usd || parseFloat(d.quoted_price))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setEvalLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    loadAndEvaluate()
  }, [loadAndEvaluate])

  const handleWhatIfChange = async (newPrice: number) => {
    setWhatIfPrice(newPrice)
    setWhatIfLoading(true)
    try {
      const res = await api.whatIf(dealId, newPrice)
      setWhatIfResult(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setWhatIfLoading(false)
    }
  }

  const ev = whatIfResult || evaluation

  const fmt = (n: number | undefined, prefix = '$', decimals = 0) =>
    n != null ? `${prefix}${n.toLocaleString('en', { maximumFractionDigits: decimals })}` : '—'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1110] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-spin">⚙️</div>
          <div className="text-[#fdf1e1]/70 text-sm">Evaluating Commercial Deal P&L...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">
                Deterministic P&L Evaluator
              </span>
              <GlassBadge status="CALCULATED" label="No LLM Math" />
            </div>
            <h1 className="title-ogg text-4xl sm:text-5xl text-[#fdf1e1]">
              Is this deal worth taking?
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/strategy?scenario_id=${scenarioId}&deal_id=${dealId}`)}
              className="btn-paper px-7 py-3 text-sm font-semibold"
            >
              ⚡ Run Strategy Optimizer →
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
            ⚠️ {error}
          </div>
        )}

        {/* Hero Focal Verdict */}
        {ev && <VerdictHeroCard verdict={ev.deal_verdict} reason={ev.verdict_reason} />}

        {/* Metric Cards Row - Cream SightCards Floating */}
        {ev && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SightCard
              kicker="Current Quote"
              title={fmt(ev.quoted_price_usd)}
              subtitle={`$${(ev.quoted_price_per_bbl || 0).toFixed(2)} / bbl`}
              badge={<GlassBadge status="CONFIRMED" />}
            />

            <SightCard
              kicker="Target Price Ceiling"
              title={fmt(ev.max_acceptable_price_usd)}
              subtitle="Max price for 8% target margin"
              badge={<GlassBadge status="CALCULATED" />}
            />

            <SightCard
              kicker="Expected Profit"
              title={fmt(ev.expected_profit_usd)}
              subtitle="Net of landed costs"
              badge={<GlassBadge status="CALCULATED" />}
            />

            <SightCard
              kicker="Expected Margin"
              title={`${(ev.expected_margin_pct || 0).toFixed(1)}%`}
              subtitle="Target threshold: 8.0%"
              badge={<GlassBadge status="CALCULATED" />}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Interactive What-If Simulator */}
          <GlassPanel className="lg:col-span-1 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="title-ogg text-2xl text-[#fdf1e1]">What-If Simulator</h3>
                <GlassBadge status="CALCULATED" label="Live Math" />
              </div>
              <p className="text-xs text-[#fdf1e1]/70">
                Slide the shipowner quote to see real-time recalculations of target margin and verdict.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs text-[#fdf1e1]/80 mb-2">
                  <span>Shipowner Quote</span>
                  <span className="font-bold text-[#fdf1e1] font-mono">{fmt(whatIfPrice)}</span>
                </div>
                <input
                  type="range"
                  min={Math.max(100000, (ev?.max_acceptable_price_usd || 1000000) * 0.4)}
                  max={(ev?.quoted_price_usd || 3000000) * 2}
                  step={50000}
                  value={whatIfPrice}
                  onChange={(e) => handleWhatIfChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-[#0a121c] rounded-lg appearance-none cursor-pointer accent-[#fdf1e1]"
                />
                <div className="flex justify-between text-[10px] text-[#fdf1e1]/50 mt-1.5 font-mono">
                  <span>Min: ${((ev?.max_acceptable_price_usd || 1000000) * 0.4 / 1e6).toFixed(1)}M</span>
                  <span>Target: ${((ev?.max_acceptable_price_usd || 0) / 1e6).toFixed(2)}M</span>
                  <span>Max: ${(((ev?.quoted_price_usd || 3000000) * 2) / 1e6).toFixed(1)}M</span>
                </div>
              </div>

              {whatIfLoading && (
                <div className="text-xs text-[#fdf1e1] text-center animate-pulse">
                  Recalculating arithmetic...
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#0a121c]/70 border border-[rgba(253,241,225,0.15)] space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#fdf1e1]/70">Simulated Per-Barrel Cost:</span>
                  <span className="font-semibold text-[#fdf1e1] font-mono">
                    ${ev ? (ev.landed_cost_per_bbl || 0).toFixed(2) : '—'} / bbl
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#fdf1e1]/70">Simulated Margin:</span>
                  <span className={`font-semibold font-mono ${ev?.expected_margin_pct >= 8 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                    {ev ? (ev.expected_margin_pct || 0).toFixed(1) : '—'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#fdf1e1]/70">Simulated Verdict:</span>
                  <GlassBadge status={ev?.deal_verdict || 'GO'} />
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Right Column: Full P&L Breakdown Statement */}
          <GlassPanel className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(253,241,225,0.15)] pb-4">
              <div>
                <h3 className="title-ogg text-2xl text-[#fdf1e1]">Commercial P&L Breakdown</h3>
                <p className="text-xs text-[#fdf1e1]/70">Every calculation carries an explicit provenance verification label.</p>
              </div>
              <GlassBadge status="CALCULATED" label="No LLM Math" />
            </div>

            {ev && (
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Cargo Volume', val: `${ev.volume_bbls?.toLocaleString()} Barrels`, prov: 'CONFIRMED' },
                  { label: 'Shipowner Quoted Price', val: fmt(ev.quoted_price_usd), prov: 'CONFIRMED' },
                  { label: 'Freight Transport Cost', val: `${fmt(ev.freight_usd)} ($${(ev.freight_per_bbl || 0).toFixed(2)}/bbl)`, prov: 'SIMULATED' },
                  { label: 'Insurance Fee ($0.15/bbl)', val: fmt(ev.insurance_usd), prov: 'SIMULATED' },
                  { label: 'Port Handling Fee ($0.10/bbl)', val: fmt(ev.handling_usd), prov: 'SIMULATED' },
                  { label: 'Total Landed Cost', val: fmt(ev.landed_cost_usd), prov: 'CALCULATED', bold: true },
                  { label: 'Landed Cost per Barrel', val: `$${(ev.landed_cost_per_bbl || 0).toFixed(2)} / bbl`, prov: 'CALCULATED', highlight: 'text-[#fdf1e1] font-bold' },
                  { label: 'Market Selling Price Used', val: `$${ev.market_price_used_usd || 85.00} / bbl`, prov: ev.market_price_provenance || 'SIMULATED' },
                  { label: 'Expected Total Revenue', val: fmt(ev.expected_revenue_usd), prov: 'CALCULATED' },
                  { label: 'Expected Net Profit', val: fmt(ev.expected_profit_usd), prov: 'CALCULATED', highlight: ev.expected_profit_usd >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]' },
                  { label: 'Maximum Acceptable Price Ceiling', val: fmt(ev.max_acceptable_price_usd), prov: 'CALCULATED', highlight: 'text-[#f59e0b]' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl ${
                      row.bold ? 'bg-[#fdf1e1]/10 border border-[#fdf1e1]/25 font-semibold' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[#fdf1e1]/80">{row.label}</span>
                    <div className="flex items-center gap-3">
                      <span className={`font-medium ${row.highlight || 'text-[#fdf1e1]'}`}>{row.val}</span>
                      <GlassBadge status={row.prov} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </main>
    </div>
  )
}

export default function DealEvaluatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1110] flex items-center justify-center text-[#fdf1e1]/70">Loading Deal P&L Evaluator...</div>}>
      <EvaluatorContent />
    </Suspense>
  )
}
