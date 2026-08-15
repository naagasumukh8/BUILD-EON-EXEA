'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, GlassCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

function VerdictHeroCard({ verdict, reason }: { verdict: string; reason: string }) {
  const isGo = verdict === 'GO'
  const isNegotiate = verdict === 'NEGOTIATE'

  const borderClass = isGo
    ? 'border-[#10b981]/50 bg-[#10b981]/10 shadow-[0_0_50px_rgba(16,185,129,0.25)]'
    : isNegotiate
    ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
    : 'border-[#ef4444]/50 bg-[#ef4444]/10 shadow-[0_0_50px_rgba(239,68,68,0.25)]'

  const textClass = isGo ? 'text-[#10b981]' : isNegotiate ? 'text-[#f59e0b]' : 'text-[#ef4444]'
  const icon = isGo ? '✅' : isNegotiate ? '🤝' : '❌'

  return (
    <div className={`p-8 rounded-3xl border ${borderClass} text-center space-y-3 transition-all duration-300`}>
      <div className="text-4xl">{icon}</div>
      <div className={`title-ogg text-5xl font-semibold tracking-wide ${textClass}`}>
        {verdict}
      </div>
      <p className="text-sm sm:text-base text-[#e2eaf4] max-w-xl mx-auto font-light leading-relaxed">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-spin">⚙️</div>
          <div className="text-[#8aacca] text-sm">Evaluating Commercial Deal Economics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
                Commercial Deal Evaluation
              </span>
              <GlassBadge status="CALCULATED" label="Deterministic P&L" />
            </div>
            <h1 className="title-ogg text-3xl sm:text-4xl text-[#fdf1e1]">
              {deal?.counterparty || 'Vessel Opportunity'} P&L Analysis
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/strategy?scenario_id=${scenarioId}&deal_id=${dealId}`)}
              className="btn-paper px-6 py-2.5 text-sm font-semibold"
            >
              ⚡ Run OR-Tools Optimizer →
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
            ⚠️ {error}
          </div>
        )}

        {ev && <VerdictHeroCard verdict={ev.deal_verdict} reason={ev.verdict_reason} />}

        {ev && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <GlassCard>
              <div className="text-xs text-[#8aacca] mb-1 flex justify-between">
                <span>Quoted Price</span>
                <GlassBadge status="CONFIRMED" />
              </div>
              <div className="text-2xl font-bold text-[#fdf1e1]">{fmt(ev.quoted_price_usd)}</div>
              <div className="text-xs text-[#6b8499] mt-1">${(ev.quoted_price_per_bbl || 0).toFixed(2)} / bbl</div>
            </GlassCard>

            <GlassCard>
              <div className="text-xs text-[#8aacca] mb-1 flex justify-between">
                <span>Price Ceiling (Target)</span>
                <GlassBadge status="CALCULATED" />
              </div>
              <div className="text-2xl font-bold text-[#f59e0b]">{fmt(ev.max_acceptable_price_usd)}</div>
              <div className="text-xs text-[#6b8499] mt-1">Max price for 8% target margin</div>
            </GlassCard>

            <GlassCard>
              <div className="text-xs text-[#8aacca] mb-1 flex justify-between">
                <span>Expected Profit</span>
                <GlassBadge status="CALCULATED" />
              </div>
              <div className={`text-2xl font-bold ${ev.expected_profit_usd >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {fmt(ev.expected_profit_usd)}
              </div>
              <div className="text-xs text-[#6b8499] mt-1">Net of landed costs</div>
            </GlassCard>

            <GlassCard>
              <div className="text-xs text-[#8aacca] mb-1 flex justify-between">
                <span>Expected Margin</span>
                <GlassBadge status="CALCULATED" />
              </div>
              <div className={`text-2xl font-bold ${ev.expected_margin_pct >= 8 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                {(ev.expected_margin_pct || 0).toFixed(1)}%
              </div>
              <div className="text-xs text-[#6b8499] mt-1">Target threshold: 8.0%</div>
            </GlassCard>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassPanel className="lg:col-span-1 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="title-ogg text-xl text-[#fdf1e1]">What-If Simulator</h3>
                <GlassBadge status="CALCULATED" label="Live Math" />
              </div>
              <p className="text-xs text-[#8aacca]">
                Slide shipowner quote to see immediate impact on verdict and target margin.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[#8aacca] mb-2">
                  <span>Simulated Quote (USD)</span>
                  <span className="font-bold text-[#fdf1e1]">{fmt(whatIfPrice)}</span>
                </div>
                <input
                  type="range"
                  min={Math.max(100000, (ev?.max_acceptable_price_usd || 1000000) * 0.4)}
                  max={(ev?.quoted_price_usd || 3000000) * 2}
                  step={50000}
                  value={whatIfPrice}
                  onChange={(e) => handleWhatIfChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#0a121c] rounded-lg appearance-none cursor-pointer accent-[#2a9aff]"
                />
                <div className="flex justify-between text-[10px] text-[#6b8499] mt-1">
                  <span>Min: ${((ev?.max_acceptable_price_usd || 1000000) * 0.4 / 1e6).toFixed(1)}M</span>
                  <span>Target: ${((ev?.max_acceptable_price_usd || 0) / 1e6).toFixed(2)}M</span>
                  <span>Max: ${(((ev?.quoted_price_usd || 3000000) * 2) / 1e6).toFixed(1)}M</span>
                </div>
              </div>

              {whatIfLoading && (
                <div className="text-xs text-[#2a9aff] text-center animate-pulse">
                  Recalculating P&L arithmetic...
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#0a121c]/70 border border-[rgba(30,90,140,0.3)] space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8aacca]">Simulated Per-Barrel Cost:</span>
                  <span className="font-semibold text-[#fdf1e1]">
                    ${ev ? (ev.landed_cost_per_bbl || 0).toFixed(2) : '—'} / bbl
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8aacca]">Simulated Margin:</span>
                  <span className={`font-semibold ${ev?.expected_margin_pct >= 8 ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                    {ev ? (ev.expected_margin_pct || 0).toFixed(1) : '—'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8aacca]">Simulated Verdict:</span>
                  <GlassBadge status={ev?.deal_verdict || 'GO'} />
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(30,90,140,0.3)] pb-4">
              <div>
                <h3 className="title-ogg text-xl text-[#fdf1e1]">Complete Financial P&L Statement</h3>
                <p className="text-xs text-[#8aacca]">Every line item carries explicit provenance verification.</p>
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
                  { label: 'Landed Cost per Barrel', val: `$${(ev.landed_cost_per_bbl || 0).toFixed(2)} / bbl`, prov: 'CALCULATED', highlight: 'text-[#2a9aff]' },
                  { label: 'Market Selling Price Used', val: `$${ev.market_price_used_usd || 85.00} / bbl`, prov: ev.market_price_provenance || 'SIMULATED' },
                  { label: 'Expected Total Revenue', val: fmt(ev.expected_revenue_usd), prov: 'CALCULATED' },
                  { label: 'Expected Net Profit', val: fmt(ev.expected_profit_usd), prov: 'CALCULATED', highlight: ev.expected_profit_usd >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]' },
                  { label: 'Maximum Acceptable Price Ceiling', val: fmt(ev.max_acceptable_price_usd), prov: 'CALCULATED', highlight: 'text-[#f59e0b]' },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${
                      row.bold ? 'bg-[#1e6faa]/15 border border-[#2a9aff]/30 font-semibold' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[#8aacca]">{row.label}</span>
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
    <Suspense fallback={<div className="min-h-screen bg-[#080e14] flex items-center justify-center text-[#8aacca]">Loading Evaluator...</div>}>
      <EvaluatorContent />
    </Suspense>
  )
}
