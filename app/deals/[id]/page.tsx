'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

function DealDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const dealId = (params?.id as string) || 'deal-001'
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Interactive Counter-Offer What-If Simulator
  const [whatIfPrice, setWhatIfPrice] = useState<number>(2000000)
  const [whatIfResult, setWhatIfResult] = useState<any>(null)
  const [whatIfLoading, setWhatIfLoading] = useState(false)

  const loadAndEvaluate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const ev = await api.evaluate({ deal_id: dealId, scenario_id: scenarioId })
      setEvaluation(ev)
      setWhatIfPrice(ev.quoted_price_usd || 2000000)
      setWhatIfResult(ev)
    } catch (e: any) {
      setError(e.message || 'Error running deterministic P&L evaluation.')
    } finally {
      setLoading(false)
    }
  }, [dealId, scenarioId])

  useEffect(() => {
    loadAndEvaluate()
  }, [loadAndEvaluate])

  const handleWhatIfSimulate = async () => {
    setWhatIfLoading(true)
    try {
      const res = await api.whatIf(dealId, whatIfPrice)
      setWhatIfResult(res)
    } catch (e: any) {
      setError(e.message || 'Error simulating counter-offer.')
    } finally {
      setWhatIfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70 font-sans">
        Computing Deterministic Financial P&L Evaluation...
      </div>
    )
  }

  const active = whatIfResult || evaluation

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Commercial P&L Evaluator &middot; Deterministic Financial Engine
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Commercial Deal Economic Evaluation
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Answers the key economic question: &quot;If I buy this confirmed capacity for ${Number(active?.quoted_price_usd || 2000000).toLocaleString()}, does this deal make money?&quot;
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        {active && (
          <>
            {/* Verdict Hero Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#18181B]/10 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 block mb-1">
                    VERIFIED COMMERCIAL OPPORTUNITY &middot; {active.commercial_verification_status || 'HUMAN VERIFIED'}
                  </span>
                  <h2 className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-[#18181B]">
                    {active.vessel_name || 'Stena Bulk Charter (VLCC)'}
                  </h2>
                  <p className="text-xs text-[#18181B]/60 mt-1 font-mono">
                    Journey: {active.journey || 'Australia → Japan via India'} &middot; Transport Source: {active.transport_provider || 'Stena Bulk (Shipowner)'}
                  </p>
                </div>

                {/* Verdict Badge */}
                <div>
                  <span
                    className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-sm border ${
                      active.deal_verdict === 'GO'
                        ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                        : active.deal_verdict === 'NEGOTIATE'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-red-950 text-red-300 border-red-800'
                    }`}
                  >
                    VERDICT: {active.deal_verdict}
                  </span>
                </div>
              </div>

              {/* Rationale Box */}
              <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 text-xs leading-relaxed space-y-1">
                <span className="font-bold text-[#18181B] block uppercase tracking-wider text-[10px] text-[#18181B]/60">
                  DETERMINISTIC EVALUATION RATIONALE
                </span>
                <p className="text-[#18181B]/80 font-medium">
                  {active.verdict_reason}
                </p>
              </div>

              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-white border border-[#18181B]/10 shadow-2xs">
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Confirmed Volume</div>
                  <div className="font-bold text-lg text-[#18181B]">{Number(active.volume_bbls || 400000).toLocaleString()} bbl</div>
                  <div className="text-[10px] text-[#18181B]/40 mt-0.5">({active.capacity_pct || 20}% Vessel Capacity)</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#18181B]/10 shadow-2xs">
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Quoted Freight / bbl</div>
                  <div className="font-bold text-lg text-[#18181B]">${active.quoted_price_per_bbl?.toFixed(2)}</div>
                  <div className="text-[10px] text-[#18181B]/40 mt-0.5">(${Number(active.quoted_price_usd).toLocaleString()} Total)</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] text-emerald-800 uppercase font-semibold">Expected Net Profit</div>
                  <div className="font-bold text-lg text-emerald-700">+${(active.expected_profit_usd / 1e6).toFixed(2)}M</div>
                  <div className="text-[10px] text-emerald-800/70 mt-0.5">({active.expected_margin_pct?.toFixed(1)}% Margin)</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] text-amber-900 uppercase font-semibold">Target Price Ceiling</div>
                  <div className="font-bold text-lg text-amber-800">${active.max_acceptable_price_per_bbl?.toFixed(2)} / bbl</div>
                  <div className="text-[10px] text-amber-900/70 mt-0.5">(${Number(active.max_acceptable_price_usd).toLocaleString()} Max Quote)</div>
                </div>
              </div>

            </div>

            {/* Counter-Offer What-If Simulator Panel */}
            <GlassPanel className="space-y-5 border border-[#18181B]/15">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 block">
                    COUNTER-OFFER SIMULATOR
                  </span>
                  <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                    Simulate Freight Price Negotiation
                  </h3>
                </div>

                <span className="text-xs font-semibold text-[#18181B]/60">
                  Target Ceiling: ${active.max_acceptable_price_per_bbl?.toFixed(2)}/bbl
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-[#18181B]/70 block">
                    Test Counter-Offer Quote ($ USD Lumpsum):
                  </label>
                  <input
                    type="range"
                    min="1000000"
                    max="3000000"
                    step="50000"
                    value={whatIfPrice}
                    onChange={(e) => setWhatIfPrice(parseFloat(e.target.value))}
                    className="w-full accent-[#18181B]"
                  />
                  <div className="flex justify-between text-xs font-mono text-[#18181B]/60">
                    <span>$1.0M ($2.50/bbl)</span>
                    <span className="font-bold text-[#18181B]">${(whatIfPrice / 1e6).toFixed(2)}M (${(whatIfPrice / 400000).toFixed(2)}/bbl)</span>
                    <span>$3.0M ($7.50/bbl)</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleWhatIfSimulate}
                    disabled={whatIfLoading}
                    className="w-full py-3 rounded-2xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs disabled:opacity-50"
                  >
                    {whatIfLoading ? 'Simulating...' : 'Re-Evaluate Counter-Offer →'}
                  </button>
                </div>
              </div>
            </GlassPanel>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                onClick={() => router.push(`/map?scenario_id=${scenarioId}`)}
                className="text-xs font-medium text-[#18181B]/70 hover:text-[#18181B]"
              >
                ← Back to Network Map
              </button>

              <button
                onClick={() => router.push(`/strategy?scenario_id=${scenarioId}&deal_id=${dealId}`)}
                className="rounded-full bg-[#18181B] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all shadow-md"
              >
                Feed Deal into Multi-Modal Strategy Optimizer →
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  )
}

export default function DealDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70 font-sans">Loading Deal Evaluation...</div>}>
      <DealDetailContent />
    </Suspense>
  )
}
