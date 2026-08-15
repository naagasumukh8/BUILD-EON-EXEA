'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

function VerdictCard({ verdict, reason }: { verdict: string; reason: string }) {
  const config: Record<string, { cls: string; icon: string; title: string }> = {
    GO:        { cls: 'verdict-go',        icon: '✅', title: 'GO — Accept this deal' },
    NEGOTIATE: { cls: 'verdict-negotiate', icon: '🤝', title: 'NEGOTIATE — Counter offer' },
    REJECT:    { cls: 'verdict-reject',    icon: '❌', title: 'REJECT — Walk away' },
  }
  const c = config[verdict] || config['REJECT']
  return (
    <div className={`badge ${c.cls} text-base px-6 py-3 rounded-card w-full justify-center gap-3`}>
      <span className="text-2xl">{c.icon}</span>
      <span className="font-bold tracking-wide">{c.title}</span>
    </div>
  )
}

function ProvenanceBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED:    'badge-confirmed',
    REAL_REFERENCE: 'badge-reference',
    ESTIMATED:    'badge-estimated',
    SIMULATED:    'badge-simulated',
    CALCULATED:   'badge-calculated',
  }
  return <span className={`badge ${map[status] || 'badge-simulated'}`}>{status.replace('_', ' ')}</span>
}

function Metric({ label, value, prov, highlight }: { label: string; value: string; prov?: string; highlight?: string }) {
  return (
    <div className="card p-4">
      <div className="label mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight || 'text-text-primary'}`}>{value}</div>
      {prov && <div className="mt-1"><ProvenanceBadge status={prov} /></div>}
    </div>
  )
}

export default function DealEvaluatorPage() {
  const { id: dealId } = useParams<{ id: string }>()
  const params = useSearchParams()
  const router = useRouter()
  const scenarioId = params.get('scenario_id') || ''

  const [deal, setDeal] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [evalLoading, setEvalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // What-if state
  const [whatIfPrice, setWhatIfPrice] = useState<number>(0)
  const [whatIfResult, setWhatIfResult] = useState<any>(null)
  const [whatIfLoading, setWhatIfLoading] = useState(false)

  const loadAndEvaluate = useCallback(async () => {
    try {
      const d = await api.getDeal(dealId)
      setDeal(d)
      setWhatIfPrice(parseFloat(d.quoted_price) || 0)

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

  useEffect(() => { loadAndEvaluate() }, [loadAndEvaluate])

  const runWhatIf = async () => {
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

  const fmt = (n: number | undefined, prefix = '$', decimals = 0) =>
    n != null ? `${prefix}${n.toLocaleString('en', { maximumFractionDigits: decimals })}` : '—'
  const fmtPct = (n: number | undefined) =>
    n != null ? `${n.toFixed(1)}%` : '—'

  const ev = whatIfResult || evaluation

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-gradient-maritime">
      {/* Topbar */}
      <div className="bg-bg-panel border-b border-border-dim px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-accent-bright">MARITIME</span>
          <span className="text-text-muted text-sm">/ Deal Evaluator</span>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost" onClick={() => router.push(`/map?scenario_id=${scenarioId}`)}>← Map</button>
          {evaluation && (
            <button
              className="btn-primary"
              onClick={() => router.push(`/strategy?scenario_id=${scenarioId}&deal_id=${dealId}`)}
            >
              ⚡ Run Optimizer →
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-3 gap-6">

          {/* Left: Deal info */}
          <div className="col-span-1 space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="label">Confirmed Deal</div>
                <span className="badge badge-confirmed">CONFIRMED</span>
              </div>
              {deal && (
                <div className="space-y-2 text-sm">
                  <div className="data-row"><span className="data-label">Type</span><span className="data-value capitalize">{deal.deal_type}</span></div>
                  <div className="data-row"><span className="data-label">Counterparty</span><span className="data-value">{deal.counterparty || '—'}</span></div>
                  <div className="data-row"><span className="data-label">Product</span><span className="data-value capitalize">{deal.product}</span></div>
                  <div className="data-row"><span className="data-label">Volume</span><span className="data-value">{fmt(deal.capacity_volume, '', 0)} bbls</span></div>
                  <div className="data-row"><span className="data-label">Quoted</span><span className="data-value">{deal.quoted_price_currency} {Number(deal.quoted_price).toLocaleString()} ({deal.quoted_price_unit})</span></div>
                </div>
              )}
            </div>

            {/* What-if */}
            <div className="card p-5">
              <div className="label mb-3">What-If Simulator</div>
              <div className="text-xs text-text-muted mb-3">
                Change the quoted price and see how it affects the verdict instantly.
                <br/><span className="text-prov-calculated">DETERMINISTIC — no AI</span>
              </div>
              <label className="label mb-1 block">New Quote (USD)</label>
              <input
                type="number"
                className="input mb-3"
                value={whatIfPrice}
                step={10000}
                onChange={e => setWhatIfPrice(parseFloat(e.target.value))}
              />
              {ev && (
                <div className="text-xs text-text-muted mb-3">
                  Max acceptable: <strong className="text-go">{fmt(ev.max_acceptable_price_usd)}</strong>
                </div>
              )}
              <input
                type="range"
                className="w-full mb-3 accent-accent-bright"
                min={ev ? ev.max_acceptable_price_usd * 0.5 : 0}
                max={ev ? ev.quoted_price_usd * 2 : 10000000}
                step={10000}
                value={whatIfPrice}
                onChange={e => setWhatIfPrice(parseFloat(e.target.value))}
              />
              <button className="btn-primary w-full" onClick={runWhatIf} disabled={whatIfLoading}>
                {whatIfLoading ? 'Calculating...' : '⚡ Recalculate'}
              </button>
              {whatIfResult && (
                <div className="mt-3">
                  <VerdictCard verdict={whatIfResult.deal_verdict} reason={whatIfResult.verdict_reason} />
                </div>
              )}
            </div>
          </div>

          {/* Right: Evaluation results */}
          <div className="col-span-2 space-y-4">
            {evalLoading && (
              <div className="card p-8 text-center text-text-secondary">
                <div className="text-2xl mb-2 animate-spin-slow">⚙️</div>
                Evaluating deal economics...
              </div>
            )}

            {ev && !evalLoading && (
              <>
                <VerdictCard verdict={ev.deal_verdict} reason={ev.verdict_reason} />
                <p className="text-sm text-text-secondary px-1">{ev.verdict_reason}</p>

                <div className="grid grid-cols-3 gap-3">
                  <Metric label="Quoted Price" value={fmt(ev.quoted_price_usd)} prov="CONFIRMED" />
                  <Metric label="Max Acceptable Price" value={fmt(ev.max_acceptable_price_usd)} prov="CALCULATED" highlight="text-negotiate" />
                  <Metric label="Expected Margin" value={fmtPct(ev.expected_margin_pct)} prov="CALCULATED"
                    highlight={ev.expected_margin_pct > 8 ? 'text-go' : ev.expected_margin_pct > 0 ? 'text-negotiate' : 'text-reject'} />
                </div>

                <div className="card p-5">
                  <div className="label mb-3">P&L Breakdown <span className="badge badge-calculated ml-2">CALCULATED</span></div>
                  <div className="space-y-2 text-sm">
                    {[
                      { l: 'Volume', v: `${ev.volume_bbls?.toLocaleString()} bbls`, p: 'CONFIRMED' },
                      { l: 'Quoted Price', v: fmt(ev.quoted_price_usd), p: 'CONFIRMED' },
                      { l: 'Freight Cost', v: `${fmt(ev.freight_usd)} (${fmt(ev.freight_per_bbl, '$', 2)}/bbl)`, p: 'SIMULATED' },
                      { l: 'Insurance', v: fmt(ev.insurance_usd), p: 'SIMULATED' },
                      { l: 'Handling', v: fmt(ev.handling_usd), p: 'SIMULATED' },
                      { l: 'Landed Cost', v: fmt(ev.landed_cost_usd), p: 'CALCULATED', bold: true },
                      { l: 'Cost per Barrel', v: fmt(ev.landed_cost_per_bbl, '$', 2), p: 'CALCULATED' },
                      { l: 'Market Price Used', v: `$${ev.market_price_used_usd}/bbl`, p: ev.market_price_provenance },
                      { l: 'Expected Revenue', v: fmt(ev.expected_revenue_usd), p: 'CALCULATED' },
                      { l: 'Expected Profit', v: fmt(ev.expected_profit_usd), p: 'CALCULATED', highlight: ev.expected_profit_usd > 0 ? 'text-go' : 'text-reject' },
                    ].map(row => (
                      <div key={row.l} className={`data-row ${row.bold ? 'border-t border-border-mid pt-2' : ''}`}>
                        <span className="data-label">{row.l}</span>
                        <div className="flex items-center gap-2">
                          <span className={`data-value ${row.highlight || ''} ${row.bold ? 'font-bold' : ''}`}>{row.v}</span>
                          <ProvenanceBadge status={row.p} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-reject/10 border border-reject/30 rounded-btn text-sm text-reject">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-maritime flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin-slow">⚙️</div>
        <div className="text-text-secondary">Evaluating deal economics...</div>
      </div>
    </div>
  )
}
