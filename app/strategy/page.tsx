'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

function StrategyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runOptimizer = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.optimize({ scenario_id: scenarioId })
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [scenarioId])

  useEffect(() => {
    runOptimizer()
  }, [runOptimizer])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">
        Solving Continuous Linear Allocation with OR-Tools...
      </div>
    )
  }

  const recommended = result?.recommended_strategy
  const baseline = result?.baseline_strategy

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Step 4 &middot; OR-Tools Strategy Solver
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Multi-Modal Hybrid Strategy Allocation
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Continuous linear programming solver output. Excludes unverified candidate vessels automatically.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            ⚠️ {error}
          </div>
        )}

        {recommended && (
          <>
            {/* Recommendation Summary Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#18181B]/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    ⭐ RANK 1 RECOMMENDED
                  </span>
                  <h2 className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-[#18181B] mt-2">
                    {recommended.name}
                  </h2>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Weighted Cost / bbl</div>
                  <div className="font-['Instrument_Serif'] text-3xl font-bold text-[#18181B]">
                    ${recommended.cost_per_bbl?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Progress Bar Allocation Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#18181B]/70">Allocation Breakdown:</div>
                <div className="w-full bg-[#18181B]/10 h-4 rounded-full overflow-hidden flex">
                  {recommended.allocations?.map((a: any, i: number) => {
                    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500']
                    return (
                      <div
                        key={a.option_id}
                        className={`${colors[i % colors.length]} h-full`}
                        style={{ width: `${a.allocated_pct}%` }}
                        title={`${a.option_name}: ${a.allocated_pct}%`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Allocations Table */}
              <div className="space-y-3 pt-4 border-t border-[#18181B]/10">
                {recommended.allocations?.map((a: any) => (
                  <div
                    key={a.option_id}
                    className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-[#18181B]">{a.option_name}</div>
                      <div className="text-xs text-[#18181B]/60">
                        {Number(a.allocated_volume).toLocaleString()} bbl ({a.allocated_pct}%) · ETA {a.eta_days} days
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#18181B]">
                        ${(a.cost_usd / 1e6).toFixed(2)}M
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#18181B] text-white text-[10px] font-bold uppercase">
                        {a.provenance_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Baseline Comparison Card */}
            {baseline && (
              <GlassPanel className="space-y-4">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Baseline Comparison</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-xs text-[#18181B]/60">Single Route Fallback ({baseline.name})</div>
                    <div className="text-2xl font-bold text-[#18181B]">${(baseline.total_cost_usd / 1e6).toFixed(2)}M</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs text-emerald-800 font-semibold">Recommended Hybrid Savings</div>
                    <div className="text-2xl font-bold text-emerald-700">
                      +${((baseline.total_cost_usd - recommended.total_cost_usd) / 1e6).toFixed(2)}M Savings
                    </div>
                  </div>
                </div>
              </GlassPanel>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => router.push(`/intake?scenario_id=${scenarioId}`)}
                className="btn-ghost-glass"
              >
                ← Adjust Intake Weights
              </button>

              <button
                onClick={() => router.push(`/report?scenario_id=${scenarioId}`)}
                className="btn-paper text-base px-8"
              >
                📄 Generate Executive Decision Report →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function StrategyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Strategy Optimizer...</div>}>
      <StrategyContent />
    </Suspense>
  )
}
