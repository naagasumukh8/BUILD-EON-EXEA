/**
 * Next.js Server-Side Routes Route (/api/routes)
 *
 * Dynamically returns geographic maritime, pipeline, and alternate route polylines
 * based on the target scenario destination.
 */

import { NextRequest, NextResponse } from 'next/server'

const DESTINATION_CONFIGS: Record<string, {
  coords: [number, number]
  name: string
  routes: any[]
}> = {
  rotterdam: {
    coords: [51.92, 4.48],
    name: 'Rotterdam, Netherlands',
    routes: [
      {
        id: 'route-rot-cape',
        name: 'Cape of Good Hope Bypass (Ras Tanura → Rotterdam)',
        type: 'maritime_bypass',
        distance_nm: 11200,
        transit_days: 28,
        risk_score: 0.12,
        path: [[26.64, 50.16], [12.0, 51.0], [-34.8, 20.0], [14.7, -17.5], [36.0, -9.0], [51.92, 4.48]],
        color: '#3b82f6',
        provenance: 'REAL_REFERENCE',
      },
      {
        id: 'route-rot-sumed',
        name: 'SUMED Pipeline + Med Route (Ain Sukhna → Rotterdam)',
        type: 'pipeline_hybrid',
        distance_nm: 3400,
        transit_days: 10,
        risk_score: 0.08,
        path: [[29.9, 32.5], [31.3, 30.0], [36.0, 15.0], [36.0, -5.0], [51.92, 4.48]],
        color: '#10b981',
        provenance: 'REAL_REFERENCE',
      },
      {
        id: 'route-rot-waf',
        name: 'West Africa Direct Route (Bonny Terminal → Rotterdam)',
        type: 'alt_origin',
        distance_nm: 4200,
        transit_days: 12,
        risk_score: 0.10,
        path: [[4.43, 7.16], [14.7, -17.5], [36.0, -9.0], [51.92, 4.48]],
        color: '#f59e0b',
        provenance: 'REAL_REFERENCE',
      },
    ],
  },
  mumbai: {
    coords: [18.95, 72.83],
    name: 'Mumbai Port, India',
    routes: [
      {
        id: 'route-mum-ipsa',
        name: 'IPSA Pipeline Bypass (Ras Tanura → Yanbu → Mumbai)',
        type: 'pipeline_hybrid',
        distance_nm: 2800,
        transit_days: 6,
        risk_score: 0.06,
        path: [[26.64, 50.16], [24.08, 38.05], [12.5, 43.5], [12.0, 51.0], [18.95, 72.83]],
        color: '#10b981',
        provenance: 'REAL_REFERENCE',
      },
      {
        id: 'route-mum-fuj',
        name: 'Fujairah ADCOP Strategic Bypass (Abu Dhabi → Fujairah → Mumbai)',
        type: 'pipeline_hybrid',
        distance_nm: 1100,
        transit_days: 4,
        risk_score: 0.05,
        path: [[24.45, 54.38], [25.13, 56.33], [22.0, 62.0], [18.95, 72.83]],
        color: '#3b82f6',
        provenance: 'REAL_REFERENCE',
      },
    ],
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const destParam = (searchParams.get('dest') || searchParams.get('destination') || 'Rotterdam').toLowerCase()

  let matchedConfig = DESTINATION_CONFIGS['rotterdam']
  for (const [key, cfg] of Object.entries(DESTINATION_CONFIGS)) {
    if (destParam.includes(key)) {
      matchedConfig = cfg
      break
    }
  }

  return NextResponse.json({
    destination: matchedConfig.name,
    coords: matchedConfig.coords,
    routes: matchedConfig.routes,
    count: matchedConfig.routes.length,
    timestamp: new Date().toISOString(),
  })
}
