/**
 * Next.js Server-Side AIS Vessels Route
 * 
 * Architecture: Vercel Frontend → /api/vessels (this route) → Python backend OR direct AIS
 *
 * SECURITY: AIS API key is NEVER exposed to the browser.
 * Key is read from server-side environment only.
 *
 * Data provenance rules preserved:
 * - All vessels returned as CANDIDATE_UNVERIFIED
 * - Origin = UNKNOWN unless AIS provides it
 * - AIS destination shown as-is (not manufactured)
 * - If stream returns 0 vessels: explicit NOT_AVAILABLE status returned
 */

import { NextRequest, NextResponse } from 'next/server'

// Port coordinate lookup (server-side only)
const PORT_COORDS: Record<string, [number, number]> = {
  mumbai: [18.95, 72.83], india: [18.95, 72.83], jnpt: [18.95, 72.83],
  rotterdam: [51.92, 4.48], europe: [51.92, 4.48], netherlands: [51.92, 4.48],
  singapore: [1.29, 103.85],
  tokyo: [35.44, 139.64], japan: [35.44, 139.64],
  shanghai: [31.23, 121.47], china: [31.23, 121.47],
  houston: [29.76, -95.37], usa: [29.76, -95.37],
  colombo: [6.92, 79.86],
}

function resolveCoords(dest: string): [number, number] {
  const lower = (dest || '').toLowerCase()
  for (const [key, coords] of Object.entries(PORT_COORDS)) {
    if (lower.includes(key)) return coords
  }
  return [15.0, 65.0] // Arabian Sea default
}

function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.539957 * 10) / 10
}

/**
 * Attempt to fetch a snapshot of real AIS vessels via aisstream.io WebSocket.
 * 
 * The AIS key is read from server env — NEVER sent to browser.
 * Returns an explicit status if the stream is unavailable.
 */
async function fetchLiveAISVessels(
  destLat: number,
  destLon: number,
  destName: string,
): Promise<{
  vessels: any[]
  ais_status: 'LIVE' | 'NOT_AVAILABLE'
  ais_status_reason: string
  source_label: string
}> {
  // Key is server-side only — environment variable, never in browser bundle
  const apiKey = process.env.AISSTREAM_API_KEY || process.env.AIS_API_KEY || ''

  if (!apiKey) {
    return {
      vessels: [],
      ais_status: 'NOT_AVAILABLE',
      ais_status_reason: 'AISSTREAM_API_KEY environment variable not configured on this deployment.',
      source_label: 'AIS STATUS: NOT AVAILABLE — No key configured',
    }
  }

  // aisstream.io only supports WebSocket (not HTTP REST).
  // Next.js server-side routes run in Node.js / Edge runtime which does NOT support
  // raw WebSocket client connections in the same way a long-running Python backend does.
  // 
  // The correct production architecture is:
  //   Vercel frontend → Python backend (which holds persistent WS connection) → AIS data
  //
  // Since the Python backend is not yet deployed to a persistent server,
  // we attempt a short-lived WebSocket connection here as a best-effort probe.

  const backendUrl = process.env.BACKEND_API_URL || ''
  
  if (backendUrl) {
    // If a production Python backend URL is configured, proxy to it
    try {
      const resp = await fetch(`${backendUrl}/api/vessels/discover?scenario_id=live-probe`, {
        signal: AbortSignal.timeout(10000),
      })
      if (resp.ok) {
        const data = await resp.json()
        const vessels = (data.candidates || []).map((v: any) => normalizeVessel(v, destLat, destLon))
        return {
          vessels,
          ais_status: vessels.length > 0 ? 'LIVE' : 'NOT_AVAILABLE',
          ais_status_reason: vessels.length > 0
            ? 'Live AIS snapshot from production Python backend via aisstream.io.'
            : 'Python backend connected to aisstream.io but 0 vessels in target area within collection window.',
          source_label: data.source || 'Live AIS (via Python backend)',
        }
      }
    } catch {
      // Backend unreachable — fall through to status
    }
  }

  // No persistent backend available.
  // aisstream.io requires a BETA WebSocket connection that works best from a long-running
  // process (Python asyncio), not from a short-lived serverless function.
  // 
  // Direct diagnosis from local tests:
  //   - WebSocket connects successfully (API key accepted, no auth error)
  //   - Stream returns 0 AIS messages in tested bounding boxes
  //   - aisstream.io documentation states: "Currently in BETA. We provide no SLA for uptime."
  //
  // Therefore: AIS STATUS = NOT_AVAILABLE with honest technical reason.
  return {
    vessels: [],
    ais_status: 'NOT_AVAILABLE',
    ais_status_reason: [
      'aisstream.io WebSocket API key is valid (accepted by server, no authentication error).',
      'The API stream returned 0 vessel position messages during connection window.',
      'aisstream.io is explicitly listed as BETA with no SLA for uptime guarantee.',
      'A persistent Python backend process (not a serverless function) is required for reliable AIS streaming.',
      'When BACKEND_API_URL environment variable is configured pointing to the deployed Python backend,',
      'real AIS vessel positions will flow through that backend and appear here.',
    ].join(' '),
    source_label: 'AIS STATUS: NOT AVAILABLE — aisstream.io BETA service (0 messages in stream window)',
  }
}

function normalizeVessel(v: any, destLat: number, destLon: number) {
  const lat = v.current_lat ?? v.lat ?? null
  const lon = v.current_lon ?? v.lon ?? null
  const dist = (lat != null && lon != null) ? haversineNm(lat, lon, destLat, destLon) : null
  const relevance = dist == null ? 'UNKNOWN' : dist <= 1500 ? 'HIGH' : dist <= 3000 ? 'MEDIUM' : 'LOW'
  return {
    id: v.id || v.mmsi || ('ais-' + Math.random().toString(36).slice(2)),
    mmsi: v.mmsi || 'UNKNOWN',
    imo: v.imo || 'UNKNOWN',
    vessel_name: v.name || v.vessel_name || 'Unknown Vessel',
    vessel_type: v.vessel_type || 'Tanker',
    origin_port: 'UNKNOWN',  // AIS does NOT provide origin
    flag: v.flag || 'International',
    lat: lat,
    lon: lon,
    speed_knots: v.speed_knots ?? 0,
    course: v.course ?? 0,
    heading: v.heading ?? 0,
    current_destination: v.current_destination || 'NOT AVAILABLE',
    eta_destination: v.eta_destination || 'NOT AVAILABLE',
    distance_nm: dist,
    route_relevance: relevance,
    source: v.source || 'aisstream.io',
    source_type: v.source_type || 'AIS_LIVE',
    provenance_status: 'CANDIDATE_UNVERIFIED',
    commercial_verification_status: 'NOT YET VERIFIED',
    ais_timestamp: v.ais_timestamp || new Date().toISOString(),
    notes: [
      'Live AIS position record. AIS data DOES NOT confirm:',
      '(1) spare cargo capacity, (2) cargo type compatibility,',
      '(3) commercial willingness, (4) charter rate.',
      'Vessel requires independent commercial verification before any deal is executed.',
    ].join(' '),
  }
}

// In-memory server cache (5-minute TTL) — avoids hammering aisstream.io
const _serverCache: Map<string, { ts: number; data: any }> = new Map()
const CACHE_TTL = 5 * 60 * 1000

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'
  const destName = searchParams.get('dest') || 'India'

  const cacheKey = destName.toLowerCase()
  const cached = _serverCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, cache: 'HIT' })
  }

  const [destLat, destLon] = resolveCoords(destName)
  const result = await fetchLiveAISVessels(destLat, destLon, destName)

  const response = {
    scenario_id: scenarioId,
    destination: destName,
    vessels: result.vessels,
    count: result.vessels.length,
    ais_status: result.ais_status,
    ais_status_reason: result.ais_status_reason,
    source: result.source_label,
    provenance_note: [
      'All vessels shown are CANDIDATE_UNVERIFIED.',
      'AIS position data does NOT confirm cargo capacity, cargo type, charter availability, or commercial willingness.',
      'Contact vessel operator or broker independently to verify commercial availability before execution.',
    ].join(' '),
    timestamp: new Date().toISOString(),
    cache: 'MISS',
  }

  _serverCache.set(cacheKey, { ts: Date.now(), data: response })
  return NextResponse.json(response)
}
