'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, SightCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

const DEAL_TYPES = [
  { value: 'vessel', label: '🚢 Vessel Charter', desc: 'Commercial ship charter quote' },
  { value: 'pipeline', label: '🔧 Pipeline Capacity', desc: 'Pipeline throughput agreement' },
  { value: 'alternate_route', label: '🗺️ Alternate Route', desc: 'Bypass or alternate sea lane' },
  { value: 'supplier', label: '🏭 Spot Supplier', desc: 'Direct supplier commercial offer' },
]

function NewDealContent() {
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

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fdf1e1]/10 border border-[#fdf1e1]/30 text-xs text-[#fdf1e1] font-medium tracking-widest uppercase">
            <span>Commercial Verification</span>
          </div>
          <h1 className="title-ogg text-4xl sm:text-5xl text-[#fdf1e1]">
            Is this deal worth taking?
          </h1>
          <p className="text-sm sm:text-base text-[#fdf1e1]/70">
            Record the actual commercial terms offered by the shipowner or supplier to perform deterministic P&L analysis.
          </p>
        </div>

        {vesselName && (
          <div className="p-5 rounded-2xl bg-[#fdf1e1]/10 border border-[#fdf1e1]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚢</span>
              <div>
                <div className="font-semibold text-[#fdf1e1] text-base">{vesselName}</div>
                <div className="text-xs text-[#fdf1e1]/70">Converting candidate vessel to verified commercial opportunity</div>
              </div>
            </div>
            <GlassBadge status="CONFIRMED" label="CONFIRMING" />
          </div>
        )}

        <GlassPanel>
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-3">
                Select Deal Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEAL_TYPES.map((dt) => (
                  <SightCard
                    key={dt.value}
                    title={dt.label}
                    subtitle={dt.desc}
                    onClick={() => set('deal_type', dt.value)}
                    className={`border ${
                      form.deal_type === dt.value
                        ? 'ring-2 ring-[#fdf1e1] scale-[1.01]'
                        : 'opacity-85 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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
                <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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

            {/* Capacity Input Panel */}
            <div className="p-5 rounded-2xl bg-[#0a121c]/70 border border-[rgba(253,241,225,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/70 font-medium">
                  Available Capacity
                </span>
                <GlassBadge status="CONFIRMED" label="HUMAN VERIFIED" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#fdf1e1]/60 block mb-1">Capacity %</span>
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
                  <span className="text-xs text-[#fdf1e1]/60 block mb-1">Capacity Volume (bbls)</span>
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

            {/* Quote Input Panel */}
            <div className="p-5 rounded-2xl bg-[#0a121c]/70 border border-[rgba(253,241,225,0.18)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/70 font-medium">
                  Shipowner / Operator Quote *
                </span>
                <GlassBadge status="CONFIRMED" label="HUMAN VERIFIED" />
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
                <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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
                <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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
              <div className="p-4 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
                ⚠️ {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(253,241,225,0.15)]">
              <button className="btn-ghost-glass" onClick={() => router.back()}>
                ← Cancel
              </button>
              <button
                className="btn-paper px-8 text-base font-semibold"
                onClick={handleSubmit}
                disabled={loading || !form.quoted_price}
              >
                {loading ? 'Saving Deal...' : '✅ Evaluate Commercial P&L →'}
              </button>
            </div>
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}

export default function NewDealPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1110] flex items-center justify-center text-[#fdf1e1]/70">Loading Deal Form...</div>}>
      <NewDealContent />
    </Suspense>
  )
}
