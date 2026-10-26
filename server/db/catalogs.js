export const catalogNames = Object.freeze([
  'services',
  'barangays',
  'officials',
  'cityFacts',
  'updates',
  'history',
  'budget',
  'procurement',
  'briefs',
  'elections',
  'accountability',
  'requirements',
  'requirementSources',
])

export const recordTypes = Object.freeze({
  services: 'service',
  barangays: 'barangay',
  officials: 'official',
  cityFacts: 'fact',
  updates: 'update',
  history: 'history',
  budget: 'budget',
  procurement: 'procurement',
  briefs: 'brief',
  elections: 'election',
  accountability: 'accountability',
  requirements: 'requirement',
  requirementSources: 'requirementSource',
})

export function recordTypesForCatalog(name) {
  return name === 'services' ? ['service', 'hotline'] : [recordTypes[name]]
}
