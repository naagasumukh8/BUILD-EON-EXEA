'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

function AllocationBar({ allocations }: { allocations: any[] }) {
  const colors = ['bg-accent', 'bg-go', 'bg-negotiate', 'bg-prov-reference', 'bg-prov-calculated']
  return (
    <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
      {allocations.map((a, i) => (
        <div
          key={i}
          className={`${colors[i % colors.length]} transition-all duration-700`}
          style={{ width: `${a.allocated_pct}%` }}
          title={`${a.option_name}: ${a.allocated_pct.toFixed(1)}%`}
        />
      ))}
    </div>
  )
}

function StrategyCard({ strategy, isRecommended, isBaseline, rank }: any) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`card p-5 transition-all duration-200
      ${isRecommended ? 'border-accent shadow-glow-blue' : ''}
      ${isBaseline ? 'border-border-mid opacity-80' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {isBaseline ? (
            <span className="badge badge-estimated">BASELINE</span>
          ) : isRecommended ? (
            <span className="badge badge-confirmed">★ AI RECOMMENDED</span>
          ) : (
            <span className="text-xs text-text-muted font-mono">#{rank}</span>
          )}
          <div>
            <div className="font-medium text-sm text-text-primary">{strategy.name}</div>
            <div className="text-xs text-text-muted">{strategy.allocations?.length || 0} options</div>
          </div>
        </div>
        <span className="badge badge-calculated">CALCULATED</span>
      </div>

      <AllocationBar allocations={strategy.allocations || []} />

      <div className="grid grid-cols-4 gap-3 mt-4">
        {[
          { l: 'Cost/bbl', v: `$${strategy.cost_per_bbl?.toFixed(2) || '—'}` },
          { l: 'Profit', v: strategy.expected_profit_usd != null ? `$${(strategy.expected_profit_usd/1e6).toFixed(1)}M` : '—' },
          { l: 'Margin', v: strategy.expected_margin_pct != null ? `${strategy.expected_margin_pct.toFixed(1)}%` : '—' },
          { l: 'ETA', v: `${strategy.eta_days || '?'} days` },
        ].map(m => (
          <div key={m.l} className="text-center">
            <div className="text-xs text-text-muted">{m.l}</div>
            <div className="text-sm font-bold text-text-primary">{m.v}</div>
          </div>
        ))}
      </div>

      {strategy.allocations?.length > 0 && (
        <button className="mt-3 text-xs text-accent hover:text-accent-bright" onClick={() => setOpen(!open)}>
          {open ? '▲ Hide breakdown' : '▼ Show allocation'}
        </button>
      )}
      {open && (
        <div className="mt-3 space-y-2">
          {strategy.allocations.map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${['bg-accent','bg-go','bg-negotiate','bg-prov-reference'][i%4]}`} />
                <span className="text-text-secondary">{a.option_name}</span>
                <span className="badge badge-simulated capitalize">{a.option_type}</span>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <span>{a.allocated_pct?.toFixed(1)}%</span>
                <span>{a.allocated_volume?.toLocaleString()} bbls</span>
                <span className="badge badge-calculated">{a.provenance_status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BaselineComparison({ baseline, recommended }: { baseline: any; recommended: any }) {
  if (!baseline || !recommended) return null
  const savings = baseline.total_cost_usd - recommended.total_cost_usd
  const marginDiff = recommended.expected_margin_pct - baseline.expected_margin_pct

  return (
    <div className="card p-5">
      <div className="label mb-4">Baseline vs AI Recommendation</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-text-muted mb-2">CURRENT BASELINE</div>
          {[
            { l: 'Total Cost', v: `$${(baseline.total_cost_usd/1e6).toFixed(2)}M` },
            { l: 'Cost/bbl', v: `$${baseline.cost_per_bbl?.toFixed(2)}` },
            { l: 'Margin', v: `${baseline.expected_margin_pct?.toFixed(1)}%` },
            { l: 'ETA', v: `${baseline.eta_days} days` },
            { l: 'Risk', v: `${(baseline.risk_score * 100).toFixed(0)}%` },
          ].map(r => (
            <div key={r.l} className="data-row">
              <span className="data-label">{r.l}</span>
              <span className="data-value text-text-muted">{r.v}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs text-accent-bright mb-2">★ AI RECOMMENDATION</div>
          {[
            { l: 'Total Cost', v: `$${(recommended.total_cost_usd/1e6).toFixed(2)}M`, highlight: 'text-go' },
            { l: 'Cost/bbl', v: `$${recommended.cost_per_bbl?.toFixed(2)}`, highlight: 'text-go' },
            { l: 'Margin', v: `${recommended.expected_margin_pct?.toFixed(1)}%`, highlight: 'text-go' },
            { l: 'ETA', v: `${recommended.eta_days} days` },
            { l: 'Risk', v: `${(recommended.risk_score * 100).toFixed(0)}%` },
          ].map(r => (
            <div key={r.l} className="data-row">
              <span className="data-label">{r.l}</span>
              <span className={`data-value ${r.highlight || ''}`}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
      {savings > 0 && (
        <div className="mt-4 p-3 bg-go/10 border border-go/30 rounded-btn text-center">
          <div className="text-go font-bold">Estimated savings: ${(savings/1e6).toFixed(2)}M</div>
          <div className="text-xs text-text-muted">vs baseline · {marginDiff > 0 ? '+' : ''}{marginDiff.toFixed(1)}% margin improvement <span className="badge badge-calculated">CALCULATED</span></div>
        </div>
      )}
    </div>
  )
}

export default function StrategyPage() {
  const params = useSearchParams()
  const router = useRouter()
  const scenarioId = params.get('scenario_id') || ''
  const dealId = params.get('deal_id') || ''

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
    <div className="min-h-screen bg-gradient-maritime">
      {/* Topbar */}
      <div className="bg-bg-panel border-b border-border-dim px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-accent-bright">MARITIME</span>
          <span className="text-text-muted text-sm">/ Strategy Optimizer</span>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost" onClick={() => router.push(`/deals/${dealId}?scenario_id=${scenarioId}`)}>← Deal Evaluator</button>
          {result && (
            <button className="btn-primary" onClick={() => router.push(`/report?scenario_id=${scenarioId}&run_id=${result.optimization_run_id}`)}>
              📄 Generate Report →
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Config */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title text-lg">OR-Tools Optimizer</div>
              <div className="text-xs text-text-muted mt-1">Deterministic — no LLM involved in allocation decisions</div>
            </div>
            <button className="btn-primary" onClick={runOptimizer} disabled={loading || !dealId}>
              {loading ? '⚙️ Optimizing...' : '⚡ Run Optimization'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'cost', label: 'Cost Weight' },
              { key: 'time', label: 'Time Weight' },
              { key: 'risk', label: 'Risk Weight' },
            ].map(w => (
              <div key={w.key}>
                <div className="flex justify-between mb-1">
                  <span className="label">{w.label}</span>
                  <span className="text-xs text-text-primary font-bold">{(weights[w.key as keyof typeof weights] * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05"
                  value={weights[w.key as keyof typeof weights]}
                  onChange={e => setWeights(ww => ({ ...ww, [w.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-accent-bright" />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-reject/10 border border-reject/30 rounded-btn text-sm text-reject">{error}</div>
        )}

        {result && (
          <div className="space-y-5">
            {/* Baseline comparison */}
            <BaselineComparison baseline={result.baseline} recommended={result.recommended} />

            {/* Strategies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="section-title text-lg">Ranked Strategies ({result.strategies?.length})</div>
              </div>
              <div className="space-y-4">
                {result.baseline && (
                  <StrategyCard strategy={result.baseline} isBaseline rank={0} />
                )}
                {result.strategies?.map((s: any, i: number) => (
                  <StrategyCard key={i} strategy={s} isRecommended={s.is_recommended} rank={s.rank} />
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="label">Gemini Explanation</div>
                  <div className="text-xs text-text-muted">AI explains the result — does not calculate it</div>
                </div>
                <button className="btn-ghost" onClick={getExplanation} disabled={explainLoading}>
                  {explainLoading ? '...' : '🤖 Explain'}
                </button>
              </div>
              {explanation ? (
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{explanation}</div>
              ) : (
                <div className="text-sm text-text-muted">Click "Explain" to get Gemini's narrative on why this strategy was selected.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
