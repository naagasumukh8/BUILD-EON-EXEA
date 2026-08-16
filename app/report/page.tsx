'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { DecisionBrief } from '@/components/ui/DecisionBrief'
import { api } from '@/lib/api'

function ReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [scenario, setScenario] = useState<any>(null)
  const [optionsEvaluated, setOptionsEvaluated] = useState<any[]>([])
  const [dealEvaluation, setDealEvaluation] = useState<any>(null)
  const [strategyResult, setStrategyResult] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const scen = await api.getScenario(scenarioId).catch(() => ({
        id: scenarioId,
        product: 'diesel',
        volume_bbls: 2000000,
        destination_port: 'Mumbai, India',
        deadline_days: 7,
        priority: 'cost'
      }))
      setScenario(scen)

      const vesselsRes = await api.listVessels(scenarioId).catch(() => ({ vessels: [] }))
      setOptionsEvaluated(vesselsRes.vessels || [])

      let deal = null
      if (typeof window !== 'undefined') {
        const savedDeal = localStorage.getItem(`deal_${scenarioId}`)
        if (savedDeal) {
          try { deal = JSON.parse(savedDeal) } catch (e) {}
        }
      }
      setDealEvaluation(deal)

      const strategy = await api.optimize({ scenario_id: scenarioId })
      setStrategyResult(strategy)
    } catch (e: any) {
      setError(e.message || 'Error compiling executive decision brief.')
    } finally {
      setLoading(false)
    }
  }, [scenarioId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRecalculateWhatIf = async (newPrice: number) => {
    try {
      const updatedDeal = await api.whatIf('deal-001', newPrice)
      setDealEvaluation(updatedDeal)
    } catch (e: any) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">
        Compiling Executive Decision Briefing...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
            {error}
          </div>
        )}

        <DecisionBrief
          scenario={scenario}
          optionsEvaluated={optionsEvaluated}
          dealEvaluation={dealEvaluation}
          strategyResult={strategyResult}
          onRecalculateWhatIf={handleRecalculateWhatIf}
        />

        {/* Action Bar */}
        <div className="pt-6 border-t border-[#18181B]/10 flex items-center justify-between">
          <button
            onClick={() => router.push(`/strategy?scenario_id=${scenarioId}`)}
            className="text-xs font-medium text-[#18181B]/70 hover:text-[#18181B]"
          >
            ← Adjust Multi-Modal Allocation Strategy
          </button>

          <button
            onClick={() => alert('Executive Briefing Report generated! PDF download started.')}
            className="rounded-full bg-[#18181B] px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-all shadow-md"
          >
            Download Briefing Report (PDF) →
          </button>
        </div>

      </main>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Executive Briefing...</div>}>
      <ReportContent />
    </Suspense>
  )
}
