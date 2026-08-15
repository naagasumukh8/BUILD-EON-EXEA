'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, GlassCard, SightCard } from '@/components/ui/GlassPanel'
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
    destination_port_name: 'India',
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

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Editorial Heading */}
        <div className="text-center max-w-3xl mx-auto pt-6 pb-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fdf1e1]/10 border border-[#fdf1e1]/30 text-xs text-[#fdf1e1] font-medium tracking-widest uppercase">
            <span>AI Consultation</span>
          </div>
          <h1 className="title-ogg text-4xl sm:text-5xl lg:text-6xl text-[#fdf1e1] leading-tight">
            What are you trying to secure?
          </h1>
          <p className="text-[#fdf1e1]/70 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            State your operational demand in natural language, or adjust the scenario attributes step by step.
          </p>
        </div>

        {/* AI Input Box */}
        <GlassPanel className="relative overflow-hidden border-[rgba(253,241,225,0.25)] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">
                Natural Language Requirement Input
              </span>
              <GlassBadge status="SIMULATED" label="Gemini 2.5 Engine" />
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                className="glass-input flex-1 py-4 px-5 text-base sm:text-lg rounded-2xl bg-[#0a121c]/80 border-[rgba(253,241,225,0.25)] placeholder:text-[#fdf1e1]/40"
                placeholder="I need 2 million barrels of diesel delivered to India within 7 days."
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIParse()}
              />
              <button
                onClick={handleAIParse}
                disabled={aiLoading}
                className="btn-paper whitespace-nowrap text-base px-8 py-4 shrink-0 font-semibold"
              >
                {aiLoading ? 'Analyzing...' : 'Parse Scenario →'}
              </button>
            </div>

            {aiQuestion && (
              <div className="p-4 rounded-2xl bg-[#fdf1e1]/10 border border-[#fdf1e1]/30 text-sm text-[#fdf1e1] animate-slide-up flex items-start gap-3">
                <span className="text-lg">💬</span>
                <div>{aiQuestion}</div>
              </div>
            )}

            {/* Extracted Information Cream & Glass Pills */}
            <div className="pt-3 border-t border-[rgba(253,241,225,0.15)] flex flex-wrap items-center gap-2.5 text-xs">
              <span className="text-[#fdf1e1]/60 mr-2 font-medium">Extracted Scenario:</span>
              {fields.volume_required && (
                <div className="px-4 py-1.5 rounded-full bg-[#fdf1e1] text-[#111411] font-semibold flex items-center gap-1.5 shadow-sm">
                  <span>{Number(fields.volume_required).toLocaleString()} {fields.volume_unit}</span>
                </div>
              )}
              {fields.product && (
                <div className="px-4 py-1.5 rounded-full bg-[#fdf1e1] text-[#111411] font-semibold uppercase flex items-center gap-1.5 shadow-sm">
                  <span>{fields.product}</span>
                </div>
              )}
              {fields.destination_port_name && (
                <div className="px-4 py-1.5 rounded-full bg-[#fdf1e1] text-[#111411] font-semibold flex items-center gap-1.5 shadow-sm">
                  <span>Destination: {fields.destination_port_name}</span>
                </div>
              )}
              {fields.deadline_days && (
                <div className="px-4 py-1.5 rounded-full bg-[#fdf1e1] text-[#111411] font-semibold flex items-center gap-1.5 shadow-sm">
                  <span>Deadline: {fields.deadline_days} Days</span>
                </div>
              )}
            </div>
          </div>
        </GlassPanel>

        {/* Guided Step Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
                step === s.id
                  ? 'bg-[#fdf1e1] text-[#111411] border-[#fdf1e1] shadow-[0_6px_24px_rgba(0,0,0,0.3)]'
                  : 'bg-[#0f1a26]/60 border-[rgba(253,241,225,0.15)] text-[#fdf1e1]/70 hover:text-[#fdf1e1] hover:bg-white/10'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
            ⚠️ {error}
          </div>
        )}

        {/* Step Form Panel */}
        <GlassPanel>
          {step === 1 && <StepDemand fields={fields} set={set} />}
          {step === 2 && <StepSupply fields={fields} set={set} />}
          {step === 3 && <StepVessel fields={fields} set={set} />}
          {step === 4 && <StepAlternatives fields={fields} set={set} />}
          {step === 5 && <StepPriorities fields={fields} set={set} totalWeight={totalWeight} />}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(253,241,225,0.15)]">
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
                {loading ? 'Saving Scenario...' : '🚢 Launch Network Map →'}
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
    <Suspense fallback={<div className="min-h-screen bg-[#0b1110] flex items-center justify-center text-[#fdf1e1]/70">Loading Intake Consultation...</div>}>
      <IntakeContent />
    </Suspense>
  )
}

function StepDemand({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-3xl mb-1 text-[#fdf1e1]">Demand Specification</h3>
        <p className="text-sm text-[#fdf1e1]/70">Specify product category, volume requirement, and destination.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
            Product Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRODUCTS.map((p) => (
              <button
                key={p}
                onClick={() => set('product', p)}
                className={`py-3 px-4 rounded-2xl text-sm capitalize font-medium transition-all duration-200 border ${
                  fields.product === p
                    ? 'bg-[#fdf1e1] text-[#111411] border-[#fdf1e1] font-semibold shadow-md'
                    : 'bg-[#0a121c]/60 border-[rgba(253,241,225,0.15)] text-[#fdf1e1]/80 hover:border-[#fdf1e1]/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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
              <span className="text-xs text-[#fdf1e1]/50 mt-1 block font-mono">
                = {(parseFloat(fields.volume_required) / 1000000).toFixed(2)}M Barrels
              </span>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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
          <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
            Destination Port *
          </label>
          <input
            className="glass-input"
            placeholder="e.g. India, Mumbai, JNPT, Singapore"
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
        <h3 className="title-ogg text-3xl mb-1 text-[#fdf1e1]">Supply & Commercial Terms</h3>
        <p className="text-sm text-[#fdf1e1]/70">Provide origin port, supplier information, and purchase benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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
          <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2">
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
          <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2 flex items-center justify-between">
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
          <label className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-2 flex items-center justify-between">
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
        <h3 className="title-ogg text-3xl mb-1 text-[#fdf1e1]">Vessel Situation</h3>
        <p className="text-sm text-[#fdf1e1]/70">Specify your fleet status or charter requirements.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {VESSEL_SITUATIONS.map((vs) => (
          <SightCard
            key={vs.value}
            title={vs.label}
            subtitle={
              vs.value === 'own'
                ? 'Own fleet vessel available'
                : vs.value === 'chartered'
                ? 'Existing charter contract'
                : 'Discover available market vessels via AIS'
            }
            onClick={() => set('vessel_situation', vs.value)}
            className={`border ${
              fields.vessel_situation === vs.value
                ? 'ring-2 ring-[#fdf1e1] shadow-lg'
                : 'opacity-90 hover:opacity-100'
            }`}
          />
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-[#0a121c]/70 border border-[rgba(253,241,225,0.15)] text-xs text-[#fdf1e1]/70 flex items-center gap-3">
        <span className="text-lg">ℹ️</span>
        <div>
          <strong className="text-[#fdf1e1]">Note on AIS Data:</strong> AIS positions track vessel movement only — commercial capacity must be verified with shipowner.
        </div>
      </div>
    </div>
  )
}

function StepAlternatives({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-3xl mb-1 text-[#fdf1e1]">Pipeline & Bypass Alternatives</h3>
        <p className="text-sm text-[#fdf1e1]/70">Reference pipeline infrastructure automatically evaluated by the solver.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: 'IPSA Pipeline', origin: 'Saudi Arabia', eta: '3 Days', tariff: '$1.40/bbl', status: 'REAL_REFERENCE' },
          { name: 'Habshan-Fujairah', origin: 'ADNOC / UAE', eta: '1 Day', tariff: '$1.20/bbl', status: 'REAL_REFERENCE' },
          { name: 'SUMED Pipeline', origin: 'Red Sea → Med', eta: '1 Day', tariff: '$2.10/bbl', status: 'REAL_REFERENCE' },
        ].map((p) => (
          <SightCard
            key={p.name}
            kicker={p.origin}
            title={p.name}
            subtitle={`ETA: ${p.eta} · Tariff: ${p.tariff}`}
            badge={<GlassBadge status={p.status} />}
          />
        ))}
      </div>
    </div>
  )
}

function StepPriorities({ fields, set, totalWeight }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="title-ogg text-3xl mb-1 text-[#fdf1e1]">Optimization Weighting</h3>
        <p className="text-sm text-[#fdf1e1]/70">Adjust business priorities governing the solver objective function.</p>
      </div>

      <div className="space-y-5">
        {[
          { key: 'priority_cost_weight', label: 'Cost Priority', desc: 'Minimise total landed cost per barrel' },
          { key: 'priority_time_weight', label: 'Time Priority', desc: 'Minimise transit days and ETA' },
          { key: 'priority_risk_weight', label: 'Risk Mitigation', desc: 'Minimise supply disruption vulnerability' },
        ].map((w) => (
          <div key={w.key} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[#fdf1e1]">{w.label} <span className="text-xs text-[#fdf1e1]/50 font-normal">({w.desc})</span></span>
              <span className="font-bold text-[#fdf1e1] font-mono">
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
              className="w-full accent-[#fdf1e1] h-2 bg-[#0a121c] rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
