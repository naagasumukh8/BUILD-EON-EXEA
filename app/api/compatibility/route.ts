/**
 * Product / Grade Compatibility Status API Route
 *
 * Gap 3: Product/Grade Compatibility
 *
 * SCHEMA INSPECTION RESULT:
 * The Supabase schema (001_initial_schema.sql) defines:
 *   - pipelines.product_compatible TEXT[]   (e.g. '{crude,diesel}')
 *   - alternate_routes.product_compatible TEXT[]
 *
 * WHAT EXISTS (from pipeline seed data):
 *   - IPSA (Saudi-Red Sea): product_compatible = '{crude}'
 *   - Habshan-Fujairah (ADNOC): product_compatible = '{crude}'
 *   - SUMED (Egypt): product_compatible = '{crude,refined}'
 *   - Kirkuk-Ceyhan: product_compatible = '{crude}'
 *   - Trans-Arabian (Tapline): product_compatible = '{crude}'
 *
 * WHAT DOES NOT EXIST:
 *   - No refinery-crude grade compatibility table (API gravity, sulfur tolerance)
 *   - No vessel cargo-type compatibility table
 *   - No counterparty grade acceptance dataset
 *   - Reference data has no verified compatibility entries beyond product_compatible arrays
 *
 * THEREFORE: Compatibility is NOT yet populated with a verified reference dataset.
 *
 * The system MUST NOT claim "Compatible" unless supported by actual data.
 * Where compatibility is unknown: "COMPATIBILITY: NOT YET VERIFIED"
 */

import { NextRequest, NextResponse } from 'next/server'

// Pipeline product compatibility — from actual seeded schema data (REAL_REFERENCE)
const PIPELINE_COMPATIBILITY: Record<string, {
  product_compatible: string[]
  provenance: string
  source: string
  notes: string
}> = {
  'IPSA (Saudi-Red Sea)': {
    product_compatible: ['crude'],
    provenance: 'REAL_REFERENCE',
    source: 'IEA/UNCTAD pipeline registry',
    notes: 'Crude oil only. Does not accept refined products or LNG.',
  },
  'Habshan-Fujairah (ADNOC)': {
    product_compatible: ['crude'],
    provenance: 'REAL_REFERENCE',
    source: 'ADNOC official capacity data',
    notes: 'Crude oil only. Abu Dhabi strategic bypass pipeline.',
  },
  'SUMED (Egypt)': {
    product_compatible: ['crude', 'refined'],
    provenance: 'REAL_REFERENCE',
    source: 'Suez Canal Authority',
    notes: 'Accepts crude and refined products. Does not accept LNG.',
  },
  'Kirkuk-Ceyhan (Iraq-Turkey)': {
    product_compatible: ['crude'],
    provenance: 'REAL_REFERENCE',
    source: 'IEA pipeline registry',
    notes: 'Crude oil only.',
  },
}

// What is NOT yet populated
const COMPATIBILITY_GAPS = {
  refinery_crude_grade_compatibility: {
    status: 'NOT_YET_POPULATED',
    description: 'No refinery-specific crude grade acceptance dataset exists.',
    missing_data: [
      'API gravity tolerance per refinery configuration',
      'Sulfur content (sweet vs sour) per refinery',
      'Viscosity limits per vessel class',
      'Flash point requirements for refined products',
    ],
    user_facing_label: 'COMPATIBILITY DATA: REFERENCE DATASET NOT YET POPULATED',
  },
  vessel_cargo_type_compatibility: {
    status: 'NOT_YET_POPULATED',
    description: 'No vessel cargo-type compatibility dataset beyond AIS vessel_type field.',
    missing_data: [
      'Product grade acceptance per vessel coil heating capability',
      'Cargo contamination history per MMSI',
      'Last cargo per voyage record',
    ],
    user_facing_label: 'COMPATIBILITY DATA: REFERENCE DATASET NOT YET POPULATED',
  },
  counterparty_grade_acceptance: {
    status: 'NOT_YET_POPULATED',
    description: 'No verified counterparty crude grade acceptance table.',
    missing_data: [
      'Refinery-grade tolerance agreements',
      'Crude assay database per supply origin',
    ],
    user_facing_label: 'COMPATIBILITY DATA: REFERENCE DATASET NOT YET POPULATED',
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const product = searchParams.get('product') || ''
  const route = searchParams.get('route') || ''

  // Check pipeline compatibility if route and product provided
  let routeCompatibility: any = null
  if (route && product) {
    const pipelineData = PIPELINE_COMPATIBILITY[route]
    if (pipelineData) {
      const isCompatible = pipelineData.product_compatible.includes(product.toLowerCase())
      routeCompatibility = {
        route,
        product,
        result: isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE',
        provenance: pipelineData.provenance,
        source: pipelineData.source,
        notes: pipelineData.notes,
        product_compatible: pipelineData.product_compatible,
        user_facing_label: isCompatible
          ? 'COMPATIBLE — ' + pipelineData.provenance
          : 'INCOMPATIBLE — ' + route + ' does not accept ' + product,
      }
    } else {
      routeCompatibility = {
        route,
        product,
        result: 'NOT_YET_VERIFIED',
        user_facing_label: 'COMPATIBILITY: NOT YET VERIFIED',
        notes: 'Route not found in compatibility reference dataset.',
      }
    }
  }

  return NextResponse.json({
    compatibility_status: 'PARTIAL',
    summary: [
      'Pipeline product compatibility (crude vs refined) is seeded from REAL_REFERENCE data.',
      'Refinery-specific crude grade compatibility (API gravity, sulfur content) is NOT YET POPULATED.',
      'The system will NOT claim Compatible unless supported by actual compatibility data.',
      'Where compatibility is unknown, the label is: COMPATIBILITY: NOT YET VERIFIED',
    ].join(' '),
    pipeline_compatibility: PIPELINE_COMPATIBILITY,
    compatibility_gaps: COMPATIBILITY_GAPS,
    route_check: routeCompatibility,
    data_rules: {
      rule_1: 'System NEVER claims Compatible unless provenance is REAL_REFERENCE or CONFIRMED.',
      rule_2: 'Unknown compatibility is labeled COMPATIBILITY: NOT YET VERIFIED.',
      rule_3: 'Compatibility data without a verified reference dataset is NOT shown as confirmed.',
      rule_4: 'LLM/AI is NEVER used to determine grade compatibility — only verified reference data.',
    },
    timestamp: new Date().toISOString(),
  })
}
