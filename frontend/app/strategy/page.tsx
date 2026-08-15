'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, GlassCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

function AllocationVisualizer({ allocations }: { allocations: any[] }) {
  if (!allocations || allocations.length === 0) return null

  const colorPalette = [
    { bg: 'bg-[#1e6faa]', border: 'border-[#2a9aff]', text: 'text-[#2a9aff]' },
    { bg: 'bg-[#10b981]', border: 'border-[#34d399]', text: 'text-[#34d399]' },
    { bg: 'bg-[#f59e0b]', border: 'border-[#fbbf24]', text: 'text-[#fbbf24]' },
    { bg: 'bg-[#a855f7]', border: 'border-[#c084fc]', text: 'text-[#c084fc]' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex h-5 rounded-full overflow-hidden p-0.5 bg-[#0a121c] border border-[rgba(30,90,140,0.3)]">
        {allocations.map((a, idx) => {
          const col = colorPalette[idx % colorPalette.length]
          return (
            <div
              key={idx}
              className={`${col.bg} transition-all duration-700 h-full first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${a.allocated_pct}%` }}
              title={`${a.option_name}: ${a.allocated_pct.toFixed(1)}%`}
            />
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {allocations.map((a, idx) => {
          const col = colorPalette[idx % colorPalette.length]
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl bg-[#0a121c]/70 border ${col.border} flex items-center justify-between text-xs`}
            >
              <div>
                <div className="font-semibold text-[#fdf1e1] text-sm">{a.allocated_pct.toFixed(0)}%</div>
                <div className="text-[#8aacca]">{a.option_name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-[#fdf1e1]">{Number(a.allocated_volume).toLocaleString()} bbls</div>
                <GlassBadge status={a.provenance_status || 'CALCULATED'} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ComparisonPanel({ baseline, recommended }: { baseline: any; recommended: any }) {
  if (!baseline || !recommended) return null

  const costSavings = (baseline.total_cost_usd || 0) - (recommended.total_cost_usd || 0)
  const marginDiff = (recommended.expected_margin_pct || 0) - (baseline.expected_margin_pct || 0)

  return (
    <GlassPanel className="border-[#2a9aff]/40 shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-6">
      <div className="flex items-center justify-between border-b border-[rgba(30,90,140,0.3)] pb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
            Status Quo vs AI Optimization
          </div>
          <h3 className="title-ogg text-2xl text-[#fdf1e1]">Strategy Performance Comparison</h3>
        </div>
        <GlassBadge status="CALCULATED" label="OR-Tools Solver" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#0a121c]/70 border border-[rgba(30,90,140,0.3)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#6b8499]">Baseline (Single Option)</span>
            <GlassBadge status="CONFIRMED" />
          </div>
          <div className="text-xl font-bold text-[#fdf1e1]">{baseline.name}</div>
          <div className="space-y-2 text-xs text-[#8aacca]">
            <div className="flex justify-between"><span>Total Cost:</span><span className="text-[#fdf1e1] font-semibold">${((baseline.total_cost_usd || 0) / 1e6).toFixed(2)}M</span></div>
            <div className="flex justify-between"><span>Cost / bbl:</span><span className="text-[#fdf1e1] font-semibold">${(baseline.cost_per_bbl || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Expected Margin:</span><span className="text-[#fdf1e1] font-semibold">{(baseline.expected_margin_pct || 0).toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>ETA:</span><span className="text-[#fdf1e1] font-semibold">{baseline.eta_days} Days</span></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1e6faa]/15 border border-[#2a9aff]/50 shadow-[0_0_30px_rgba(42,154,255,0.2)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#2a9aff]">★ Recommended Strategy</span>
            <GlassBadge status="CALCULATED" label="Rank #1" />
          </div>
          <div className="text-xl font-bold text-[#fdf1e1]">{recommended.name}</div>
          <div className="space-y-2 text-xs text-[#8aacca]">
            <div className="flex justify-between"><span>Total Cost:</span><span className="text-[#10b981] font-bold">${((recommended.total_cost_usd || 0) / 1e6).toFixed(2)}M</span></div>
            <div className="flex justify-between"><span>Cost / bbl:</span><span className="text-[#10b981] font-bold">${(recommended.cost_per_bbl || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Expected Margin:</span><span className="text-[#10b981] font-bold">{(recommended.expected_margin_pct || 0).toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>ETA:</span><span className="text-[#fdf1e1] font-semibold">{recommended.eta_days} Days</span></div>
          </div>
        </div>
      </div>

      {costSavings > 0 && (
        <div className="p-4 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 text-center space-y-1">
          <div className="text-lg font-bold text-[#10b981]">
            Estimated Net Savings: ${((costSavings) / 1e6).toFixed(2)}M USD
          </div>
          <div className="text-xs text-[#8aacca]">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
                OR-Tools Linear Optimization
              </span>
              <GlassBadge status="CALCULATED" label="No LLM Math" />
            </div>
            <h1 className="title-ogg text-3xl sm:text-4xl text-[#fdf1e1]">
              Recommended Supply Strategy
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runOptimizer}
              disabled={loading || !dealId}
              className="btn-paper px-6 py-2.5 text-sm font-semibold"
            >
              {loading ? '⚙️ Solving Math...' : '⚡ Run Optimization'}
            </button>
            {result && (
              <button
                onClick={() => router.push(`/report?scenario_id=${scenarioId}&run_id=${result.optimization_run_id}`)}
                className="btn-glass text-sm px-5 py-2.5"
              >
                📄 Generate Report →
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
            ⚠️ {error}
          </div>
        )}

        <GlassPanel className="p-5">
          <div className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold mb-3">
            Optimizer Weight Parameters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { key: 'cost', label: 'Cost Minimisation' },
              { key: 'time', label: 'Transit Time' },
              { key: 'risk', label: 'Risk Score' },
            ].map((w) => (
              <div key={w.key} className="space-y-1">
                <div className="flex justify-between text-xs text-[#8aacca]">
                  <span>{w.label}</span>
                  <span className="font-bold text-[#2a9aff]">
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
                  className="w-full accent-[#2a9aff] h-2 bg-[#0a121c] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </GlassPanel>

        {result && (
          <div className="space-y-8">
            <GlassPanel className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
                    Optimal Capacity Allocation
                  </span>
                  <h3 className="title-ogg text-2xl text-[#fdf1e1]">{result.recommended?.name}</h3>
                </div>
                <GlassBadge status="CALCULATED" label="Rank #1" />
              </div>
              <AllocationVisualizer allocations={result.recommended?.allocations || []} />
            </GlassPanel>

            <ComparisonPanel baseline={result.baseline} recommended={result.recommended} />

            <div className="space-y-4">
              <h3 className="title-ogg text-2xl text-[#fdf1e1]">Evaluated Supply Combinations</h3>
              <div className="grid grid-cols-1 gap-4">
                {result.strategies?.map((s: any) => (
                  <GlassCard
                    key={s.rank}
                    className={`border ${
                      s.is_recommended ? 'border-[#2a9aff] bg-[#1e6faa]/15' : 'border-[rgba(30,80,120,0.3)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-sm text-[#2a9aff]">#{s.rank}</span>
                          <h4 className="font-semibold text-base text-[#fdf1e1]">{s.name}</h4>
                          {s.is_recommended && <GlassBadge status="CONFIRMED" label="RECOMMENDED" />}
                        </div>
                        <div className="text-xs text-[#8aacca]">
                          Coverage: {s.coverage_pct}% ({Number(s.allocated_volume).toLocaleString()} bbls)
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-xs text-right">
                        <div>
                          <div className="text-[#6b8499]">Cost/bbl</div>
                          <div className="font-bold text-[#fdf1e1]">${s.cost_per_bbl?.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[#6b8499]">Total Cost</div>
                          <div className="font-bold text-[#fdf1e1]">${(s.total_cost_usd / 1e6).toFixed(2)}M</div>
                        </div>
                        <div>
                          <div className="text-[#6b8499]">Margin</div>
                          <div className="font-bold text-[#10b981]">{s.expected_margin_pct?.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-[#6b8499]">ETA</div>
                          <div className="font-bold text-[#fdf1e1]">{s.eta_days}d</div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            <GlassPanel className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="title-ogg text-xl text-[#fdf1e1]">Gemini Decision Rationale</h3>
                  <p className="text-xs text-[#8aacca]">AI explanation of the deterministic solver output.</p>
                </div>
                <button className="btn-ghost-glass text-xs" onClick={getExplanation} disabled={explainLoading}>
                  {explainLoading ? 'Generating Explanation...' : '🤖 Generate Gemini Analysis'}
                </button>
              </div>

              {explanation ? (
                <div className="p-4 rounded-2xl bg-[#0a121c]/80 border border-[rgba(30,90,140,0.3)] text-sm text-[#e2eaf4] leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </div>
              ) : (
                <div className="text-xs text-[#6b8499] italic">
                  Click "Generate Gemini Analysis" for executive trade-off narrative.
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
    <Suspense fallback={<div className="min-h-screen bg-[#080e14] flex items-center justify-center text-[#8aacca]">Loading Optimizer...</div>}>
      <StrategyContent />
    </Suspense>
  )
}
