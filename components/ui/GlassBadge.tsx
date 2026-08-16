import React from 'react'

export type ProvenanceStatus =
  | 'CONFIRMED'
  | 'REAL_REFERENCE'
  | 'ESTIMATED'
  | 'SIMULATED'
  | 'CALCULATED'
  | 'CANDIDATE_UNVERIFIED'
  | 'GO'
  | 'NEGOTIATE'
  | 'REJECT'
  | string

interface GlassBadgeProps {
  status: ProvenanceStatus
  label?: string
  size?: 'sm' | 'md'
}

export function GlassBadge({ status, label, size = 'sm' }: GlassBadgeProps) {
  const statusUpper = (status || '').toUpperCase()

  let badgeClass = 'badge-simulated'
  let displayLabel = label || statusUpper.replace('_', ' ')

  if (statusUpper === 'CONFIRMED') {
    badgeClass = 'badge-confirmed'
    displayLabel = label || 'CONFIRMED'
  } else if (statusUpper === 'REAL_REFERENCE' || statusUpper === 'REAL REFERENCE') {
    badgeClass = 'badge-reference'
    displayLabel = label || 'REAL REFERENCE'
  } else if (statusUpper === 'ESTIMATED') {
    badgeClass = 'badge-estimated'
    displayLabel = label || 'ESTIMATED'
  } else if (statusUpper === 'CALCULATED') {
    badgeClass = 'badge-calculated'
    displayLabel = label || 'CALCULATED'
  } else if (statusUpper === 'CANDIDATE_UNVERIFIED' || statusUpper.includes('CANDIDATE')) {
    badgeClass = 'badge-candidate'
    displayLabel = label || 'CANDIDATE: UNVERIFIED'
  } else if (statusUpper === 'GO') {
    badgeClass = 'verdict-go font-bold'
    displayLabel = label || 'GO'
  } else if (statusUpper === 'NEGOTIATE') {
    badgeClass = 'verdict-negotiate font-bold'
    displayLabel = label || 'NEGOTIATE'
  } else if (statusUpper === 'REJECT') {
    badgeClass = 'verdict-reject font-bold'
    displayLabel = label || 'REJECT'
  }

  const paddingClass = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs'

  return (
    <span className={`badge-glass ${badgeClass} ${paddingClass}`}>
      {displayLabel}
    </span>
  )
}
