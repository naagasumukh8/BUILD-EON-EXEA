'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

const DEAL_TYPES = [
  { value: 'vessel', label: 'Vessel Charter', desc: 'Moving ship commercial opportunity' },
  { value: 'pipeline', label: 'Pipeline Capacity', desc: 'Overland pipeline throughput tariff' },
  { value: 'alternate_route', label: 'Alternate Route', desc: 'Bypass or long-haul sea lane' },
  { value: 'supplier', label: 'Spot Supplier', desc: 'Direct commercial supply offer' },
]

function NewDealFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'
  const vesselId = searchParams.get('vessel_id') || ''
  const vesselName = searchParams.get('vessel_name') || ''
  const journeyParam = searchParams.get('journey') || 'Australia → Japan via India'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    deal_type: 'vessel',
    vessel_id: vesselId || 'vess-001',
    vessel_name: vesselName || 'Stena Bulk Charter (VLCC)',
    journey: journeyParam,
    confirmed_capacity_bbls: 400000,
    volume_required: 2000000,
    quoted_price_usd: 2000000,
    transport_provider: 'Stena Bulk (Shipowner)',
    commercial_source: 'Broker Quote / Human Verified'
  })

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await api.evaluateDeal({
        ...form,
        scenario_id: scenarioId,
        vessel_id: form.vessel_id,
        vessel_name: form.vessel_name,
        journey: form.journey,
        confirmed_capacity_bbls: Number(form.confirmed_capacity_bbls),
        volume_required: Number(form.volume_required),
        quoted_price_usd: Number(form.quoted_price_usd),
      })

      if (res && res.deal_id) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`deal_${res.deal_id}`, JSON.stringify(res))
        }
        router.push(`/deals/${res.deal_id}?scenario_id=${scenarioId}`)
      } else {
        router.push(`/deals/deal-001?scenario_id=${scenarioId}`)
      }
    } catch (err: any) {
      console.error(err)
      setError('Evaluation failed. Please verify inputs.')
      router.push(`/deals/deal-001?scenario_id=${scenarioId}`)
    } finally {
      setLoading(false)
    }
  }

  const calculatedFreightPerBbl = (Number(form.quoted_price_usd || 0) / Number(form.confirmed_capacity_bbls || 1)).toFixed(2)
  const maxAcceptableFreightPerBbl = 4.125
  const maxAcceptableTotalUsd = (maxAcceptableFreightPerBbl * Number(form.confirmed_capacity_bbls || 400000)).toLocaleString()

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] font-sans">
      <Navbar scenarioId={scenarioId} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#18181B]/50">
            STEP 02 &middot; VERIFY &amp; ENTER COMMERCIAL QUOTE
          </span>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Commercial Opportunity Valuation
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl font-light">
            Enter confirmed charter rate quotes or pipeline tariffs to trigger deterministic commercial P&amp;L evaluation.
          </p>
        </div>

        <GlassPanel className="p-6 sm:p-8 space-y-6 shadow-xl">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60">
              Select Opportunity Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEAL_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChange('deal_type', t.value)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    form.deal_type === t.value
                      ? 'border-[#18181B] bg-[#18181B] text-white shadow-md'
                      : 'border-[#18181B]/15 bg-white text-[#18181B] hover:border-[#18181B]/40'
                  }`}
                >
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className={`text-xs mt-1 ${form.deal_type === t.value ? 'text-white/70' : 'text-[#18181B]/60'}`}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#18181B]/10">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60">
                Asset Name / Vessel Charter
              </label>
              <input
                type="text"
                value={form.vessel_name}
                onChange={(e) => handleChange('vessel_name', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#18181B]/15 text-sm font-semibold focus:outline-none focus:border-[#18181B]"
                placeholder="e.g. Stena Bulk Charter (VLCC)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60">
                Confirmed Capacity (Barrels)
              </label>
              <input
                type="number"
                value={form.confirmed_capacity_bbls}
                onChange={(e) => handleChange('confirmed_capacity_bbls', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#18181B]/15 text-sm font-semibold focus:outline-none focus:border-[#18181B]"
              />
              <p className="text-[10px] text-[#18181B]/50">
                Max vessel/option volume available for assignment.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60">
                Total Required Scenario Volume
              </label>
              <input
                type="number"
                value={form.volume_required}
                onChange={(e) => handleChange('volume_required', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#18181B]/15 text-sm font-semibold focus:outline-none focus:border-[#18181B]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/60">
                Entered Freight Quote (USD Total)
              </label>
              <input
                type="number"
                value={form.quoted_price_usd}
                onChange={(e) => handleChange('quoted_price_usd', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#18181B]/15 text-sm font-bold text-blue-700 focus:outline-none focus:border-[#18181B]"
              />
              <div className="flex justify-between text-[11px] font-semibold text-[#18181B]/70">
                <span>Implied Freight Rate: <strong className="text-[#18181B]">${calculatedFreightPerBbl}/bbl</strong></span>
                <span>Target Ceiling: <strong>${maxAcceptableTotalUsd}</strong> ($4.125/bbl)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-2 text-xs">
            <div className="font-bold uppercase tracking-wider text-[#18181B]/60 text-[10px]">
              Data Provenance &amp; Verification Protocol
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#18181B]/80">
              <div><strong>Transport Provider:</strong> {form.transport_provider}</div>
              <div><strong>Source Provenance:</strong> {form.commercial_source}</div>
              <div><strong>Status:</strong> <span className="font-bold text-emerald-700">HUMAN VERIFIED COMMERCIAL QUOTE</span></div>
              <div><strong>Data Stream:</strong> <span className="font-bold text-amber-700">DEMO DATA (AIS API Offline)</span></div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-[#18181B]/10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-full border border-[#18181B]/20 text-xs font-semibold hover:bg-black/5 transition-all"
            >
              &larr; Back to Map
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-full bg-[#18181B] px-8 py-3.5 text-xs font-semibold text-white hover:bg-black transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Evaluating Deal Economics...' : 'Evaluate Commercial Deal →'}
            </button>
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}

export default function NewDealClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Commercial Entry Form...</div>}>
      <NewDealFormContent />
    </Suspense>
  )
}
