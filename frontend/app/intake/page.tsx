'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────
interface SupplySource { origin: string; available_volume_bbl: number | null }
interface ParsedSpec {
  product_type: string | null
  volume_bbls: number | null
  destination_port: string | null
  deadline_days: number | null
  optimization_priority: string | null
  /** null means NOT SPECIFIED — NEVER default to any value */
  target_landed_cost_usd_bbl: number | null
  sources: SupplySource[]
  disruption_conditions: string[]
  constraints: string[]
}

// ── Component ─────────────────────────────────────────────────────────────────
function IntakeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const existingScenarioId = searchParams.get('scenario_id')

  const [prompt, setPrompt] = useState('')
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ambiguities, setAmbiguities] = useState<string[]>([])
  const [parsed, setParsed] = useState<ParsedSpec | null>(null)
  const [step, setStep] = useState<'input' | 'parsed'>('input')

  // ── Parse handler ──────────────────────────────────────────────────────────
  const handleParse = async () => {
    if (!prompt.trim()) return
    setParsing(true)
    setError(null)
    setAmbiguities([])
    try {
      const res = await api.parseIntake(prompt)
      const f = res.parsed_fields || res

      // Build sources — NEVER invent
      const sources: SupplySource[] = Array.isArray(f.sources)
        ? f.sources.map((s: any) => ({
            origin: s.origin || '',
            available_volume_bbl: s.available_volume_bbl ?? null,
          }))
        : []

      // Surface ambiguities
      const ambs: string[] = []
      if (!f.product && !f.product_type) ambs.push('Product type could not be identified')
      if (!f.volume_required && !f.volume_bbls) ambs.push('Required volume could not be identified')
      if (!f.destination_port_name && !f.destination_port) ambs.push('Destination could not be identified')
      if (!f.deadline_days) ambs.push('Delivery deadline could not be identified')
      if (sources.length === 0 && !f.origin_port_name) ambs.push('Supply origins not specified — add manually below')
      setAmbiguities(ambs)

      setParsed({
        product_type: f.product || f.product_type || null,
        volume_bbls: f.volume_required || f.volume_bbls || null,
        destination_port: f.destination_port_name || f.destination_port || null,
        deadline_days: f.deadline_days || null,
        optimization_priority: f.optimization_priority || null,
        // CRITICAL: only set if Gemini returned it — otherwise null
        target_landed_cost_usd_bbl: f.target_landed_cost_usd_bbl ?? null,
        sources,
        disruption_conditions: Array.isArray(f.disruption_conditions) ? f.disruption_conditions : [],
        constraints: Array.isArray(f.constraints) ? f.constraints : [],
      })
      setStep('parsed')
    } catch (e: any) {
      setError(e.message || 'Error parsing supply requirement.')
    } finally {
      setParsing(false)
    }
  }

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSaveAndProceed = async () => {
    if (!parsed) return
    setSaving(true)
    setError(null)
    try {
      const payload: any = {
        natural_language_prompt: prompt,
        product: parsed.product_type || 'crude',
        product_type: parsed.product_type || 'crude',
        volume_required: parseFloat(String(parsed.volume_bbls)) || 0,
        volume_bbls: parseFloat(String(parsed.volume_bbls)) || 0,
        destination_port_name: parsed.destination_port || '',
        destination_port: parsed.destination_port || '',
        deadline_days: parseInt(String(parsed.deadline_days)) || 18,
        optimization_priority: parsed.optimization_priority || null,
        sources: parsed.sources,
        disruption_conditions: parsed.disruption_conditions,
        constraints: parsed.constraints,
      }
      // ONLY include target_landed_cost if user explicitly provided it
      if (parsed.target_landed_cost_usd_bbl !== null) {
        payload.max_acceptable_landed_cost_usd_bbl = parsed.target_landed_cost_usd_bbl
      }
      const res = await api.saveScenario(payload)
      const scenarioId = res.scenario_id || res.id || existingScenarioId || 'scen-demo-001'
      router.push(`/map?scenario_id=${scenarioId}`)
    } catch (e: any) {
      setError(e.message || 'Error saving supply requirement.')
    } finally {
      setSaving(false)
    }
  }

  // ── Source helpers ─────────────────────────────────────────────────────────
  const updateSource = (i: number, field: keyof SupplySource, val: string) => {
    if (!parsed) return
    const updated = [...parsed.sources]
    updated[i] = {
      ...updated[i],
      [field]: field === 'available_volume_bbl' ? (parseFloat(val) || null) : val,
    }
    setParsed({ ...parsed, sources: updated })
  }
  const addSource = () =>
    parsed && setParsed({ ...parsed, sources: [...parsed.sources, { origin: '', available_volume_bbl: null }] })
  const removeSource = (i: number) =>
    parsed && setParsed({ ...parsed, sources: parsed.sources.filter((_, idx) => idx !== i) })

  const inp = 'w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]'

  // ── Render ─────────────────────────────────────────────────────────────────
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
            Describe your requirement in plain language. Any field not explicitly stated is marked{' '}
            <em>Not specified</em> — the parser never guesses or invents values.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        {/* NL Input */}
        <GlassPanel className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B]/70">
            Requirement Statement
          </label>
          <div className="relative">
            <textarea
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={[
                'Example:',
                'I need 2.5M bbl of crude oil delivered to Rotterdam within 18 days.',
                'Supply: 1.2M bbl from Western Australia, 800k bbl from Middle East, 1M bbl from West Africa.',
                'Strait of Hormuz is expected to remain unavailable.',
                'Priority: minimize total landed cost.',
                'No single transport option may carry more than 40% of required volume.',
              ].join('\n')}
              className="w-full p-4 pb-14 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] placeholder-[#18181B]/30 focus:outline-none focus:ring-2 focus:ring-[#18181B] resize-none font-mono"
            />
            <button
              onClick={handleParse}
              disabled={parsing || !prompt.trim()}
              className="absolute right-3 bottom-4 px-5 py-2 rounded-full bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs disabled:opacity-40"
            >
              {parsing ? 'Parsing...' : 'Parse Requirement →'}
            </button>
          </div>
        </GlassPanel>

        {/* Parsed Spec */}
        {step === 'parsed' && parsed && (
          <GlassPanel className="space-y-7 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#18181B]/10 pb-4">
              <h2 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
                Parsed Specification — Verify Before Proceeding
              </h2>
              <span className="text-xs text-[#18181B]/50 font-medium uppercase tracking-wider">Editable</span>
            </div>

            {/* Ambiguities */}
            {ambiguities.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="text-xs font-bold uppercase text-amber-800 tracking-wider">⚠ Ambiguities — Please Verify</div>
                {ambiguities.map((a, i) => (
                  <div key={i} className="text-xs text-amber-800">• {a}</div>
                ))}
              </div>
            )}

            {/* Core fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Product</label>
                <select
                  value={parsed.product_type || ''}
                  onChange={(e) => setParsed({ ...parsed, product_type: e.target.value || null })}
                  className={inp}
                >
                  <option value="">— Not specified —</option>
                  <option value="crude">CRUDE OIL</option>
                  <option value="diesel">DIESEL</option>
                  <option value="gasoline">GASOLINE</option>
                  <option value="lng">LNG</option>
                  <option value="refined">REFINED PRODUCTS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Required Volume (bbl)</label>
                <input
                  type="number"
                  value={parsed.volume_bbls ?? ''}
                  placeholder="Not specified"
                  onChange={(e) => setParsed({ ...parsed, volume_bbls: e.target.value ? parseFloat(e.target.value) : null })}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Destination</label>
                <input
                  type="text"
                  value={parsed.destination_port ?? ''}
                  placeholder="Not specified"
                  onChange={(e) => setParsed({ ...parsed, destination_port: e.target.value || null })}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Deadline (Days)</label>
                <input
                  type="number"
                  value={parsed.deadline_days ?? ''}
                  placeholder="Not specified"
                  onChange={(e) => setParsed({ ...parsed, deadline_days: e.target.value ? parseInt(e.target.value) : null })}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">Optimization Priority</label>
                <select
                  value={parsed.optimization_priority ?? ''}
                  onChange={(e) => setParsed({ ...parsed, optimization_priority: e.target.value || null })}
                  className={inp}
                >
                  <option value="">— Not specified —</option>
                  <option value="MINIMIZE_TOTAL_LANDED_COST">MINIMIZE TOTAL LANDED COST</option>
                  <option value="MINIMIZE_TRANSIT_TIME">MINIMIZE TRANSIT TIME</option>
                  <option value="MINIMIZE_RISK">MINIMIZE RISK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18181B]/70 mb-1">
                  Target Landed Cost ($/bbl){' '}
                  <span className="text-[10px] font-normal text-[#18181B]/40">only if user stated</span>
                </label>
                {parsed.target_landed_cost_usd_bbl === null ? (
                  <div className="flex items-center gap-3">
                    <div className={`${inp} flex-1 text-[#18181B]/40 italic`}>Not specified</div>
                    <button
                      type="button"
                      onClick={() => setParsed({ ...parsed, target_landed_cost_usd_bbl: 0 })}
                      className="px-3 py-2 rounded-xl border border-[#18181B]/20 text-xs hover:bg-[#18181B]/5 font-medium"
                    >
                      + Add
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={parsed.target_landed_cost_usd_bbl}
                      onChange={(e) => setParsed({ ...parsed, target_landed_cost_usd_bbl: parseFloat(e.target.value) || null })}
                      className={`${inp} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setParsed({ ...parsed, target_landed_cost_usd_bbl: null })}
                      className="px-3 py-2 rounded-xl border border-red-200 text-xs text-red-600 hover:bg-red-50"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Supply Sources */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/70">
                  Supply Sources
                </label>
                <button
                  type="button"
                  onClick={addSource}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#18181B]/20 hover:bg-[#18181B]/5 font-medium"
                >
                  + Add Origin
                </button>
              </div>

              {parsed.sources.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-dashed border-[#18181B]/20 text-xs text-[#18181B]/40 italic text-center">
                  No supply sources specified
                </div>
              ) : (
                parsed.sources.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#18181B] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <input
                      type="text"
                      value={s.origin}
                      placeholder="Origin region (e.g. West Africa)"
                      onChange={(e) => updateSource(i, 'origin', e.target.value)}
                      className="flex-1 p-3 rounded-xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                    />
                    <input
                      type="number"
                      value={s.available_volume_bbl ?? ''}
                      placeholder="Volume (bbl)"
                      onChange={(e) => updateSource(i, 'available_volume_bbl', e.target.value)}
                      className="w-36 p-3 rounded-xl bg-[#FAFAF8] border border-[#18181B]/15 text-sm text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                    />
                    <button type="button" onClick={() => removeSource(i)} className="text-red-400 hover:text-red-600 text-xl px-1">
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Disruption Conditions */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/70">
                Disruption Conditions
              </label>
              {parsed.disruption_conditions.length === 0 ? (
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-dashed border-[#18181B]/20 text-xs text-[#18181B]/40 italic">
                  None identified
                </div>
              ) : (
                parsed.disruption_conditions.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                    <span className="font-bold">⚠</span>
                    <span className="flex-1">{d}</span>
                    <button
                      type="button"
                      onClick={() => setParsed({ ...parsed, disruption_conditions: parsed.disruption_conditions.filter((_, idx) => idx !== i) })}
                      className="text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]/70">
                Constraints
              </label>
              {parsed.constraints.length === 0 ? (
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-dashed border-[#18181B]/20 text-xs text-[#18181B]/40 italic">
                  None identified
                </div>
              ) : (
                parsed.constraints.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                    <span>🔒</span>
                    <span className="flex-1">{c}</span>
                    <button
                      type="button"
                      onClick={() => setParsed({ ...parsed, constraints: parsed.constraints.filter((_, idx) => idx !== i) })}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Final structured summary (dark monospace) */}
            <div className="p-5 rounded-2xl bg-[#18181B] text-white space-y-1 text-[11px] font-mono leading-5">
              <div className="text-white/40 uppercase text-[9px] tracking-widest mb-3">
                Structured Specification — Final Check Before Proceeding
              </div>
              <div>
                <span className="text-white/50">Product:             </span>
                {parsed.product_type?.toUpperCase() || '— NOT SPECIFIED'}
              </div>
              <div>
                <span className="text-white/50">Required Volume:     </span>
                {parsed.volume_bbls ? `${parsed.volume_bbls.toLocaleString()} bbl` : '— NOT SPECIFIED'}
              </div>
              <div>
                <span className="text-white/50">Destination:         </span>
                {parsed.destination_port || '— NOT SPECIFIED'}
              </div>
              <div>
                <span className="text-white/50">Deadline:            </span>
                {parsed.deadline_days ? `${parsed.deadline_days} days` : '— NOT SPECIFIED'}
              </div>
              <div>
                <span className="text-white/50">Priority:            </span>
                {parsed.optimization_priority || '— NOT SPECIFIED'}
              </div>
              <div>
                <span className="text-white/50">Target Landed Cost:  </span>
                <span className={parsed.target_landed_cost_usd_bbl !== null ? 'text-white' : 'text-white/40'}>
                  {parsed.target_landed_cost_usd_bbl !== null
                    ? `$${parsed.target_landed_cost_usd_bbl}/bbl`
                    : 'NOT SPECIFIED'}
                </span>
              </div>
              {parsed.sources.length > 0 && (
                <>
                  <div className="pt-1 text-white/50">Supply Sources:</div>
                  {parsed.sources.map((s, i) => (
                    <div key={i} className="pl-4 text-emerald-300">
                      {s.origin}:{' '}
                      {s.available_volume_bbl ? `${s.available_volume_bbl.toLocaleString()} bbl` : 'volume not specified'}
                    </div>
                  ))}
                </>
              )}
              {parsed.disruption_conditions.length > 0 && (
                <>
                  <div className="pt-1 text-white/50">Disruption:</div>
                  {parsed.disruption_conditions.map((d, i) => (
                    <div key={i} className="pl-4 text-red-300">{d}</div>
                  ))}
                </>
              )}
              {parsed.constraints.length > 0 && (
                <>
                  <div className="pt-1 text-white/50">Constraints:</div>
                  {parsed.constraints.map((c, i) => (
                    <div key={i} className="pl-4 text-sky-300">{c}</div>
                  ))}
                </>
              )}
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-[#18181B]/10 flex items-center justify-between">
              <span className="text-xs text-[#18181B]/60">
                PROVENANCE: PARSED SPECIFICATION — HUMAN VERIFIED
              </span>
              <button
                onClick={handleSaveAndProceed}
                disabled={saving || !parsed.product_type || !parsed.volume_bbls || !parsed.destination_port}
                className="rounded-full bg-[#18181B] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all shadow-md disabled:opacity-40"
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">
          Loading Specification Setup...
        </div>
      }
    >
      <IntakeContent />
    </Suspense>
  )
}
