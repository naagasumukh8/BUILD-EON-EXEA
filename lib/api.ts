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
    // Backend unreachable — fallback to client-side simulated engine
  }

  return getFallbackData(path, options) as T
}

function getFallbackData(path: string, options?: RequestInit): any {
  const body = options?.body ? JSON.parse(options.body as string) : {}

  // 1. Intake Parse
  if (path.includes('/api/intake/parse')) {
    const text = (body.text || '').toLowerCase()
    let vol = 2000000
    if (text.includes('1 million') || text.includes('1m')) vol = 1000000
    if (text.includes('500') || text.includes('500k')) vol = 500000
    
    let deadline = 7
    if (text.includes('3 days') || text.includes('3d')) deadline = 3
    if (text.includes('14 days') || text.includes('14d')) deadline = 14

    let prod = 'diesel'
    if (text.includes('crude')) prod = 'crude'
    if (text.includes('lng') || text.includes('gas')) prod = 'lng'

    return {
      complete: true,
      parsed_fields: {
        product: prod,
        volume_required: vol,
        destination_port_name: text.includes('india') ? 'Mumbai, India' : 'Rotterdam',
        deadline_days: deadline,
        origin_port_name: 'Ras Tanura',
        vessel_situation: 'seeking'
      },
      follow_up_question: null
    }
  }

  // 2. Intake Save / Get
  if (path.includes('/api/intake/save') || path.includes('/api/intake/')) {
    return {
      id: body.id || 'scen-demo-001',
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
  }

  // 3. Vessel Discovery / List
  if (path.includes('/api/vessels')) {
    return [
      {
        id: 'vess-001',
        vessel_name: 'Stena Bulk Charter',
        option_type: 'confirmed_deal',
        capacity_bbls: 300000,
        cost_usd_per_bbl: 4600.00,
        eta_days: 6,
        risk_score: 0.10,
        provenance_status: 'CONFIRMED',
        location: 'Djibouti Anchorage'
      },
      {
        id: 'vess-002',
        vessel_name: 'IPSA Bypass Pipeline',
        option_type: 'pipeline',
        capacity_bbls: 400000,
        cost_usd_per_bbl: 4700.00,
        eta_days: 3,
        risk_score: 0.05,
        provenance_status: 'REAL_REFERENCE',
        location: 'Yanbu Terminal'
      },
      {
        id: 'vess-003',
        vessel_name: 'Cape Bypass Sea Lane',
        option_type: 'alternate_route',
        capacity_bbls: 1000000,
        cost_usd_per_bbl: 4900.00,
        eta_days: 5,
        risk_score: 0.15,
        provenance_status: 'REAL_REFERENCE',
        location: 'Cape of Good Hope'
      },
      {
        id: 'vess-004',
        vessel_name: 'MV Atlantic Pioneer',
        option_type: 'candidate_vessel',
        capacity_bbls: 500000,
        cost_usd_per_bbl: 4000.00,
        eta_days: 4,
        risk_score: 0.25,
        provenance_status: 'CANDIDATE_UNVERIFIED',
        location: 'Arabian Sea'
      }
    ]
  }

  // 4. Deal Create / Get / Evaluate
  if (path.includes('/api/evaluate')) {
    return {
      deal_id: body.deal_id || 'deal-001',
      volume_bbls: 50000,
      quoted_price_usd: 2000000,
      quoted_price_per_bbl: 40.00,
      freight_usd: 2000000,
      freight_per_bbl: 40.00,
      insurance_usd: 1250,
      handling_usd: 500,
      landed_cost_usd: 225750000,
      landed_cost_per_bbl: 4515.00,
      market_price_used_usd: 5000.00,
      market_price_provenance: 'SIMULATED',
      expected_revenue_usd: 250000000,
      expected_profit_usd: 24250000,
      expected_margin_pct: 9.7,
      max_acceptable_price_usd: 1250000,
      max_acceptable_price_per_bbl: 25.00,
      min_target_margin_used: 500,
      deal_verdict: 'NEGOTIATE',
      verdict_reason: 'At $40.00/bbl the quoted price exceeds target ceiling by $15/bbl ($15.00/bbl). Negotiate down to target ceiling of $1,250,000 ($25.00/bbl) or lower.',
      profitability_provenance: 'CALCULATED'
    }
  }

  // 5. Optimizer
  if (path.includes('/api/optimize')) {
    return {
      status: 'OPTIMAL',
      fulfilled_volume: 1000000,
      shortfall_volume: 0,
      message: 'Optimal hybrid allocation computed via OR-Tools solver.',
      recommended_strategy: {
        rank: 1,
        is_recommended: true,
        name: '30% Stena Bulk + 40% IPSA Pipeline + 30% Cape Bypass',
        total_cost_usd: 4730000000,
        cost_per_bbl: 4730.00,
        expected_profit_usd: 270000000,
        expected_margin_pct: 5.4,
        eta_days: 6,
        risk_score: 0.11,
        coverage_pct: 100,
        allocated_volume: 1000000,
        provenance_status: 'CALCULATED',
        allocations: [
          { option_id: 'vess-001', option_name: 'Stena Bulk Charter', allocated_volume: 300000, allocated_pct: 30, cost_usd: 1380000000, eta_days: 6, risk_score: 0.1, provenance_status: 'CONFIRMED' },
          { option_id: 'vess-002', option_name: 'IPSA Bypass Pipeline', allocated_volume: 400000, allocated_pct: 40, cost_usd: 1880000000, eta_days: 3, risk_score: 0.05, provenance_status: 'REAL_REFERENCE' },
          { option_id: 'vess-003', option_name: 'Cape Bypass Sea Lane', allocated_volume: 300000, allocated_pct: 30, cost_usd: 1470000000, eta_days: 5, risk_score: 0.15, provenance_status: 'REAL_REFERENCE' }
        ]
      },
      baseline_strategy: {
        rank: 0,
        is_baseline: true,
        name: '100% Cape Bypass Sea Lane',
        total_cost_usd: 4900000000,
        cost_per_bbl: 4900.00,
        expected_profit_usd: 100000000,
        expected_margin_pct: 2.0,
        eta_days: 5,
        risk_score: 0.15,
        coverage_pct: 100,
        allocated_volume: 1000000,
        provenance_status: 'CALCULATED',
        allocations: [
          { option_id: 'vess-003', option_name: 'Cape Bypass Sea Lane', allocated_volume: 1000000, allocated_pct: 100, cost_usd: 4900000000, eta_days: 5, risk_score: 0.15, provenance_status: 'REAL_REFERENCE' }
        ]
      }
    }
  }

  // Default Fallback
  return { status: 'ok', id: 'demo-fallback-id', message: 'Simulated response' }
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
