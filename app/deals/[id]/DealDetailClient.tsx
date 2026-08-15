'use client'

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

  const [whatIfPrice, setWhatIfPrice] = useState<number>(2000000)
  const [whatIfResult, setWhatIfResult] = useState<any>(null)
  const [whatIfLoading, setWhatIfLoading] = useState(false)

  const loadAndEvaluate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let savedDeal: any = null
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(`deal_${dealId}`)
        if (local) {
          try { savedDeal = JSON.parse(local) } catch (e) {}
        }
      }

      const res = await api.evaluateDeal({
        deal_id: dealId,
        scenario_id: scenarioId,
        ...(savedDeal || {})
      })

      setEvaluation(res)
      if (res && res.quoted_price_usd) {
        setWhatIfPrice(res.quoted_price_usd)
      }
    } catch (err: any) {
      console.error(err)
      setError('Failed to calculate commercial valuation.')
    } finally {
      setLoading(false)
    }
  }, [dealId, scenarioId])

  useEffect(() => {
    loadAndEvaluate()
  }, [loadAndEvaluate])

  const handleWhatIfRecalculate = async (price: number) => {
    setWhatIfLoading(true)
    try {
      const res = await api.evaluateDeal({
        deal_id: dealId,
        scenario_id: scenarioId,
        vessel_name: evaluation?.vessel_name || 'Stena Bulk Charter (VLCC)',
        confirmed_capacity_bbls: evaluation?.volume_bbls || 400000,
        volume_required: 2000000,
        quoted_price_usd: price
      })
      setWhatIfResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setWhatIfLoading(false)
    }
  }

  const activeEval = whatIfResult || evaluation

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70 font-sans">
        Computing Commercial P&amp;L &amp; Landed Margin Economics...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] font-sans">
      <Navbar scenarioId={scenarioId} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#18181B]/50">
              COMMERCIAL DEAL AUDIT &middot; {dealId}
            </span>
            <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B] mt-1">
              {activeEval?.vessel_name || 'Stena Bulk Charter (VLCC)'}
            </h1>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
              activeEval?.deal_verdict === 'GO'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            VERDICT: {activeEval?.deal_verdict || 'GO'}
          </span>
        </div>

        <GlassPanel className="p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-[#18181B]/10">
              <div className="text-[10px] text-[#18181B]/50 uppercase">Entered Freight Quote</div>
              <div className="font-bold text-base text-[#18181B] mt-1">
                ${Number(activeEval?.quoted_price_usd || 2000000).toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                ${Number(activeEval?.quoted_price_per_bbl || 5.00).toFixed(2)} / bbl
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#18181B]/10">
              <div className="text-[10px] text-[#18181B]/50 uppercase">Confirmed Capacity</div>
              <div className="font-bold text-base text-[#18181B] mt-1">
                {Number(activeEval?.volume_bbls || 400000).toLocaleString()} bbl
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {activeEval?.capacity_pct || 20}% of 2.0M Scenario
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#18181B]/10">
              <div className="text-[10px] text-[#18181B]/50 uppercase">Landed Cost / bbl</div>
              <div className="font-bold text-base text-[#18181B] mt-1">
                ${Number(activeEval?.landed_cost_per_bbl || 92.30).toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                Base $82.50 + Freight + $4.80 Ins
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#18181B]/10">
              <div className="text-[10px] text-[#18181B]/50 uppercase">Expected Net Profit</div>
              <div className={`font-bold text-base mt-1 ${
                Number(activeEval?.expected_profit_usd || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}>
                +${(Number(activeEval?.expected_profit_usd || 5080000) / 1e6).toFixed(2)}M
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                {Number(activeEval?.expected_margin_pct || 12.1).toFixed(1)}% Commercial Margin
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-2 text-xs">
            <div className="font-bold uppercase tracking-wider text-[#18181B]/60 text-[10px]">
              Recommendation Rationale &amp; Economic Ceiling
            </div>
            <p className="text-[#18181B]/80 leading-relaxed">
              {activeEval?.verdict_reason}
            </p>
          </div>

          <div className="pt-4 border-t border-[#18181B]/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                Interactive What-If Counter-Offer Simulator
              </h3>
              <span className="text-xs text-gray-500 font-mono">
                Target Ceiling: $4.125/bbl ($1,650,000 Total)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                value={whatIfPrice}
                onChange={(e) => setWhatIfPrice(Number(e.target.value))}
                className="px-4 py-2.5 rounded-xl border border-[#18181B]/20 text-sm font-bold text-blue-700 w-48 focus:outline-none focus:border-[#18181B]"
                placeholder="New Quoted Price USD"
              />
              <button
                type="button"
                onClick={() => handleWhatIfRecalculate(whatIfPrice)}
                disabled={whatIfLoading}
                className="px-6 py-2.5 rounded-full bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all"
              >
                {whatIfLoading ? 'Recalculating...' : 'Simulate Counter-Offer P&L'}
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-[#18181B]/10">
            <button
              type="button"
              onClick={() => router.push(`/map?scenario_id=${scenarioId}`)}
              className="px-6 py-3 rounded-full border border-[#18181B]/20 text-xs font-semibold hover:bg-black/5 transition-all"
            >
              &larr; Back to Network Map
            </button>

            <button
              type="button"
              onClick={() => router.push(`/strategy?scenario_id=${scenarioId}`)}
              className="rounded-full bg-[#18181B] px-8 py-3.5 text-xs font-semibold text-white hover:bg-black transition-all shadow-md"
            >
              Run Multi-Modal Strategy Optimization &rarr;
            </button>
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}

export default function DealDetailClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Deal Evaluation...</div>}>
      <DealDetailContent />
    </Suspense>
  )
}
