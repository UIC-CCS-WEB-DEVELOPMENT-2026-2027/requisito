export function normalizeSearchText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function filterAndSortBarangays(records, {
  query = '',
  adminDistrict = '',
  legislativeDistrict = '',
  sortBy = 'name',
  direction = 'asc',
} = {}) {
  const normalizedQuery = normalizeSearchText(query)
  const filtered = records.filter((record) => {
    if (record.isSample) return false
    if (adminDistrict && record.adminDistrict !== adminDistrict) return false
    if (legislativeDistrict && record.legislativeDistrict !== legislativeDistrict) return false
    return !normalizedQuery || normalizeSearchText(`${record.title} ${record.adminDistrict} ${record.legislativeDistrict}`).includes(normalizedQuery)
  })
  const sign = direction === 'desc' ? -1 : 1
  const sortField = { name: 'title', district: 'adminDistrict', population: 'population2020' }[sortBy] ?? 'title'
  return filtered.sort((left, right) => {
    const leftValue = left[sortField]
    const rightValue = right[sortField]
    if (sortField === 'population2020' && (leftValue == null || rightValue == null)) {
      if (leftValue == null && rightValue != null) return 1
      if (leftValue != null && rightValue == null) return -1
    }
    const primary = typeof leftValue === 'number' && typeof rightValue === 'number'
      ? leftValue - rightValue
      : String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'en', { sensitivity: 'base' })
    return primary === 0
      ? left.title.localeCompare(right.title, 'en', { sensitivity: 'base' })
      : primary * sign
  })
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function exportBarangaysCsv(records) {
  const columns = ['title', 'adminDistrict', 'legislativeDistrict', 'population2020', 'verification', 'lastVerified']
  const header = ['name', 'adminDistrict', 'legislativeDistrict', 'population2020', 'verification', 'lastVerified']
  return [
    header.join(','),
    ...records.map((record) => columns.map((column) => csvCell(record[column])).join(',')),
  ].join('\r\n')
}
