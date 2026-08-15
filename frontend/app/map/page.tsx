'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

// Leaflet must be loaded client-side only
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

export default function MapPage() {
  const params = useSearchParams()
  const router = useRouter()
  const scenarioId = params.get('scenario_id') || ''
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  const [loading, setLoading] = useState(false)
  const [vessels, setVessels] = useState<any[]>([])
  const [scenario, setScenario] = useState<any>(null)
  const [selected, setSelected] = useState<any>(null)
  const [discovering, setDiscovering] = useState(false)
  const [sourceLabel, setSourceLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Load scenario
  useEffect(() => {
    if (!scenarioId) return
    api.getScenario(scenarioId)
      .then(setScenario)
      .catch(() => {})
  }, [scenarioId])

  // Init Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return
    import('leaflet').then(leaflet => {
      L = leaflet.default
      // Fix Leaflet default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        center: [15, 60],
        zoom: 4,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 18,
      }).addTo(map)

      mapInstanceRef.current = map
    })
  }, [])

  // Add vessel markers
  useEffect(() => {
    if (!mapInstanceRef.current || !L || vessels.length === 0) return
    const map = mapInstanceRef.current

    vessels.forEach(v => {
      if (!v.current_lat || !v.current_lon) return

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(239,68,68,0.2);
          border: 2px solid #ef4444;
          border-radius: 50%;
          width: 14px; height: 14px;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(239,68,68,0.5);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      const marker = L.marker([v.current_lat, v.current_lon], { icon })
        .addTo(map)
        .on('click', () => setSelected(v))

      marker.bindTooltip(`
        <b>${v.name}</b><br/>
        ${v.vessel_type || ''} · ${v.flag || ''}<br/>
        <span style="color:#ef4444;font-size:10px">CANDIDATE — UNVERIFIED</span>
      `, { permanent: false })
    })

    // Add port markers
    Object.entries(PORT_COORDS).forEach(([name, coords]) => {
      const portIcon = L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(42,154,255,0.2);
          border: 2px solid #2a9aff;
          border-radius: 3px;
          width: 10px; height: 10px;
        " title="${name}"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      })
      L.marker(coords, { icon: portIcon }).addTo(map)
        .bindTooltip(name)
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
    <div className="min-h-screen bg-gradient-maritime flex flex-col">
      {/* Topbar */}
      <div className="bg-bg-panel border-b border-border-dim px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-accent-bright">MARITIME</span>
          <span className="text-text-muted text-sm">/ Network Map</span>
        </div>
        <div className="flex items-center gap-3">
          {scenario && (
            <span className="text-sm text-text-secondary">
              {scenario.product?.toUpperCase()} · {Number(scenario.volume_required).toLocaleString()} {scenario.volume_unit} → {scenario.destination_port_name}
            </span>
          )}
          <button className="btn-primary" onClick={handleDiscover} disabled={discovering || !scenarioId}>
            {discovering ? '🔍 Searching AIS...' : '🔍 Discover Vessels'}
          </button>
          <button className="btn-ghost" onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}`)}>
            ✅ Confirm a Deal →
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: 'calc(100vh - 56px)' }} />
          {vessels.length === 0 && !discovering && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="card p-6 text-center max-w-sm pointer-events-auto">
                <div className="text-4xl mb-3">🗺️</div>
                <div className="section-title text-lg mb-2">No Vessels Yet</div>
                <p className="text-sm text-text-secondary mb-4">Click "Discover Vessels" to search AIS for candidates near your destination.</p>
                <button className="btn-primary w-full" onClick={handleDiscover} disabled={!scenarioId}>
                  {discovering ? 'Searching...' : 'Discover Vessels'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="w-80 bg-bg-panel border-l border-border-dim flex flex-col overflow-y-auto">
          {selected ? (
            <VesselDetail vessel={selected} scenarioId={scenarioId} onClose={() => setSelected(null)} router={router} />
          ) : (
            <VesselList vessels={vessels} sourceLabel={sourceLabel} onSelect={setSelected} />
          )}
        </aside>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 card p-4 bg-reject/10 border-reject/40 text-reject text-sm max-w-sm">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-3 text-text-muted">×</button>
        </div>
      )}
    </div>
  )
}

function VesselList({ vessels, sourceLabel, onSelect }: any) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="label">Vessel Candidates ({vessels.length})</div>
        {sourceLabel && (
          <span className={`badge ${sourceLabel.includes('SIMULATED') ? 'badge-simulated' : 'badge-candidate'} text-xs`}>
            {sourceLabel.includes('SIMULATED') ? 'SIMULATED' : 'AIS LIVE'}
          </span>
        )}
      </div>
      {vessels.length === 0 && (
        <p className="text-sm text-text-muted">No candidates discovered yet.</p>
      )}
      {vessels.map((v: any, i: number) => (
        <button key={v.id || i} className="card p-4 text-left hover:border-accent/60 transition-all" onClick={() => onSelect(v)}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-medium text-sm text-text-primary">{v.name}</div>
              <div className="text-xs text-text-muted">{v.vessel_type} · {v.flag}</div>
            </div>
            <span className="badge badge-candidate text-xs whitespace-nowrap">UNVERIFIED</span>
          </div>
          {v.current_destination && (
            <div className="text-xs text-text-secondary">→ {v.current_destination}</div>
          )}
          {v.speed_knots && (
            <div className="text-xs text-text-muted">{v.speed_knots} kn</div>
          )}
        </button>
      ))}
    </div>
  )
}

function VesselDetail({ vessel, scenarioId, onClose, router }: any) {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="label">Vessel Detail</div>
        <button className="text-text-muted hover:text-text-primary text-lg" onClick={onClose}>×</button>
      </div>

      <div className="card p-4">
        <div className="flex items-start justify-between mb-3">
          <h2 className="font-medium text-text-primary">{vessel.name}</h2>
          <span className="badge badge-candidate">CANDIDATE — UNVERIFIED</span>
        </div>
        <div className="space-y-2">
          {[
            ['Type', vessel.vessel_type],
            ['Flag', vessel.flag],
            ['DWT', vessel.dwt ? `${vessel.dwt.toLocaleString()} MT` : 'Unknown'],
            ['Destination', vessel.current_destination || 'Unknown'],
            ['Speed', vessel.speed_knots ? `${vessel.speed_knots} knots` : 'Unknown'],
            ['Position', vessel.current_lat ? `${vessel.current_lat?.toFixed(2)}, ${vessel.current_lon?.toFixed(2)}` : 'Unknown'],
            ['AIS Source', vessel.source],
            ['Timestamp', vessel.ais_timestamp ? new Date(vessel.ais_timestamp).toLocaleString() : 'Unknown'],
          ].map(([k, v]) => v && (
            <div key={k} className="data-row">
              <span className="data-label">{k}</span>
              <span className="data-value text-xs">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-btn text-xs text-amber-300">
        ⚠️ AIS data shows vessel movement only. Available cargo capacity is UNKNOWN. Contact the vessel operator or broker to verify commercial availability before confirming.
      </div>

      <button
        className="btn-primary w-full"
        onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${vessel.id}&vessel_name=${encodeURIComponent(vessel.name)}`)}
      >
        ✅ Verify Commercial Opportunity
      </button>
    </div>
  )
}
