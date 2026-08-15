'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

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
const UseMapComponent = dynamicImport(
  () => import('react-leaflet').then((m) => {
    const { useMap } = m
    function SetMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
      const map = useMap()
      const prevRef = useRef<string>('')
      useEffect(() => {
        const key = `${center[0]}_${center[1]}`
        if (prevRef.current !== key) {
          map.setView(center, zoom, { animate: true, duration: 1.0 })
          prevRef.current = key
        }
      }, [center, zoom, map])
      return null
    }
    return { default: SetMapView }
  }),
  { ssr: false }
)

type DestConfig = {
  center: [number, number]
  zoom: number
  destCoords: [number, number]
  destLabel: string
  showIpsaPipeline: boolean
  showHormuz: boolean
}

function getDestConfig(destName: string): DestConfig {
  const lower = (destName || '').toLowerCase()
  if (lower.includes('japan') || lower.includes('tokyo')) {
    return { center: [25.0, 120.0], zoom: 4, destCoords: [35.44, 139.64], destLabel: 'Tokyo Bay Terminal, Japan', showIpsaPipeline: false, showHormuz: true }
  }
  if (lower.includes('china') || lower.includes('shanghai') || lower.includes('ningbo') || lower.includes('qingdao')) {
    return { center: [18.0, 110.0], zoom: 4, destCoords: [31.23, 121.47], destLabel: 'Shanghai Port, China', showIpsaPipeline: false, showHormuz: true }
  }
  if (lower.includes('singapore')) {
    return { center: [6.0, 96.0], zoom: 5, destCoords: [1.35, 103.8], destLabel: 'Singapore Terminal', showIpsaPipeline: false, showHormuz: true }
  }
  if (lower.includes('rotterdam') || lower.includes('europe') || lower.includes('netherlands')) {
    return { center: [38.0, 10.0], zoom: 3, destCoords: [51.92, 4.48], destLabel: 'Rotterdam Hub, Netherlands', showIpsaPipeline: true, showHormuz: true }
  }
  if (lower.includes('colombo') || lower.includes('sri lanka')) {
    return { center: [10.0, 72.0], zoom: 5, destCoords: [6.92, 79.86], destLabel: 'Colombo Terminal, Sri Lanka', showIpsaPipeline: true, showHormuz: true }
  }
  if (lower.includes('houston') || lower.includes('usa')) {
    return { center: [28.0, -50.0], zoom: 3, destCoords: [29.76, -95.36], destLabel: 'Houston Hub, USA', showIpsaPipeline: true, showHormuz: false }
  }
  return { center: [18.0, 68.0], zoom: 5, destCoords: [18.96, 72.82], destLabel: 'Mumbai Port, India', showIpsaPipeline: true, showHormuz: true }
}

const IPSA_PIPELINE_COORDS: [number, number][] = [[26.64, 50.16], [25.00, 45.00], [24.09, 38.06]]
const HORMUZ_COORDS: [number, number] = [26.56, 56.25]
const SUPPLY_ORIGIN_COORDS: [number, number] = [26.64, 50.16]

function createIcon(L: any, color: string, label: string, size = 28) {
  if (!L) return undefined
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*.46)}px">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

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
  const [showPipelines, setShowPipelines] = useState(true)
  const [showVessels, setShowVessels] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showChokepoints, setShowChokepoints] = useState(true)
  const [showOilCompanies, setShowOilCompanies] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((m) => setL(m.default || m))
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

  useEffect(() => { loadNetworkData() }, [loadNetworkData])

  const destName = scenario?.destination_port_name || scenario?.destination_port || 'India'
  const destCfg = getDestConfig(destName)
  const activeRoute = routes[activeRouteIndex]

  const showIpsa = showPipelines && destCfg.showIpsaPipeline
  const routePassesThroughHormuz = activeRoute?.path?.some(
    ([lat, lon]: [number, number]) => Math.abs(lat - HORMUZ_COORDS[0]) < 1.5 && Math.abs(lon - HORMUZ_COORDS[1]) < 2.0
  ) ?? false
  const showHormuzMarker = showChokepoints && destCfg.showHormuz && routePassesThroughHormuz

  const keyPorts = [
    { key: 'origin', lat: SUPPLY_ORIGIN_COORDS[0], lon: SUPPLY_ORIGIN_COORDS[1], name: 'Ras Tanura Terminal  Supply Origin', color: '#7c3aed', emoji: '???' },
    { key: 'dest', lat: destCfg.destCoords[0], lon: destCfg.destCoords[1], name: `${destCfg.destLabel}  Destination`, color: '#16a34a', emoji: '?' },
    ...(showIpsa ? [{ key: 'yanbu', lat: 24.09, lon: 38.06, name: 'Yanbu Terminal  Pipeline Endpoint', color: '#d97706', emoji: '??' }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />
      <div className="flex-1 relative w-full" style={{ height: 'calc(100vh - 64px)' }}>

        {/* MAP CANVAS */}
        <div className="absolute inset-0 z-0">
          {!loading && typeof window !== 'undefined' && (
            <MapContainer center={destCfg.center} zoom={destCfg.zoom} scrollWheelZoom className="w-full h-full">
              <UseMapComponent center={destCfg.center} zoom={destCfg.zoom} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* IPSA Pipeline  scenario-conditional */}
              {showIpsa && (
                <Polyline positions={IPSA_PIPELINE_COORDS} pathOptions={{ color: '#D97706', weight: 4, dashArray: '8,8' }}>
                  <Popup>
                    <div className="p-2 space-y-1 font-sans text-xs">
                      <div className="font-bold text-sm">Saudi IPSA East-West Pipeline</div>
                      <div className="text-amber-700 font-semibold">ACTIVE BYPASS INFRASTRUCTURE</div>
                      <div>Route: Ras Tanura ? Yanbu (Red Sea)</div>
                      <div>Capacity: 2,500,000 bbl/day</div>
                      <div>Purpose: Bypasses Strait of Hormuz</div>
                      <div>Operator: Saudi Aramco  Tariff: ~$1.40/bbl</div>
                    </div>
                  </Popup>
                </Polyline>
              )}

              {/* Route polylines */}
              {showRoutes && routes.map((route, idx) => {
                const isActive = idx === activeRouteIndex
                const routeColor = route.type === 'Recommended' ? '#2563EB' : route.type === 'Alternative' ? '#059669' : '#D97706'
                return (
                  <Polyline key={route.id} positions={route.path}
                    pathOptions={{ color: isActive ? routeColor : '#94a3b8', weight: isActive ? 4 : 2, dashArray: isActive ? undefined : '6,6', opacity: isActive ? 1.0 : 0.3 }}>
                    <Popup>
                      <div className="p-2 font-sans text-xs max-w-xs space-y-1">
                        <div className="text-[10px] font-bold uppercase text-gray-500">{route.type} Route</div>
                        <div className="font-bold text-sm">{route.name}</div>
                        {route.description && <div className="text-gray-500 italic">{route.description}</div>}
                        <div className="border-t pt-1 space-y-0.5">
                          <div><b>Origin:</b> {route.origin}</div>
                          <div><b>Destination:</b> {route.destination}</div>
                          <div><b>Distance:</b> {route.distance_nm?.toLocaleString()} nm</div>
                          <div><b>ETA:</b> {route.eta_days} days</div>
                          <div><b>Cost:</b> ${route.cost_per_bbl?.toFixed(2)}/bbl</div>
                          <div><b>Risk:</b> <span className={route.risk === 'HIGH' ? 'text-red-600 font-bold' : route.risk === 'MEDIUM' ? 'text-amber-600 font-bold' : 'text-green-600 font-bold'}>{route.risk}</span></div>
                          <div className="text-[10px] text-gray-400">{route.data_source}  {route.provenance}</div>
                        </div>
                      </div>
                    </Popup>
                  </Polyline>
                )
              })}

              {/* Hormuz chokepoint  only on routes that pass through it */}
              {showHormuzMarker && (
                <Marker position={HORMUZ_COORDS} icon={createIcon(L, '#DC2626', '??', 30)}>
                  <Popup>
                    <div className="p-2 text-center font-sans text-xs space-y-1">
                      <div className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase">STABILITY RISK 94% BLOCKED</div>
                      <div className="font-bold">Strait of Hormuz Chokepoint</div>
                      <div className="text-red-700">Active disruption. Routes 2 & 3 bypass this chokepoint.</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Key port markers  only origin + destination + yanbu (if relevant) */}
              {keyPorts.map((port) => (
                <Marker key={port.key} position={[port.lat, port.lon]} icon={createIcon(L, port.color, port.emoji, 28)}>
                  <Popup><div className="p-2 font-sans text-xs font-bold">{port.name}</div></Popup>
                </Marker>
              ))}

              {/* Bi-Coastal Oil Company Hub Network (Reliance / Jio Energy Grid & IOCL) */}
              {showOilCompanies && (
                <>
                  {/* Bi-Coastal Swap Connection Line */}
                  <Polyline positions={[[18.96, 72.82], [15.0, 76.0], [17.68, 83.21]]}
                    pathOptions={{ color: '#8B5CF6', weight: 3.5, dashArray: '6,6' }}>
                    <Popup>
                      <div className="p-2 space-y-1 font-sans text-xs max-w-xs">
                        <div className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px] uppercase">BI-COASTAL ENERGY CARGO SWAP</div>
                        <div className="font-bold text-sm">Reliance / Jio Energy & IOCL Dual-Coast Swap</div>
                        <div className="text-gray-600">Unload West Coast (Mumbai) ⇄ Release East Coast (Vizag)</div>
                        <div className="text-emerald-700 font-semibold">Saves 2,450 nm & 8.5 transit days around Sri Lanka!</div>
                        <button onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&deal_type=bicoastal_swap&counterparty=${encodeURIComponent('Reliance / Jio Energy Grid')}&journey=${encodeURIComponent('West Coast Unload (Mumbai) ⇄ East Coast Release (Vizag)')}`)}
                          className="w-full mt-1.5 py-1 rounded bg-[#8B5CF6] text-white text-[11px] font-semibold hover:bg-purple-700 shadow">
                          🤝 Initiate Bi-Coastal Swap Deal →
                        </button>
                      </div>
                    </Popup>
                  </Polyline>

                  {/* West Coast Hub Marker (Mumbai / Jamnagar) */}
                  <Marker position={[18.96, 72.82]} icon={createIcon(L, '#8B5CF6', '🏢', 30)}>
                    <Popup>
                      <div className="p-2 font-sans text-xs space-y-1 max-w-xs">
                        <div className="font-bold text-sm">Reliance / Jio Energy — West Coast Refinery Hub (Mumbai)</div>
                        <div className="text-gray-600">Refinery / Storage Capacity: 12,500,000 bbls</div>
                        <div className="text-purple-700 font-semibold">Dual-Coast Connected to East Hub (Vizag)</div>
                        <button onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&deal_type=bicoastal_swap&counterparty=${encodeURIComponent('Reliance / Jio Energy Grid')}&journey=${encodeURIComponent('West Coast Unload (Mumbai) ⇄ East Coast Release (Vizag)')}`)}
                          className="w-full mt-1 py-1 rounded bg-[#18181B] text-white text-[11px] font-semibold hover:bg-black">
                          Propose Unload at Mumbai →
                        </button>
                      </div>
                    </Popup>
                  </Marker>

                  {/* East Coast Hub Marker (Vizag / Paradip) */}
                  <Marker position={[17.68, 83.21]} icon={createIcon(L, '#8B5CF6', '🏢', 30)}>
                    <Popup>
                      <div className="p-2 font-sans text-xs space-y-1 max-w-xs">
                        <div className="font-bold text-sm">Reliance / Jio Energy — East Coast Terminal (Vizag)</div>
                        <div className="text-gray-600">Inventory Capacity: 8,200,000 bbls</div>
                        <div className="text-emerald-700 font-semibold">Instant Local Release Available (Zero Transit)</div>
                        <button onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&deal_type=bicoastal_swap&counterparty=${encodeURIComponent('Reliance / Jio Energy Grid')}&journey=${encodeURIComponent('West Coast Unload (Mumbai) ⇄ East Coast Release (Vizag)')}`)}
                          className="w-full mt-1 py-1 rounded bg-[#18181B] text-white text-[11px] font-semibold hover:bg-black">
                          Propose Release at Vizag →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* Moving vessels with journey trace */}
              {showVessels && vessels.map((v) => {
                const pos: [number, number] = [v.lat, v.lon]
                const dest: [number, number] | null = v.dest_coords
                return (
                  <div key={v.id}>
                    {dest && (
                      <Polyline positions={[pos, dest]}
                        pathOptions={{ color: '#2563EB', weight: 1.5, dashArray: '4,6', opacity: 0.45 }} />
                    )}
                    <Marker position={pos} icon={createIcon(L, '#2563EB', '??', 24)}
                      eventHandlers={{ click: () => setSelectedVessel(v) }}>
                      <Popup>
                        <div className="p-2 font-sans text-xs space-y-1.5" style={{ minWidth: '200px' }}>
                          <div className="flex justify-between items-center">
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] uppercase ${v.status_label === 'LIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                              {v.status_label || 'DEMO DATA'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{v.imo || ''}</span>
                          </div>
                          <div className="font-bold">{v.vessel_name}</div>
                          <div className="text-gray-500">Pos: [{v.lat?.toFixed(2)}, {v.lon?.toFixed(2)}] ? {v.current_destination}</div>
                          <div className="text-gray-400 italic text-[11px]">Origin: {v.origin_port || 'Unknown'} (AIS does not report origin)</div>
                          <div className="border-t pt-1 space-y-0.5">
                            <div><b>Distance to target:</b> <span className="text-blue-700 font-bold">{v.distance_nm || 'N/A'} nm</span></div>
                            <div><b>Relevance:</b> <span className={`font-bold ${v.route_relevance === 'HIGH' ? 'text-green-700' : v.route_relevance === 'MEDIUM' ? 'text-amber-700' : 'text-gray-600'}`}>{v.route_relevance}</span></div>
                            <div><b>ETA:</b> {v.eta_days} Days ({v.eta_source})</div>
                            <div><b>Source:</b> {v.data_source}</div>
                          </div>
                          <button onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${v.id}&vessel_name=${encodeURIComponent(v.vessel_name)}&journey=${encodeURIComponent(`[${v.lat},${v.lon}] -> ${v.current_destination}`)}`)}
                            className="w-full py-1.5 rounded bg-[#18181B] text-white text-[11px] font-semibold hover:bg-black shadow">
                            🤝 Negotiate Cargo Space & Verify Deal →
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

        {/* LAYER TOGGLES  top right */}
        <div className="absolute top-2 right-2 z-10 flex flex-wrap gap-1 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-[#18181B]/10 shadow-md">
          {[
            { label: 'Oil Hubs', active: showOilCompanies, toggle: () => setShowOilCompanies(!showOilCompanies), color: 'bg-purple-600' },
            { label: 'Pipeline', active: showPipelines, toggle: () => setShowPipelines(!showPipelines), color: 'bg-amber-500' },
            { label: 'Routes', active: showRoutes, toggle: () => setShowRoutes(!showRoutes), color: 'bg-[#18181B]' },
            { label: 'Vessels', active: showVessels, toggle: () => setShowVessels(!showVessels), color: 'bg-blue-600' },
            { label: 'Choke', active: showChokepoints, toggle: () => setShowChokepoints(!showChokepoints), color: 'bg-red-600' },
          ].map(({ label, active, toggle, color }) => (
            <button key={label} onClick={toggle}
              className={`px-2.5 py-1 rounded-full font-semibold text-[11px] transition-all ${active ? `${color} text-white` : 'bg-gray-100 text-gray-500'}`}>
              {active ? `✓ ${label}` : `+ ${label}`}
            </button>
          ))}
        </div>

        {/* ROUTE SWITCHER  top center */}
        {!loading && routes.length > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center bg-white/92 backdrop-blur-md px-1 py-1 rounded-full border border-[#18181B]/10 shadow-xl">
            <button onClick={() => setActiveRouteIndex((p) => (p > 0 ? p - 1 : routes.length - 1))}
              className="px-2 text-base font-bold hover:text-blue-600 leading-none"></button>
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-[#18181B] whitespace-nowrap">
              Route {activeRouteIndex + 1}/{routes.length} <span className="font-normal text-gray-400">({activeRoute?.type})</span>
            </div>
            <button onClick={() => setActiveRouteIndex((p) => (p < routes.length - 1 ? p + 1 : 0))}
              className="px-2 text-base font-bold hover:text-blue-600 leading-none"></button>
          </div>
        )}

        {/* OVERLAY PANELS */}
        <div className="absolute inset-0 z-10 pointer-events-none">

          {/* Scenario info  top left */}
          <div className="absolute top-12 left-2 pointer-events-auto max-w-[260px] sm:max-w-sm">
            <GlassPanel className="p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#18181B]/50">POLY EXEA NETWORK</span>
                {destCfg.showHormuz && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-200">DISRUPTED</span>
                )}
              </div>
              <div>
                <h3 className="font-['Instrument_Serif'] text-xl text-[#18181B]">Transport Opportunities</h3>
                <p className="text-[11px] text-[#18181B]/70 mt-0.5">Sea lanes for <strong>{destCfg.destLabel}</strong>.</p>
              </div>
              <div className="pt-2 border-t border-[#18181B]/10 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Product</div>
                  <div className="font-bold uppercase">{scenario?.product || 'DIESEL'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Volume</div>
                  <div className="font-bold">{Number(scenario?.volume_required || 2000000).toLocaleString()} bbl</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Origin</div>
                  <div className="font-bold text-[11px]">Ras Tanura, Persian Gulf</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#18181B]/50 uppercase font-semibold">Destination</div>
                  <div className="font-bold text-[11px]">{destCfg.destLabel}</div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Active route info  left, below scenario */}
          {activeRoute && (
            <div className="absolute left-2 pointer-events-auto max-w-[260px] sm:max-w-sm" style={{ top: '215px' }}>
              <GlassPanel className="p-3 space-y-2 shadow-lg">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-xs text-[#18181B] leading-snug flex-1">{activeRoute.name}</h4>
                  <button onClick={() => setShowComparison(!showComparison)}
                    className="text-[10px] uppercase font-bold text-blue-600 hover:underline whitespace-nowrap flex-shrink-0">
                    Compare
                  </button>
                </div>
                {activeRoute.description && (
                  <p className="text-[11px] text-gray-500 italic leading-snug">{activeRoute.description}</p>
                )}
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {[
                      ['Origin', activeRoute.origin],
                      ['Destination', activeRoute.destination],
                      ['Distance', `${activeRoute.distance_nm?.toLocaleString()} nm`],
                      ['ETA', `${activeRoute.eta_days} days`],
                      ['Cost', `$${activeRoute.cost_per_bbl?.toFixed(2)}/bbl`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span className="block text-[10px] text-gray-400 uppercase">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase">Risk</span>
                      <span className={`font-bold ${activeRoute.risk === 'HIGH' ? 'text-red-600' : activeRoute.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {activeRoute.risk}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 border-t pt-1">{activeRoute.data_source}  {activeRoute.provenance}</div>
                </div>
              </GlassPanel>
            </div>
          )}

          {/* Route comparison table  bottom */}
          {showComparison && (
            <div className="absolute bottom-4 left-2 z-20 pointer-events-auto" style={{ maxWidth: 'calc(100vw - 16px)' }}>
              <GlassPanel className="p-4 shadow-2xl border border-[#18181B]/20 overflow-x-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-['Instrument_Serif'] text-xl">Route Comparison</h3>
                  <button onClick={() => setShowComparison(false)} className="font-bold text-lg hover:text-red-500 leading-none ml-4"></button>
                </div>
                <table className="text-xs text-left w-full min-w-[380px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-1.5 text-gray-400 uppercase text-[10px] pr-3">Metric</th>
                      {routes.map((r, i) => (
                        <th key={r.id} className={`py-1.5 font-bold pr-3 ${i === activeRouteIndex ? 'text-blue-600' : 'text-[#18181B]'}`}>
                          {r.type}<br /><span className="text-[10px] font-normal text-gray-400">{r.distance_nm?.toLocaleString()} nm</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'ETA', fn: (r: any) => `${r.eta_days} days` },
                      { label: 'Cost/bbl', fn: (r: any) => `$${r.cost_per_bbl?.toFixed(2)}` },
                      { label: 'Risk', fn: (r: any) => <span className={`font-bold ${r.risk === 'HIGH' ? 'text-red-600' : r.risk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>{r.risk}</span> },
                      { label: 'Origin', fn: (r: any) => r.origin },
                      { label: 'Source', fn: (r: any) => <span className="text-gray-400">{r.provenance}</span> },
                    ].map(({ label, fn }) => (
                      <tr key={label} className="border-b border-gray-100">
                        <td className="py-1.5 font-semibold text-gray-500 pr-3 whitespace-nowrap">{label}</td>
                        {routes.map((r) => <td key={r.id} className="py-1.5 pr-3">{fn(r)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassPanel>
            </div>
          )}

          {/* Selected vessel detail  bottom center */}
          {selectedVessel && (
            <div className="absolute bottom-4 left-2 right-2 sm:left-auto sm:right-4 sm:max-w-sm pointer-events-auto z-30">
              <GlassPanel className="p-4 space-y-3 shadow-xl border border-[#18181B]/15">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]/50 block mb-0.5">
                      VESSEL OPPORTUNITY  {selectedVessel.commercial_verification_status || 'CANDIDATE  UNVERIFIED'}
                    </span>
                    <h3 className="font-['Instrument_Serif'] text-xl text-[#18181B] truncate">{selectedVessel.vessel_name}</h3>
                    <p className="text-[11px] text-blue-700 font-medium mt-0.5 leading-snug">{selectedVessel.relevance_reason}</p>
                  </div>
                  <button onClick={() => setSelectedVessel(null)} className="text-[#18181B]/40 hover:text-[#18181B] text-xl font-bold ml-2 flex-shrink-0"></button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Position', `[${selectedVessel.lat?.toFixed(1)}, ${selectedVessel.lon?.toFixed(1)}]`],
                    ['AIS Destination', selectedVessel.current_destination],
                    ['Transit ETA', `${selectedVessel.eta_days} Days (${selectedVessel.eta_source || 'CALCULATED'})`],
                    ['Distance to Target', `${selectedVessel.distance_nm || 'N/A'} nm`],
                    ['Route Relevance', selectedVessel.route_relevance || 'N/A'],
                    ['Vessel Type', selectedVessel.vessel_type],
                    ['Data Source', selectedVessel.data_source],
                    ['Status', selectedVessel.status_label || 'DEMO DATA'],
                  ].map(([label, value]) => (
                    <div key={label} className="p-2 rounded-xl bg-white border border-[#18181B]/10">
                      <div className="text-[10px] text-[#18181B]/50 uppercase">{label}</div>
                      <div className="font-bold text-[11px] text-[#18181B] leading-snug mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button onClick={() => router.push(`/deals/new?scenario_id=${scenarioId}&vessel_id=${selectedVessel.id}&vessel_name=${encodeURIComponent(selectedVessel.vessel_name)}&journey=${encodeURIComponent(`[${selectedVessel.lat},${selectedVessel.lon}] ? ${selectedVessel.current_destination}`)}`)}
                    className="rounded-full bg-[#18181B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black shadow-md">
                    Verify Commercial Opportunity & Enter Quote ?
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
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Transport Network Map...</div>}>
      <MapContent />
    </Suspense>
  )
}
