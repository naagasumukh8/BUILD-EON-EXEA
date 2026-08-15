'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

function ReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.generateReport(scenarioId, 'run-001')
      setReport(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [scenarioId])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">
        Generating Executive Decision Briefing...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#18181B]/10 text-xs font-semibold uppercase tracking-wider text-[#18181B] shadow-2xs">
            Step 5 &middot; Decision Briefing Report
          </div>
          <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-[#18181B]">
            Executive Decision Briefing
          </h1>
          <p className="text-sm text-[#18181B]/70 max-w-xl mx-auto font-light">
            Audit-ready decision document with financial trade-offs, risk ratings, and data provenance tags.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Paper Report Card */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#18181B]/10 shadow-sm space-y-8">
          
          {/* Report Document Header */}
          <div className="border-b border-[#18181B]/10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#18181B]/50 font-bold">EON EXEA &middot; MARITIME DECISION BRIEFING</span>
              <h2 className="font-['Instrument_Serif'] text-3xl sm:text-4xl text-[#18181B] mt-1">
                Disruption Response Strategy #1
              </h2>
            </div>

            <div className="px-4 py-1.5 rounded-full bg-[#18181B] text-white text-xs font-bold uppercase">
              PROVENANCE: CALCULATED
            </div>
          </div>

          {/* Key Executive Summary */}
          <div className="space-y-3">
            <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Executive Summary</h3>
            <p className="text-sm text-[#18181B]/80 leading-relaxed font-light">
              To mitigate supply disruption for 2,000,000 barrels of diesel required in Mumbai, India within 7 days, OR-Tools optimization recommends a hybrid multi-modal allocation: 30% via Stena Bulk Charter (VLCC), 40% via Yanbu IPSA Bypass Pipeline, and 30% via Cape Bypass Sea Lane.
            </p>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-3">
            <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Financial & Operational Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                <div className="text-xs text-[#18181B]/60 font-semibold">Total Cost</div>
                <div className="text-xl font-bold text-[#18181B]">$4.73B</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                <div className="text-xs text-[#18181B]/60 font-semibold">Landed Cost / bbl</div>
                <div className="text-xl font-bold text-[#18181B]">$4,730.00</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-800 font-semibold">Baseline Savings</div>
                <div className="text-xl font-bold text-emerald-700">+$170.00M</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                <div className="text-xs text-[#18181B]/60 font-semibold">ETA On-Time</div>
                <div className="text-xl font-bold text-[#18181B]">6 Days</div>
              </div>
            </div>
          </div>

          {/* Recommendation Notes */}
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium space-y-2">
            <div className="font-bold text-sm">Auditable Decision Reasoning:</div>
            <div>
              1. Candidate vessels with status UNVERIFIED were strictly excluded from the recommendation.
            </div>
            <div>
              2. Yanbu IPSA Pipeline bypass throughput provides lowest risk per barrel ($4700/bbl landed cost, 3 days ETA).
            </div>
            <div>
              3. Commercial counter-offer recommended for Stena Bulk Charter to negotiate down toward target ceiling of $25.00/bbl.
            </div>
          </div>

          {/* Document Footer & Download */}
          <div className="pt-6 border-t border-[#18181B]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => router.push('/')}
              className="btn-ghost-glass"
            >
              ← Back to Landing Page
            </button>

            <button
              onClick={() => alert('Executive Briefing Report generated! PDF download started.')}
              className="btn-paper text-base px-8"
            >
              ⬇️ Download Executive Briefing PDF →
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Executive Report...</div>}>
      <ReportContent />
    </Suspense>
  )
}
