'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const DEAL_TYPES = [
  { value: 'vessel',         label: '🚢 Vessel' },
  { value: 'pipeline',       label: '🔧 Pipeline' },
  { value: 'alternate_route',label: '🗺️ Alternate Route' },
  { value: 'supplier',       label: '🏭 Alternate Supplier' },
]

export default function NewDealPage() {
  const params = useSearchParams()
  const router = useRouter()
  const scenarioId = params.get('scenario_id') || ''
  const vesselId = params.get('vessel_id') || ''
  const vesselName = params.get('vessel_name') || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    deal_type: 'vessel',
    counterparty: vesselName,
    product: 'crude',
    capacity_pct: '',
    capacity_volume: '',
    quoted_price: '',
    quoted_price_currency: 'USD',
    quoted_price_unit: 'lumpsum',
    availability_date: '',
    contact_reference: '',
    notes: '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.quoted_price) return
    setLoading(true)
    setError(null)
    try {
      const payload: Record<string, any> = {
        scenario_id: scenarioId,
        vessel_candidate_id: vesselId || undefined,
        deal_type: form.deal_type,
        counterparty: form.counterparty || undefined,
        product: form.product,
        quoted_price: parseFloat(form.quoted_price),
        quoted_price_currency: form.quoted_price_currency,
        quoted_price_unit: form.quoted_price_unit,
        availability_date: form.availability_date || undefined,
        contact_reference: form.contact_reference || undefined,
        notes: form.notes || undefined,
      }
      if (form.capacity_pct) payload.capacity_pct = parseFloat(form.capacity_pct)
      if (form.capacity_volume) payload.capacity_volume = parseFloat(form.capacity_volume)

      const deal = await api.createDeal(payload)
      // Go to deal evaluator
      router.push(`/deals/${deal.id}?scenario_id=${scenarioId}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-maritime">
      {/* Topbar */}
      <div className="bg-bg-panel border-b border-border-dim px-6 py-3 flex items-center gap-4">
        <span className="font-display text-accent-bright">MARITIME</span>
        <span className="text-text-muted text-sm">/ Confirm Commercial Deal</span>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="section-title mb-1">Confirm Commercial Deal</h1>
          <p className="text-sm text-text-secondary">
            Enter the commercial terms verified with the vessel operator / broker / supplier.
            This becomes a <span className="badge badge-confirmed mx-1">CONFIRMED</span> record.
          </p>
        </div>

        {vesselName && (
          <div className="card p-3 mb-5 flex items-center gap-3">
            <span className="badge badge-candidate">CANDIDATE → CONFIRMING</span>
            <span className="text-sm text-text-primary font-medium">{vesselName}</span>
          </div>
        )}

        <div className="card p-6 space-y-5">
          {/* Deal type */}
          <div>
            <label className="label mb-2 block">Deal Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {DEAL_TYPES.map(dt => (
                <button key={dt.value} onClick={() => set('deal_type', dt.value)}
                  className={`p-3 rounded-btn border text-sm text-left transition-all
                    ${form.deal_type === dt.value ? 'border-accent bg-accent/10 text-text-primary' : 'border-border-dim text-text-secondary hover:border-border-mid'}`}>
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-2 block">Counterparty / Operator</label>
              <input className="input" placeholder="e.g. Stena Line, Aramco"
                value={form.counterparty} onChange={e => set('counterparty', e.target.value)} />
            </div>
            <div>
              <label className="label mb-2 block">Product *</label>
              <select className="select" value={form.product} onChange={e => set('product', e.target.value)}>
                {['crude', 'diesel', 'gasoline', 'refined', 'lng'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="label mb-2 block">Available Capacity <span className="badge badge-confirmed ml-2">CONFIRMED — HUMAN VERIFIED</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-text-muted mb-1">As percentage (%)</div>
                <input className="input" type="number" min="0" max="100" placeholder="e.g. 20"
                  value={form.capacity_pct} onChange={e => set('capacity_pct', e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">OR as volume (bbls)</div>
                <input className="input" type="number" placeholder="e.g. 400000"
                  value={form.capacity_volume} onChange={e => set('capacity_volume', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Quote */}
          <div>
            <label className="label mb-2 block">Quoted Price * <span className="badge badge-confirmed ml-2">CONFIRMED — HUMAN VERIFIED</span></label>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <input className="input" type="number" step="0.01" placeholder="e.g. 2000000"
                  value={form.quoted_price} onChange={e => set('quoted_price', e.target.value)} />
              </div>
              <select className="select" value={form.quoted_price_currency} onChange={e => set('quoted_price_currency', e.target.value)}>
                <option value="USD">USD</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR</option>
              </select>
              <select className="select" value={form.quoted_price_unit} onChange={e => set('quoted_price_unit', e.target.value)}>
                <option value="lumpsum">Lump sum</option>
                <option value="per_bbl">Per barrel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-2 block">Availability Date</label>
              <input className="input" type="date"
                value={form.availability_date} onChange={e => set('availability_date', e.target.value)} />
            </div>
            <div>
              <label className="label mb-2 block">Contact Reference</label>
              <input className="input" placeholder="e.g. email / broker ref"
                value={form.contact_reference} onChange={e => set('contact_reference', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Notes</label>
            <textarea className="input h-20 resize-none" placeholder="Additional terms, conditions, restrictions..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && (
            <div className="p-3 bg-reject/10 border border-reject/30 rounded-btn text-sm text-reject">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button className="btn-ghost" onClick={() => router.back()}>← Back</button>
            <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading || !form.quoted_price}>
              {loading ? 'Saving...' : '✅ Confirm Deal & Evaluate →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
