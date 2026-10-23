import { normalizeSearchText } from './barangayDirectory.js'

export function rankSearchRecords(records, query) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return []
  return records
    .filter((record) =>
      !record.isSample && !/\b(sample|placeholder|fictional)\b/i.test(`${record.title ?? ''} ${record.description ?? ''}`),
    )
    .map((record, index) => ({ record, index, rank: rankRecord(record, normalizedQuery) }))
    .filter((result) => result.rank < Infinity)
    .sort((left, right) => left.rank - right.rank ||
      left.record.title.localeCompare(right.record.title, 'en', { sensitivity: 'base' }) ||
      left.index - right.index)
    .map(({ record }) => ({ ...record }))
}

function rankRecord(record, query) {
  const title = normalizeSearchText(record.title ?? record.label)
  if (title === query) return 0
  if (title.startsWith(query)) return 1
  if (title.includes(query)) return 2
  const allFields = normalizeSearchText(Object.values(record).flatMap((value) => {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value.filter((item) => typeof item === 'string')
    if (value && typeof value === 'object') return Object.values(value).filter((item) => typeof item === 'string')
    return []
  }).join(' '))
  return allFields.includes(query) ? 3 : Infinity
}
