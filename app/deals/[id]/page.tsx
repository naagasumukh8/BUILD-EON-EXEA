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

  return (
    <div className={`p-8 sm:p-10 rounded-3xl border ${borderClass} text-center space-y-3 transition-all duration-300`}>
      <div className="text-xs font-bold uppercase tracking-widest opacity-60">Commercial Verdict</div>
      <div className={`font-['Instrument_Serif'] text-6xl sm:text-7xl font-normal tracking-wide ${textClass}`}>
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
      setError(e.message || 'Error running P&L evaluation.')
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
      setError(e.message || 'Error simulating counter-offer.')
    } finally {
      setWhatIfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">
        Computing Commercial Verdict...
      </div>
    )
  }

  const result = whatIfResult || evaluation

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Commercial Deal Evaluation
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Commercial Verdict & Negotiation Target
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Deterministic P&L valuation based on target product margins.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            {error}
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
                <div className="text-[10px] text-[#18181B]/50 font-bold uppercase">PROVENANCE: CONFIRMED</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs text-center space-y-1">
                <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Landed Cost</div>
                <div className="font-['Instrument_Serif'] text-3xl font-bold text-[#18181B]">
                  ${result.landed_cost_per_bbl?.toFixed(2)} <span className="text-xs text-[#18181B]/60 font-sans">/bbl</span>
                </div>
                <div className="text-[10px] text-[#18181B]/50 font-bold uppercase">PROVENANCE: CALCULATED</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs text-center space-y-1">
                <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Expected Profit</div>
                <div className="font-['Instrument_Serif'] text-3xl font-bold text-emerald-700">
                  ${(result.expected_profit_usd / 1e6)?.toFixed(2)}M
                </div>
                <div className="text-[10px] text-emerald-700 font-bold uppercase">PROVENANCE: CALCULATED</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#18181B]/10 shadow-xs text-center space-y-1">
                <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Maximum Acceptable Price</div>
                <div className="font-['Instrument_Serif'] text-3xl font-bold text-[#18181B]">
                  ${(result.max_acceptable_price_usd / 1e6)?.toFixed(2)}M
                </div>
                <div className="text-[10px] text-[#18181B]/50 font-bold uppercase">TARGET CEILING</div>
              </div>
            </div>

            {/* What-If Commercial Sensitivity Simulator */}
            <GlassPanel className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Commercial Price Simulator</h3>
                <span className="text-xs text-[#18181B]/60 uppercase font-semibold">Simulate Counter-Offer Impact</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#18181B]/70">
                    <span>Simulated Quoted Price ($ Total)</span>
                    <span className="font-bold text-[#18181B]">${whatIfPrice?.toLocaleString()}</span>
                  </div>

                  <input
                    type="range"
                    min="1000000"
                    max="4000000"
                    step="50000"
                    value={whatIfPrice}
                    onChange={(e) => setWhatIfPrice(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#18181B]/10 rounded-lg appearance-none cursor-pointer accent-[#18181B]"
                  />
                </div>

                <button
                  onClick={handleWhatIf}
                  disabled={whatIfLoading}
                  className="rounded-full bg-[#18181B] px-6 py-3 text-xs font-semibold text-white hover:bg-black transition-all shadow-sm shrink-0 self-end"
                >
                  {whatIfLoading ? 'Simulating...' : 'Re-calculate Verdict →'}
                </button>
              </div>
            </GlassPanel>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}`)}
                className="text-xs font-medium text-[#18181B]/70 hover:text-[#18181B]"
              >
                ← Test Another Quote
              </button>

              <button
                onClick={() => router.push(`/strategy?scenario_id=${scenarioId}`)}
                className="rounded-full bg-[#18181B] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all shadow-md"
              >
                Proceed to Strategy Solver →
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
