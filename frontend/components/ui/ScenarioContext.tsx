'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ScenarioState {
  id: string
  product: string
  volume_bbls: number
  destination_port: string
  deadline_days: number
  max_acceptable_landed_cost_usd_bbl: number
  priority: string
  vessel_situation: string
  origin_port: string
  prompt?: string
}

const DEFAULT_SCENARIO: ScenarioState = {
  id: 'scen-demo-001',
  product: 'diesel',
  volume_bbls: 2000000,
  destination_port: 'Mumbai, India',
  deadline_days: 7,
  max_acceptable_landed_cost_usd_bbl: 95.0,
  priority: 'cost',
  vessel_situation: 'seeking',
  origin_port: 'Ras Tanura',
  prompt: 'I need 2 million barrels of diesel delivered to India within 7 days.'
}

interface ScenarioContextType {
  scenario: ScenarioState
  setScenario: (scen: Partial<ScenarioState>) => void
}

const ScenarioContext = createContext<ScenarioContextType>({
  scenario: DEFAULT_SCENARIO,
  setScenario: () => {},
})

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [scenario, setScenarioState] = useState<ScenarioState>(DEFAULT_SCENARIO)

  useEffect(() => {
    const saved = localStorage.getItem('eon_exea_active_scenario')
    if (saved) {
      try {
        setScenarioState(JSON.parse(saved))
      } catch (e) {
        // use default
      }
    }
  }, [])

  const setScenario = (update: Partial<ScenarioState>) => {
    setScenarioState((prev) => {
      const next = { ...prev, ...update }
      localStorage.setItem('eon_exea_active_scenario', JSON.stringify(next))
      return next
    })
  }

  return (
    <ScenarioContext.Provider value={{ scenario, setScenario }}>
      {children}
    </ScenarioContext.Provider>
  )
}

export function useScenario() {
  return useContext(ScenarioContext)
}
