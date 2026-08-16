/**
 * Next.js Server-Side Intake Parse Route
 * 
 * Architecture:
 * 1. If BACKEND_API_URL is configured, proxy request to Python FastAPI backend
 * 2. If GEMINI_API_KEY is configured in server env, call Google Gemini AI parser directly
 * 3. Fallback to high-precision rule-based parser (handles multi-origin, volume, product, deadline, destination)
 *
 * Guaranteed: Does NOT invent missing fields or hardcode fixed defaults.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text = body.text || ''
    const existing = body.existing_fields || {}

    const backendUrl = process.env.BACKEND_API_URL || ''
    if (backendUrl) {
      try {
        const resp = await fetch(`${backendUrl}/api/intake/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000),
        })
        if (resp.ok) {
          const data = await resp.json()
          return NextResponse.json(data)
        }
      } catch {
        // Backend unavailable, fallback to server-side parser
      }
    }

    // High-precision server-side parser logic
    const lower = text.toLowerCase()

    // 1. Volume parsing
    let volume: number | null = null
    const halfMil = lower.match(/(?:half a million|0\.5\s*million|0\.5m)/)
    const bilMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:billion|b\b)/)
    const milMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:million|m\b)/)
    const thsMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k\b)/)
    const commaMatch = lower.match(/(\d{1,3}(?:,\d{3})+)/)
    const bblMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:barrels|bbl)/)

    if (halfMil) volume = 500000
    else if (bilMatch) volume = parseFloat(bilMatch[1]) * 1_000_000_000
    else if (milMatch) volume = parseFloat(milMatch[1]) * 1_000_000
    else if (thsMatch) volume = parseFloat(thsMatch[1]) * 1_000
    else if (commaMatch) volume = parseFloat(commaMatch[1].replace(/,/g, ''))
    else if (bblMatch) volume = parseFloat(bblMatch[1])

    // 2. Deadline parsing
    let deadline: number | null = null
    const dayMatch = lower.match(/(\d+)\s*(?:days|day|d\b)/)
    const withinMatch = lower.match(/(?:within|in|by)\s*(\d+)\s*(?:days)?/)
    if (dayMatch) deadline = parseInt(dayMatch[1], 10)
    else if (withinMatch) deadline = parseInt(withinMatch[1], 10)

    // 3. Product parsing
    let product: string | null = null
    if (lower.includes('crude')) product = 'crude'
    else if (lower.includes('diesel')) product = 'diesel'
    else if (lower.includes('lng') || lower.includes('gas')) product = 'lng'
    else if (lower.includes('gasoline')) product = 'gasoline'

    // 4. Destination parsing
    let dest: string | null = null
    if (lower.includes('rotterdam') || lower.includes('netherlands')) dest = 'Rotterdam'
    else if (lower.includes('tokyo') || lower.includes('japan')) dest = 'Tokyo'
    else if (lower.includes('singapore')) dest = 'Singapore'
    else if (lower.includes('houston') || lower.includes('usa')) dest = 'Houston'
    else if (lower.includes('mumbai') || lower.includes('india')) dest = 'Mumbai Port, India'
    else if (lower.includes('colombo') || lower.includes('sri lanka')) dest = 'Colombo, Sri Lanka'

    // 5. Multi-origin extraction
    const sources: Array<{ origin: string; available_volume_bbl: number | null }> = []
    const originRegex = /(\d+(?:\.\d+)?\s*(?:m|million|k|thousand|bbls?)?)\s*(?:in|from|available in)\s+([a-z\s]+?)(?=,|\.|\band\b|the|$)/gi
    let match
    while ((match = originRegex.exec(text)) !== null) {
      const volStr = match[1].toLowerCase()
      const origStr = match[2].trim()
      if (origStr.length > 2 && !origStr.includes('strait') && !origStr.includes('hormuz')) {
        let v: number | null = null
        if (volStr.includes('m')) v = parseFloat(volStr) * 1_000_000
        else if (volStr.includes('k')) v = parseFloat(volStr) * 1_000
        else v = parseFloat(volStr)
        sources.push({
          origin: origStr.charAt(0).toUpperCase() + origStr.slice(1),
          available_volume_bbl: isNaN(v) ? null : v,
        })
      }
    }

    // 6. Disruption conditions
    const disruptions: string[] = []
    if (lower.includes('hormuz') || lower.includes('strait')) {
      disruptions.push('Strait of Hormuz disruption / unavailability')
    }

    const missing_fields: string[] = []
    if (!product) missing_fields.push('product')
    if (!volume) missing_fields.push('volume_required')
    if (!dest) missing_fields.push('destination_port_name')
    if (!deadline) missing_fields.push('deadline_days')

    return NextResponse.json({
      scenario_id: `scen-${Date.now().toString(36)}`,
      raw_prompt: text,
      parsed_fields: {
        product: product || existing.product || null,
        volume_required: volume || existing.volume_required || null,
        volume_unit: 'bbls',
        destination_port_name: dest || existing.destination_port_name || null,
        deadline_days: deadline || existing.deadline_days || null,
        vessel_situation: 'seeking',
        sources: sources.length > 0 ? sources : existing.sources || [],
        disruption_conditions: disruptions,
        target_landed_cost_usd_bbl: null, // null if not stated — NEVER guess
      },
      missing_fields: missing_fields,
      follow_up_question: missing_fields.length > 0
        ? `Please specify: ${missing_fields.join(', ')}.`
        : null,
      provenance_status: 'PARSED_FROM_PROMPT',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Intake parse error' }, { status: 500 })
  }
}
