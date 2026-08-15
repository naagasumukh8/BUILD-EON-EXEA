'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
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
    counterparty: vesselName || 'Stena Bulk Charter',
    product: 'diesel',
    capacity_pct: '20',
    capacity_volume: '400000',
    quoted_price: '2000000',
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
        scenario_id: scenarioId || 'scen-demo-001',
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

      if (form.capacity_volume) {
        payload.capacity_volume = parseFloat(form.capacity_volume)
      } else if (form.capacity_pct) {
        payload.capacity_pct = parseFloat(form.capacity_pct)
      }

      const deal = await api.createDeal(payload)
      router.push(`/deals/${deal.id || 'deal-001'}?scenario_id=${scenarioId || 'scen-demo-001'}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Step 3 &middot; Deal Verification
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Commercial Quote Verification
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Enter counterparty freight terms to compute deterministic landed cost, margin, and negotiation target ceiling.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            ⚠️ {error}
          </div>
        )}

        <GlassPanel className="space-y-6">
          
          {/* Deal Type Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B]/70 mb-3">
              1. Deal Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEAL_TYPES.map((t) => (
                <div
                  key={t.value}
                  onClick={() => set('deal_type', t.value)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    form.deal_type === t.value
                      ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                      : 'bg-white border-[#18181B]/10 text-[#18181B] hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className={`text-xs mt-1 ${form.deal_type === t.value ? 'text-white/70' : 'text-[#18181B]/60'}`}>
                    {t.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#18181B]/10">
            <div>
              <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Counterparty / Vessel Name</label>
              <input
                type="text"
                value={form.counterparty}
                onChange={(e) => set('counterparty', e.target.value)}
                placeholder="e.g. Stena Bulk Charter"
                className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Product Type</label>
              <select
                value={form.product}
                onChange={(e) => set('product', e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                <option value="crude">CRUDE</option>
                <option value="diesel">DIESEL</option>
                <option value="gasoline">GASOLINE</option>
                <option value="lng">LNG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Capacity Volume (bbls)</label>
              <input
                type="number"
                value={form.capacity_volume}
                onChange={(e) => set('capacity_volume', e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Quoted Freight Price ($ Total / Lump Sum)</label>
              <input
                type="number"
                value={form.quoted_price}
                onChange={(e) => set('quoted_price', e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Broker Reference / Contract Ref</label>
              <input
                type="text"
                value={form.contact_reference}
                onChange={(e) => set('contact_reference', e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Verification Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#18181B]/10 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="btn-ghost-glass"
            >
              ← Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-paper text-base px-8"
            >
              {loading ? 'Evaluating Quote...' : '⚖️ Compute Deterministic P&L Verdict →'}
            </button>
          </div>

        </GlassPanel>
      </main>
    </div>
  )
}

export default function NewDealPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Quote Evaluator...</div>}>
      <NewDealContent />
    </Suspense>
  )
}
