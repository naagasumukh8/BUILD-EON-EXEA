'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel, SightCard } from '@/components/ui/GlassPanel'
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
    const id = scenarioId || 'scen-demo-001'
    api.getScenario(id)
      .then(setScenario)
      .catch(() => {})
    api.listVessels(id)
      .then(setVessels)
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
          background: rgba(253,241,225,0.25);
          border: 2px solid #fdf1e1;
          border-radius: 50%;
          width: 16px; height: 16px;
          box-shadow: 0 0 16px rgba(253,241,225,0.7);
          cursor: pointer;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const marker = L.marker([v.current_lat, v.current_lon], { icon: vesselIcon })
        .addTo(map)
        .on('click', () => setSelected(v))

      marker.bindTooltip(`
        <div style="background:#0f1a26; color:#fdf1e1; padding:6px 10px; border-radius:8px; border:1px solid rgba(253,241,225,0.3);">
          <strong style="font-size:12px;">${v.name}</strong><br/>
          <span style="font-size:10px; color:#fb7185;">CANDIDATE — UNVERIFIED</span>
        </div>
      `, { permanent: false, direction: 'top' })
    })

    Object.entries(PORT_COORDS).forEach(([name, coords]) => {
      const portIcon = L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(30,111,170,0.4);
          border: 2px solid #2a9aff;
          border-radius: 4px;
          width: 12px; height: 12px;
          box-shadow: 0 0 12px rgba(42,154,255,0.6);
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0b1110]">
      <Navbar scenarioId={scenarioId} />

      {/* Fullscreen Atmospheric Map Canvas */}
      <div className="absolute inset-0 z-0 top-[60px]">
        <div ref={mapRef} className="w-full h-full opacity-85" />
      </div>

      {/* Floating UI Overlay */}
      <div className="relative z-10 p-4 sm:p-6 flex-1 flex flex-col justify-between pointer-events-none">
        
        {/* Top Floating Glass Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-auto">
          {/* Supply Requirement Floating Card */}
          <GlassPanel className="p-4 sm:p-5 border-[rgba(253,241,225,0.2)] shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">Supply Requirement</span>
              <GlassBadge status="CONFIRMED" label="Active" />
            </div>
            {scenario ? (
              <div className="flex items-center gap-5 flex-wrap text-sm text-[#fdf1e1]">
                <div className="font-bold text-xl text-[#fdf1e1] title-ogg">
                  {Number(scenario.volume_required).toLocaleString()} {scenario.volume_unit}
                </div>
                <div className="text-xs text-[#fdf1e1]/70">
                  Product: <strong className="text-[#fdf1e1] uppercase">{scenario.product}</strong>
                </div>
                <div className="text-xs text-[#fdf1e1]/70">
                  Destination: <strong className="text-[#fdf1e1]">{scenario.destination_port_name}</strong>
                </div>
                <div className="text-xs text-[#fdf1e1]/70">
                  Deadline: <strong className="text-[#fdf1e1]">{scenario.deadline_days} Days</strong>
                </div>
              </div>
            ) : (
              <span className="text-xs text-[#fdf1e1]/50">Loading supply requirements...</span>
            )}
          </GlassPanel>

          {/* Discover AIS Action */}
          <button
            onClick={handleDiscover}
            disabled={discovering || !scenarioId}
            className="btn-paper text-sm px-7 py-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.4)] font-semibold"
          >
            {discovering ? '🔍 Scanning AIS Stream...' : '🔍 Discover Vessels'}
          </button>
        </div>

        {/* Bottom Floating Vessel Candidates Carousel / SightCards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pointer-events-auto items-end">
          {/* Candidate Vessel List Panel */}
          <GlassPanel className="col-span-1 md:col-span-1 p-5 max-h-[400px] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium">
                Vessel Opportunities ({vessels.length})
              </span>
              {sourceLabel && <GlassBadge status="SIMULATED" label={sourceLabel} />}
            </div>

            {vessels.length === 0 && (
              <div className="text-center py-8 text-[#fdf1e1]/50 text-xs">
                Click "Discover Vessels" to scan AIS network positions near your destination.
              </div>
            )}

            <div className="space-y-3">
              {vessels.map((v) => (
                <SightCard
                  key={v.id}
                  kicker="Vessel Candidate"
                  title={v.name}
                  subtitle={`${v.vessel_type || 'Tanker'} · ETA ~${v.eta_days_to_dest || 4} days`}
                  badge={<GlassBadge status="CANDIDATE_UNVERIFIED" />}
                  onClick={() => setSelected(v)}
                  className={`border transition-all ${
                    selected?.id === v.id ? 'ring-2 ring-[#fdf1e1] scale-[1.02]' : ''
                  }`}
                />
              ))}
            </div>
          </GlassPanel>

          {/* Selected Vessel Opportunity Detail Floating Panel */}
          {selected && (
            <GlassPanel className="col-span-1 md:col-span-2 p-6 sm:p-8 animate-slide-up border-[rgba(253,241,225,0.3)] shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#fdf1e1]/60 font-medium block mb-1">
                    Vessel Candidate Detail
                  </span>
                  <div className="flex items-center gap-3">
                    <h2 className="title-ogg text-3xl text-[#fdf1e1]">{selected.name}</h2>
                    <GlassBadge status="CANDIDATE_UNVERIFIED" />
                  </div>
                  <p className="text-xs text-[#fdf1e1]/70 mt-1">
                    Route: {selected.current_destination || 'Persian Gulf'} → {scenario?.destination_port_name || 'India'}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[#fdf1e1]/50 hover:text-[#fdf1e1] text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0a121c]/80 border border-[rgba(253,241,225,0.15)]">
                  <div className="text-[#fdf1e1]/50 mb-1">Estimated ETA</div>
                  <div className="font-bold text-base text-[#fdf1e1]">{selected.eta_days_to_dest || 4} Days</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a121c]/80 border border-[rgba(253,241,225,0.15)]">
                  <div className="text-[#fdf1e1]/50 mb-1">Speed</div>
                  <div className="font-bold text-base text-[#fdf1e1]">{selected.speed_knots || 13} Knots</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a121c]/80 border border-[rgba(253,241,225,0.15)]">
                  <div className="text-[#fdf1e1]/50 mb-1">DWT Capacity</div>
                  <div className="font-bold text-base text-[#fdf1e1]">{selected.dwt ? selected.dwt.toLocaleString() : '150,000'} MT</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a121c]/80 border border-[rgba(253,241,225,0.15)]">
                  <div className="text-[#fdf1e1]/50 mb-1">AIS Source</div>
                  <div className="font-bold text-base text-[#fdf1e1]">{selected.source}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-xs text-[#fbbf24] mb-5 flex items-center justify-between">
                <span>⚠️ AIS tracks vessel movement. Commercial cargo capacity must be verified with shipowner or broker.</span>
              </div>

              <button
                onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${selected.id}&vessel_name=${encodeURIComponent(selected.name)}`)}
                className="btn-paper text-sm px-6 py-3.5 w-full font-semibold"
              >
                Verify Commercial Opportunity & Enter Quote →
              </button>
            </GlassPanel>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-2xl bg-[#ef4444]/20 border border-[#ef4444]/40 text-sm text-[#ef4444]">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1110] flex items-center justify-center text-[#fdf1e1]/70">Loading Maritime Map...</div>}>
      <MapContent />
    </Suspense>
  )
}
