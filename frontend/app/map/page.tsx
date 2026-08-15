'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, GlassCard } from '@/components/ui/GlassPanel'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { api } from '@/lib/api'

let L: any = null

const PORT_COORDS: Record<string, [number, number]> = {
  'Ras Tanura': [26.64, 50.16],
  'Abu Dhabi': [24.45, 54.38],
  'Fujairah': [25.13, 56.33],
  'Mumbai': [18.95, 72.83],
  'Chennai': [13.08, 80.27],
  'Singapore': [1.29, 103.85],
  'Rotterdam': [51.92, 4.48],
  'Houston': [29.76, -95.37],
  'Shanghai': [31.23, 121.47],
}

function MapContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || ''
  
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  const [vessels, setVessels] = useState<any[]>([])
  const [scenario, setScenario] = useState<any>(null)
  const [selected, setSelected] = useState<any>(null)
  const [discovering, setDiscovering] = useState(false)
  const [sourceLabel, setSourceLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!scenarioId) return
    api.getScenario(scenarioId)
      .then(setScenario)
      .catch(() => {})
  }, [scenarioId])

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return
    import('leaflet').then((leaflet) => {
      L = leaflet.default
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        center: [18, 62],
        zoom: 4,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO © OpenStreetMap',
        maxZoom: 18,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      mapInstanceRef.current = map
    })
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !L || vessels.length === 0) return
    const map = mapInstanceRef.current

    vessels.forEach((v) => {
      if (!v.current_lat || !v.current_lon) return

      const vesselIcon = L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(244,63,94,0.25);
          border: 2px solid #fb7185;
          border-radius: 50%;
          width: 16px; height: 16px;
          box-shadow: 0 0 14px rgba(244,63,94,0.7);
          cursor: pointer;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const marker = L.marker([v.current_lat, v.current_lon], { icon: vesselIcon })
        .addTo(map)
        .on('click', () => setSelected(v))

      marker.bindTooltip(`
        <div style="background:#0f1a26; color:#fdf1e1; padding:6px 10px; border-radius:8px; border:1px solid rgba(30,90,140,0.4);">
          <strong style="font-size:12px;">${v.name}</strong><br/>
          <span style="font-size:10px; color:#fb7185;">CANDIDATE — UNVERIFIED</span>
        </div>
      `, { permanent: false, direction: 'top' })
    })

    Object.entries(PORT_COORDS).forEach(([name, coords]) => {
      const portIcon = L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(42,154,255,0.3);
          border: 2px solid #2a9aff;
          border-radius: 4px;
          width: 12px; height: 12px;
          box-shadow: 0 0 10px rgba(42,154,255,0.5);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })
      L.marker(coords, { icon: portIcon }).addTo(map).bindTooltip(name)
    })
  }, [vessels])

  const handleDiscover = async () => {
    if (!scenarioId) return
    setDiscovering(true)
    setError(null)
    try {
      const res = await api.discoverVessels(scenarioId)
      setVessels(res.candidates || [])
      setSourceLabel(res.source || '')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDiscovering(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#080e14]">
      <Navbar scenarioId={scenarioId} />

      <div className="absolute inset-0 z-0 top-[60px]">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 flex-1 flex flex-col justify-between pointer-events-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-auto">
          <GlassPanel className="p-4 sm:p-5 border-[#1e6faa]/40 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">Active Supply Scenario</span>
              <GlassBadge status="CONFIRMED" label="Active" />
            </div>
            {scenario ? (
              <div className="flex items-center gap-4 flex-wrap text-sm text-[#fdf1e1]">
                <div className="font-semibold text-lg text-[#2a9aff]">
                  {Number(scenario.volume_required).toLocaleString()} {scenario.volume_unit}
                </div>
                <div className="text-xs text-[#8aacca]">
                  Product: <strong className="text-[#fdf1e1] uppercase">{scenario.product}</strong>
                </div>
                <div className="text-xs text-[#8aacca]">
                  Destination: <strong className="text-[#fdf1e1]">{scenario.destination_port_name}</strong>
                </div>
                <div className="text-xs text-[#8aacca]">
                  Deadline: <strong className="text-[#fdf1e1]">{scenario.deadline_days} Days</strong>
                </div>
              </div>
            ) : (
              <span className="text-xs text-[#6b8499]">Loading scenario details...</span>
            )}
          </GlassPanel>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscover}
              disabled={discovering || !scenarioId}
              className="btn-paper text-sm px-6 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.5)] font-semibold"
            >
              {discovering ? '🔍 Scanning AIS Network...' : '🔍 Discover Vessels'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-auto items-end">
          <GlassPanel className="col-span-1 md:col-span-1 p-5 max-h-[380px] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#8aacca] font-semibold">
                AIS Candidates ({vessels.length})
              </span>
              {sourceLabel && <GlassBadge status="SIMULATED" label={sourceLabel} />}
            </div>

            {vessels.length === 0 && (
              <div className="text-center py-8 text-[#6b8499] text-xs">
                Click "Discover Vessels" to scan AIS network positions near your destination.
              </div>
            )}

            <div className="space-y-2">
              {vessels.map((v) => (
                <GlassCard
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`p-3.5 border ${
                    selected?.id === v.id
                      ? 'border-[#2a9aff] bg-[#1e6faa]/25'
                      : 'border-[rgba(30,80,120,0.25)] hover:border-[#1e6faa]/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#fdf1e1]">{v.name}</div>
                      <div className="text-xs text-[#8aacca]">{v.vessel_type || 'Tanker'} · {v.flag || 'Marshall Islands'}</div>
                    </div>
                    <GlassBadge status="CANDIDATE_UNVERIFIED" />
                  </div>
                  {v.speed_knots && (
                    <div className="mt-2 text-xs text-[#6b8499] flex justify-between">
                      <span>Speed: {v.speed_knots} kn</span>
                      <span>ETA: ~{v.eta_days_to_dest || 4} days</span>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </GlassPanel>

          {selected && (
            <GlassPanel className="col-span-1 md:col-span-2 p-6 animate-slide-up border-[#2a9aff]/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="title-ogg text-2xl text-[#fdf1e1]">{selected.name}</h2>
                    <GlassBadge status="CANDIDATE_UNVERIFIED" />
                  </div>
                  <p className="text-xs text-[#8aacca]">
                    {selected.vessel_type} · Flag: {selected.flag || 'N/A'} · DWT: {selected.dwt ? selected.dwt.toLocaleString() : 'N/A'} MT
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[#6b8499] hover:text-[#fdf1e1] text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
                <div className="p-3 rounded-xl bg-[#0a121c]/70 border border-[rgba(30,90,140,0.3)]">
                  <div className="text-[#6b8499]">Destination</div>
                  <div className="font-semibold text-[#fdf1e1] mt-1">{selected.current_destination || 'En route'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0a121c]/70 border border-[rgba(30,90,140,0.3)]">
                  <div className="text-[#6b8499]">Speed</div>
                  <div className="font-semibold text-[#fdf1e1] mt-1">{selected.speed_knots || 13} knots</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0a121c]/70 border border-[rgba(30,90,140,0.3)]">
                  <div className="text-[#6b8499]">Coordinates</div>
                  <div className="font-semibold text-[#fdf1e1] mt-1">{selected.current_lat?.toFixed(2)}, {selected.current_lon?.toFixed(2)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0a121c]/70 border border-[rgba(30,90,140,0.3)]">
                  <div className="text-[#6b8499]">AIS Source</div>
                  <div className="font-semibold text-[#2a9aff] mt-1">{selected.source}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#fbbf24] mb-4 flex items-center justify-between">
                <span>⚠️ AIS tracks vessel movement. Commercial cargo availability must be verified with shipowner.</span>
              </div>

              <button
                onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${selected.id}&vessel_name=${encodeURIComponent(selected.name)}`)}
                className="btn-paper text-sm px-6 py-3 w-full font-semibold"
              >
                ✅ Verify Commercial Opportunity & Enter Quote →
              </button>
            </GlassPanel>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 text-sm text-[#ef4444]">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080e14] flex items-center justify-center text-[#8aacca]">Loading Map...</div>}>
      <MapContent />
    </Suspense>
  )
}
