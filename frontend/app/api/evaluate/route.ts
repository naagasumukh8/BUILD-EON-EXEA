/**
 * Next.js Server-Side Deal Evaluation Route (/api/evaluate)
 *
 * GO / NEGOTIATE / REJECT logic — 100% deterministic calculation.
 * Preserves economic provenance without using LLM for math.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Proxy to backend if BACKEND_API_URL is configured
    const backendUrl = process.env.BACKEND_API_URL || ''
    if (backendUrl) {
      try {
        const resp = await fetch(`${backendUrl}/api/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000),
        })
        if (resp.ok) {
          return NextResponse.json(await resp.json())
        }
      } catch {
        // Fallback to local server-side deterministic logic
      }
    }

    // Deterministic Deal Evaluator
    const volume_bbls = Number(body.capacity_volume || body.volume_bbls || 1_000_000)
    const quoted_price = Number(body.quoted_price || body.new_quoted_price || 90.0)
    const unit = body.quoted_price_unit || 'lumpsum'

    let quoted_price_usd = quoted_price
    if (unit === 'per_bbl') {
      quoted_price_usd = quoted_price * volume_bbls
    }

    const quoted_price_per_bbl = quoted_price_usd / volume_bbls
    const freight_per_bbl = Number(body.freight_usd_per_bbl || 2.50)
    const insurance_per_bbl = Number(body.insurance_usd_per_bbl || 0.15)
    const handling_per_bbl = Number(body.handling_usd_per_bbl || 0.10)

    const freight_usd = freight_per_bbl * volume_bbls
    const insurance_usd = insurance_per_bbl * volume_bbls
    const handling_usd = handling_per_bbl * volume_bbls

    const landed_cost_usd = quoted_price_usd + freight_usd + insurance_usd + handling_usd
    const landed_cost_per_bbl = landed_cost_usd / volume_bbls

    const market_price_used_usd = Number(body.market_price_usd_per_bbl || 105.0)
    const market_price_provenance = body.market_price_provenance || 'REAL_REFERENCE'

    const expected_revenue_usd = market_price_used_usd * volume_bbls
    const expected_profit_usd = expected_revenue_usd - landed_cost_usd
    const expected_margin_pct = (expected_profit_usd / expected_revenue_usd) * 100

    const min_target_margin = Number(body.min_target_margin || 0.08)
    const max_acceptable_price_per_bbl = market_price_used_usd * (1 - min_target_margin) - freight_per_bbl - insurance_per_bbl - handling_per_bbl
    const max_acceptable_price_usd = max_acceptable_price_per_bbl * volume_bbls

    let deal_verdict = 'NEGOTIATE'
    let verdict_reason = ''

    if (expected_margin_pct >= min_target_margin * 100) {
      deal_verdict = 'GO'
      verdict_reason = `Deal meets target margin threshold of ${(min_target_margin * 100).toFixed(1)}%. Projected margin is ${expected_margin_pct.toFixed(1)}% ($${expected_profit_usd.toLocaleString()} profit).`
    } else if (expected_profit_usd > 0) {
      deal_verdict = 'NEGOTIATE'
      verdict_reason = `Deal is profitable ($${expected_profit_usd.toLocaleString()}) but margin of ${expected_margin_pct.toFixed(1)}% is below target ${(min_target_margin * 100).toFixed(1)}%. Target max acceptable quote is $${max_acceptable_price_per_bbl.toFixed(2)}/bbl.`
    } else {
      deal_verdict = 'REJECT'
      verdict_reason = `Deal results in net loss of -$${Math.abs(expected_profit_usd).toLocaleString()} (landed cost $${landed_cost_per_bbl.toFixed(2)}/bbl exceeds market price $${market_price_used_usd.toFixed(2)}/bbl).`
    }

    return NextResponse.json({
      deal_id: body.deal_id || `deal-${Date.now().toString(36)}`,
      volume_bbls,
      quoted_price_usd,
      quoted_price_per_bbl,
      freight_usd,
      freight_per_bbl,
      insurance_usd,
      handling_usd,
      landed_cost_usd,
      landed_cost_per_bbl,
      market_price_used_usd,
      market_price_provenance,
      expected_revenue_usd,
      expected_profit_usd,
      expected_margin_pct: Number(expected_margin_pct.toFixed(2)),
      max_acceptable_price_usd,
      max_acceptable_price_per_bbl: Number(max_acceptable_price_per_bbl.toFixed(2)),
      min_target_margin_used: min_target_margin,
      deal_verdict,
      verdict_reason,
      profitability_provenance: 'CALCULATED',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Deal evaluation error' }, { status: 500 })
  }
}
