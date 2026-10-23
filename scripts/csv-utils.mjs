export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"' && quoted && text[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.')
  row.push(field)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

export function recordsFromCsv(text, expectedHeaders, convertRow) {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''))
  if (rows.length < 2) throw new Error('CSV must include the required header and at least one data row.')
  const headers = rows[0].map((value) => value.trim())
  if (headers.length !== expectedHeaders.length ||
      expectedHeaders.some((header, index) => headers[index] !== header)) {
    throw new Error(`CSV headers must be exactly: ${expectedHeaders.join(', ')}.`)
  }
  return rows.slice(1).map((values, index) => {
    const line = index + 2
    if (values.length !== headers.length) throw new Error(`Line ${line}: expected ${headers.length} columns.`)
    return convertRow(Object.fromEntries(headers.map((header, column) => [header, values[column].trim()])), line)
  })
}

export function parseNonNegativeAmount(value, field, line) {
  const amount = Number(value)
  if (!value || !Number.isFinite(amount) || amount < 0) {
    throw new Error(`Line ${line}: ${field} must be a non-negative number.`)
  }
  return amount
}

export function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function requireHttpsOrBlank(value, field, line) {
  if (!value) return ''
  let parsed
  try { parsed = new URL(value) } catch { parsed = null }
  if (!parsed || parsed.protocol !== 'https:' || !parsed.hostname) {
    throw new Error(`Line ${line}: ${field} must be an HTTPS URL or blank.`)
  }
  return value
}

export function slugify(value) {
  return value.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
