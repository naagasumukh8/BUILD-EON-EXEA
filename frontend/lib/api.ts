const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.detail || err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Health
  health: () => request<any>('/api/health'),

  // Intake
  parseIntake: (text: string, existing: Record<string, any> = {}) =>
    request<any>('/api/intake/parse', {
      method: 'POST',
      body: JSON.stringify({ text, existing_fields: existing }),
    }),
  saveScenario: (data: Record<string, any>) =>
    request<any>('/api/intake/save', { method: 'POST', body: JSON.stringify(data) }),
  getScenario: (id: string) => request<any>(`/api/intake/${id}`),

  // Vessels
  discoverVessels: (scenarioId: string) =>
    request<any>(`/api/vessels/discover?scenario_id=${scenarioId}`),
  getVessel: (id: string) => request<any>(`/api/vessels/${id}`),
  listVessels: (scenarioId: string) =>
    request<any>(`/api/vessels/?scenario_id=${scenarioId}`),

  // Deals
  createDeal: (data: Record<string, any>) =>
    request<any>('/api/deals/', { method: 'POST', body: JSON.stringify(data) }),
  getDeal: (id: string) => request<any>(`/api/deals/${id}`),
  listDeals: (scenarioId: string) =>
    request<any>(`/api/deals/?scenario_id=${scenarioId}`),

  // Evaluator
  evaluate: (dealId: string, overrides: Record<string, any> = {}) =>
    request<any>('/api/evaluate/', {
      method: 'POST',
      body: JSON.stringify({ deal_id: dealId, ...overrides }),
    }),
  whatIf: (dealId: string, newPrice: number, overrides: Record<string, any> = {}) =>
    request<any>('/api/evaluate/whatif', {
      method: 'POST',
      body: JSON.stringify({ deal_id: dealId, new_quoted_price: newPrice, ...overrides }),
    }),

  // Optimizer
  optimize: (data: Record<string, any>) =>
    request<any>('/api/optimize/', { method: 'POST', body: JSON.stringify(data) }),

  // Report
  explain: (optimizationRunId: string, scenarioId: string) =>
    request<any>('/api/report/explain', {
      method: 'POST',
      body: JSON.stringify({ optimization_run_id: optimizationRunId, scenario_id: scenarioId }),
    }),
  generateReport: (scenarioId: string, optimizationRunId: string) =>
    request<any>('/api/report/generate', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId, optimization_run_id: optimizationRunId }),
    }),
  downloadReport: (reportId: string) =>
    `${API}/api/report/${reportId}/download`,
}
