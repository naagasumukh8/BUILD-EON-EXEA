'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

// Dynamically import Leaflet Map components to avoid SSR window errors
const MapContainer = dynamicImport(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamicImport(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
)
const Marker = dynamicImport(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
)
const Popup = dynamicImport(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
)
const Polyline = dynamicImport(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
)

// Infrastructure Coordinates
const PORTS: Record<string, { lat: number; lon: number; name: string; type: string }> = {
  ras_tanura: { lat: 26.64, lon: 50.16, name: 'Ras Tanura Terminal (Persian Gulf)', type: 'export' },
  yanbu: { lat: 24.09, lon: 38.06, name: 'Yanbu Terminal (Red Sea Bypass)', type: 'pipeline' },
  fujairah: { lat: 25.13, lon: 56.33, name: 'Fujairah Anchorage (Oman Gulf)', type: 'anchorage' },
  djibouti: { lat: 11.588, lon: 43.145, name: 'Djibouti Chokepoint Station', type: 'waypoint' },
  mumbai: { lat: 18.96, lon: 72.82, name: 'Mumbai Port (India)', type: 'import' },
  tokyo: { lat: 35.44, lon: 139.64, name: 'Tokyo Bay Terminal (Japan)', type: 'import' },
  rotterdam: { lat: 51.92, lon: 4.48, name: 'Rotterdam Energy Hub (Netherlands)', type: 'import' },
  hormuz: { lat: 26.56, lon: 56.25, name: 'Strait of Hormuz Chokepoint', type: 'chokepoint' }
}

// Pipelines Data
const PIPELINES = [
  {
    id: 'pipe-ipsa',
    name: 'Saudi IPSA / East-West Pipeline Bypass',
    capacity: '2,500,000 bbl/day',
    status: 'ACTIVE BREECH BYPASS',
    coords: [
      [26.64, 50.16], // Ras Tanura
      [25.00, 45.00], // Riyadh Bypass
      [24.09, 38.06], // Yanbu Red Sea
    ] as [number, number][]
  }
]

// Alternate Sea Lanes Data
const SEA_LANES = [
  {
    id: 'lane-red-sea',
    name: 'Red Sea & Bab-el-Mandeb Route to Asia',
    status: 'OPTIMAL ACTIVE ROUTE',
    coords: [
      [24.09, 38.06],  // Yanbu Red Sea
      [11.588, 43.145], // Djibouti / Bab-el-Mandeb
      [12.00, 60.00],   // Arabian Sea Transit
      [18.96, 72.82]    // Mumbai, India
    ] as [number, number][]
  },
  {
    id: 'lane-cape',
    name: 'Cape of Good Hope Bypass Route',
    status: 'LONG-HAUL FALLBACK',
    coords: [
      [24.09, 38.06],
      [11.588, 43.145],
      [-34.83, 20.00], // Cape of Good Hope
      [51.92, 4.48]    // Rotterdam
    ] as [number, number][]
  }
]

function MapContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [scenario, setScenario] = useState<any>(null)
  const [vessels, setVessels] = useState<any[]>([])
  const [selectedVessel, setSelectedVessel] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [L, setL] = useState<any>(null)

  // Map Layer Toggle Filters
  const [showPipelines, setShowPipelines] = useState(true)
  const [showVessels, setShowVessels] = useState(true)
  const [showSeaLanes, setShowSeaLanes] = useState(true)
  const [showChokepoints, setShowChokepoints] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leafletModule) => {
        setL(leafletModule.default || leafletModule)
      })
    }
  }, [])

  const loadNetworkData = useCallback(async () => {
    try {
      const scen = await api.getScenario(scenarioId).catch(() => ({
        destination_port_name: 'India',
        product: 'diesel',
        volume_required: 2000000,
        deadline_days: 7
      }))
      setScenario(scen)

      const list = await api.listVessels(scenarioId).catch(() => [])
      setVessels(list || [])
      if (list && list.length > 0) {
        setSelectedVessel(list[0])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [scenarioId])

  useEffect(() => {
    loadNetworkData()
  }, [loadNetworkData])

  const destLower = (scenario?.destination_port_name || '').toLowerCase()
  let mapCenter: [number, number] = [19.0, 58.0]
  let mapZoom = 4

  if (destLower.includes('japan') || destLower.includes('tokyo')) {
    mapCenter = [28.0, 130.0]
    mapZoom = 4
  } else if (destLower.includes('rotterdam') || destLower.includes('europe') || destLower.includes('netherlands')) {
    mapCenter = [48.0, 10.0]
    mapZoom = 4
  } else if (destLower.includes('singapore')) {
    mapCenter = [1.35, 103.8]
    mapZoom = 6
  }

  // Create custom DivIcon for Leaflet markers
  const createCustomIcon = (bgColor: string, label: string) => {
    if (!L) return undefined
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="background-color: ${bgColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">${label}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />

      <div className="flex-1 relative w-full h-[calc(100vh-100px)] overflow-hidden">
        
        {/* Leaflet Map Canvas */}
        <div className="absolute inset-0 z-0 bg-[#e5e5e0]">
          {!loading && typeof window !== 'undefined' && (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* 1. PIPELINE OVERLAYS */}
              {showPipelines && PIPELINES.map((p) => (
                <Polyline
                  key={p.id}
                  positions={p.coords}
                  pathOptions={{ color: '#D97706', weight: 4, dashArray: '8, 8' }}
                >
                  <Popup>
                    <div className="p-2 space-y-1 font-sans">
                      <div className="font-bold text-sm text-[#18181B]">{p.name}</div>
                      <div className="text-xs text-amber-700 font-semibold">{p.status}</div>
                      <div className="text-xs text-[#18181B]/70">Capacity: {p.capacity}</div>
                    </div>
                  </Popup>
                </Polyline>
              ))}

              {/* 2. ALTERNATE SEA LANES */}
              {showSeaLanes && SEA_LANES.map((lane) => (
                <Polyline
                  key={lane.id}
                  positions={lane.coords}
                  pathOptions={{ color: '#18181B', weight: 2.5, dashArray: '6, 6' }}
                >
                  <Popup>
                    <div className="p-2 space-y-1 font-sans">
                      <div className="font-bold text-sm text-[#18181B]">{lane.name}</div>
                      <div className="text-xs text-emerald-700 font-semibold">{lane.status}</div>
                    </div>
                  </Popup>
                </Polyline>
              ))}

              {/* 3. DISRUPTED STRAIT OF HORMUZ CHOKEPOINT MARKER */}
              {showChokepoints && (
                <Marker
                  position={[PORTS.hormuz.lat, PORTS.hormuz.lon]}
                  icon={createCustomIcon('#DC2626', '⚠️')}
                >
                  <Popup>
                    <div className="p-2 space-y-1 text-center font-sans">
                      <div className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase">
                        STABILITY RISK 94% BLOCKED
                      </div>
                      <div className="font-bold text-sm text-[#18181B] mt-1">{PORTS.hormuz.name}</div>
                      <div className="text-xs text-red-700 font-medium">
                        Disrupted — Energy movement rerouted via Yanbu Pipeline & Red Sea
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* 4. PORTS & TERMINALS */}
              {Object.entries(PORTS).map(([key, port]) => {
                if (key === 'hormuz') return null
                return (
                  <Marker
                    key={key}
                    position={[port.lat, port.lon]}
                    icon={createCustomIcon('#475569', '⚓')}
                  >
                    <Popup>
                      <div className="p-2 font-sans space-y-1">
                        <div className="font-bold text-xs uppercase tracking-wider text-[#18181B]/50">{port.type} Terminal</div>
                        <div className="font-bold text-sm text-[#18181B]">{port.name}</div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* 5. MOVING VESSELS & JOURNEY TRACES */}
              {showVessels && vessels.map((v) => {
                const originCoords: [number, number] = v.origin_coords || [13.50, 58.20]
                const currentPos: [number, number] = [v.lat || 13.50, v.lon || 58.20]
                const destCoords: [number, number] = v.dest_coords || [35.44, 139.64]
                const deliveryCoords: [number, number] = [18.96, 72.82] // Mumbai India

                return (
                  <div key={v.id}>
                    {/* Vessel Active Journey Route: Origin -> Current Pos -> Current Dest */}
                    {v.origin_coords && (
                      <Polyline
                        positions={[originCoords, currentPos, destCoords]}
                        pathOptions={{ color: '#2563EB', weight: 3, opacity: 0.7 }}
                      />
                    )}

                    {/* Potential Opportunity Diversion Line to Delivery Point */}
                    {v.potential_delivery && (
                      <Polyline
                        positions={[currentPos, deliveryCoords]}
                        pathOptions={{ color: '#059669', weight: 2.5, dashArray: '4, 4' }}
                      />
                    )}

                    <Marker
                      position={currentPos}
                      icon={createCustomIcon('#2563EB', '🚢')}
                      eventHandlers={{
                        click: () => setSelectedVessel(v),
                      }}
                    >
                      <Popup>
                        <div className="p-3 space-y-2 font-sans max-w-xs">
                          <div className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] uppercase">
                            MOVING VESSEL OPPORTUNITY
                          </div>

                          <div>
                            <div className="font-bold text-base text-[#18181B]">{v.vessel_name}</div>
                            <div className="text-xs text-[#18181B]/70 font-medium">
                              Journey: {v.origin_port || 'Australia'} &rarr; {v.current_destination || 'Japan'}
                            </div>
                          </div>

                          <div className="text-xs bg-[#FAFAF8] p-2 rounded-lg border border-[#18181B]/10 space-y-1">
                            <div><span className="font-semibold text-[#18181B]/60">Potential Delivery:</span> <strong className="text-emerald-700">{v.potential_delivery || 'India'}</strong></div>
                            <div><span className="font-semibold text-[#18181B]/60">Transit ETA:</span> {v.eta_days} Days</div>
                            <div><span className="font-semibold text-[#18181B]/60">Transport Source:</span> {v.transport_provider}</div>
                            <div><span className="font-semibold text-[#18181B]/60">Data Source:</span> {v.data_source}</div>
                            <div><span className="font-semibold text-[#18181B]/60">Commercial Status:</span> <span className="font-bold text-amber-700">{v.commercial_verification_status || 'CANDIDATE — UNVERIFIED'}</span></div>
                          </div>

                          <button
                            onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${v.id}&vessel_name=${encodeURIComponent(v.vessel_name)}&journey=${encodeURIComponent(`${v.origin_port || 'Australia'} → ${v.current_destination || 'Japan'} via ${v.potential_delivery || 'India'}`)}`)}
                            className="w-full py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-black transition-all"
                          >
                            Verify Commercial Opportunity &rarr;
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                )
              })}
            </MapContainer>
          )}
        </div>

        {/* Floating Map Layer Selector */}
        <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-[#18181B]/10 shadow-md text-xs">
          <button
            onClick={() => setShowPipelines(!showPipelines)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              showPipelines ? 'bg-amber-500 text-white shadow-2xs' : 'bg-[#FAFAF8] text-[#18181B]/60'
            }`}
          >
            {showPipelines ? '✓ Pipelines' : '+ Pipelines'}
          </button>

          <button
            onClick={() => setShowSeaLanes(!showSeaLanes)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              showSeaLanes ? 'bg-[#18181B] text-white shadow-2xs' : 'bg-[#FAFAF8] text-[#18181B]/60'
            }`}
          >
            {showSeaLanes ? '✓ Alternate Lanes' : '+ Alternate Lanes'}
          </button>

          <button
            onClick={() => setShowVessels(!showVessels)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              showVessels ? 'bg-blue-600 text-white shadow-2xs' : 'bg-[#FAFAF8] text-[#18181B]/60'
            }`}
          >
            {showVessels ? '✓ Ships & Vessels' : '+ Ships & Vessels'}
          </button>

          <button
            onClick={() => setShowChokepoints(!showChokepoints)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              showChokepoints ? 'bg-red-600 text-white shadow-2xs' : 'bg-[#FAFAF8] text-[#18181B]/60'
            }`}
          >
            {showChokepoints ? '⚠️ Chokepoints' : '+ Chokepoints'}
          </button>
        </div>

        {/* Floating UI Overlays */}
        <div className="absolute inset-0 z-10 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
          
          {/* Top Left Floating Supply Requirement Card */}
          <div className="pointer-events-auto max-w-sm">
            <GlassPanel className="p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#18181B]/50">
                  STRAIT OF HORMUZ DISRUPTION
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase border border-red-200">
                  DISRUPTED
                </span>
              </div>

              <div>
                <h3 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">Transport Opportunities</h3>
                <p className="text-xs text-[#18181B]/70 font-light mt-0.5">
                  Moving vessels, Yanbu IPSA pipelines & sea lanes for {scenario?.destination_port_name || 'India'}.
                </p>
              </div>

              {/* Requirement Summary */}
              <div className="pt-2 border-t border-[#18181B]/10 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Commodity</div>
                  <div className="font-bold text-[#18181B] uppercase">{scenario?.product || 'DIESEL'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Required Volume</div>
                  <div className="font-bold text-[#18181B]">{Number(scenario?.volume_required || 2000000).toLocaleString()} bbl</div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Bottom Floating Option Detail Panel */}
          {selectedVessel && (
            <div className="pointer-events-auto max-w-2xl w-full mx-auto">
              <GlassPanel className="p-6 space-y-4 shadow-xl border border-[#18181B]/15 animate-slide-up">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 block mb-1">
                      VESSEL OPPORTUNITY &middot; {selectedVessel.commercial_verification_status || 'CANDIDATE — UNVERIFIED'}
                    </span>
                    <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B]">
                      {selectedVessel.vessel_name}
                    </h3>
                    <p className="text-xs text-[#18181B]/70 font-light mt-1">
                      {selectedVessel.relevance_reason || `Travelling ${selectedVessel.origin_port || 'Australia'} → ${selectedVessel.current_destination || 'Japan'} passing near ${selectedVessel.potential_delivery || 'India'}.`}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedVessel(null)}
                    className="text-[#18181B]/40 hover:text-[#18181B] text-xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white border border-[#18181B]/10">
                    <div className="text-[10px] text-[#18181B]/50 uppercase">Active Journey</div>
                    <div className="font-bold text-xs text-[#18181B]">{selectedVessel.origin_port || 'Australia'} &rarr; {selectedVessel.current_destination || 'Japan'}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-[10px] text-[#18181B]/50 uppercase">Delivery ETA</div>
                    <div className="font-bold text-sm text-[#18181B]">{selectedVessel.eta_days} Days</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-[10px] text-[#18181B]/50 uppercase">Transport Provider</div>
                    <div className="font-bold text-xs text-[#18181B]">{selectedVessel.transport_provider || 'Stena Bulk'}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-[10px] text-[#18181B]/50 uppercase">Data Source</div>
                    <div className="font-bold text-xs text-[#18181B]">{selectedVessel.data_source || 'AIS Stream'}</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${selectedVessel.id}&vessel_name=${encodeURIComponent(selectedVessel.vessel_name)}&journey=${encodeURIComponent(`${selectedVessel.origin_port || 'Australia'} → ${selectedVessel.current_destination || 'Japan'} via ${selectedVessel.potential_delivery || 'India'}`)}`)}
                    className="rounded-full bg-[#18181B] px-8 py-3.5 text-xs font-semibold text-white hover:bg-black transition-all shadow-md"
                  >
                    Verify Commercial Opportunity & Enter Quote &rarr;
                  </button>
                </div>
              </GlassPanel>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Interactive Disruption Network Map...</div>}>
      <MapContent />
    </Suspense>
  )
}
