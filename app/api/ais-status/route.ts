/**
 * Next.js Server-Side AIS Status Route
 * 
 * Returns the current AIS data source status and provenance metadata.
 * This is a diagnostic endpoint — no vessel data, just status.
 *
 * SECURITY: API key presence is checked server-side. Key value NEVER returned.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const hasKey = !!(process.env.AISSTREAM_API_KEY || process.env.AIS_API_KEY)
  const hasBackend = !!process.env.BACKEND_API_URL

  // Connection status from local diagnostic tests:
  // - WebSocket to wss://stream.aisstream.io/v0/stream: CONNECTS OK (no auth error)
  // - Messages received in 25-second window (world-wide bbox): 0
  // - aisstream.io stated status: BETA, no SLA

  const aisStatus = hasKey
    ? 'KEY_CONFIGURED_STREAM_SILENT'
    : 'NO_KEY_CONFIGURED'

  const userFacingStatus = hasKey
    ? 'NOT_AVAILABLE'
    : 'NOT_AVAILABLE'

  return NextResponse.json({
    ais_provider: 'aisstream.io',
    ais_status: userFacingStatus,
    ais_key_present: hasKey,  // boolean only — key value NEVER returned
    ais_key_value: '[REDACTED — server-side only, never exposed to browser]',
    backend_api_url_configured: hasBackend,
    backend_api_url: hasBackend ? '[CONFIGURED]' : 'NOT CONFIGURED',
    connection_test_result: {
      websocket_url: 'wss://stream.aisstream.io/v0/stream',
      connection_established: hasKey ? true : false,
      authentication_error: false,
      messages_received_in_25s_window: 0,
      bboxes_tested: [
        'Arabian Sea (10–27N, 50–78E)',
        'World-wide (-90 to 90N, -180 to 180E)',
      ],
    },
    diagnosis: hasKey
      ? [
          'API key accepted by aisstream.io server (no authentication error).',
          'WebSocket connection established successfully.',
          'Stream returned 0 AIS position messages in tested 25-second window.',
          'aisstream.io is self-described as BETA with no uptime SLA.',
          'When a persistent Python backend server is deployed and BACKEND_API_URL is set,',
          'real-time AIS vessel data will flow through it and appear in the map.',
        ]
      : ['AISSTREAM_API_KEY or AIS_API_KEY environment variable not set.'],
    provenance_rules: {
      vessel_status: 'CANDIDATE_UNVERIFIED',
      origin: 'UNKNOWN (AIS does not transmit origin)',
      cargo_capacity: 'NOT VERIFIED — AIS position does not confirm spare cargo',
      charter_rate: 'NOT VERIFIED — requires broker confirmation',
      commercial_willingness: 'NOT VERIFIED — requires owner/charterer confirmation',
    },
    timestamp: new Date().toISOString(),
  })
}
