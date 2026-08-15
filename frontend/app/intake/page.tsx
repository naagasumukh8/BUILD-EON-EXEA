'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, GlassCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

const STEPS = [
  { id: 1, label: 'Demand', icon: '📦' },
  { id: 2, label: 'Supply Origin', icon: '⚓' },
  { id: 3, label: 'Vessel Status', icon: '🚢' },
  { id: 4, label: 'Alternatives', icon: '🗺️' },
  { id: 5, label: 'Priorities', icon: '⚖️' },
]

const PRODUCTS = ['crude', 'diesel', 'gasoline', 'refined', 'lng']
const VESSEL_SITUATIONS = [
  { value: 'own', label: 'I own a vessel' },
  { value: 'chartered', label: 'I have a chartered vessel' },
  { value: 'seeking', label: 'I need to find a vessel' },
]

function IntakeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentScenarioId = searchParams.get('scenario_id') || ''

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiQuestion, setAiQuestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [fields, setFields] = useState<Record<string, any>>({
    product: 'diesel',
    volume_required: '2000000',
    volume_unit: 'bbls',
    destination_port_name: 'Mumbai',
    deadline_days: '7',
    origin_port_name: 'Ras Tanura',
    supplier: 'Saudi Aramco',
    purchase_price_usd_per_bbl: '82.50',
    vessel_situation: 'seeking',
    vessel_type_required: 'VLCC',
    priority_cost_weight: 0.4,
    priority_time_weight: 0.35,
    priority_risk_weight: 0.25,
  })

  const set = (k: string, v: any) => setFields((f) => ({ ...f, [k]: v }))

  const handleAIParse = async () => {
    if (!aiText.trim()) return
    setAiLoading(true)
    setError(null)
    try {
      const res = await api.parseIntake(aiText, fields)
      if (res.parsed_fields) {
        setFields((f) => ({ ...f, ...res.parsed_fields }))
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

  const totalWeight =
    parseFloat(fields.priority_cost_weight) +
    parseFloat(fields.priority_time_weight) +
    parseFloat(fields.priority_risk_weight)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar scenarioId={currentScenarioId} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        <div className="text-center max-w-3xl mx-auto pt-4 pb-2 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e6faa]/15 border border-[#1e6faa]/40 text-xs text-[#2a9aff]">
            <span>AI Supply Chain Consultation</span>
          </div>
          <h1 className="title-ogg text-4xl sm:text-5xl lg:text-6xl text-[#fdf1e1] leading-tight">
            What supply requirement are you trying to solve?
          </h1>
          <p className="text-[#8aacca] text-base sm:text-lg max-w-xl mx-auto font-light">
            Describe your operational demand in plain language, or configure your scenario terms step by step below.
          </p>
        </div>

        <GlassPanel className="relative overflow-hidden border-[#1e6faa]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
                AI Natural Language Parser
              </span>
              <GlassBadge status="SIMULATED" label="Gemini 2.5 Parsing" />
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                className="glass-input flex-1 py-4 px-5 text-base sm:text-lg rounded-2xl bg-[#0a121c]/80 border-[#1e6faa]/40 placeholder:text-[#6b8499]"
                placeholder="e.g. I need 2 million barrels of diesel delivered to Mumbai in 7 days, seeking a ship..."
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIParse()}
              />
              <button
                onClick={handleAIParse}
                disabled={aiLoading}
                className="btn-paper whitespace-nowrap text-base px-8 py-4 shrink-0 font-medium"
              >
                {aiLoading ? 'Analyzing...' : 'Parse Scenario →'}
              </button>
            </div>

            {aiQuestion && (
              <div className="p-4 rounded-xl bg-[#1e6faa]/15 border border-[#2a9aff]/40 text-sm text-[#2a9aff] animate-slide-up flex items-start gap-3">
                <span className="text-lg">💬</span>
                <div>{aiQuestion}</div>
              </div>
            )}

            <div className="pt-2 border-t border-[rgba(30,90,140,0.25)] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#6b8499] mr-2">Parsed Chips:</span>
              {fields.volume_required && (
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#fdf1e1] flex items-center gap-1.5">
                  <span className="text-[#2a9aff]">Volume:</span>
                  <span className="font-semibold">{Number(fields.volume_required).toLocaleString()} {fields.volume_unit}</span>
                </div>
              )}
              {fields.product && (
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#fdf1e1] flex items-center gap-1.5 uppercase">
                  <span className="text-[#2a9aff]">Product:</span>
                  <span className="font-semibold">{fields.product}</span>
                </div>
              )}
              {fields.destination_port_name && (
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#fdf1e1] flex items-center gap-1.5">
                  <span className="text-[#2a9aff]">Destination:</span>
                  <span className="font-semibold">{fields.destination_port_name}</span>
                </div>
              )}
              {fields.deadline_days && (
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#fdf1e1] flex items-center gap-1.5">
                  <span className="text-[#2a9aff]">Deadline:</span>
                  <span className="font-semibold">{fields.deadline_days} Days</span>
                </div>
              )}
            </div>
          </div>
        </GlassPanel>

        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                step === s.id
                  ? 'bg-gradient-to-r from-[#1e6faa] to-[#144970] text-[#fdf1e1] border-[#2a9aff]/50 shadow-[0_4px_20px_rgba(30,111,170,0.4)]'
                  : 'bg-[#0f1a26]/60 border-[rgba(30,80,120,0.3)] text-[#8aacca] hover:text-[#fdf1e1] hover:bg-white/5'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
            ⚠️ {error}
          </div>
        )}

        <GlassPanel>
          {step === 1 && <StepDemand fields={fields} set={set} />}
          {step === 2 && <StepSupply fields={fields} set={set} />}
          {step === 3 && <StepVessel fields={fields} set={set} />}
          {step === 4 && <StepAlternatives fields={fields} set={set} />}
          {step === 5 && <StepPriorities fields={fields} set={set} totalWeight={totalWeight} />}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(30,90,140,0.3)]">
            <button
              className="btn-ghost-glass"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              ← Previous Step
            </button>

            {step < 5 ? (
              <button className="btn-paper" onClick={() => setStep((s) => s + 1)}>
                Next Step →
              </button>
            ) : (
              <button className="btn-paper text-base px-8" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving Scenario...' : '🚢 Save Scenario & Launch Map →'}
              </button>
            )}
          </div>
        </GlassPanel>
      </main>
    </div>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080e14] flex items-center justify-center text-[#8aacca]">Loading Intake...</div>}>
      <IntakeContent />
    </Suspense>
  )
}

function StepDemand({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-2xl mb-1 text-[#fdf1e1]">Demand Specification</h3>
        <p className="text-sm text-[#8aacca]">Select commodity type, total volume requirement, and destination.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
            Product Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRODUCTS.map((p) => (
              <button
                key={p}
                onClick={() => set('product', p)}
                className={`py-3 px-4 rounded-xl text-sm capitalize font-medium transition-all duration-200 border ${
                  fields.product === p
                    ? 'bg-[#1e6faa] text-[#fdf1e1] border-[#2a9aff] shadow-[0_0_15px_rgba(42,154,255,0.3)]'
                    : 'bg-[#0a121c]/60 border-[rgba(30,80,120,0.3)] text-[#8aacca] hover:border-[#1e6faa]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
              Required Volume *
            </label>
            <div className="flex gap-2">
              <input
                className="glass-input flex-1"
                type="number"
                placeholder="2000000"
                value={fields.volume_required}
                onChange={(e) => set('volume_required', e.target.value)}
              />
              <select
                className="glass-input w-28 bg-[#0a121c]"
                value={fields.volume_unit}
                onChange={(e) => set('volume_unit', e.target.value)}
              >
                <option value="bbls">bbls</option>
                <option value="mbbls">Mbbls</option>
                <option value="mt">MT</option>
              </select>
            </div>
            {fields.volume_required && (
              <span className="text-xs text-[#6b8499] mt-1 block">
                = {(parseFloat(fields.volume_required) / 1000000).toFixed(2)}M Barrels
              </span>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
              Delivery Deadline (Days) *
            </label>
            <input
              className="glass-input"
              type="number"
              placeholder="7"
              value={fields.deadline_days}
              onChange={(e) => set('deadline_days', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
            Destination Port *
          </label>
          <input
            className="glass-input"
            placeholder="e.g. Mumbai, JNPT, Singapore, Rotterdam"
            value={fields.destination_port_name}
            onChange={(e) => set('destination_port_name', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function StepSupply({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-2xl mb-1 text-[#fdf1e1]">Supply & Commercial Terms</h3>
        <p className="text-sm text-[#8aacca]">Provide known origin, supplier details, and reference pricing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
            Origin Port
          </label>
          <input
            className="glass-input"
            placeholder="e.g. Ras Tanura, Abu Dhabi"
            value={fields.origin_port_name}
            onChange={(e) => set('origin_port_name', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2">
            Supplier Counterparty
          </label>
          <input
            className="glass-input"
            placeholder="e.g. Saudi Aramco, ADNOC"
            value={fields.supplier}
            onChange={(e) => set('supplier', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2 flex items-center justify-between">
            <span>Purchase Price (USD/bbl)</span>
            <GlassBadge status="SIMULATED" label="ESTIMATED" />
          </label>
          <input
            className="glass-input"
            type="number"
            step="0.01"
            placeholder="82.50"
            value={fields.purchase_price_usd_per_bbl}
            onChange={(e) => set('purchase_price_usd_per_bbl', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold block mb-2 flex items-center justify-between">
            <span>Known Freight (USD/bbl)</span>
            <GlassBadge status="SIMULATED" label="ESTIMATED" />
          </label>
          <input
            className="glass-input"
            type="number"
            step="0.01"
            placeholder="1.50"
            value={fields.freight_cost_usd_per_bbl || ''}
            onChange={(e) => set('freight_cost_usd_per_bbl', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function StepVessel({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-2xl mb-1 text-[#fdf1e1]">Vessel Situation</h3>
        <p className="text-sm text-[#8aacca]">Specify your current fleet or charter status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {VESSEL_SITUATIONS.map((vs) => (
          <GlassCard
            key={vs.value}
            onClick={() => set('vessel_situation', vs.value)}
            className={`border ${
              fields.vessel_situation === vs.value
                ? 'border-[#2a9aff] bg-[#1e6faa]/20'
                : 'border-[rgba(30,80,120,0.3)] hover:border-[#1e6faa]'
            }`}
          >
            <div className="font-semibold text-base text-[#fdf1e1] mb-1">{vs.label}</div>
            <p className="text-xs text-[#8aacca]">
              {vs.value === 'own'
                ? 'Own fleet vessel available'
                : vs.value === 'chartered'
                ? 'Existing charter contract'
                : 'Discover available market vessels via AIS'}
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-[#0a121c]/70 border border-[rgba(30,80,120,0.3)] text-xs text-[#8aacca] flex items-center gap-3">
        <span className="text-lg">ℹ️</span>
        <div>
          <strong className="text-[#fdf1e1]">Note on AIS Data:</strong> AIS positions indicate vessel movement, but do NOT confirm commercial cargo capacity. Every candidate discovered is labeled <GlassBadge status="CANDIDATE_UNVERIFIED" /> until verified.
        </div>
      </div>
    </div>
  )
}

function StepAlternatives({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-2xl mb-1 text-[#fdf1e1]">Infrastructure Alternatives</h3>
        <p className="text-sm text-[#8aacca]">The engine incorporates reference pipeline infrastructure alongside sea routes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: 'IPSA Pipeline', origin: 'Saudi Arabia', eta: '3 Days', tariff: '$1.40/bbl', status: 'REAL_REFERENCE' },
          { name: 'Habshan-Fujairah', origin: 'ADNOC / UAE', eta: '1 Day', tariff: '$1.20/bbl', status: 'REAL_REFERENCE' },
          { name: 'SUMED Pipeline', origin: 'Red Sea → Med', eta: '1 Day', tariff: '$2.10/bbl', status: 'REAL_REFERENCE' },
        ].map((p) => (
          <GlassCard key={p.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#fdf1e1] text-sm">{p.name}</span>
              <GlassBadge status={p.status} />
            </div>
            <div className="text-xs text-[#8aacca] space-y-1">
              <div>Origin: {p.origin}</div>
              <div>ETA: {p.eta} · Tariff: {p.tariff}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function StepPriorities({ fields, set, totalWeight }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-2xl mb-1 text-[#fdf1e1]">Optimization Priorities</h3>
        <p className="text-sm text-[#8aacca]">Adjust the weights driving the OR-Tools decision engine.</p>
      </div>

      <div className="space-y-5">
        {[
          { key: 'priority_cost_weight', label: 'Cost Priority', desc: 'Minimise landed cost per barrel' },
          { key: 'priority_time_weight', label: 'Time Priority', desc: 'Minimise transit days and ETA' },
          { key: 'priority_risk_weight', label: 'Risk Mitigation', desc: 'Minimise supply disruption risk' },
        ].map((w) => (
          <div key={w.key} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[#fdf1e1]">{w.label} <span className="text-xs text-[#6b8499] font-normal">({w.desc})</span></span>
              <span className="font-bold text-[#2a9aff]">
                {totalWeight > 0 ? ((fields[w.key] / totalWeight) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={fields[w.key]}
              onChange={(e) => set(w.key, parseFloat(e.target.value))}
              className="w-full accent-[#2a9aff] h-2 bg-[#0a121c] rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
