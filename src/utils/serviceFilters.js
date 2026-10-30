const VERIFICATION_ORDER = Object.freeze({
  unverified: 0,
  verified: 1,
  conflicting: 2,
})

export const SERVICE_CATEGORY_TRANSLATION_KEYS = Object.freeze({
  Emergency: 'services.category.emergency',
  Health: 'services.category.health',
  'Business and Permits': 'services.category.business',
  Information: 'services.category.information',
  'Building and Construction': 'services.category.building',
  'Taxes and Payments': 'services.category.taxes',
  'Public Concerns': 'services.category.concerns',
  'Civil Registry': 'services.category.civilRegistry',
})

export function filterServices(services, { query = '', category = '' } = {}) {
  const normalizedQuery = String(query).trim().toLowerCase()

  // Keep only services that match both the optional search text and category.
  return services.filter((service) => {
    const matchesCategory = !category || service.category === category
    const searchableText = [
      service.title,
      service.description,
      service.category,
      service.notes,
      ...(service.keywords ?? []),
    ].join(' ').toLowerCase()
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery))
  })
}

export function sortServices(services, sortMode = 'status') {
  // Sort a copy so the original service list stays unchanged.
  return [...services].sort((left, right) => {
    if (sortMode === 'time-sensitive') {
      const urgencyOrder = Number(right.timeSensitive) - Number(left.timeSensitive)
      if (urgencyOrder !== 0) return urgencyOrder
    } else if (sortMode === 'title') {
      return left.title.localeCompare(right.title, 'en', { sensitivity: 'base' })
    } else {
      const leftOrder = VERIFICATION_ORDER[left.verification] ?? VERIFICATION_ORDER.unverified
      const rightOrder = VERIFICATION_ORDER[right.verification] ?? VERIFICATION_ORDER.unverified
      if (leftOrder !== rightOrder) return leftOrder - rightOrder
    }

    return left.title.localeCompare(right.title, 'en', { sensitivity: 'base' })
  })
}
