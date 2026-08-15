'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

// ── 20-STRATEGY TAXONOMY: 4 COMMERCIAL FAMILIES ─────────────────────────────
const DEAL_FAMILIES = [
  {
    family: 'MOVE_DIFFERENTLY',
    label: '🚢 Move Differently',
    color: 'bg-sky-600',
    types: [
      { value: 'alternate_route',    label: 'Direct Alternate Route',   desc: 'Bypass Hormuz via Cape of Good Hope or another maritime corridor' },
      { value: 'pipeline',           label: 'Pipeline Bypass',          desc: 'Move crude through a pipeline and re-ship from a terminal' },
      { value: 'transshipment',      label: 'Transshipment',            desc: 'Transfer cargo at a hub to avoid an inefficient direct movement' },
      { value: 'sts_lightering',     label: 'STS / Lightering',         desc: 'Ship-to-ship transfer where operationally and commercially feasible' },
      { value: 'multimodal',         label: 'Multi-modal',              desc: 'Maritime + pipeline + road/rail/terminal infrastructure combined' },
    ],
  },
  {
    family: 'DONT_MOVE',
    label: "📦 Don't Move Your Cargo",
    color: 'bg-emerald-600',
    types: [
      { value: 'supplier',           label: 'Replacement Supply',       desc: 'Buy equivalent product from another origin/market' },
      { value: 'local_inventory',    label: 'Local Inventory',          desc: 'Obtain product from existing regional inventory or SPR' },
      { value: 'bicoastal_swap',     label: 'Bi-Coastal Cargo Swap',    desc: 'Unload West Coast (Mumbai) ⇄ Release East Coast (Vizag)' },
      { value: 'regional_exchange',  label: 'Local / Regional Exchange','desc': 'Use equivalent inventory already near the destination' },
      { value: 'alternative_origin', label: 'Alternative Origin',       desc: 'Change the loading origin entirely — remove Hormuz dependency' },
    ],
  },
  {
    family: 'USE_NETWORK',
    label: '🌐 Use the Network',
    color: 'bg-violet-600',
    types: [
      { value: 'vessel',             label: 'Moving Vessel Opportunity','desc': 'Identify a vessel already near a useful corridor' },
      { value: 'backhaul',           label: 'Backhaul Opportunity',     desc: "Use a vessel's empty return journey for another cargo" },
      { value: 'triangulation',      label: '3-Party Triangulation',    desc: 'Closed 3-node loop swap eliminating ballast voyages' },
      { value: 'diversified_split',  label: 'Diversified Split',        desc: 'Spread requirement across several independent sources/routes' },
      { value: 'demand_rebalancing', label: 'Demand Rebalancing',       desc: 'Change which refinery/unit receives which available cargo' },
    ],
  },
  {
    family: 'CHANGE_TIMING',
    label: '⏱️ Change Timing / Structure',
    color: 'bg-amber-600',
    types: [
      { value: 'wait_timing',        label: 'Wait / Timing Strategy',   desc: 'Delay transit until a feasible/safe window opens' },
      { value: 'alt_destination',    label: 'Alternative Destination',  desc: 'Discharge somewhere feasible and forward through another network' },
      { value: 'emergency_replace',  label: 'Emergency Replacement',    desc: 'Procure replacement supply now; treat stranded cargo separately' },
      { value: 'counterparty_exchange', label: 'Counterparty Exchange', desc: 'Two companies exchange physical positions or delivery obligations' },
      { value: 'hybrid',             label: 'Hybrid Strategy',          desc: 'Combine multiple modes — pipeline + vessel + replacement supply' },
    ],
  },
]

// Flat list for legacy deal_type selects
const DEAL_TYPES = DEAL_FAMILIES.flatMap(f => f.types)



function NewDealContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'
  const vesselId = searchParams.get('vessel_id') || ''
  const vesselName = searchParams.get('vessel_name') || ''
  const dealTypeParam = searchParams.get('deal_type') || 'vessel'
  const counterpartyParam = searchParams.get('counterparty') || vesselName || 'Reliance / Jio Energy Grid'
  const journeyParam = searchParams.get('journey') || 'Arabian Sea (18.96°N, 58.20°E) → Mumbai Port, India'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    deal_type: dealTypeParam,
    counterparty: counterpartyParam,
    journey: journeyParam,
    product: 'diesel',
    capacity_pct: '20',
    capacity_volume: '400000',
    quoted_price: '2000000',
    quoted_price_currency: 'USD',
    quoted_price_unit: 'lumpsum',
    availability_date: '',
    commercial_source: 'Shipowner / Broker Quote',
    verification_status: 'HUMAN VERIFIED',
    contact_reference: 'Broker Ref: MAR-2026-88',
    notes: 'Commercial charter terms verified directly with shipowner broker. AIS confirms vessel currently transiting along route.',
  })

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.quoted_price) return
    setLoading(true)
    setError(null)
    try {
      const payload: Record<string, any> = {
        scenario_id: scenarioId,
        vessel_id: vesselId || 'vess-001',
        vessel_name: form.counterparty,
        journey: form.journey,
        deal_type: form.deal_type,
        counterparty: form.counterparty,
        product: form.product,
        confirmed_capacity_bbls: parseFloat(form.capacity_volume) || 400000,
        quoted_price_usd: parseFloat(form.quoted_price) || 2000000,
        quoted_price_currency: form.quoted_price_currency,
        commercial_source: form.commercial_source,
        verification_status: form.verification_status,
        contact_reference: form.contact_reference,
        notes: form.notes,
      }

      const deal = await api.createDeal(payload)
      router.push(`/deals/${deal.id || deal.deal_id || 'deal-001'}?scenario_id=${scenarioId}`)
    } catch (e: any) {
      setError(e.message || 'Error submitting commercial quote.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Commercial Opportunity Verification &middot; Human Verification Entry
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Verify Commercial Opportunity
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Enter confirmed commercial capacity and freight quote terms obtained from shipowner/broker to evaluate deal profitability.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        <GlassPanel className="p-8 space-y-8 border border-[#18181B]/15">
          
          {/* Opportunity Banner */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold text-sm uppercase">DISCOVERED MOVING VESSEL OPPORTUNITY</div>
            <div><strong>Active Vessel:</strong> {form.counterparty}</div>
            <div><strong>Moving Journey:</strong> {form.journey}</div>
            <div><strong>AIS Status:</strong> AIS tracks position & course only (AIS does NOT claim spare cargo capacity). Capacity is confirmed below via human broker entry.</div>
          </div>

          {/* Strategy Family Selector — 20 Classes / 4 Families */}
          <div className="space-y-5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/70 block">
              Strategy Family &amp; Opportunity Class
            </label>
            {DEAL_FAMILIES.map((family) => (
              <div key={family.family} className="space-y-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${family.color}`}>
                  {family.label}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {family.types.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('deal_type', t.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.deal_type === t.value
                          ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                          : 'bg-white text-[#18181B] border-[#18181B]/10 hover:border-[#18181B]/30'
                      }`}
                    >
                      <div className="font-semibold text-xs">{t.label}</div>
                      <div className={`text-[10px] mt-0.5 leading-tight ${form.deal_type === t.value ? 'text-white/60' : 'text-[#18181B]/45'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>


          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Counterparty / Vessel Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18181B]/70 block">
                Transport Source / Vessel Name
              </label>
              <input
                type="text"
                value={form.counterparty}
                onChange={(e) => set('counterparty', e.target.value)}
                className="w-full rounded-2xl border border-[#18181B]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                placeholder="e.g. Stena Bulk Charter (VLCC)"
              />
            </div>

            {/* Moving Journey Context */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18181B]/70 block">
                Moving Journey Context
              </label>
              <input
                type="text"
                value={form.journey}
                onChange={(e) => set('journey', e.target.value)}
                className="w-full rounded-2xl border border-[#18181B]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                placeholder="e.g. Australia → Japan via India"
              />
            </div>

            {/* Confirmed Volume */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18181B]/70 block">
                Confirmed Commercial Capacity (Barrels)
              </label>
              <input
                type="number"
                value={form.capacity_volume}
                onChange={(e) => {
                  const vol = e.target.value
                  set('capacity_volume', vol)
                  set('capacity_pct', (parseFloat(vol) / 2000000 * 100).toFixed(0))
                }}
                className="w-full rounded-2xl border border-[#18181B]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                placeholder="400000"
              />
            </div>

            {/* Quoted Freight Price */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18181B]/70 block">
                Quoted Freight Price ($ USD)
              </label>
              <input
                type="number"
                value={form.quoted_price}
                onChange={(e) => set('quoted_price', e.target.value)}
                className="w-full rounded-2xl border border-[#18181B]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                placeholder="2000000"
              />
            </div>

            {/* Commercial Source */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18181B]/70 block">
                Commercial Verification Source
              </label>
              <input
                type="text"
                value={form.commercial_source}
                onChange={(e) => set('commercial_source', e.target.value)}
                className="w-full rounded-2xl border border-[#18181B]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                placeholder="Shipowner / Broker Quote"
              />
            </div>

            {/* Verification Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18181B]/70 block">
                Commercial Status
              </label>
              <input
                type="text"
                value={form.verification_status}
                disabled
                className="w-full rounded-2xl border border-[#18181B]/15 bg-[#FAFAF8] px-4 py-3 text-sm font-bold text-emerald-800"
              />
            </div>

          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-between border-t border-[#18181B]/10">
            <button
              type="button"
              onClick={() => router.push(`/map?scenario_id=${scenarioId}`)}
              className="text-xs font-medium text-[#18181B]/70 hover:text-[#18181B]"
            >
              ← Back to Network Map
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-full bg-[#18181B] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Evaluating Deal Economics...' : 'Evaluate Commercial Deal →'}
            </button>
          </div>

        </GlassPanel>
      </main>
    </div>
  )
}

export default function NewDealPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Commercial Entry Form...</div>}>
      <NewDealContent />
    </Suspense>
  )
}
