'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

function IntakeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const existingScenarioId = searchParams.get('scenario_id')

  const [prompt, setPrompt] = useState(
    'I need 2 million barrels of diesel delivered to India within 7 days.'
  )
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [parsed, setParsed] = useState<any>({
    product_type: 'diesel',
    volume_bbls: 2000000,
    destination_port: 'Mumbai, India',
    deadline_days: 7,
    max_acceptable_landed_cost_usd_bbl: 95.0,
    priority: 'cost',
  })

  const [step, setStep] = useState<'input' | 'parsed'>('parsed')

  const handleParse = async () => {
    if (!prompt.trim()) return
    setParsing(true)
    setError(null)
    try {
      const res = await api.parseIntake(prompt)
      const fields = res.parsed_fields || res
      setParsed({
        product_type: fields.product || fields.product_type || 'diesel',
        volume_bbls: fields.volume_required || fields.volume_bbls || 2000000,
        destination_port: fields.destination_port_name || fields.destination_port || 'Mumbai, India',
        deadline_days: fields.deadline_days || 7,
        max_acceptable_landed_cost_usd_bbl: fields.max_acceptable_landed_cost_usd_bbl || 95.0,
        priority: fields.priority || 'cost',
      })
      setStep('parsed')
    } catch (e: any) {
      setError(e.message || 'Error parsing supply requirement.')
    } finally {
      setParsing(false)
    }
  }

  const handleSaveAndProceed = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await api.saveScenario({
        natural_language_prompt: prompt,
        product: parsed.product_type || 'diesel',
        product_type: parsed.product_type || 'diesel',
        volume_required: parseFloat(parsed.volume_bbls) || 2000000,
        volume_bbls: parseFloat(parsed.volume_bbls) || 2000000,
        destination_port_name: parsed.destination_port || 'Mumbai, India',
        destination_port: parsed.destination_port || 'Mumbai, India',
        deadline_days: parseInt(parsed.deadline_days) || 7,
        max_acceptable_landed_cost_usd_bbl: parseFloat(parsed.max_acceptable_landed_cost_usd_bbl) || 95.0,
        priority: parsed.priority || 'cost',
      })
      const scenarioId = res.scenario_id || res.id || existingScenarioId || 'scen-demo-001'
      router.push(`/map?scenario_id=${scenarioId}`)
    } catch (e: any) {
      setError(e.message || 'Error saving supply requirement.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={existingScenarioId || 'scen-demo-001'} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Supply Requirement Intake
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Specify Energy Requirement
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            State your operational commodity target, volume, destination, and delivery deadline.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        {/* Natural Language Prompt Input */}
        <GlassPanel className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B]/70">
            Requirement Statement
          </label>

          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I need 25 million barrels of diesel delivered to India within 70 days."
              className="w-full p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] placeholder-[#18181B]/40 focus:outline-none focus:ring-2 focus:ring-[#18181B] resize-none"
            />

            <button
              onClick={handleParse}
              disabled={parsing}
              className="absolute right-3 bottom-4 px-5 py-2 rounded-full bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs"
            >
              {parsing ? 'Parsing Statement...' : 'Parse Requirement →'}
            </button>
          </div>
        </GlassPanel>

        {/* Parsed Parameters Verification */}
        {step === 'parsed' && parsed && (
          <GlassPanel className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#18181B]/10 pb-4">
              <h2 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                Parsed Specification Parameters
              </h2>
              <span className="text-xs text-[#18181B]/50 font-medium uppercase tracking-wider">
                Editable Specification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Product Type</label>
                <select
                  value={parsed.product_type}
                  onChange={(e) => setParsed({ ...parsed, product_type: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                >
                  <option value="diesel">DIESEL</option>
                  <option value="crude">CRUDE OIL</option>
                  <option value="gasoline">GASOLINE</option>
                  <option value="lng">LNG</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Volume (Barrels / bbl)</label>
                <input
                  type="number"
                  value={parsed.volume_bbls}
                  onChange={(e) => setParsed({ ...parsed, volume_bbls: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Destination Port</label>
                <input
                  type="text"
                  value={parsed.destination_port}
                  onChange={(e) => setParsed({ ...parsed, destination_port: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Deadline (Days)</label>
                <input
                  type="number"
                  value={parsed.deadline_days}
                  onChange={(e) => setParsed({ ...parsed, deadline_days: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Target Landed Cost ($/bbl)</label>
                <input
                  type="number"
                  value={parsed.max_acceptable_landed_cost_usd_bbl || 95.0}
                  onChange={(e) => setParsed({ ...parsed, max_acceptable_landed_cost_usd_bbl: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Optimization Priority</label>
                <select
                  value={parsed.priority}
                  onChange={(e) => setParsed({ ...parsed, priority: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                >
                  <option value="cost">MINIMIZE COST</option>
                  <option value="speed">MINIMIZE TRANSIT TIME</option>
                  <option value="risk">MINIMIZE RISK</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-[#18181B]/10 flex items-center justify-between">
              <span className="text-xs text-[#18181B]/60">
                PROVENANCE: PARSED SPECIFICATION
              </span>

              <button
                onClick={handleSaveAndProceed}
                disabled={saving}
                className="rounded-full bg-[#18181B] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all shadow-md"
              >
                {saving ? 'Saving Requirement...' : 'Discover Supply & Transport Options →'}
              </button>
            </div>
          </GlassPanel>
        )}

      </main>
    </div>
  )
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Specification Setup...</div>}>
      <IntakeContent />
    </Suspense>
  )
}
