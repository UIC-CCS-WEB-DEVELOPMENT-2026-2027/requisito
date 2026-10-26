import { Router } from 'express'
import { requireEditor, requireSession } from '../auth/middleware.js'
import { getRecord, listRecords, editRecord } from '../db/records.js'
import { catalogNames, recordTypes, recordTypesForCatalog } from '../db/catalogs.js'

const STORAGE_TYPES = new Set([...Object.values(recordTypes), 'hotline'])

export function resolveRecordTypes(type) {
  if (catalogNames.includes(type)) return recordTypesForCatalog(type)
  if (STORAGE_TYPES.has(type)) return [type]
  return null
}

const EDITABLE_FIELDS = new Set([
  'title', 'description', 'category', 'sourceUrl', 'notes', 'timeSensitive',
  'relatedSources', 'contact', 'steps', 'date', 'year', 'fiscalYear', 'sector',
  'amountPHP', 'referenceNo', 'agency', 'awardDate', 'status', 'kind',
  'officialBody', 'goalId', 'label', 'copies', 'validityMonths',
  'adminDistrict', 'legislativeDistrict', 'population2020', 'holderName', 'term',
  'url', 'publishedDate', 'statementDate', 'effectiveDate', 'evidenceType',
  'supports', 'limitations', 'relatedSources',
])

function filterEditableData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const entries = Object.entries(data)
  if (entries.length === 0 || entries.some(([key]) => !EDITABLE_FIELDS.has(key))) return null
  return Object.fromEntries(entries)
}

function isHttpsUrlOrEmpty(value) {
  if (value === '') return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

function isValidRequirementSource(data) {
  for (const field of ['agency', 'title', 'evidenceType', 'limitations']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) return false
  }
  if (typeof data.url !== 'string' || !data.url || !isHttpsUrlOrEmpty(data.url)) return false
  if (!Array.isArray(data.supports) ||
      data.supports.length === 0 ||
      data.supports.some((claim) => typeof claim !== 'string' || !claim.trim())) return false
  if (data.relatedSources !== undefined &&
      (!Array.isArray(data.relatedSources) ||
       data.relatedSources.some((url) => typeof url !== 'string' || !isHttpsUrlOrEmpty(url) || !url))) {
    return false
  }
  for (const field of ['publishedDate', 'statementDate', 'effectiveDate']) {
    if (data[field] !== null &&
        (typeof data[field] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data[field]))) {
      return false
    }
  }
  return true
}

function nowIso(config) {
  return (config.now ? config.now() : new Date()).toISOString()
}

export function createRecordsRouter({ db, config }) {
  const router = Router()
  router.use(requireSession)

  router.get('/', (req, res) => {
    const { type = '', district = '', verification = '' } = req.query
    const types = type ? resolveRecordTypes(type) : null
    if (type && !types) return res.status(400).json({ error: 'Unknown record type.' })
    if (verification && !['verified', 'unverified', 'conflicting'].includes(verification)) {
      return res.status(400).json({ error: 'Unknown verification state.' })
    }
    const allRecords = listRecords(db, {
      district: district || undefined,
      verification: verification || undefined,
    }).filter((record) => !types || types.includes(record.type))
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50))
    const start = (page - 1) * limit
    return res.json({ records: allRecords.slice(start, start + limit), total: allRecords.length, page, limit })
  })

  router.get('/:type/:id', (req, res) => {
    const types = resolveRecordTypes(req.params.type)
    if (!types) return res.status(400).json({ error: 'Unknown record type.' })
    const record = types.map((type) => getRecord(db, type, req.params.id)).find(Boolean)
    return record ? res.json({ record }) : res.status(404).json({ error: 'Record not found.' })
  })

  router.patch('/:type/:id', requireEditor, (req, res) => {
    const types = resolveRecordTypes(req.params.type)
    if (!types) return res.status(400).json({ error: 'Unknown record type.' })
    const data = filterEditableData(req.body?.data)
    if (!data) return res.status(400).json({ error: 'Provide only editable record fields.' })
    if (Object.hasOwn(data, 'sourceUrl') &&
        (typeof data.sourceUrl !== 'string' || !isHttpsUrlOrEmpty(data.sourceUrl))) {
      return res.status(400).json({ error: 'sourceUrl must be empty or a valid HTTPS URL without credentials.' })
    }
    if (Object.hasOwn(data, 'url') &&
        (typeof data.url !== 'string' || !isHttpsUrlOrEmpty(data.url))) {
      return res.status(400).json({ error: 'url must be a valid HTTPS URL without credentials.' })
    }
    const sourceUrl = req.body?.source_url
    const note = req.body?.note
    if (sourceUrl !== undefined && typeof sourceUrl !== 'string') {
      return res.status(400).json({ error: 'source_url must be text.' })
    }
    if (note !== undefined && (typeof note !== 'string' || note.length > 2000)) {
      return res.status(400).json({ error: 'note must be no more than 2000 characters.' })
    }
    try {
      const existing = types.map((type) => getRecord(db, type, req.params.id)).find(Boolean)
      if (!existing) return res.status(404).json({ error: 'Record not found.' })
      if (existing.type === 'requirementSource' &&
          !isValidRequirementSource({ ...existing, ...data })) {
        return res.status(400).json({ error: 'Requirement source data is incomplete or contains an invalid URL or date.' })
      }
      const record = editRecord(db, {
        type: existing.type,
        id: req.params.id,
        data,
        sourceUrl,
        note: note ?? '',
        actor: req.adminUser.username,
        now: nowIso(config),
      })
      return record ? res.json({ record }) : res.status(404).json({ error: 'Record not found.' })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  })

  return router
}
