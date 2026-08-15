'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, GlassCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

const DEAL_TYPES = [
  { value: 'vessel', label: '🚢 Vessel Charter' },
  { value: 'pipeline', label: '🔧 Pipeline Capacity' },
  { value: 'alternate_route', label: '🗺️ Alternate Sea Route' },
  { value: 'supplier', label: '🏭 Spot Supplier' },
]

export default function NewDealPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || ''
  const vesselId = searchParams.get('vessel_id') || ''
  const vesselName = searchParams.get('vessel_name') || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    deal_type: 'vessel',
    counterparty: vesselName || '',
    product: 'diesel',
    capacity_pct: '20',
    capacity_volume: '400000',
    quoted_price: '3000000',
    quoted_price_currency: 'USD',
    quoted_price_unit: 'lumpsum',
    availability_date: '',
    contact_reference: 'Broker Ref: MAR-2026-88',
    notes: 'Freight terms verified directly with shipowner broker.',
  })

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

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
      router.push(`/deals/${deal.id}?scenario_id=${scenarioId}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <GlassBadge status="CONFIRMED" label="Commercial Verification" />
          <h1 className="title-ogg text-3xl sm:text-4xl text-[#fdf1e1]">
            Verify Commercial Opportunity
          </h1>
          <p className="text-sm text-[#8aacca]">
            Confirm commercial terms with the vessel operator or supplier to create a verified record.
          </p>
        </div>

        {vesselName && (
          <div className="p-4 rounded-2xl bg-[#1e6faa]/15 border border-[#2a9aff]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚢</span>
              <div>
                <div className="font-semibold text-[#fdf1e1] text-sm">{vesselName}</div>
                <div className="text-xs text-[#8aacca]">Converting AIS candidate to verified commercial deal</div>
              </div>
            </div>
            <GlassBadge status="CONFIRMED" />
          </div>
        )}

        <GlassPanel>
          <div className="space-y-5">
            {/* Deal Type Selection */}
            <div>
              <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
                Supply Deal Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEAL_TYPES.map((dt) => (
                  <button
                    key={dt.value}
                    onClick={() => set('deal_type', dt.value)}
                    className={`p-3 rounded-xl text-xs font-medium text-left border transition-all ${
                      form.deal_type === dt.value
                        ? 'bg-[#1e6faa] border-[#2a9aff] text-[#fdf1e1]'
                        : 'bg-[#0a121c]/60 border-[rgba(30,80,120,0.3)] text-[#8aacca] hover:border-[#1e6faa]'
                    }`}
                  >
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
                  Counterparty / Operator Name
                </label>
                <input
                  className="glass-input"
                  placeholder="e.g. Stena Bulk, Saudi Aramco"
                  value={form.counterparty}
                  onChange={(e) => set('counterparty', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
                  Commodity Product
                </label>
                <select
                  className="glass-input bg-[#0a121c]"
                  value={form.product}
                  onChange={(e) => set('product', e.target.value)}
                >
                  {['crude', 'diesel', 'gasoline', 'refined', 'lng'].map((p) => (
                    <option key={p} value={p}>{p.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Capacity Input */}
            <div className="p-4 rounded-xl bg-[#0a121c]/60 border border-[rgba(30,80,120,0.3)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
                  Commercial Capacity
                </span>
                <GlassBadge status="CONFIRMED" label="Human Verified" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-[#6b8499] block mb-1">Capacity %</span>
                  <input
                    className="glass-input"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="20"
                    value={form.capacity_pct}
                    onChange={(e) => set('capacity_pct', e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-xs text-[#6b8499] block mb-1">Capacity Volume (bbls)</span>
                  <input
                    className="glass-input"
                    type="number"
                    placeholder="400000"
                    value={form.capacity_volume}
                    onChange={(e) => set('capacity_volume', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quoted Price */}
            <div className="p-4 rounded-xl bg-[#0a121c]/60 border border-[rgba(30,80,120,0.3)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
                  Shipowner / Operator Quote *
                </span>
                <GlassBadge status="CONFIRMED" label="Human Verified" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  className="glass-input col-span-1"
                  type="number"
                  placeholder="3000000"
                  value={form.quoted_price}
                  onChange={(e) => set('quoted_price', e.target.value)}
                />
                <select
                  className="glass-input bg-[#0a121c]"
                  value={form.quoted_price_currency}
                  onChange={(e) => set('quoted_price_currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹ Lakh)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <select
                  className="glass-input bg-[#0a121c]"
                  value={form.quoted_price_unit}
                  onChange={(e) => set('quoted_price_unit', e.target.value)}
                >
                  <option value="lumpsum">Lump Sum Total</option>
                  <option value="per_bbl">Per Barrel ($/bbl)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
                  Contact Reference
                </label>
                <input
                  className="glass-input"
                  placeholder="e.g. Broker Email / Ref ID"
                  value={form.contact_reference}
                  onChange={(e) => set('contact_reference', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
                  Availability Date
                </label>
                <input
                  className="glass-input"
                  type="date"
                  value={form.availability_date}
                  onChange={(e) => set('availability_date', e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
                ⚠️ {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(30,90,140,0.3)]">
              <button className="btn-ghost-glass" onClick={() => router.back()}>
                ← Cancel
              </button>
              <button
                className="btn-paper px-8 text-base font-semibold"
                onClick={handleSubmit}
                disabled={loading || !form.quoted_price}
              >
                {loading ? 'Saving Deal...' : '✅ Save Deal & Evaluate Economics →'}
              </button>
            </div>
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}
