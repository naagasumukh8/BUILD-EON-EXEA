'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

const STEPS = [
  { id: 1, label: 'Demand', icon: '📦' },
  { id: 2, label: 'Supply Origin', icon: '⚓' },
  { id: 3, label: 'Vessel Status', icon: '🚢' },
  { id: 4, label: 'Alternatives', icon: '🗺️' },
  { id: 5, label: 'Priorities', icon: '⚖️' },
]

const PRODUCTS = ['crude', 'diesel', 'gasoline', 'refined', 'lng']

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
      router.push(`/map?scenario_id=${scenario.id || 'scen-demo-001'}`)
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
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col">
      <Navbar scenarioId={currentScenarioId} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Step 1 &middot; Natural Language Intake
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            State Your Disruption Requirement
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Enter your operational demand in plain text or use the step-by-step guided form below.
          </p>
        </div>

        {/* AI Natural Language Prompt Card */}
        <GlassPanel className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#18181B]/60 flex items-center gap-2">
              <span>✦</span> AI Fast Parser (Gemini Engine)
            </span>
            <span className="text-xs text-[#18181B]/50">Auto-Extracts Product, Volume & Deadline</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder='e.g. "We need 2 million barrels of diesel to Mumbai, India within 7 days from Ras Tanura"'
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] placeholder-[#18181B]/40 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              onKeyDown={(e) => e.key === 'Enter' && handleAIParse()}
            />
            <button
              onClick={handleAIParse}
              disabled={aiLoading}
              className="btn-paper whitespace-nowrap"
            >
              {aiLoading ? 'Parsing...' : 'Extract Parameters →'}
            </button>
          </div>

          {aiQuestion && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 font-medium">
              <span className="text-base">💬</span>
              <div>{aiQuestion}</div>
            </div>
          )}

          {/* Extracted Parameters */}
          <div className="pt-3 border-t border-[#18181B]/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#18181B]/60 font-medium">Active Scenario:</span>
            {fields.volume_required && (
              <span className="px-3.5 py-1 rounded-full bg-[#18181B] text-white font-semibold shadow-2xs">
                {Number(fields.volume_required).toLocaleString()} {fields.volume_unit}
              </span>
            )}
            {fields.product && (
              <span className="px-3.5 py-1 rounded-full bg-[#18181B] text-white font-semibold uppercase shadow-2xs">
                {fields.product}
              </span>
            )}
            {fields.destination_port_name && (
              <span className="px-3.5 py-1 rounded-full bg-[#18181B] text-white font-semibold shadow-2xs">
                Destination: {fields.destination_port_name}
              </span>
            )}
            {fields.deadline_days && (
              <span className="px-3.5 py-1 rounded-full bg-[#18181B] text-white font-semibold shadow-2xs">
                Deadline: {fields.deadline_days} Days
              </span>
            )}
          </div>
        </GlassPanel>

        {/* Guided Step Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                step === s.id
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'bg-white border border-[#18181B]/10 text-[#18181B]/70 hover:text-[#18181B] hover:bg-[#18181B]/5'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
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

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#18181B]/10">
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
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Intake Consultation...</div>}>
      <IntakeContent />
    </Suspense>
  )
}

function StepDemand({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Product & Quantity Demand</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Product Type</label>
          <select
            value={fields.product}
            onChange={(e) => set('product', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          >
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Required Volume (bbls)</label>
          <input
            type="number"
            value={fields.volume_required}
            onChange={(e) => set('volume_required', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Destination Port / Region</label>
          <input
            type="text"
            value={fields.destination_port_name}
            onChange={(e) => set('destination_port_name', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Maximum Deadline (Days)</label>
          <input
            type="number"
            value={fields.deadline_days}
            onChange={(e) => set('deadline_days', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />
        </div>
      </div>
    </div>
  )
}

function StepSupply({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Supply Origin & Purchase Price</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Origin Terminal / Port</label>
          <input
            type="text"
            value={fields.origin_port_name}
            onChange={(e) => set('origin_port_name', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Primary Supplier</label>
          <input
            type="text"
            value={fields.supplier}
            onChange={(e) => set('supplier', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">FOB Purchase Price ($/bbl)</label>
          <input
            type="number"
            step="0.1"
            value={fields.purchase_price_usd_per_bbl}
            onChange={(e) => set('purchase_price_usd_per_bbl', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />
        </div>
      </div>
    </div>
  )
}

function StepVessel({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Vessel Situation</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Current Vessel Position</label>
          <select
            value={fields.vessel_situation}
            onChange={(e) => set('vessel_situation', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          >
            <option value="seeking">Seeking Available Charter Vessel</option>
            <option value="chartered">Have Existing Chartered Vessel</option>
            <option value="own">Own Fleet Vessel</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Vessel Class Required</label>
          <select
            value={fields.vessel_type_required}
            onChange={(e) => set('vessel_type_required', e.target.value)}
            className="w-full p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          >
            <option value="VLCC">VLCC (2.0M bbl capacity)</option>
            <option value="Suezmax">Suezmax (1.0M bbl capacity)</option>
            <option value="Aframax">Aframax (600K bbl capacity)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function StepAlternatives({ fields, set }: any) {
  return (
    <div className="space-y-6">
      <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Bypass Pipeline & Alternative Routes</h3>
      <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10 space-y-3">
        <div className="text-sm font-semibold text-[#18181B]">Disruption Chokepoint & Route Bypasses</div>
        <p className="text-xs text-[#18181B]/70 leading-relaxed">
          EON EXEA automatically integrates Yanbu IPSA Pipeline Bypass (2.5M bbl/day throughput) and Cape of Good Hope alternate sea lane options into your multi-modal decision optimization.
        </p>
      </div>
    </div>
  )
}

function StepPriorities({ fields, set, totalWeight }: any) {
  return (
    <div className="space-y-6">
      <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Optimization Priority Weights</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#18181B]/70 mb-1">
            <span>Cost Weight (Minimizing Landed Cost)</span>
            <span>{Math.round(fields.priority_cost_weight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={fields.priority_cost_weight}
            onChange={(e) => set('priority_cost_weight', parseFloat(e.target.value))}
            className="w-full accent-[#18181B]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-[#18181B]/70 mb-1">
            <span>Time Weight (Minimizing Delivery Days)</span>
            <span>{Math.round(fields.priority_time_weight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={fields.priority_time_weight}
            onChange={(e) => set('priority_time_weight', parseFloat(e.target.value))}
            className="w-full accent-[#18181B]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-[#18181B]/70 mb-1">
            <span>Risk Weight (Avoiding High Risk Routes)</span>
            <span>{Math.round(fields.priority_risk_weight * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={fields.priority_risk_weight}
            onChange={(e) => set('priority_risk_weight', parseFloat(e.target.value))}
            className="w-full accent-[#18181B]"
          />
        </div>
      </div>
    </div>
  )
}
