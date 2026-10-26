import process from 'node:process'
import { buildAnswer, containsPersonalData, getAssistantRecords, refusal, retrieve, verificationOf } from '../lib/assistant-records.js'
import { generateAnswer, isSupportedModelName } from '../lib/gemini.js'

export const RATE_LIMIT_PER_MIN = 10
export const DAILY_LIMIT_PER_IP = 100
const requestsByIp = new Map()
const dailyRequestsByIp = new Map()
let testModeLogged = false
const UNAVAILABLE = 'The assistant is unavailable right now.'
const MAX_DAILY_LIMIT = 10000

function json(data, status = 200, providerCalled = false) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store',
      'X-Assistant-Provider': providerCalled ? 'called' : 'skipped', ...(status === 405 ? { Allow: 'POST' } : {}) },
  })
}

// Serverless memory resets: this limiter is only a speed bump, not a shared quota.
function rateLimited(ip) {
  const now = Date.now()
  for (const [address, entry] of requestsByIp) if (now >= entry.resetAt) requestsByIp.delete(address)
  const entry = requestsByIp.get(ip) ?? { count: 0, resetAt: now + 60000 }
  entry.count += 1
  requestsByIp.set(ip, entry)
  return entry.count > RATE_LIMIT_PER_MIN
}

function dailyLimitFromEnvironment() {
  const configured = process.env.DAILY_LIMIT_PER_IP?.trim()
  if (!configured) return DAILY_LIMIT_PER_IP
  const limit = Number(configured)
  return Number.isInteger(limit) && limit > 0 && limit <= MAX_DAILY_LIMIT ? limit : null
}

function manilaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function dailyLimited(ip, limit) {
  const today = manilaDate()
  for (const [address, entry] of dailyRequestsByIp) {
    if (entry.day !== today) dailyRequestsByIp.delete(address)
  }
  const entry = dailyRequestsByIp.get(ip) ?? { count: 0, day: today }
  entry.count += 1
  dailyRequestsByIp.set(ip, entry)
  return entry.count > limit
}

export default async function chat(req, context = {}) {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405)
  let body
  try { body = await req.json() } catch { return json({ error: 'Send valid JSON.' }, 400) }
  if (typeof body?.question !== 'string') return json({ error: 'Question must be text.' }, 400)
  const language = body.language ?? 'en'
  if (!['en', 'fil', 'ceb'].includes(language)) return json({ error: 'Choose a supported language.' }, 400)
  const question = body.question.trim()
  if (!question) return json({ error: 'Please enter a question.' }, 400)
  if (question.length > 500) return json({ error: 'Keep your question within 500 characters.' }, 400)
  if (containsPersonalData(question)) return json({ error: "Please don't share ID numbers or personal details." }, 400)
  const pageContext = body.context ?? null
  if (pageContext !== null &&
      (!pageContext || typeof pageContext !== 'object' || Array.isArray(pageContext) ||
       !['requirement', 'service', 'hotline', 'brief', 'history', 'budget'].includes(pageContext.type) ||
       typeof pageContext.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageContext.slug))) {
    return json({ error: 'Page context is invalid.' }, 400)
  }
  const ip = context.ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const dailyLimit = dailyLimitFromEnvironment()
  if (dailyLimit === null) return json({ error: 'The assistant is not configured correctly.' }, 503)
  if (rateLimited(ip)) return json({ error: 'Please wait a minute before trying again.' }, 429)
  if (dailyLimited(ip, dailyLimit)) return json({ error: 'The daily assistant limit has been reached.' }, 429)

  const testMode = process.env.NETLIFY_DEV === 'true' && process.env.ALLOW_UNVERIFIED_FOR_TESTING === 'true' &&
    !process.env.DEPLOY_ID && !['production', 'deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT)
  if (testMode && !testModeLogged) {
    console.info('TEST MODE on (credentials withheld)')
    testModeLogged = true
  }
  const eligible = getAssistantRecords().filter(record =>
    testMode || verificationOf(record) === 'verified')
  if (!eligible.length) return json(refusal(['No verified civic records are available yet.']))
  const contextRecord = pageContext
    ? eligible.find(record => record.slug === pageContext.slug && record.type === pageContext.type)
    : null
  if (pageContext && !contextRecord) return json(refusal(['No verified record is available for this page yet.']))
  const model = process.env.AI_MODEL?.trim() ?? ''
  const keys = [...new Set((process.env.AI_API_KEYS ?? '').split(/[,\r\n]+/).map(key => key.trim()).filter(Boolean))]
  // Only stable Gemini Flash text names are accepted; no default model or aliases.
  if (process.env.AI_PROVIDER !== 'gemini' || !isSupportedModelName(model) || !keys.length) {
    return json({ error: UNAVAILABLE }, 503)
  }
  const records = retrieve(eligible, question, contextRecord?.id ?? null)
  // Dates and links are omitted from the provider payload; the server supplies them.
  const guidance = records.map(record => ({ id: record.id, label: record.label, notes: record.notes,
    copies: record.copies, verification: verificationOf(record) }))
  try {
    const result = await generateAnswer(question, guidance, model, keys, language)
    if (result.error) return json({ error: UNAVAILABLE }, result.status, true)
    return json(buildAnswer(result.text, records, testMode, keys), 200, true)
  } catch {
    return json({ error: UNAVAILABLE }, 503, true)
  }
}
