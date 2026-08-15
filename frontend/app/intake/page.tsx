'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const STEPS = [
  { id: 1, label: 'Demand',       icon: '📦' },
  { id: 2, label: 'Supply',       icon: '⚓' },
  { id: 3, label: 'Vessel',       icon: '🚢' },
  { id: 4, label: 'Alternatives', icon: '🗺️' },
  { id: 5, label: 'Priorities',   icon: '⚖️' },
]

const PRODUCTS = ['crude', 'diesel', 'gasoline', 'refined', 'lng']
const VESSEL_SITUATIONS = [
  { value: 'own',        label: 'I own a vessel' },
  { value: 'chartered',  label: 'I have a chartered vessel' },
  { value: 'seeking',    label: 'I need to find a vessel' },
]

export default function IntakePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuestion, setAiQuestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [fields, setFields] = useState<Record<string, any>>({
    product: '',
    volume_required: '',
    volume_unit: 'bbls',
    destination_port_name: '',
    deadline_days: '',
    origin_port_name: '',
    supplier: '',
    purchase_price_usd_per_bbl: '',
    vessel_situation: 'seeking',
    vessel_type_required: '',
    priority_cost_weight: 0.4,
    priority_time_weight: 0.35,
    priority_risk_weight: 0.25,
  })

  const set = (k: string, v: any) => setFields(f => ({ ...f, [k]: v }))

  // ── AI free-text parse ─────────────────────────────────────────────
  const handleAIParse = async () => {
    if (!aiText.trim()) return
    setAiLoading(true)
    setError(null)
    try {
      const res = await api.parseIntake(aiText, fields)
      if (res.parsed_fields) {
        setFields(f => ({ ...f, ...res.parsed_fields }))
      }
      setAiQuestion(res.follow_up_question || null)
      if (res.complete) setStep(2)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAiLoading(false)
      setAiText('')
    }
  }

  // ── Save & continue ────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...fields,
        volume_required: parseFloat(fields.volume_required) || 0,
        deadline_days: parseInt(fields.deadline_days) || 7,
        purchase_price_usd_per_bbl: parseFloat(fields.purchase_price_usd_per_bbl) || null,
        priority_cost_weight: parseFloat(fields.priority_cost_weight),
        priority_time_weight: parseFloat(fields.priority_time_weight),
        priority_risk_weight: parseFloat(fields.priority_risk_weight),
      }
      const scenario = await api.saveScenario(payload)
      router.push(`/map?scenario_id=${scenario.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const totalWeight = parseFloat(fields.priority_cost_weight) +
                      parseFloat(fields.priority_time_weight) +
                      parseFloat(fields.priority_risk_weight)

  return (
    <div className="min-h-screen bg-gradient-maritime flex">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 bg-bg-panel border-r border-border-dim flex flex-col p-6 gap-2 shrink-0">
        <div className="mb-8">
          <div className="font-display text-lg text-accent-bright tracking-wide">MARITIME</div>
          <div className="text-xs text-text-muted mt-0.5">Supply Decision Platform</div>
        </div>
        {STEPS.map(s => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`nav-item ${step === s.id ? 'active' : ''}`}
          >
            <span>{s.icon}</span>
            <span>Step {s.id}: {s.label}</span>
          </button>
        ))}
        <div className="mt-auto pt-6 border-t border-border-dim">
          <div className="text-xs text-text-muted">All data is clearly labelled with its source and confidence level.</div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-sm font-bold text-accent-bright">{step}</span>
            <h1 className="section-title">{STEPS[step - 1].label}</h1>
          </div>
          <div className="flex gap-2">
            {STEPS.map(s => (
              <div key={s.id} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s.id <= step ? 'bg-accent' : 'bg-bg-surface'}`} />
            ))}
          </div>
        </div>

        {/* ── AI Parse bar (always visible) ─────────────────── */}
        <div className="card p-4 mb-6">
          <div className="label mb-2">AI Quick Entry</div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="e.g. I need 2 million barrels of diesel delivered to India in 7 days, we don't own a ship"
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAIParse()}
            />
            <button className="btn-primary whitespace-nowrap" onClick={handleAIParse} disabled={aiLoading}>
              {aiLoading ? '...' : 'Parse with AI'}
            </button>
          </div>
          {aiQuestion && (
            <div className="mt-3 p-3 bg-accent/10 border border-accent/30 rounded-btn text-sm text-accent-bright">
              💬 {aiQuestion}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-reject/10 border border-reject/30 rounded-btn text-sm text-reject">{error}</div>
        )}

        {/* ── Step content ───────────────────────────────────── */}
        <div className="card p-6 animate-fade-in">
          {step === 1 && <StepDemand fields={fields} set={set} />}
          {step === 2 && <StepSupply fields={fields} set={set} />}
          {step === 3 && <StepVessel fields={fields} set={set} />}
          {step === 4 && <StepAlternatives fields={fields} set={set} />}
          {step === 5 && <StepPriorities fields={fields} set={set} totalWeight={totalWeight} />}
        </div>

        {/* Nav buttons */}
        <div className="flex justify-between mt-6">
          <button
            className="btn-ghost"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >← Back</button>
          {step < 5 ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
              Continue →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : '🚀 Discover Vessels'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

// ── Step 1: Demand ─────────────────────────────────────────────────────
function StepDemand({ fields, set }: any) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="col-span-2">
        <label className="label mb-2 block">Product *</label>
        <div className="flex gap-2 flex-wrap">
          {PRODUCTS.map(p => (
            <button key={p} onClick={() => set('product', p)}
              className={`px-4 py-2 rounded-btn text-sm border transition-all duration-150 capitalize
                ${fields.product === p ? 'bg-accent text-white border-accent' : 'border-border-mid text-text-secondary hover:border-accent'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label mb-2 block">Required Volume *</label>
        <div className="flex gap-2">
          <input className="input" type="number" placeholder="2000000"
            value={fields.volume_required} onChange={e => set('volume_required', e.target.value)} />
          <select className="select w-28" value={fields.volume_unit} onChange={e => set('volume_unit', e.target.value)}>
            <option value="bbls">bbls</option>
            <option value="mbbls">Mbbls</option>
            <option value="mt">MT</option>
          </select>
        </div>
        {fields.volume_required && (
          <div className="mt-1 text-xs text-text-muted">
            = {(parseFloat(fields.volume_required)/1000000).toFixed(2)}M barrels
          </div>
        )}
      </div>
      <div>
        <label className="label mb-2 block">Deadline (days from today) *</label>
        <input className="input" type="number" placeholder="7"
          value={fields.deadline_days} onChange={e => set('deadline_days', e.target.value)} />
      </div>
      <div className="col-span-2">
        <label className="label mb-2 block">Destination Port *</label>
        <input className="input" placeholder="e.g. Mumbai, Chennai, Singapore"
          value={fields.destination_port_name} onChange={e => set('destination_port_name', e.target.value)} />
      </div>
    </div>
  )
}

// ── Step 2: Current Supply ─────────────────────────────────────────────
function StepSupply({ fields, set }: any) {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <label className="label mb-2 block">Origin Port</label>
        <input className="input" placeholder="e.g. Ras Tanura"
          value={fields.origin_port_name} onChange={e => set('origin_port_name', e.target.value)} />
      </div>
      <div>
        <label className="label mb-2 block">Supplier</label>
        <input className="input" placeholder="e.g. Saudi Aramco"
          value={fields.supplier} onChange={e => set('supplier', e.target.value)} />
      </div>
      <div>
        <label className="label mb-2 block">Purchase Cost (USD/bbl) <span className="badge badge-simulated ml-2">ESTIMATED</span></label>
        <input className="input" type="number" step="0.01" placeholder="82.00"
          value={fields.purchase_price_usd_per_bbl} onChange={e => set('purchase_price_usd_per_bbl', e.target.value)} />
      </div>
      <div>
        <label className="label mb-2 block">Known Freight Cost (USD/bbl) <span className="badge badge-simulated ml-2">ESTIMATED</span></label>
        <input className="input" type="number" step="0.01" placeholder="1.50"
          value={fields.freight_cost_usd_per_bbl || ''} onChange={e => set('freight_cost_usd_per_bbl', e.target.value)} />
      </div>
      <div className="col-span-2 p-3 bg-bg-surface rounded-btn border border-border-dim text-xs text-text-muted">
        ℹ️ These costs are used as economic assumptions for the deal evaluator. All values are labelled with their provenance (CONFIRMED, ESTIMATED, SIMULATED) throughout the application.
      </div>
    </div>
  )
}

// ── Step 3: Vessel Situation ───────────────────────────────────────────
function StepVessel({ fields, set }: any) {
  return (
    <div className="space-y-5">
      <div>
        <label className="label mb-3 block">Your Vessel Situation *</label>
        <div className="grid grid-cols-3 gap-3">
          {VESSEL_SITUATIONS.map(vs => (
            <button key={vs.value} onClick={() => set('vessel_situation', vs.value)}
              className={`p-4 rounded-card border text-sm text-left transition-all duration-150
                ${fields.vessel_situation === vs.value ? 'border-accent bg-accent/10 text-text-primary' : 'border-border-dim text-text-secondary hover:border-border-mid'}`}>
              <div className="font-medium mb-1">{vs.label}</div>
            </button>
          ))}
        </div>
      </div>
      {fields.vessel_situation === 'seeking' && (
        <div>
          <label className="label mb-2 block">Required Vessel Type</label>
          <select className="select" value={fields.vessel_type_required} onChange={e => set('vessel_type_required', e.target.value)}>
            <option value="">Any type</option>
            <option value="VLCC">VLCC (Very Large Crude Carrier)</option>
            <option value="Suezmax">Suezmax</option>
            <option value="Aframax">Aframax</option>
            <option value="MR Tanker">MR Tanker (Medium Range)</option>
            <option value="LNG Carrier">LNG Carrier</option>
          </select>
        </div>
      )}
      <div className="p-3 bg-bg-surface rounded-btn border border-border-dim text-xs text-text-muted">
        <strong className="text-text-secondary">Important:</strong> The system will discover candidate vessels from AIS data. These are labelled <span className="badge badge-candidate">CANDIDATE — UNVERIFIED</span>. AIS shows vessel movement — it does NOT confirm available cargo capacity. You will need to contact vessel operators directly to verify commercial availability.
      </div>
    </div>
  )
}

// ── Step 4: Known Alternatives ─────────────────────────────────────────
function StepAlternatives({ fields, set }: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        The optimizer automatically considers available pipelines and alternate routes. Here you can provide any additional known alternatives.
      </p>
      <div>
        <label className="label mb-2 block">Known Alternative Port / Route</label>
        <input className="input" placeholder="e.g. Reroute via Cape of Good Hope"
          value={fields.known_alternative || ''} onChange={e => set('known_alternative', e.target.value)} />
      </div>
      <div className="p-4 bg-bg-surface rounded-card border border-border-dim">
        <div className="label mb-3">Pipelines automatically included:</div>
        <div className="space-y-2 text-sm">
          {[
            { name: 'IPSA (Saudi Red Sea)', prov: 'REAL_REFERENCE', eta: '3 days', cost: '$1.40/bbl' },
            { name: 'Habshan–Fujairah (ADNOC)', prov: 'REAL_REFERENCE', eta: '1 day', cost: '$1.20/bbl' },
            { name: 'SUMED Pipeline', prov: 'REAL_REFERENCE', eta: '1 day', cost: '$2.10/bbl' },
          ].map(p => (
            <div key={p.name} className="flex items-center justify-between">
              <span className="text-text-secondary">{p.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-xs">{p.eta} · {p.cost}</span>
                <span className={`badge ${p.prov === 'REAL_REFERENCE' ? 'badge-reference' : 'badge-simulated'}`}>{p.prov}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 5: Business Priorities ────────────────────────────────────────
function StepPriorities({ fields, set, totalWeight }: any) {
  const weights = [
    { key: 'priority_cost_weight', label: 'Cost', desc: 'Minimise total landed cost', color: 'bg-accent' },
    { key: 'priority_time_weight', label: 'Time', desc: 'Minimise delivery time', color: 'bg-go' },
    { key: 'priority_risk_weight', label: 'Risk', desc: 'Minimise supply chain risk', color: 'bg-negotiate' },
  ]
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Set your business priorities. These weights drive the OR-Tools optimization objective. They will be normalised to sum to 1.
      </p>
      {weights.map(w => (
        <div key={w.key}>
          <div className="flex justify-between mb-2">
            <div>
              <span className="text-sm font-medium text-text-primary">{w.label}</span>
              <span className="text-xs text-text-muted ml-2">{w.desc}</span>
            </div>
            <span className="text-sm font-bold text-text-primary">{(parseFloat(fields[w.key]) * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.05"
            value={fields[w.key]}
            onChange={e => set(w.key, parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-bg-surface accent-accent-bright"
          />
        </div>
      ))}
      <div className="flex gap-3">
        {weights.map(w => (
          <div key={w.key} className="flex-1 card p-3 text-center">
            <div className="text-xs text-text-muted mb-1">{w.label}</div>
            <div className="text-2xl font-bold text-text-primary">
              {totalWeight > 0 ? ((parseFloat(fields[w.key]) / totalWeight) * 100).toFixed(0) : '0'}%
            </div>
            <div className="text-xs text-text-muted">normalised</div>
          </div>
        ))}
      </div>
    </div>
  )
}
