'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

function VerdictHeroCard({ verdict, reason }: { verdict: string; reason: string }) {
  const isGo = verdict === 'GO'
  const isNegotiate = verdict === 'NEGOTIATE'

  const borderClass = isGo
    ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
    : isNegotiate
    ? 'border-amber-300 bg-amber-50 text-amber-950 shadow-sm'
    : 'border-red-300 bg-red-50 text-red-950 shadow-sm'

  const textClass = isGo ? 'text-emerald-700' : isNegotiate ? 'text-amber-800' : 'text-red-700'
  const icon = isGo ? '✅' : isNegotiate ? '🤝' : '❌'

  return (
    <div className={`p-8 sm:p-10 rounded-3xl border ${borderClass} text-center space-y-3 transition-all duration-300`}>
      <div className="text-4xl">{icon}</div>
      <div className={`font-['Instrument_Serif'] text-5xl sm:text-6xl font-semibold tracking-wide ${textClass}`}>
        {verdict}
      </div>
      <p className="text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
        {reason}
      </p>
    </div>
  )
}

function EvaluatorContent() {
  const params = useParams()
  const dealId = (params?.id as string) || 'deal-001'
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [deal, setDeal] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [whatIfPrice, setWhatIfPrice] = useState<number>(2000000)
  const [whatIfResult, setWhatIfResult] = useState<any>(null)
  const [whatIfLoading, setWhatIfLoading] = useState(false)

  const loadAndEvaluate = useCallback(async () => {
    try {
      const d = await api.getDeal(dealId).catch(() => ({
        id: dealId,
        counterparty: 'Stena Bulk Charter',
        product: 'diesel',
        quoted_price: 2000000,
        capacity_volume: 50000,
        provenance_status: 'CONFIRMED'
      }))
      setDeal(d)
      setWhatIfPrice(parseFloat(d.quoted_price_usd || d.quoted_price) || 2000000)

      const ev = await api.evaluate(dealId)
      setEvaluation(ev)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    loadAndEvaluate()
  }, [loadAndEvaluate])

  const handleWhatIf = async () => {
    if (!whatIfPrice) return
    setWhatIfLoading(true)
    try {
      const res = await api.whatIf(dealId, whatIfPrice)
      setWhatIfResult(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setWhatIfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">
        Computing Deterministic P&L Verdict...
      </div>
    )
  }

  const result = whatIfResult || evaluation

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Step 3 &middot; Deterministic P&L Evaluator
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Commercial Verdict & Negotiation Ceiling
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            100% deterministic financial evaluation. Never inferred by LLM.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <>
            {/* Verdict Hero Card */}
            <VerdictHeroCard
              verdict={result.deal_verdict}
              reason={result.verdict_reason}
            />

            {/* P&L Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs text-center space-y-1">
                <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Quoted Freight</div>
                <div className="font-['Instrument_Serif'] text-3xl font-bold text-[#18181B]">
                  ${result.quoted_price_per_bbl?.toFixed(2)} <span className="text-xs text-[#18181B]/60 font-sans">/bbl</span>
                </div>
                <div className="text-[10px] text-[#18181B]/50 font-bold uppercase">CONFIRMED</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs text-center space-y-1">
                <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Landed Cost</div>
                <div className="font-['Instrument_Serif'] text-3xl font-bold text-[#18181B]">
                  ${result.landed_cost_per_bbl?.toFixed(2)} <span className="text-xs text-[#18181B]/60 font-sans">/bbl</span>
                </div>
                <div className="text-[10px] text-[#18181B]/50 font-bold uppercase">CALCULATED</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs text-center space-y-1">
                <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Expected Profit</div>
                <div className="font-['Instrument_Serif'] text-3xl font-bold text-emerald-700">
                  ${(result.expected_profit_usd / 1e6)?.toFixed(2)}M
                </div>
                <div className="text-[10px] text-emerald-700 font-bold uppercase">CALCULATED</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs text-center space-y-1">
                <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Negotiation Ceiling</div>
                <div className="font-['Instrument_Serif'] text-3xl font-bold text-[#18181B]">
                  ${(result.max_acceptable_price_usd / 1e6)?.toFixed(2)}M
                </div>
                <div className="text-[10px] text-[#18181B]/50 font-bold uppercase">TARGET MAX</div>
              </div>
            </div>

            {/* What-If Sensitivity Panel */}
            <GlassPanel className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Interactive What-If Sensitivity</h3>
                <span className="text-xs text-[#18181B]/60">Simulate Counter-Offer Impact</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs font-semibold text-[#18181B]/70">Simulated Quoted Price ($ Total)</label>
                  <input
                    type="number"
                    value={whatIfPrice}
                    onChange={(e) => setWhatIfPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B]"
                  />
                </div>

                <button
                  onClick={handleWhatIf}
                  disabled={whatIfLoading}
                  className="btn-paper whitespace-nowrap self-end"
                >
                  {whatIfLoading ? 'Simulating...' : 'Re-calculate Verdict →'}
                </button>
              </div>
            </GlassPanel>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}`)}
                className="btn-ghost-glass"
              >
                ← Test Another Quote
              </button>

              <button
                onClick={() => router.push(`/strategy?scenario_id=${scenarioId}`)}
                className="btn-paper text-base px-8"
              >
                ⚙️ Proceed to Strategy Optimizer →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function EvaluatorResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Verdict...</div>}>
      <EvaluatorContent />
    </Suspense>
  )
}
