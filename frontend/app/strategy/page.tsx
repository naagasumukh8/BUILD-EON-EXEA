'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, SightCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

function SupplyFlowVisualizer({ allocations }: { allocations: any[] }) {
  if (!allocations || allocations.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Percentage Composition Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {allocations.map((a, idx) => (
          <div key={idx} className="sight-card text-center p-6 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#111411]/60 font-semibold block">
              {a.option_type?.replace('_', ' ')}
            </span>
            <div className="title-ogg text-5xl font-bold text-[#111411]">{a.allocated_pct.toFixed(0)}%</div>
            <div className="font-semibold text-base text-[#111411]">{a.option_name}</div>
            <div className="text-xs text-[#111411]/70 font-mono">
              {Number(a.allocated_volume).toLocaleString()} Barrels
            </div>
            <div className="pt-2">
              <GlassBadge status={a.provenance_status || 'CALCULATED'} />
            </div>
          </div>
        ))}
      </div>

      {/* Visual Flow Connector Line */}
      <div className="flex items-center justify-center gap-4 text-xs font-mono uppercase tracking-widest text-[#fdf1e1]/60 my-4">
        <div className="h-[1px] flex-1 bg-[rgba(253,241,225,0.2)]" />
        <span>───────── SUPPLY FLOW ─────────</span>
        <div className="h-[1px] flex-1 bg-[rgba(253,241,225,0.2)]" />
      </div>
    </div>
  )
}

function ComparisonPanel({ baseline, recommended }: { baseline: any; recommended: any }) {
  if (!baseline || !recommended) return null

  const costSavings = (baseline.total_cost_usd || 0) - (recommended.total_cost_usd || 0)
  const marginDiff = (recommended.expected_margin_pct || 0) - (baseline.expected_margin_pct || 0)

  return (
    <GlassPanel className="border-[rgba(253,241,225,0.25)] shadow-[0_24px_60px_rgba(0,0,0,0.7)] space-y-6">
      <div className="flex items-center justify-between border-b border-[rgba(253,241,225,0.15)] pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">
            Status Quo vs Hybrid Recommendation
          </span>
          <h3 className="title-ogg text-2xl sm:text-3xl text-[#fdf1e1]">Performance Comparison</h3>
        </div>
        <GlassBadge status="CALCULATED" label="OR-Tools Solver" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#0a121c]/70 border border-[rgba(253,241,225,0.15)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#fdf1e1]/50">Baseline (Single Option)</span>
            <GlassBadge status="CONFIRMED" />
          </div>
          <div className="text-2xl font-bold text-[#fdf1e1] title-ogg">{baseline.name}</div>
          <div className="space-y-2 text-xs text-[#fdf1e1]/70 pt-2">
            <div className="flex justify-between"><span>Total Cost:</span><span className="text-[#fdf1e1] font-bold font-mono">${((baseline.total_cost_usd || 0) / 1e6).toFixed(2)}M</span></div>
            <div className="flex justify-between"><span>Cost / bbl:</span><span className="text-[#fdf1e1] font-bold font-mono">${(baseline.cost_per_bbl || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Expected Margin:</span><span className="text-[#fdf1e1] font-bold font-mono">{(baseline.expected_margin_pct || 0).toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>ETA:</span><span className="text-[#fdf1e1] font-bold">{baseline.eta_days} Days</span></div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#fdf1e1]/10 border border-[#fdf1e1]/40 shadow-[0_0_40px_rgba(253,241,225,0.1)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#fdf1e1]">★ Recommended Strategy</span>
            <GlassBadge status="CALCULATED" label="Rank #1" />
          </div>
          <div className="text-2xl font-bold text-[#fdf1e1] title-ogg">{recommended.name}</div>
          <div className="space-y-2 text-xs text-[#fdf1e1]/80 pt-2">
            <div className="flex justify-between"><span>Total Cost:</span><span className="text-[#10b981] font-bold font-mono">${((recommended.total_cost_usd || 0) / 1e6).toFixed(2)}M</span></div>
            <div className="flex justify-between"><span>Cost / bbl:</span><span className="text-[#10b981] font-bold font-mono">${(recommended.cost_per_bbl || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Expected Margin:</span><span className="text-[#10b981] font-bold font-mono">{(recommended.expected_margin_pct || 0).toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>ETA:</span><span className="text-[#fdf1e1] font-bold">{recommended.eta_days} Days</span></div>
          </div>
        </div>
      </div>

      {costSavings > 0 && (
        <div className="p-4 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/40 text-center space-y-1">
          <div className="text-xl font-bold text-[#10b981]">
            Estimated Net Savings: ${((costSavings) / 1e6).toFixed(2)}M USD
          </div>
          <div className="text-xs text-[#fdf1e1]/70">
            Achieves +{marginDiff.toFixed(1)}% margin improvement over single-vessel status quo.
          </div>
        </div>
      )}
    </GlassPanel>
  )
}

function StrategyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || ''
  const dealId = searchParams.get('deal_id') || ''

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [weights, setWeights] = useState({ cost: 0.4, time: 0.35, risk: 0.25 })

  const runOptimizer = async () => {
    if (!scenarioId || !dealId) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await api.optimize({
        scenario_id: scenarioId,
        deal_ids: [dealId],
        include_pipelines: true,
        include_alternate_routes: true,
        cost_weight: weights.cost,
        time_weight: weights.time,
        risk_weight: weights.risk,
      })
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getExplanation = async () => {
    if (!result) return
    setExplainLoading(true)
    try {
      const res = await api.explain(result.optimization_run_id, scenarioId)
      setExplanation(res.explanation)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setExplainLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Editorial Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">
                OR-Tools Optimization Center
              </span>
              <GlassBadge status="CALCULATED" label="No LLM Math" />
            </div>
            <h1 className="title-ogg text-4xl sm:text-5xl text-[#fdf1e1]">
              Your best way forward.
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runOptimizer}
              disabled={loading || !dealId}
              className="btn-paper px-7 py-3 text-sm font-semibold"
            >
              {loading ? '⚙️ Solving Linear Engine...' : '⚡ Run Optimization'}
            </button>
            {result && (
              <button
                onClick={() => router.push(`/report?scenario_id=${scenarioId}&run_id=${result.optimization_run_id}`)}
                className="btn-glass text-sm px-6 py-3"
              >
                📄 Generate Report →
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
            ⚠️ {error}
          </div>
        )}

        {/* Priority Slider Controls */}
        <GlassPanel className="p-6">
          <div className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium mb-3">
            Optimization Priority Weights
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { key: 'cost', label: 'Cost Minimisation' },
              { key: 'time', label: 'Transit Time' },
              { key: 'risk', label: 'Disruption Risk' },
            ].map((w) => (
              <div key={w.key} className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#fdf1e1]/80">
                  <span>{w.label}</span>
                  <span className="font-bold text-[#fdf1e1] font-mono">
                    {(weights[w.key as keyof typeof weights] * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights[w.key as keyof typeof weights]}
                  onChange={(e) => setWeights((ww) => ({ ...ww, [w.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-[#fdf1e1] h-2 bg-[#0a121c] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </GlassPanel>

        {result && (
          <div className="space-y-8">
            {/* Visual Allocation Flow */}
            <GlassPanel className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">
                    Optimal Hybrid Allocation
                  </span>
                  <h3 className="title-ogg text-3xl text-[#fdf1e1]">{result.recommended?.name}</h3>
                </div>
                <GlassBadge status="CALCULATED" label="Rank #1" />
              </div>
              <SupplyFlowVisualizer allocations={result.recommended?.allocations || []} />
            </GlassPanel>

            {/* Baseline Comparison */}
            <ComparisonPanel baseline={result.baseline} recommended={result.recommended} />

            {/* Ranked Strategy Cards List */}
            <div className="space-y-4">
              <h3 className="title-ogg text-3xl text-[#fdf1e1]">Evaluated Strategy Combinations</h3>
              <div className="grid grid-cols-1 gap-4">
                {result.strategies?.map((s: any) => (
                  <GlassPanel
                    key={s.rank}
                    className={`p-6 border transition-all ${
                      s.is_recommended ? 'border-[#fdf1e1]/50 bg-[#fdf1e1]/10' : 'border-[rgba(253,241,225,0.15)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-sm text-[#fdf1e1] font-mono">#{s.rank}</span>
                          <h4 className="font-semibold text-lg text-[#fdf1e1] title-ogg">{s.name}</h4>
                          {s.is_recommended && <GlassBadge status="CONFIRMED" label="RECOMMENDED" />}
                        </div>
                        <div className="text-xs text-[#fdf1e1]/60">
                          Coverage: {s.coverage_pct}% ({Number(s.allocated_volume).toLocaleString()} Barrels)
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-5 text-xs text-right">
                        <div>
                          <div className="text-[#fdf1e1]/50 mb-0.5">Cost/bbl</div>
                          <div className="font-bold text-[#fdf1e1] font-mono">${s.cost_per_bbl?.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[#fdf1e1]/50 mb-0.5">Total Cost</div>
                          <div className="font-bold text-[#fdf1e1] font-mono">${(s.total_cost_usd / 1e6).toFixed(2)}M</div>
                        </div>
                        <div>
                          <div className="text-[#fdf1e1]/50 mb-0.5">Margin</div>
                          <div className="font-bold text-[#10b981] font-mono">{s.expected_margin_pct?.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-[#fdf1e1]/50 mb-0.5">ETA</div>
                          <div className="font-bold text-[#fdf1e1]">{s.eta_days} Days</div>
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </div>

            {/* Gemini Decision Rationale */}
            <GlassPanel className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="title-ogg text-2xl text-[#fdf1e1]">Gemini Executive Rationale</h3>
                  <p className="text-xs text-[#fdf1e1]/60">AI explanation of the deterministic solver allocation.</p>
                </div>
                <button className="btn-ghost-glass text-xs" onClick={getExplanation} disabled={explainLoading}>
                  {explainLoading ? 'Analyzing solver output...' : '🤖 Generate Gemini Rationale'}
                </button>
              </div>

              {explanation ? (
                <div className="p-5 rounded-2xl bg-[#0a121c]/80 border border-[rgba(253,241,225,0.15)] text-sm text-[#fdf1e1]/90 leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </div>
              ) : (
                <div className="text-xs text-[#fdf1e1]/50 italic">
                  Click "Generate Gemini Rationale" for executive decision trade-off analysis.
                </div>
              )}
            </GlassPanel>
          </div>
        )}
      </main>
    </div>
  )
}

export default function StrategyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1110] flex items-center justify-center text-[#fdf1e1]/70">Loading Strategy Optimizer...</div>}>
      <StrategyContent />
    </Suspense>
  )
}
