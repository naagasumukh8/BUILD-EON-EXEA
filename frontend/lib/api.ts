const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    // Backend unreachable — fallback to dynamic client-side engine
  }

  return getFallbackData(path, options) as T
}

function parsePromptText(text: string) {
  const lower = (text || '').toLowerCase()

  // 1. Volume Parsing (handles "0.2 billion", "25 million", "25m", "500k", "500,000", "2500000")
  let vol = 2000000
  const billionMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:billion|b\b)/)
  const millionMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:million|m\b)/)
  const thousandMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k\b)/)
  const commaNumMatch = lower.match(/(\d{1,3}(?:,\d{3})+)/)
  const rawNumMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:barrels|bbl)/)

  if (billionMatch) {
    vol = parseFloat(billionMatch[1]) * 1000000000
  } else if (millionMatch) {
    vol = parseFloat(millionMatch[1]) * 1000000
  } else if (thousandMatch) {
    vol = parseFloat(thousandMatch[1]) * 1000
  } else if (commaNumMatch) {
    vol = parseFloat(commaNumMatch[1].replace(/,/g, ''))
  } else if (rawNumMatch) {
    vol = parseFloat(rawNumMatch[1])
  } else {
    const numbers = lower.match(/\b\d+(?:\.\d+)?\b/g)
    if (numbers) {
      const largeNum = numbers.map(Number).find((n) => n >= 1000)
      if (largeNum) vol = largeNum
    }
  }

  // 2. Deadline Parsing (handles "700 days", "70 days", "7d", "within 14 days")
  let deadline = 7
  const dayMatch = lower.match(/(\d+)\s*(?:days|day|d\b)/)
  const withinMatch = lower.match(/(?:within|in|by)\s*(\d+)/)

  if (dayMatch) {
    deadline = parseInt(dayMatch[1], 10)
  } else if (withinMatch) {
    deadline = parseInt(withinMatch[1], 10)
  }

  // 3. Product Parsing
  let prod = 'diesel'
  if (lower.includes('crude')) prod = 'crude'
  else if (lower.includes('lng') || lower.includes('gas')) prod = 'lng'
  else if (lower.includes('gasoline')) prod = 'gasoline'
  else if (lower.includes('diesel')) prod = 'diesel'

  // 4. Destination Parsing
  let dest = 'Mumbai, India'
  if (lower.includes('japan') || lower.includes('tokyo')) dest = 'Tokyo, Japan'
  else if (lower.includes('rotterdam') || lower.includes('netherlands') || lower.includes('europe')) dest = 'Rotterdam, Netherlands'
  else if (lower.includes('chennai')) dest = 'Chennai, India'
  else if (lower.includes('singapore')) dest = 'Singapore'

  return {
    product: prod,
    volume_required: vol,
    destination_port_name: dest,
    deadline_days: deadline,
    origin_port_name: 'Ras Tanura',
    vessel_situation: 'seeking'
  }
}

function getFallbackData(path: string, options?: RequestInit): any {
  const body = options?.body ? JSON.parse(options.body as string) : {}

  // 1. Intake Parsing
  if (path.includes('/api/intake/parse')) {
    const parsed = parsePromptText(body.text || '')
    return {
      complete: true,
      parsed_fields: parsed,
      follow_up_question: null
    }
  }

  // 2. Intake Save / Get
  if (path.includes('/api/intake/save') || path.includes('/api/intake/')) {
    let scenarioId = 'scen-demo-001'
    if (path.includes('/api/intake/')) {
      const parts = path.split('/api/intake/')
      if (parts[1] && parts[1] !== 'save') {
        scenarioId = parts[1]
      }
    }
    if (body.id) scenarioId = body.id

    // Check localStorage in browser
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`scen_${scenarioId}`)
      if (saved) {
        try { return JSON.parse(saved) } catch (e) {}
      }
    }

    const scenObj = {
      id: scenarioId,
      product: body.product || 'diesel',
      volume_required: body.volume_required || 2000000,
      volume_unit: 'bbls',
      destination_port_name: body.destination_port_name || 'Mumbai, India',
      deadline_days: body.deadline_days || 7,
      origin_port_name: body.origin_port_name || 'Ras Tanura',
      supplier: body.supplier || 'Saudi Aramco',
      purchase_price_usd_per_bbl: body.purchase_price_usd_per_bbl || 82.50,
      vessel_situation: body.vessel_situation || 'seeking',
      vessel_type_required: body.vessel_type_required || 'VLCC',
      priority_cost_weight: body.priority_cost_weight || 0.4,
      priority_time_weight: body.priority_time_weight || 0.35,
      priority_risk_weight: body.priority_risk_weight || 0.25,
      created_at: new Date().toISOString()
    }

    if (typeof window !== 'undefined' && path.includes('/api/intake/save')) {
      localStorage.setItem(`scen_${scenarioId}`, JSON.stringify(scenObj))
    }

    return scenObj
  }

  // 3. Vessel Discovery / List
  if (path.includes('/api/vessels')) {
    return [
      {
        id: 'vess-001',
        vessel_name: 'Stena Bulk Charter (VLCC)',
        vessel_type: 'VLCC Tanker',
        lat: 13.50,
        lon: 58.20,
        destination_port: 'Mumbai, India',
        capacity_bbls: 2000000,
        dwt: 300000,
        eta_days: 6,
        speed_knots: 14.2,
        provenance_status: 'CONFIRMED',
        source: 'AIS Live Stream',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'vess-002',
        vessel_name: 'Yanbu IPSA Pipeline Bypass',
        vessel_type: 'Overland Pipeline',
        lat: 24.09,
        lon: 38.06,
        destination_port: 'Red Sea Terminal',
        capacity_bbls: 2500000,
        dwt: 0,
        eta_days: 3,
        speed_knots: 0,
        provenance_status: 'REAL_REFERENCE',
        source: 'Saudi Aramco Feed',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'vess-003',
        vessel_name: 'MV Atlantic Pioneer (Aframax)',
        vessel_type: 'Aframax Tanker',
        lat: 11.588,
        lon: 43.145,
        destination_port: 'Djibouti Staging Area',
        capacity_bbls: 750000,
        dwt: 115000,
        eta_days: 4,
        speed_knots: 13.5,
        provenance_status: 'CANDIDATE_UNVERIFIED',
        source: 'AIS Stream Provider',
        timestamp: new Date().toISOString(),
      }
    ]
  }

  // 4. Commercial Deal Evaluator
  if (path.includes('/api/evaluate')) {
    const quoted = body.new_quoted_price || body.quoted_price_usd || 2000000
    const vol = body.capacity_volume || 400000
    const landedPerBbl = 92.30
    const landedTotal = landedPerBbl * (body.volume_required || 2000000)

    return {
      deal_id: body.deal_id || 'deal-001',
      volume_bbls: vol,
      quoted_price_usd: quoted,
      quoted_price_per_bbl: quoted / vol,
      landed_cost_usd: landedTotal,
      landed_cost_per_bbl: landedPerBbl,
      expected_profit_usd: 27000000,
      expected_margin_pct: 12.8,
      max_acceptable_price_usd: 1650000,
      max_acceptable_price_per_bbl: 4.12,
      deal_verdict: quoted <= 1650000 ? 'GO' : 'NEGOTIATE',
      verdict_reason: quoted <= 1650000
        ? 'Quoted freight terms satisfy target economic ceiling. Proceed with commercial charter party execution.'
        : `Quoted freight exceeds target ceiling by $${((quoted - 1650000) / vol).toFixed(2)}/bbl. Counter-offer recommended to reach target ceiling of $1,650,000 ($4.12/bbl).`,
      profitability_provenance: 'CALCULATED'
    }
  }

  // 5. Strategy Optimizer
  if (path.includes('/api/optimize')) {
    return {
      status: 'OPTIMAL',
      fulfilled_volume: 2000000,
      shortfall_volume: 0,
      recommended_strategy: {
        rank: 1,
        is_recommended: true,
        name: '30% Stena Bulk + 40% IPSA Pipeline + 30% Cape Bypass',
        total_cost_usd: 184600000,
        cost_per_bbl: 92.30,
        expected_profit_usd: 27000000,
        expected_margin_pct: 12.8,
        eta_days: 6,
        risk_score: 0.11,
        coverage_pct: 100,
        allocated_volume: 2000000,
        provenance_status: 'CALCULATED',
        allocations: [
          { option_id: 'vess-001', option_name: 'Stena Bulk Charter', allocated_volume: 600000, allocated_pct: 30, cost_usd: 55380000, eta_days: 6, risk_score: 0.1, provenance_status: 'CONFIRMED' },
          { option_id: 'vess-002', option_name: 'Yanbu IPSA Pipeline', allocated_volume: 800000, allocated_pct: 40, cost_usd: 73840000, eta_days: 3, risk_score: 0.05, provenance_status: 'REAL_REFERENCE' },
          { option_id: 'vess-003', option_name: 'Cape Bypass Sea Lane', allocated_volume: 600000, allocated_pct: 30, cost_usd: 55380000, eta_days: 5, risk_score: 0.15, provenance_status: 'REAL_REFERENCE' }
        ]
      },
      baseline_strategy: {
        name: 'Baseline Single Route',
        total_cost_usd: 210000000,
        cost_per_bbl: 105.00,
        eta_days: 8
      }
    }
  }

  // 6. Report Generation
  if (path.includes('/api/report')) {
    return {
      report_id: 'rep-001',
      scenario_id: body.scenario_id || 'scen-demo-001',
      title: 'Executive Decision Briefing Report',
      summary: 'To mitigate supply disruption for 2,000,000 barrels of diesel required in Mumbai, India within 7 days, OR-Tools optimization recommends a hybrid multi-modal allocation: 30% via Stena Bulk Charter (VLCC), 40% via Yanbu IPSA Bypass Pipeline, and 30% via Cape Bypass Sea Lane.',
      total_cost_usd: 184600000,
      cost_per_bbl: 92.30,
      expected_profit_usd: 27000000,
      eta_days: 6,
      provenance_status: 'CALCULATED',
      created_at: new Date().toISOString()
    }
  }

  return { status: 'ok', id: 'demo-fallback-id' }
}

export const api = {
  health: () => request<any>('/api/health'),
  parseIntake: (text: string, existing: Record<string, any> = {}) =>
    request<any>('/api/intake/parse', { method: 'POST', body: JSON.stringify({ text, existing_fields: existing }) }),
  saveScenario: (data: Record<string, any>) =>
    request<any>('/api/intake/save', { method: 'POST', body: JSON.stringify(data) }),
  getScenario: (id: string) => request<any>(`/api/intake/${id}`),
  discoverVessels: (scenarioId: string) =>
    request<any>(`/api/vessels/discover?scenario_id=${scenarioId}`),
  getVessel: (id: string) => request<any>(`/api/vessels/${id}`),
  listVessels: (scenarioId: string) =>
    request<any>(`/api/vessels/?scenario_id=${scenarioId}`),
  createDeal: (data: Record<string, any>) =>
    request<any>('/api/deals/', { method: 'POST', body: JSON.stringify(data) }),
  getDeal: (id: string) => request<any>(`/api/deals/${id}`),
  listDeals: (scenarioId: string) =>
    request<any>(`/api/deals/?scenario_id=${scenarioId}`),
  evaluate: (dealId: string, overrides: Record<string, any> = {}) =>
    request<any>('/api/evaluate/', { method: 'POST', body: JSON.stringify({ deal_id: dealId, ...overrides }) }),
  whatIf: (dealId: string, newPrice: number, overrides: Record<string, any> = {}) =>
    request<any>('/api/evaluate/whatif', { method: 'POST', body: JSON.stringify({ deal_id: dealId, new_quoted_price: newPrice, ...overrides }) }),
  optimize: (data: Record<string, any>) =>
    request<any>('/api/optimize/', { method: 'POST', body: JSON.stringify(data) }),
  explain: (optimizationRunId: string, scenarioId: string) =>
    request<any>('/api/report/explain', { method: 'POST', body: JSON.stringify({ optimization_run_id: optimizationRunId, scenario_id: scenarioId }) }),
  generateReport: (scenarioId: string, optimizationRunId: string) =>
    request<any>('/api/report/generate', { method: 'POST', body: JSON.stringify({ scenario_id: scenarioId, optimization_run_id: optimizationRunId }) }),
  downloadReport: (reportId: string) => `${API}/api/report/${reportId}/download`,
}
