const populationFactDefinitions = [
  { id: 'population-2020', labelKey: 'statistics.cityPopulation2020' },
  { id: 'most-populous-barangay-region-xi-2020', labelKey: 'statistics.bucanaPopulation2020' },
]

function numbersIn(text) {
  return [...text.matchAll(/\b\d[\d,]*\b/gu)].map(([value]) => Number(value.replaceAll(',', '')))
}

function isOfficialHttpsUrl(value) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (
      url.hostname === 'psa.gov.ph' ||
      url.hostname.endsWith('.psa.gov.ph')
    )
  } catch {
    return false
  }
}

function statisticFromFact(fact, labelKey) {
  const value = numbersIn(fact.description).at(-1)
  if (!Number.isFinite(value) || !isOfficialHttpsUrl(fact.sourceUrl)) return null

  return {
    id: fact.id,
    labelKey,
    value,
    sourceUrl: fact.sourceUrl,
    verification: 'unverified',
  }
}

export function getCityStatistics(cityFacts, barangays) {
  const factsById = new Map(cityFacts.map((fact) => [fact.id, fact]))
  const population = populationFactDefinitions
    .map(({ id, labelKey }) => {
      const fact = factsById.get(id)
      return fact ? statisticFromFact(fact, labelKey) : null
    })
    .filter(Boolean)

  const districtEntries = new Map()
  for (const barangay of barangays) {
    if (!barangay.adminDistrict || !isOfficialHttpsUrl(barangay.sourceUrl)) continue
    const entry = districtEntries.get(barangay.adminDistrict) ?? {
      id: barangay.adminDistrict,
      label: barangay.adminDistrict,
      value: 0,
      sourceUrls: new Set(),
      verification: 'unverified',
    }
    entry.value += 1
    entry.sourceUrls.add(barangay.sourceUrl)
    districtEntries.set(barangay.adminDistrict, entry)
  }

  const barangayEntriesByDistrict = [...districtEntries.values()]
    .map((entry) => ({ ...entry, sourceUrls: [...entry.sourceUrls] }))
    .sort((left, right) => left.label.localeCompare(right.label))

  return { population, barangayEntriesByDistrict }
}
