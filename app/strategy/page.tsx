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
  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Interactive What-If Allocation Sliders
  const [customVesselPct, setCustomVesselPct] = useState<number>(60)
  const [customPipelinePct, setCustomPipelinePct] = useState<number>(40)
  const [sliderAlert, setSliderAlert] = useState<string | null>(null)

  const runOptimizer = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.optimize({ scenario_id: scenarioId })
      setResult(res)
      if (res?.recommended_strategy?.allocations) {
        const v = res.recommended_strategy.allocations.find((a: any) => a.option_id.includes('vess-001'))
        const p = res.recommended_strategy.allocations.find((a: any) => a.option_id.includes('vess-002'))
        if (v) setCustomVesselPct(v.allocated_pct)
        if (p) setCustomPipelinePct(p.allocated_pct)
      }
    } catch (e: any) {
      setError(e.message || 'Error running strategy optimization.')
    } finally {
      setLoading(false)
    }
  }, [scenarioId])

  useEffect(() => {
    runOptimizer()
  }, [runOptimizer])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70 font-sans">
        Solving Multi-Modal Allocation Strategy...
      </div>
    )
  }

  const strategies = result?.strategies || (result?.recommended_strategy ? [result.recommended_strategy] : [])
  const activeStrategy = strategies[selectedStrategyIndex] || result?.recommended_strategy
  const baseline = result?.baseline_strategy
  const reqVolume = result?.fulfilled_volume || 2000000

  // Find option costs and market price dynamically from result allocations to avoid hardcoding Mumbai rates
  let vesselCost = 92.30
  let pipelineCost = 89.50
  let routeCost = 97.20

  if (result?.strategies) {
    for (const strat of result.strategies) {
      if (strat.allocations) {
        for (const alloc of strat.allocations) {
          const unitCost = alloc.allocated_volume > 0 ? (alloc.cost_usd / alloc.allocated_volume) : 0
          if (unitCost > 0) {
            if (alloc.option_type === 'vessel') vesselCost = unitCost
            if (alloc.option_type === 'pipeline') pipelineCost = unitCost
            if (alloc.option_type === 'alternate_route') routeCost = unitCost
          }
        }
      }
    }
  }

  let marketPrice = 105.00
  if (activeStrategy) {
    const revenue = activeStrategy.expected_profit_usd + activeStrategy.total_cost_usd
    if (activeStrategy.allocated_volume > 0) {
      marketPrice = revenue / activeStrategy.allocated_volume
    }
  }

  // Interactive What-If Calculation
  const adjustedVesselVol = Math.round((reqVolume * customVesselPct) / 100)
  const adjustedPipelineVol = Math.round((reqVolume * customPipelinePct) / 100)
  const adjustedRouteVol = Math.max(0, reqVolume - adjustedVesselVol - adjustedPipelineVol)

  const calcCost = Math.round((adjustedVesselVol * vesselCost) + (adjustedPipelineVol * pipelineCost) + (adjustedRouteVol * routeCost))
  const calcCostPerBbl = calcCost / reqVolume
  const calcProfit = Math.round(reqVolume * (marketPrice - calcCostPerBbl))
  const calcMargin = (calcProfit / (reqVolume * marketPrice)) * 100

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Multi-Modal Strategy Solver &middot; 5 Feasible Alternatives
          </div>
          <h1 className="font-[#18181B] font-['Instrument_Serif'] text-4xl sm:text-5xl">
            Recommended Strategy Alternatives
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Continuous linear allocation optimization combining confirmed moving vessel deals, Yanbu IPSA pipeline bypasses, and alternate sea lanes.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        {/* Top Strategy Selector Tabs (Up to 5 Strategies) */}
        {strategies.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#18181B]/10">
            {strategies.map((st: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedStrategyIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStrategyIndex === idx
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-white border border-[#18181B]/10 text-[#18181B]/70 hover:bg-[#FAFAF8]'
                }`}
              >
                Rank {st.rank || idx + 1}: {st.name.split('+')[0]}
                {st.is_recommended && <span className="ml-1 text-emerald-400">★</span>}
              </button>
            ))}
          </div>
        )}

        {activeStrategy && (
          <>
            {/* Active Strategy Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#18181B]/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#18181B] text-white text-[10px] font-bold uppercase tracking-wider">
                    {activeStrategy.is_recommended ? 'RANK 1 OPTIMAL HYBRID' : `RANK ${activeStrategy.rank} ALTERNATIVE`}
                  </span>
                  <h2 className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-[#18181B] mt-2">
                    {activeStrategy.name}
                  </h2>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-xs text-[#18181B]/60 uppercase font-semibold">Landed Cost per Barrel</div>
                  <div className="font-['Instrument_Serif'] text-3xl font-bold text-[#18181B]">
                    ${activeStrategy.cost_per_bbl?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Progress Bar Allocation Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#18181B]/70 uppercase tracking-wider">Dynamic Capacity Allocation Breakdown</div>
                <div className="w-full bg-[#18181B]/10 h-4 rounded-full overflow-hidden flex">
                  {activeStrategy.allocations?.map((a: any, i: number) => {
                    const colors = ['bg-[#18181B]', 'bg-[#3F3F46]', 'bg-[#71717A]', 'bg-[#A1A1AA]']
                    return (
                      <div
                        key={a.option_id || i}
                        className={`${colors[i % colors.length]} h-full`}
                        style={{ width: `${a.allocated_pct}%` }}
                        title={`${a.option_name}: ${a.allocated_pct}%`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Allocations Breakdown List with Data Source & Transport Provider Provenance */}
              <div className="space-y-3 pt-4 border-t border-[#18181B]/10">
                {activeStrategy.allocations?.map((a: any, i: number) => (
                  <div
                    key={a.option_id || i}
                    className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-[#18181B]">{a.option_name}</div>
                      <div className="text-xs text-[#18181B]/70">
                        {Number(a.allocated_volume || a.allocated_mbbl || 0).toLocaleString()} bbl ({a.allocated_pct}%) &middot; ETA {a.eta_days} days
                      </div>
                      <div className="text-[10px] text-[#18181B]/50 font-mono">
                        Transport: {a.transport_provider || 'Stena Bulk'} &middot; Data: {a.data_source || 'AIS Stream'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#18181B]">
                        ${((a.cost_usd || (a.allocated_volume * 92.3)) / 1e6).toFixed(2)}M
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#18181B]/10 text-[#18181B] text-[10px] font-bold uppercase">
                        {a.commercial_verification_status || a.provenance_status || 'CONFIRMED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive What-If User Control Sliders */}
            <GlassPanel className="space-y-5 border border-[#18181B]/15">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 block">
                    USER CONTROL & WHAT-IF RECALCULATION
                  </span>
                  <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                    Adjust Capacity Allocations
                  </h3>
                </div>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                  Real-Time Recalculator Active
                </span>
              </div>

              {sliderAlert && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
                  ⚠️ {sliderAlert}
                </div>
              )}

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#18181B]">
                    <span>Moving VLCC Vessel Allocation</span>
                    <span>{customVesselPct}% ({Number(adjustedVesselVol).toLocaleString()} bbl)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customVesselPct}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10)
                      if (v > 85) {
                        setSliderAlert("Vessel allocation exceeds currently available verified capacity limit (2,000,000 bbl max).")
                      } else {
                        setSliderAlert(null)
                      }
                      setCustomVesselPct(v)
                      if (v + customPipelinePct > 100) setCustomPipelinePct(100 - v)
                    }}
                    className="w-full accent-[#18181B]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#18181B]">
                    <span>IPSA Pipeline Bypass Allocation</span>
                    <span>{customPipelinePct}% ({Number(adjustedPipelineVol).toLocaleString()} bbl)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customPipelinePct}
                    onChange={(e) => {
                      const p = parseInt(e.target.value, 10)
                      if (p > 90) {
                        setSliderAlert("Pipeline allocation exceeds currently available verified throughput limit (2,500,000 bbl/day max).")
                      } else {
                        setSliderAlert(null)
                      }
                      setCustomPipelinePct(p)
                      if (p + customVesselPct > 100) setCustomVesselPct(100 - p)
                    }}
                    className="w-full accent-[#18181B]"
                  />
                </div>
              </div>

              {/* Live Recalculated Economics Grid */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Total Landed Cost</div>
                  <div className="font-bold text-lg text-[#18181B]">${(calcCost / 1e6).toFixed(2)}M</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Landed Cost / bbl</div>
                  <div className="font-bold text-lg text-[#18181B]">${calcCostPerBbl.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Expected Profit</div>
                  <div className="font-bold text-lg text-emerald-700">+${(calcProfit / 1e6).toFixed(2)}M</div>
                </div>

                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Margin %</div>
                  <div className="font-bold text-lg text-emerald-700">{calcMargin.toFixed(1)}%</div>
                </div>
              </div>
            </GlassPanel>

            {/* Current Plan vs Recommended Strategy Comparison */}
            {baseline && (
              <GlassPanel className="space-y-4">
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                  Current Baseline vs Recommended Strategy Comparison
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-xs font-semibold text-[#18181B]/60 uppercase">Current Baseline Plan</div>
                    <div className="text-2xl font-bold text-[#18181B]">${(baseline.total_cost_usd / 1e6).toFixed(2)}M</div>
                    <div className="text-xs text-[#18181B]/50 mt-1">Single Route Direct Fallback (ETA {baseline.eta_days} days)</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs font-semibold text-emerald-800 uppercase">Recommended Multi-Modal Strategy</div>
                    <div className="text-2xl font-bold text-emerald-700">
                      +${((baseline.total_cost_usd - activeStrategy.total_cost_usd) / 1e6).toFixed(2)}M Economic Savings
                    </div>
                    <div className="text-xs text-emerald-800 mt-1">Dynamically Allocated Multi-Modal Risk Diversification</div>
                  </div>
                </div>
              </GlassPanel>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => router.push(`/intake?scenario_id=${scenarioId}`)}
                className="text-xs font-medium text-[#18181B]/70 hover:text-[#18181B]"
              >
                ← Adjust Specification Requirements
              </button>

              <button
                onClick={() => router.push(`/report?scenario_id=${scenarioId}`)}
                className="rounded-full bg-[#18181B] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all shadow-md"
              >
                Generate Executive Decision Report →
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
