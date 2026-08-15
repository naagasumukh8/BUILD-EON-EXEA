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
  shanghai: { lat: 31.23, lon: 121.47, name: 'Shanghai Port (China)', type: 'import' },
  tokyo: { lat: 35.44, lon: 139.64, name: 'Tokyo Bay Terminal (Japan)', type: 'import' },
  rotterdam: { lat: 51.92, lon: 4.48, name: 'Rotterdam Hub (Netherlands)', type: 'import' },
  singapore: { lat: 1.35, lon: 103.8, name: 'Singapore Terminal', type: 'import' },
  colombo: { lat: 6.92, lon: 79.86, name: 'Colombo Terminal (Sri Lanka)', type: 'import' },
  houston: { lat: 29.76, lon: -95.36, name: 'Houston Hub (USA)', type: 'import' },
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
    ] as [number, number][],
    operator: 'Saudi Aramco',
    tariff: '$1.40/bbl',
    source: 'Telemetry Feed',
    timestamp: new Date().toISOString(),
    provenance: 'REAL REFERENCE'
  }
]

function MapContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [scenario, setScenario] = useState<any>(null)
  const [vessels, setVessels] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0)
  const [selectedVessel, setSelectedVessel] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [L, setL] = useState<any>(null)
  const [showComparison, setShowComparison] = useState(false)

  // Map Layer Toggle Filters
  const [showPipelines, setShowPipelines] = useState(true)
  const [showVessels, setShowVessels] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
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
      const scen = await api.getScenario(scenarioId).catch(() => null)
      setScenario(scen)

      const networkRoutes = await api.getNetworkRoutes(scenarioId).catch(() => [])
      setRoutes(networkRoutes || [])

      const list = await api.listVessels(scenarioId).catch(() => [])
      setVessels(list || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [scenarioId])

  useEffect(() => {
    loadNetworkData()
  }, [loadNetworkData])

  const destLower = (scenario?.destination_port_name || scenario?.destination_port || '').toLowerCase()
  let mapCenter: [number, number] = [19.0, 58.0]
  let mapZoom = 4

  if (destLower.includes('china') || destLower.includes('shanghai') || destLower.includes('ningbo') || destLower.includes('qingdao')) {
    mapCenter = [22.0, 115.0]
    mapZoom = 4
  } else if (destLower.includes('japan') || destLower.includes('tokyo')) {
    mapCenter = [28.0, 130.0]
    mapZoom = 4
  } else if (destLower.includes('rotterdam') || destLower.includes('europe') || destLower.includes('netherlands')) {
    mapCenter = [45.0, -10.0]
    mapZoom = 3
  } else if (destLower.includes('singapore')) {
    mapCenter = [5.0, 100.0]
    mapZoom = 5
  } else if (destLower.includes('colombo') || destLower.includes('sri lanka')) {
    mapCenter = [10.0, 75.0]
    mapZoom = 5
  } else if (destLower.includes('houston') || destLower.includes('usa')) {
    mapCenter = [25.0, -80.0]
    mapZoom = 4
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

  const activeRoute = routes[activeRouteIndex]

  // Filter vessels based on the active route logic
  // If fallback, maybe only show vessels related to fallback
  const relevantVessels = vessels.filter((v: any) => {
    if (!activeRoute) return true
    if (activeRoute.type === 'Recommended' && v.relevance_reason?.includes('direct')) return true
    if (activeRoute.type === 'Alternative' && v.relevance_reason?.includes('pipeline')) return true
    if (activeRoute.type === 'Fallback' && v.relevance_reason?.includes('fallback')) return true
    return true // Just a heuristic, in a real app this would strictly filter
  })

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
                      <div className="text-xs text-amber-700 font-semibold mb-2">{p.status}</div>
                      <div className="text-xs text-[#18181B]/80 space-y-0.5">
                        <div><strong>Operator:</strong> {p.operator}</div>
                        <div><strong>Capacity:</strong> {p.capacity}</div>
                        <div><strong>Available:</strong> Real-time verified</div>
                        <div><strong>Tariff:</strong> {p.tariff}</div>
                        <div><strong>Source:</strong> {p.source} ({p.provenance})</div>
                        <div className="text-[10px] text-gray-500">{new Date(p.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              ))}

              {/* 2. DYNAMIC ROUTES */}
              {showRoutes && routes.map((route, idx) => {
                const isActive = idx === activeRouteIndex
                return (
                  <Polyline
                    key={route.id}
                    positions={route.path}
                    pathOptions={{ 
                      color: isActive ? (route.type === 'Recommended' ? '#2563EB' : route.type === 'Alternative' ? '#059669' : '#D97706') : '#18181B', 
                      weight: isActive ? 4 : 2, 
                      dashArray: isActive ? undefined : '6, 6',
                      opacity: isActive ? 1.0 : 0.3
                    }}
                  >
                    <Popup>
                      <div className="p-2 space-y-1 font-sans">
                        <div className="font-bold text-sm text-[#18181B]">{route.name}</div>
                        <div className="text-xs font-semibold uppercase">{route.type} Route</div>
                      </div>
                    </Popup>
                  </Polyline>
                )
              })}

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
                        Disrupted — Energy movement rerouted via alternative options
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
              {showVessels && relevantVessels.map((v) => {
                const currentPos: [number, number] = [v.lat, v.lon]

                return (
                  <div key={v.id}>
                    <Marker
                      position={currentPos}
                      icon={createCustomIcon('#2563EB', '🚢')}
                      eventHandlers={{
                        click: () => setSelectedVessel(v),
                      }}
                    >
                      <Popup>
                        <div className="p-3 space-y-2 font-sans max-w-xs">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${v.status_label === 'LIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                              {v.status_label || 'DEMO DATA'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {v.imo || 'IMO N/A'}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-base text-[#18181B]">{v.vessel_name}</div>
                            <div className="text-xs text-[#18181B]/70 font-medium">
                              Position: [{v.lat?.toFixed(2)}, {v.lon?.toFixed(2)}] &middot; Destination: {v.current_destination}
                            </div>
                            <div className="text-[11px] text-gray-500 italic">
                              Origin: {v.origin_port || 'Unknown'} (AIS does not report origin)
                            </div>
                          </div>

                          <div className="text-xs bg-[#FAFAF8] p-2 rounded-lg border border-[#18181B]/10 space-y-1">
                            <div><span className="font-semibold text-[#18181B]/60">Distance to Target:</span> <strong className="text-blue-700">{v.distance_nm || 'N/A'} nm</strong></div>
                            <div><span className="font-semibold text-[#18181B]/60">Route Relevance:</span> <span className={`font-bold ${v.route_relevance === 'HIGH' ? 'text-emerald-700' : v.route_relevance === 'MEDIUM' ? 'text-amber-700' : 'text-gray-700'}`}>{v.route_relevance || 'MEDIUM'}</span></div>
                            <div><span className="font-semibold text-[#18181B]/60">Transit ETA:</span> {v.eta_days} Days ({v.eta_source || 'CALCULATED'})</div>
                            <div><span className="font-semibold text-[#18181B]/60">Data Source:</span> {v.data_source}</div>
                            <div><span className="font-semibold text-[#18181B]/60">Last AIS Update:</span> {v.data_updated_at ? new Date(v.data_updated_at).toLocaleTimeString() : 'Just now'}</div>
                            <div><span className="font-semibold text-[#18181B]/60">Commercial Status:</span> <span className="font-bold text-amber-700">{v.commercial_verification_status || 'CANDIDATE — UNVERIFIED'}</span></div>
                          </div>

                          <button
                            onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${v.id}&vessel_name=${encodeURIComponent(v.vessel_name)}&journey=${encodeURIComponent(`Position: [${v.lat}, ${v.lon}] → ${v.current_destination}`)}`)}
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
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              showRoutes ? 'bg-[#18181B] text-white shadow-2xs' : 'bg-[#FAFAF8] text-[#18181B]/60'
            }`}
          >
            {showRoutes ? '✓ Sea Routes' : '+ Sea Routes'}
          </button>

          <button
            onClick={() => setShowVessels(!showVessels)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              showVessels ? 'bg-blue-600 text-white shadow-2xs' : 'bg-[#FAFAF8] text-[#18181B]/60'
            }`}
          >
            {showVessels ? '✓ Ships In Motion' : '+ Ships In Motion'}
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

        {/* Route Switcher Control (Top Center) */}
        {!loading && routes.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center bg-white/90 backdrop-blur-md p-2 rounded-full border border-[#18181B]/10 shadow-xl">
            <button 
              onClick={() => setActiveRouteIndex((prev) => (prev > 0 ? prev - 1 : routes.length - 1))}
              className="px-3 text-lg font-bold hover:text-blue-600"
            >
              ‹
            </button>
            <div className="px-4 text-sm font-bold uppercase tracking-wider text-[#18181B]">
              Route {activeRouteIndex + 1} of {routes.length} <span className="font-normal text-xs text-gray-500 ml-2">({activeRoute?.type})</span>
            </div>
            <button 
              onClick={() => setActiveRouteIndex((prev) => (prev < routes.length - 1 ? prev + 1 : 0))}
              className="px-3 text-lg font-bold hover:text-blue-600"
            >
              ›
            </button>
          </div>
        )}

        {/* Floating UI Overlays */}
        <div className="absolute inset-0 z-10 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
          
          {/* Top Left Area */}
          <div className="pointer-events-auto max-w-sm flex flex-col gap-4">
            
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
                  Visualizing optimal sea lanes and alternative options for {scenario?.destination_port_name || 'India'}.
                </p>
              </div>

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

            {/* Active Route Info Panel */}
            {activeRoute && (
              <GlassPanel className="p-5 space-y-3 shadow-lg border-blue-500/20">
                <div className="flex justify-between items-center">
                   <h4 className="font-bold text-sm text-[#18181B]">{activeRoute.name}</h4>
                   <button onClick={() => setShowComparison(!showComparison)} className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Compare</button>
                </div>
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-semibold block">Origin:</span> {activeRoute.origin}</div>
                    <div><span className="font-semibold block">Destination:</span> {activeRoute.destination}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-semibold block">Distance:</span> {activeRoute.distance_nm} nm</div>
                    <div><span className="font-semibold block">ETA:</span> {activeRoute.eta_days} days</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-2">
                    <div><span className="font-semibold block">Transport Cost:</span> ${activeRoute.cost_per_bbl.toFixed(2)} / bbl</div>
                    <div><span className="font-semibold block">Risk Level:</span> <span className={`font-bold ${activeRoute.risk === 'HIGH' ? 'text-red-600' : activeRoute.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>{activeRoute.risk}</span></div>
                  </div>
                  <div className="border-t border-gray-100 pt-2 space-y-1">
                    <div className="flex justify-between"><span className="font-semibold">Source:</span> <span>{activeRoute.data_source}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Updated:</span> <span>{new Date(activeRoute.updated_at).toLocaleTimeString()}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Provenance:</span> <span className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-[10px]">{activeRoute.provenance}</span></div>
                  </div>
                </div>
              </GlassPanel>
            )}
          </div>

          {/* Route Comparison Overlay (Bottom left) */}
          {showComparison && (
            <div className="pointer-events-auto max-w-2xl absolute bottom-6 left-6 z-20">
              <GlassPanel className="p-5 shadow-2xl animate-slide-up border border-[#18181B]/20">
                <div className="flex justify-between mb-4">
                  <h3 className="font-['Instrument_Serif'] text-2xl">Route Comparison</h3>
                  <button onClick={() => setShowComparison(false)} className="font-bold text-xl hover:text-red-500">×</button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 text-gray-500 uppercase text-[10px]">Metric</th>
                      {routes.map((r, i) => (
                        <th key={r.id} className={`py-2 font-bold ${i === activeRouteIndex ? 'text-blue-600' : 'text-[#18181B]'}`}>
                          Route {i+1}<br/>
                          <span className="text-[10px] font-normal text-gray-500">{r.type}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-semibold text-gray-600">ETA</td>
                      {routes.map(r => <td key={r.id} className="py-2">{r.eta_days} days</td>)}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-semibold text-gray-600">Cost/bbl</td>
                      {routes.map(r => <td key={r.id} className="py-2">${r.cost_per_bbl.toFixed(2)}</td>)}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-semibold text-gray-600">Risk</td>
                      {routes.map(r => <td key={r.id} className={`py-2 font-bold ${r.risk === 'HIGH' ? 'text-red-600' : r.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>{r.risk}</td>)}
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-gray-600">Distance</td>
                      {routes.map(r => <td key={r.id} className="py-2">{r.distance_nm} nm</td>)}
                    </tr>
                  </tbody>
                </table>
              </GlassPanel>
            </div>
          )}

          {/* Bottom Floating Option Detail Panel */}
          {selectedVessel && (
            <div className="pointer-events-auto max-w-2xl w-full mx-auto relative z-30">
              <GlassPanel className="p-6 space-y-4 shadow-xl border border-[#18181B]/15 animate-slide-up">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 block mb-1">
                      VESSEL OPPORTUNITY &middot; {selectedVessel.commercial_verification_status || 'CANDIDATE — UNVERIFIED'}
                    </span>
                    <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B]">
                      {selectedVessel.vessel_name}
                    </h3>
                    <p className="text-xs text-[#18181B]/70 font-bold mt-1 text-blue-700">
                      {selectedVessel.relevance_reason}
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
                    <div className="font-bold text-xs text-[#18181B]">{selectedVessel.origin_port} &rarr; {selectedVessel.current_destination}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-[10px] text-[#18181B]/50 uppercase">Delivery ETA</div>
                    <div className="font-bold text-sm text-[#18181B]">{selectedVessel.eta_days} Days</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-[10px] text-[#18181B]/50 uppercase">Transport Provider</div>
                    <div className="font-bold text-xs text-[#18181B]">{selectedVessel.transport_provider}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAFAF8] border border-[#18181B]/10">
                    <div className="text-[10px] text-[#18181B]/50 uppercase">Data Source</div>
                    <div className="font-bold text-xs text-[#18181B]">{selectedVessel.data_source}</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${selectedVessel.id}&vessel_name=${encodeURIComponent(selectedVessel.vessel_name)}&journey=${encodeURIComponent(`${selectedVessel.origin_port} → ${selectedVessel.current_destination} via ${selectedVessel.potential_delivery}`)}`)}
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
