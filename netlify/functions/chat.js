import process from 'node:process'
import requirements from '../../src/data/requirements.json' with { type: 'json' }
import { buildAnswer, containsPersonalData, refusal, retrieve, verificationOf } from '../lib/assistant-records.js'
import { generateAnswer } from '../lib/gemini.js'

export const RATE_LIMIT_PER_MIN = 10
const requestsByIp = new Map()
let testModeLogged = false
const UNAVAILABLE = 'The assistant is unavailable right now.'

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

export default async function chat(req, context = {}) {
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405)
  let body
  try { body = await req.json() } catch { return json({ error: 'Send valid JSON.' }, 400) }
  if (typeof body?.question !== 'string') return json({ error: 'Question must be text.' }, 400)
  const question = body.question.trim()
  if (!question) return json({ error: 'Please enter a question.' }, 400)
  if (question.length > 500) return json({ error: 'Keep your question within 500 characters.' }, 400)
  if (containsPersonalData(question)) return json({ error: "Please don't share ID numbers or personal details." }, 400)
  const ip = context.ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) return json({ error: 'Please wait a minute before trying again.' }, 429)

  const model = process.env.AI_MODEL?.trim() ?? ''
  const keys = [...new Set((process.env.AI_API_KEYS ?? '').split(/[,\r\n]+/).map(key => key.trim()).filter(Boolean))]
  // Only stable Gemini Flash text names are accepted; no default model or aliases.
  if (process.env.AI_PROVIDER !== 'gemini' || !/^gemini-3\.\d+-flash(?:-lite)?$/.test(model) || !keys.length) {
    return json({ error: UNAVAILABLE }, 503)
  }
  const testMode = process.env.NETLIFY_DEV === 'true' && process.env.ALLOW_UNVERIFIED_FOR_TESTING === 'true' &&
    !process.env.DEPLOY_ID && !['production', 'deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT)
  if (testMode && !testModeLogged) {
    console.info('TEST MODE on (credentials withheld)')
    testModeLogged = true
  }
  const eligible = requirements.filter(record => testMode || verificationOf(record) !== 'unverified')
  if (!eligible.length) return json(refusal(['No verified requirements are available yet.']))
  const records = retrieve(eligible, question)
  // Dates and links are omitted from the provider payload; the server supplies them.
  const guidance = records.map(record => ({ id: record.id, label: record.label, notes: record.notes,
    copies: record.copies, verification: verificationOf(record) }))
  try {
    const result = await generateAnswer(question, guidance, model, keys)
    if (result.error) return json({ error: UNAVAILABLE }, result.status, true)
    return json(buildAnswer(result.text, records, testMode, keys), 200, true)
  } catch {
    return json({ error: UNAVAILABLE }, 503, true)
  }
}
