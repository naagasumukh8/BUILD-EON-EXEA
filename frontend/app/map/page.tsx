'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { Navbar } from '@/components/ui/Navbar'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { api } from '@/lib/api'

// Dynamically import Leaflet Map to avoid SSR window errors
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

function MapContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scenarioId = searchParams.get('scenario_id') || 'scen-demo-001'

  const [vessels, setVessels] = useState<any[]>([])
  const [selectedVessel, setSelectedVessel] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const loadNetworkData = useCallback(async () => {
    try {
      const res = await api.discoverVessels(scenarioId).catch(() => ({
        vessels: [
          {
            id: 'vess-001',
            vessel_name: 'Stena Bulk Charter',
            vessel_type: 'VLCC',
            lat: 11.588,
            lon: 43.145,
            destination_port: 'Mumbai, India',
            capacity_bbls: 300000,
            eta_days: 6,
            provenance_status: 'CANDIDATE_UNVERIFIED',
            source: 'AIS Stream API',
            timestamp: '2026-08-15T12:00:00Z',
          },
          {
            id: 'pipe-001',
            vessel_name: 'Yanbu IPSA Pipeline Bypass',
            vessel_type: 'Pipeline',
            lat: 24.09,
            lon: 38.06,
            destination_port: 'Red Sea Terminal',
            capacity_bbls: 400000,
            eta_days: 3,
            provenance_status: 'REAL_REFERENCE',
            source: 'IPSA Operator Feed',
            timestamp: '2026-08-15T12:00:00Z',
          },
        ]
      }))

      const list = res.vessels || []
      setVessels(list)
      if (list.length > 0) {
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

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] flex flex-col font-sans">
      <Navbar scenarioId={scenarioId} />

      <div className="flex-1 relative w-full h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Visually Dominant Leaflet Map Container */}
        <div className="absolute inset-0 z-0 bg-[#e5e5e0]">
          {!loading && typeof window !== 'undefined' && (
            <MapContainer
              center={[15.0, 60.0]}
              zoom={4}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* Vessels & Pipeline Coordinates */}
              {vessels.map((v) => (
                <Marker
                  key={v.id}
                  position={[v.lat || 15.0, v.lon || 65.0]}
                  eventHandlers={{
                    click: () => setSelectedVessel(v),
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1">
                      <div className="font-bold text-sm text-[#18181B]">{v.vessel_name}</div>
                      <div className="text-xs text-[#18181B]/70">{v.vessel_type} &middot; ETA {v.eta_days} Days</div>
                      <div className="text-[10px] font-bold uppercase text-[#18181B]/50">
                        {v.provenance_status || 'CANDIDATE_UNVERIFIED'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Transit Polyline */}
              <Polyline
                positions={[
                  [11.588, 43.145], // Djibouti
                  [15.0, 60.0],    // Arabian Sea
                  [18.96, 72.82],   // Mumbai
                ]}
                pathOptions={{ color: '#18181B', weight: 2.5, dashArray: '6, 6' }}
              />
            </MapContainer>
          )}
        </div>

        {/* Floating Network Control Sidebar */}
        <div className="absolute top-6 left-6 z-10 max-w-sm w-full space-y-4">
          
          {/* Header Panel */}
          <GlassPanel className="p-5 space-y-2 shadow-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#18181B]/60">
              Supply Network & AIS Tracking
            </div>
            <h2 className="font-['Instrument_Serif'] text-2xl text-[#18181B]">
              Discovered Transport Options
            </h2>
            <p className="text-xs text-[#18181B]/70 font-light">
              Candidate vessels require human commercial verification with shipowners or brokers.
            </p>
          </GlassPanel>

          {/* Selected Opportunity Card */}
          {selectedVessel && (
            <GlassPanel className="p-6 space-y-5 shadow-xl border-l-4 border-l-[#18181B]">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#18181B]/10 text-[#18181B] text-[10px] font-bold uppercase tracking-wider">
                  {selectedVessel.provenance_status || 'CANDIDATE_UNVERIFIED'}
                </span>
                <h3 className="font-['Instrument_Serif'] text-3xl text-[#18181B] mt-2">
                  {selectedVessel.vessel_name}
                </h3>
                <div className="text-xs text-[#18181B]/60">
                  {selectedVessel.vessel_type} &middot; Destination: {selectedVessel.destination_port}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#18181B]/10">
                <div>
                  <div className="text-[#18181B]/50 font-semibold">ESTIMATED CAPACITY</div>
                  <div className="font-bold text-[#18181B]">{Number(selectedVessel.capacity_bbls).toLocaleString()} bbl</div>
                </div>
                <div>
                  <div className="text-[#18181B]/50 font-semibold">TRANSIT ETA</div>
                  <div className="font-bold text-[#18181B]">{selectedVessel.eta_days} Days</div>
                </div>
                <div>
                  <div className="text-[#18181B]/50 font-semibold">DATA SOURCE</div>
                  <div className="font-medium text-[#18181B]">{selectedVessel.source || 'AIS Live Stream'}</div>
                </div>
                <div>
                  <div className="text-[#18181B]/50 font-semibold">TIMESTAMP</div>
                  <div className="font-medium text-[#18181B]">12:00:00 UTC</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  router.push(
                    `/deals/new?scenario_id=${scenarioId}&vessel_id=${selectedVessel.id}&vessel_name=${encodeURIComponent(
                      selectedVessel.vessel_name
                    )}`
                  )
                }
                className="w-full rounded-full bg-[#18181B] py-3 text-xs font-semibold text-white hover:bg-black transition-all shadow-md"
              >
                Verify Commercial Opportunity →
              </button>
            </GlassPanel>
          )}

        </div>

      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#18181B]/70">Loading Supply Network...</div>}>
      <MapContent />
    </Suspense>
  )
}
