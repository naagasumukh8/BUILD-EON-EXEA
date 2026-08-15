'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

function ReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || ''
  const runId = searchParams.get('run_id') || ''

  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.generateReport(scenarioId, runId)
      setReport(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar scenarioId={scenarioId} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Editorial Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">
                Executive Decision Briefing
              </span>
              <GlassBadge status="CONFIRMED" label="Provenanced Document" />
            </div>
            <h1 className="title-ogg text-4xl sm:text-5xl text-[#fdf1e1]">
              Your recommended supply strategy.
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-ghost-glass" onClick={() => router.back()}>
              ← Strategy
            </button>
            {report && (
              <a
                href={api.downloadReport(report.id)}
                download
                className="btn-paper px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
              >
                ⬇️ Download Decision Report (.md)
              </a>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-sm text-[#ef4444]">
            ⚠️ {error}
          </div>
        )}

        {!report && !loading && (
          <GlassPanel className="text-center py-14 space-y-6">
            <div className="text-5xl">📄</div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="title-ogg text-3xl text-[#fdf1e1]">
                Assemble Executive Briefing
              </h2>
              <p className="text-sm text-[#fdf1e1]/70">
                Gemini will synthesize your scenario requirements, confirmed commercial deal terms, and OR-Tools optimization output into an executive decision document.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <GlassBadge status="CONFIRMED" label="Verified Terms" />
              <GlassBadge status="CALCULATED" label="Math Solved" />
              <GlassBadge status="SIMULATED" label="Market Benchmarks" />
            </div>

            <button
              onClick={generate}
              disabled={!runId}
              className="btn-paper text-base px-9 py-4 font-semibold"
            >
              🤖 Generate Executive Report →
            </button>

            {!runId && (
              <div className="text-xs text-[#ef4444]">
                Please run the OR-Tools optimizer first to generate a decision report.
              </div>
            )}
          </GlassPanel>
        )}

        {loading && (
          <GlassPanel className="text-center py-16 space-y-4">
            <div className="text-4xl animate-spin">⚙️</div>
            <div className="text-[#fdf1e1] font-semibold text-xl title-ogg">Synthesizing Decision Briefing...</div>
            <div className="text-xs text-[#fdf1e1]/60">Gemini is formatting executive sections with exact data provenance badges.</div>
          </GlassPanel>
        )}

        {report && (
          <GlassPanel className="p-8 sm:p-12 space-y-8">
            <div className="flex items-center justify-between border-b border-[rgba(253,241,225,0.15)] pb-5">
              <div>
                <span className="text-xs text-[#fdf1e1]/50 uppercase tracking-wider block font-medium">Document ID</span>
                <span className="font-mono text-xs text-[#fdf1e1]">{report.id}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#fdf1e1]/50 uppercase tracking-wider block font-medium">Authoring Engine</span>
                <span className="text-xs text-[#fdf1e1] font-medium">{report.generated_by} · {report.model_used || 'Template'}</span>
              </div>
            </div>

            <div
              className="prose prose-invert max-w-none space-y-5
                prose-headings:title-ogg prose-headings:text-[#fdf1e1]
                prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-[rgba(253,241,225,0.15)] prose-h2:pb-2 prose-h2:mt-8
                prose-p:text-[#fdf1e1]/85 prose-p:text-base prose-p:leading-relaxed
                prose-strong:text-[#fdf1e1] prose-strong:font-semibold
                prose-table:w-full prose-table:text-sm prose-td:py-3 prose-td:px-4 prose-td:border-b prose-td:border-[rgba(253,241,225,0.15)] prose-th:py-2.5 prose-th:px-4 prose-th:text-xs prose-th:uppercase prose-th:text-[#fdf1e1]/60
                prose-code:text-[#fdf1e1] prose-code:bg-[#0a121c] prose-code:px-2 prose-code:py-1 prose-code:rounded-md font-mono"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(report.report_markdown || ''),
              }}
            />

            <div className="pt-6 border-t border-[rgba(253,241,225,0.15)] flex justify-end">
              <a
                href={api.downloadReport(report.id)}
                download
                className="btn-paper text-sm px-7 py-3.5 font-semibold"
              >
                ⬇️ Download Official Decision Report (.md)
              </a>
            </div>
          </GlassPanel>
        )}
      </main>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1110] flex items-center justify-center text-[#fdf1e1]/70">Loading Executive Report...</div>}>
      <ReportContent />
    </Suspense>
  )
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-normal text-[#fdf1e1] mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-normal text-[#fdf1e1] mt-8 mb-4 border-b border-[rgba(253,241,225,0.15)] pb-2">$2</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[#fdf1e1] mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#fdf1e1] font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="text-[#fdf1e1] bg-[#0a121c] px-2 py-1 rounded text-xs">$1</code>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim())
      const isSep = cells.every((c) => /^[-:]+$/.test(c))
      if (isSep) return ''
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
    })
    .replace(/(<tr[\s\S]*<\/tr>)/g, '<table class="w-full my-6"><tbody>$1</tbody></table>')
    .replace(/^(?!<[h|t|u|o])(.+)$/gm, '<p class="text-base text-[#fdf1e1]/85 leading-relaxed mb-4">$1</p>')
    .replace(/---/g, '<hr class="border-[rgba(253,241,225,0.15)] my-8" />')
}
